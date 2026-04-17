import { Router } from 'express'
import { body, param } from 'express-validator'
import pool from '../db/pool'
import { AuthRequest } from '../middleware/auth'
import { handleValidation } from '../middleware/validate'

const router = Router()

// GET /cart
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.product_id, c.quantity,
              p.name, p.price, p.price_discounted, p.images, p.stock, p.weight
       FROM cart c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id=$1`,
      [req.telegramId]
    )
    res.json(result.rows)
  } catch (err) { next(err) }
})

// POST /cart  — add or update quantity
router.post('/',
  body('product_id').isInt({ min: 1 }),
  body('quantity').isInt({ min: 1, max: 999 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const { product_id, quantity } = req.body
    try {
      // Check product exists and has stock
      const prod = await pool.query('SELECT id, stock FROM products WHERE id=$1', [product_id])
      if (!prod.rows.length) return res.status(404).json({ error: 'Product not found' })
      if (prod.rows[0].stock < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' })
      }

      const result = await pool.query(
        `INSERT INTO cart(user_id, product_id, quantity) VALUES($1,$2,$3)
         ON CONFLICT(user_id, product_id) DO UPDATE SET quantity=EXCLUDED.quantity
         RETURNING *`,
        [req.telegramId, product_id, quantity]
      )
      res.status(201).json(result.rows[0])
    } catch (err) { next(err) }
  }
)

// DELETE /cart/:product_id
router.delete('/:product_id',
  param('product_id').isInt({ min: 1 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    try {
      const result = await pool.query(
        'DELETE FROM cart WHERE user_id=$1 AND product_id=$2 RETURNING product_id',
        [req.telegramId, req.params.product_id]
      )
      if (!result.rows.length) return res.status(404).json({ error: 'Cart item not found' })
      res.json({ deleted: result.rows[0].product_id })
    } catch (err) { next(err) }
  }
)

// DELETE /cart  — clear entire cart
router.delete('/', async (req: AuthRequest, res, next) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id=$1', [req.telegramId])
    res.json({ cleared: true })
  } catch (err) { next(err) }
})

export default router
