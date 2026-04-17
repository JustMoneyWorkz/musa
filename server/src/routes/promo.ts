import { Router } from 'express'
import { body } from 'express-validator'
import pool from '../db/pool'
import { handleValidation } from '../middleware/validate'

const router = Router()

// POST /promo/check
router.post('/check',
  body('code').isString().trim().notEmpty().isLength({ max: 32 }),
  handleValidation,
  async (req, res, next) => {
    const code = (req.body.code as string).toUpperCase()
    try {
      // First check existence (to differentiate "not found" vs "expired")
      const existsRes = await pool.query(
        `SELECT id, code, discount_percent, active_from, active_to
         FROM promo_codes WHERE code=$1`,
        [code]
      )
      if (!existsRes.rows.length) {
        return res.status(404).json({ error: 'Promo code not found' })
      }
      const promo = existsRes.rows[0]
      const now = new Date()
      if (new Date(promo.active_to) < now || new Date(promo.active_from) > now) {
        return res.status(410).json({ error: 'Promo code expired' })
      }
      res.json({ id: promo.id, code: promo.code, discount_percent: promo.discount_percent })
    } catch (err) { next(err) }
  }
)

export default router
