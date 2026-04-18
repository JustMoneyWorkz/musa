import { Router } from 'express'
import { body, param, query } from 'express-validator'

const VALID_STATUSES = ['pending','confirmed','assembling','delivering','delivered','cancelled']
import pool from '../db/pool'
import { AuthRequest, requireAdmin } from '../middleware/auth'
import { handleValidation } from '../middleware/validate'

const router = Router()

// All admin routes require requireAdmin middleware (applied per-route)

// GET /admin/check — alias used by frontend admin check
router.get('/check', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      'SELECT 1 FROM admins WHERE telegram_id=$1', [req.telegramId]
    )
    res.json({ is_admin: (result.rowCount ?? 0) > 0 })
  } catch (err) { next(err) }
})

// GET /admin/me — check if current user is admin
router.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      'SELECT 1 FROM admins WHERE telegram_id=$1', [req.telegramId]
    )
    res.json({ is_admin: (result.rowCount ?? 0) > 0 })
  } catch (err) { next(err) }
})

// GET /admin/orders  — all orders with filters
router.get('/orders',
  requireAdmin,
  query('status').optional().isIn(['pending','confirmed','assembling','delivering','delivered','cancelled']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const status = req.query.status as string | undefined
    const limit  = parseInt(req.query.limit  as string) || 50
    const offset = parseInt(req.query.offset as string) || 0
    const params: (string | number)[] = [limit, offset]
    let where = ''
    if (status) { params.push(status); where = `WHERE o.status=$${params.length}` }
    try {
      const result = await pool.query(
        `SELECT o.*,
                u.first_name, u.last_name, u.username, u.phone AS user_phone,
                u.photo_url AS user_photo,
                ds.date       AS slot_date,
                ds.time_range AS slot_time,
                pc.code       AS promo_code,
                json_agg(json_build_object(
                  'product_id', oi.product_id, 'quantity', oi.quantity,
                  'price', oi.price, 'name', p.name
                ) ORDER BY oi.id) AS items
         FROM orders o
         JOIN users            u  ON u.telegram_id = o.user_id
         LEFT JOIN delivery_slots ds ON ds.id = o.delivery_slot_id
         LEFT JOIN promo_codes    pc ON pc.id = o.promo_id
         JOIN order_items oi ON oi.order_id   = o.id
         JOIN products    p  ON p.id          = oi.product_id
         ${where}
         GROUP BY o.id, u.telegram_id, ds.date, ds.time_range, pc.code
         ORDER BY o.created_at DESC
         LIMIT $1 OFFSET $2`,
        params
      )
      res.json(result.rows)
    } catch (err) { next(err) }
  }
)

// GET /admin/users  — all users list
router.get('/users',
  requireAdmin,
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const limit  = parseInt(req.query.limit  as string) || 100
    const offset = parseInt(req.query.offset as string) || 0
    try {
      const result = await pool.query(
        'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      )
      res.json(result.rows)
    } catch (err) { next(err) }
  }
)

// POST /admin/admins  — add admin by telegram_id
router.post('/admins',
  requireAdmin,
  body('telegram_id').isInt({ min: 1 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const { telegram_id } = req.body
    try {
      // Ensure user exists
      const userRes = await pool.query('SELECT telegram_id FROM users WHERE telegram_id=$1', [telegram_id])
      if (!userRes.rows.length) return res.status(404).json({ error: 'User not found' })
      await pool.query(
        'INSERT INTO admins(telegram_id) VALUES($1) ON CONFLICT DO NOTHING',
        [telegram_id]
      )
      res.status(201).json({ telegram_id, is_admin: true })
    } catch (err) { next(err) }
  }
)

// DELETE /admin/admins/:telegram_id  — remove admin
router.delete('/admins/:telegram_id',
  requireAdmin,
  async (req: AuthRequest, res, next) => {
    const tid = parseInt(req.params.telegram_id)
    if (isNaN(tid)) return res.status(400).json({ error: 'Invalid telegram_id' })
    if (tid === req.telegramId) return res.status(400).json({ error: 'Cannot remove yourself' })
    try {
      const result = await pool.query('DELETE FROM admins WHERE telegram_id=$1 RETURNING telegram_id', [tid])
      if (!result.rows.length) return res.status(404).json({ error: 'Admin not found' })
      res.json({ deleted: result.rows[0].telegram_id })
    } catch (err) { next(err) }
  }
)

// GET /admin/delivery-slots
router.get('/delivery-slots',
  requireAdmin,
  async (req: AuthRequest, res, next) => {
    try {
      const result = await pool.query(
        'SELECT * FROM delivery_slots ORDER BY date ASC, time_range ASC'
      )
      res.json(result.rows)
    } catch (err) { next(err) }
  }
)

// POST /admin/delivery-slots
router.post('/delivery-slots',
  requireAdmin,
  body('date').isDate(),
  body('time_range').isString().trim().notEmpty().isLength({ max: 32 }),
  body('districts').isArray({ min: 1 }),
  body('districts.*').isString().trim().notEmpty(),
  body('product_id').optional().isInt({ min: 1 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const { date, time_range, districts, product_id } = req.body
    try {
      const result = await pool.query(
        `INSERT INTO delivery_slots(product_id, date, time_range, districts)
         VALUES($1,$2,$3,$4) RETURNING *`,
        [product_id ?? null, date, time_range, districts]
      )
      res.status(201).json(result.rows[0])
    } catch (err) { next(err) }
  }
)

// DELETE /admin/delivery-slots/:id
router.delete('/delivery-slots/:id',
  requireAdmin,
  param('id').isInt({ min: 1 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    try {
      const result = await pool.query(
        'DELETE FROM delivery_slots WHERE id=$1 RETURNING id',
        [req.params.id]
      )
      if (!result.rows.length) return res.status(404).json({ error: 'Slot not found' })
      res.json({ deleted: result.rows[0].id })
    } catch (err: unknown) {
      // FK violation — слот используется в заказах
      if ((err as { code?: string }).code === '23503') {
        return res.status(409).json({ error: 'Слот используется в заказах' })
      }
      next(err)
    }
  }
)

// GET /admin/promos — list all promo codes
router.get('/promos',
  requireAdmin,
  async (_req: AuthRequest, res, next) => {
    try {
      const result = await pool.query(
        'SELECT * FROM promo_codes ORDER BY created_at DESC'
      )
      res.json(result.rows)
    } catch (err) { next(err) }
  }
)

// POST /admin/promos — create promo code
router.post('/promos',
  requireAdmin,
  body('code').isString().trim().notEmpty().isLength({ min: 3, max: 32 }),
  body('discount_percent').isInt({ min: 1, max: 100 }),
  body('active_from').isISO8601(),
  body('active_to').isISO8601(),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const { code, discount_percent, active_from, active_to } = req.body
    if (new Date(active_from) >= new Date(active_to)) {
      return res.status(400).json({ error: 'active_from must be before active_to' })
    }
    try {
      const result = await pool.query(
        `INSERT INTO promo_codes(code, discount_percent, active_from, active_to, created_by)
         VALUES($1,$2,$3,$4,$5) RETURNING *`,
        [code.toUpperCase(), discount_percent, active_from, active_to, req.telegramId]
      )
      res.status(201).json(result.rows[0])
    } catch (err: unknown) {
      if ((err as { code?: string }).code === '23505') {
        return res.status(409).json({ error: 'Promo code already exists' })
      }
      next(err)
    }
  }
)

// DELETE /admin/promos/:id — delete promo code
router.delete('/promos/:id',
  requireAdmin,
  param('id').isInt({ min: 1 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    try {
      const result = await pool.query(
        'DELETE FROM promo_codes WHERE id=$1 RETURNING id, code',
        [req.params.id]
      )
      if (!result.rows.length) return res.status(404).json({ error: 'Promo code not found' })
      res.json({ deleted: result.rows[0].id, code: result.rows[0].code })
    } catch (err) { next(err) }
  }
)

// PATCH /admin/orders/:id/status — change any order status
router.patch('/orders/:id/status',
  requireAdmin,
  param('id').isInt({ min: 1 }),
  body('status').isIn(VALID_STATUSES),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    try {
      const result = await pool.query(
        `UPDATE orders SET status=$1 WHERE id=$2 RETURNING id, status, user_id`,
        [req.body.status, req.params.id]
      )
      if (!result.rows.length) return res.status(404).json({ error: 'Order not found' })
      res.json(result.rows[0])
    } catch (err) { next(err) }
  }
)

export default router
