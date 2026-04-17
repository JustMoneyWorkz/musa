import { Router } from 'express'
import { body, param } from 'express-validator'
import pool from '../db/pool'
import { AuthRequest } from '../middleware/auth'
import { handleValidation } from '../middleware/validate'

const router = Router()

// GET /favorites
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.*
       FROM favorites f
       JOIN products p ON p.id = f.product_id
       WHERE f.user_id=$1
       ORDER BY p.name`,
      [req.telegramId]
    )
    res.json(result.rows)
  } catch (err) { next(err) }
})

// POST /favorites
router.post('/',
  body('product_id').isInt({ min: 1 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const { product_id } = req.body
    try {
      const prod = await pool.query('SELECT id FROM products WHERE id=$1', [product_id])
      if (!prod.rows.length) return res.status(404).json({ error: 'Product not found' })

      await pool.query(
        'INSERT INTO favorites(user_id, product_id) VALUES($1,$2) ON CONFLICT DO NOTHING',
        [req.telegramId, product_id]
      )
      res.status(201).json({ user_id: req.telegramId, product_id })
    } catch (err) { next(err) }
  }
)

// DELETE /favorites/:product_id
router.delete('/:product_id',
  param('product_id').isInt({ min: 1 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    try {
      const result = await pool.query(
        'DELETE FROM favorites WHERE user_id=$1 AND product_id=$2 RETURNING product_id',
        [req.telegramId, req.params.product_id]
      )
      if (!result.rows.length) return res.status(404).json({ error: 'Favorite not found' })
      res.json({ deleted: result.rows[0].product_id })
    } catch (err) { next(err) }
  }
)

export default router
