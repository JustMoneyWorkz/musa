import { Router } from 'express'
import { body, param } from 'express-validator'
import pool from '../db/pool'
import { AuthRequest } from '../middleware/auth'
import { handleValidation } from '../middleware/validate'

const router = Router()

// GET /users/me
router.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      'SELECT telegram_id, username, first_name, last_name, photo_url, phone, created_at FROM users WHERE telegram_id=$1',
      [req.telegramId]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' })
    res.json(result.rows[0])
  } catch (err) { next(err) }
})

// PUT /users/me
router.put('/me',
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone'),
  body('first_name').optional().isString().trim().isLength({ min: 1, max: 128 }),
  body('last_name').optional().isString().trim().isLength({ max: 128 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const { phone, first_name, last_name } = req.body
    try {
      const result = await pool.query(
        `UPDATE users SET
           phone      = COALESCE($1, phone),
           first_name = COALESCE($2, first_name),
           last_name  = COALESCE($3, last_name)
         WHERE telegram_id=$4
         RETURNING telegram_id, username, first_name, last_name, photo_url, phone, created_at`,
        [phone ?? null, first_name ?? null, last_name ?? null, req.telegramId]
      )
      res.json(result.rows[0])
    } catch (err) { next(err) }
  }
)

// GET /users/me/addresses
router.get('/me/addresses', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM addresses WHERE user_id=$1 ORDER BY is_default DESC, created_at ASC',
      [req.telegramId]
    )
    res.json(result.rows)
  } catch (err) { next(err) }
})

// POST /users/me/addresses
router.post('/me/addresses',
  body('address').isString().trim().notEmpty().isLength({ max: 512 }),
  body('label').optional().isString().trim().isLength({ max: 64 }),
  body('is_default').optional().isBoolean(),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const { address, label = 'Адрес', is_default = false } = req.body
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      // Max 5 addresses
      const countRes = await client.query(
        'SELECT COUNT(*) FROM addresses WHERE user_id=$1', [req.telegramId]
      )
      if (parseInt(countRes.rows[0].count) >= 5) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: 'Maximum 5 addresses allowed' })
      }
      // If new address is default, unset others
      if (is_default) {
        await client.query(
          'UPDATE addresses SET is_default=false WHERE user_id=$1', [req.telegramId]
        )
      }
      const result = await client.query(
        'INSERT INTO addresses(user_id, label, address, is_default) VALUES($1,$2,$3,$4) RETURNING *',
        [req.telegramId, label, address, is_default]
      )
      await client.query('COMMIT')
      res.status(201).json(result.rows[0])
    } catch (err) { await client.query('ROLLBACK'); next(err) }
    finally { client.release() }
  }
)

// PUT /users/me/addresses/:id
router.put('/me/addresses/:id',
  param('id').isInt({ min: 1 }),
  body('address').optional().isString().trim().notEmpty().isLength({ max: 512 }),
  body('label').optional().isString().trim().isLength({ max: 64 }),
  body('is_default').optional().isBoolean(),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const { id } = req.params
    const { address, label, is_default } = req.body
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      // Ownership check
      const own = await client.query(
        'SELECT id FROM addresses WHERE id=$1 AND user_id=$2', [id, req.telegramId]
      )
      if (!own.rows.length) {
        await client.query('ROLLBACK')
        return res.status(404).json({ error: 'Address not found' })
      }
      if (is_default) {
        await client.query('UPDATE addresses SET is_default=false WHERE user_id=$1', [req.telegramId])
      }
      const result = await client.query(
        `UPDATE addresses SET
           address    = COALESCE($1, address),
           label      = COALESCE($2, label),
           is_default = COALESCE($3, is_default)
         WHERE id=$4 RETURNING *`,
        [address ?? null, label ?? null, is_default ?? null, id]
      )
      await client.query('COMMIT')
      res.json(result.rows[0])
    } catch (err) { await client.query('ROLLBACK'); next(err) }
    finally { client.release() }
  }
)

// DELETE /users/me/addresses/:id
router.delete('/me/addresses/:id',
  param('id').isInt({ min: 1 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    try {
      const result = await pool.query(
        'DELETE FROM addresses WHERE id=$1 AND user_id=$2 RETURNING id',
        [req.params.id, req.telegramId]
      )
      if (!result.rows.length) return res.status(404).json({ error: 'Address not found' })
      res.json({ deleted: result.rows[0].id })
    } catch (err) { next(err) }
  }
)

export default router
