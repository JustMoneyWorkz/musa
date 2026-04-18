import { Router } from 'express'
import { body, param } from 'express-validator'
import pool from '../db/pool'
import { AuthRequest, requireAdmin } from '../middleware/auth'
import { handleValidation } from '../middleware/validate'

const router = Router()

const VALID_STATUSES = ['pending','confirmed','assembling','delivering','delivered','cancelled']

// Server-side truth for delivery fee. Frontend (CheckoutPage) отображает ту же константу.
// Если захотим сделать конфигурируемым — сюда добавить чтение из env/таблицы settings.
const DELIVERY_FEE = 299

// GET /orders/slots — available delivery slots (before /:id to avoid conflict)
router.get('/slots', async (_req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, date, time_range, districts, available
       FROM delivery_slots
       WHERE available = true AND date >= CURRENT_DATE
       ORDER BY date ASC, time_range ASC`
    )
    res.json(result.rows)
  } catch (err) { next(err) }
})

// GET /orders  — user's own orders
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const orders = await pool.query(
      `SELECT o.*,
              ds.date       AS slot_date,
              ds.time_range AS slot_time,
              pc.code       AS promo_code,
              json_agg(json_build_object(
                'id', oi.id, 'product_id', oi.product_id,
                'quantity', oi.quantity, 'price', oi.price,
                'name', p.name, 'image', p.images[1]
              ) ORDER BY oi.id) AS items
       FROM orders o
       LEFT JOIN delivery_slots ds ON ds.id = o.delivery_slot_id
       LEFT JOIN promo_codes    pc ON pc.id = o.promo_id
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products    p  ON p.id = oi.product_id
       WHERE o.user_id=$1
       GROUP BY o.id, ds.date, ds.time_range, pc.code
       ORDER BY o.created_at DESC`,
      [req.telegramId]
    )
    res.json(orders.rows)
  } catch (err) { next(err) }
})

// GET /orders/:id
router.get('/:id',
  param('id').isInt({ min: 1 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    try {
      const result = await pool.query(
        `SELECT o.*,
                ds.date       AS slot_date,
                ds.time_range AS slot_time,
                pc.code       AS promo_code,
                pc.discount_percent AS promo_discount,
                json_agg(json_build_object(
                  'id', oi.id, 'product_id', oi.product_id,
                  'quantity', oi.quantity, 'price', oi.price,
                  'name', p.name, 'image', p.images[1]
                ) ORDER BY oi.id) AS items
         FROM orders o
         LEFT JOIN delivery_slots ds ON ds.id = o.delivery_slot_id
         LEFT JOIN promo_codes    pc ON pc.id = o.promo_id
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products    p  ON p.id = oi.product_id
         WHERE o.id=$1 AND o.user_id=$2
         GROUP BY o.id, ds.date, ds.time_range, pc.code, pc.discount_percent`,
        [req.params.id, req.telegramId]
      )
      if (!result.rows.length) return res.status(404).json({ error: 'Order not found' })
      res.json(result.rows[0])
    } catch (err) { next(err) }
  }
)

// POST /orders  — create order
router.post('/',
  body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('items.*.product_id').isInt({ min: 1 }),
  body('items.*.quantity').isInt({ min: 1, max: 999 }),
  body('address').isString().trim().notEmpty().isLength({ max: 512 }),
  body('phone').isMobilePhone('any'),
  body('delivery_slot_id').optional().isInt({ min: 1 }),
  body('promo_code').optional().isString().trim().isLength({ max: 32 }),
  body('payment_method').optional().isIn(['cash', 'transfer']),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const { items, address, phone, delivery_slot_id, promo_code } = req.body
    const payment_method: 'cash' | 'transfer' = req.body.payment_method ?? 'cash'
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Resolve prices from DB
      const productIds: number[] = items.map((i: { product_id: number }) => i.product_id)
      const prodRes = await client.query(
        'SELECT id, price, price_discounted, stock FROM products WHERE id=ANY($1) ORDER BY id FOR UPDATE',
        [productIds]
      )
      const prodMap: Record<number, { price: number; price_discounted: number | null; stock: number }> = {}
      prodRes.rows.forEach((p: { id: number; price: number; price_discounted: number | null; stock: number }) => { prodMap[p.id] = p })

      // Validate stock & compute subtotal
      let subtotal = 0
      for (const item of items) {
        const prod = prodMap[item.product_id]
        if (!prod) {
          await client.query('ROLLBACK')
          return res.status(400).json({ error: `Product ${item.product_id} not found` })
        }
        if (prod.stock < item.quantity) {
          await client.query('ROLLBACK')
          return res.status(400).json({ error: `Insufficient stock for product ${item.product_id}` })
        }
        subtotal += (prod.price_discounted ?? prod.price) * item.quantity
      }

      // Validate promo & compute discount
      let promoId: number | null = null
      let discountAmount = 0
      if (promo_code) {
        const promoRes = await client.query(
          `SELECT id, discount_percent FROM promo_codes
           WHERE code=$1 AND active_from <= now() AND active_to >= now()`,
          [promo_code.toUpperCase()]
        )
        if (!promoRes.rows.length) {
          await client.query('ROLLBACK')
          return res.status(400).json({ error: 'Invalid or expired promo code' })
        }
        const discount = promoRes.rows[0].discount_percent
        promoId = promoRes.rows[0].id
        discountAmount = Math.round(subtotal * discount / 100)
      }

      // Final total matches frontend formula: subtotal + delivery - discount
      const total = subtotal + DELIVERY_FEE - discountAmount

      // Validate delivery slot
      if (delivery_slot_id) {
        const slotRes = await client.query(
          'SELECT id FROM delivery_slots WHERE id=$1 AND available=true AND date >= CURRENT_DATE',
          [delivery_slot_id]
        )
        if (!slotRes.rows.length) {
          await client.query('ROLLBACK')
          return res.status(400).json({ error: 'Delivery slot unavailable' })
        }
      }

      // Create order
      const orderRes = await client.query(
        `INSERT INTO orders(user_id, address, phone, delivery_slot_id, promo_id,
                            total, payment_method, delivery_fee)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [req.telegramId, address, phone, delivery_slot_id ?? null, promoId,
         total, payment_method, DELIVERY_FEE]
      )
      const order = orderRes.rows[0]

      // Insert order items & decrement stock
      for (const item of items) {
        const prod = prodMap[item.product_id]
        const price = prod.price_discounted ?? prod.price
        await client.query(
          'INSERT INTO order_items(order_id, product_id, quantity, price) VALUES($1,$2,$3,$4)',
          [order.id, item.product_id, item.quantity, price]
        )
        const upd = await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id=$2 AND stock >= $1 RETURNING stock',
          [item.quantity, item.product_id]
        )
        if (upd.rowCount === 0) {
          await client.query('ROLLBACK')
          return res.status(409).json({ error: `Insufficient stock for product ${item.product_id}` })
        }
      }

      // Clear cart
      await client.query('DELETE FROM cart WHERE user_id=$1', [req.telegramId])

      await client.query('COMMIT')
      res.status(201).json(order)
    } catch (err) { await client.query('ROLLBACK'); next(err) }
    finally { client.release() }
  }
)

// POST /orders/:id/confirm  — user confirms receipt (delivering → delivered)
router.post('/:id/confirm',
  param('id').isInt({ min: 1 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    try {
      // Only allow if user owns the order and it's currently 'delivering'
      const result = await pool.query(
        `UPDATE orders
         SET status = 'delivered'
         WHERE id=$1 AND user_id=$2 AND status='delivering'
         RETURNING *`,
        [req.params.id, req.telegramId]
      )
      if (!result.rows.length) {
        // Check why — wrong order or wrong status
        const check = await pool.query(
          'SELECT status FROM orders WHERE id=$1 AND user_id=$2',
          [req.params.id, req.telegramId]
        )
        if (!check.rows.length) return res.status(404).json({ error: 'Order not found' })
        return res.status(400).json({
          error: `Cannot confirm order with status '${check.rows[0].status}'`,
        })
      }
      res.json(result.rows[0])
    } catch (err) { next(err) }
  }
)

// PATCH /orders/:id/status  (admin only)
router.patch('/:id/status',
  requireAdmin,
  param('id').isInt({ min: 1 }),
  body('status').isIn(VALID_STATUSES),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    try {
      const result = await pool.query(
        `UPDATE orders SET status=$1 WHERE id=$2 RETURNING *`,
        [req.body.status, req.params.id]
      )
      if (!result.rows.length) return res.status(404).json({ error: 'Order not found' })
      res.json(result.rows[0])
    } catch (err) { next(err) }
  }
)

export default router
