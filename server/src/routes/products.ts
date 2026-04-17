import { Router } from 'express'
import { body, param, query } from 'express-validator'
import pool from '../db/pool'
import { AuthRequest, requireAdmin } from '../middleware/auth'
import { handleValidation } from '../middleware/validate'

const router = Router()

// GET /products  (public — no admin needed)
router.get('/',
  query('category').optional().isString().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const category = req.query.category as string | undefined
    const limit  = parseInt(req.query.limit  as string) || 50
    const offset = parseInt(req.query.offset as string) || 0
    try {
      const params: (string | number)[] = [limit, offset]
      let where = ''
      if (category) { params.push(category); where = `WHERE category=$${params.length}` }
      const result = await pool.query(
        `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        params
      )
      res.json(result.rows)
    } catch (err) { next(err) }
  }
)

// GET /products/:id
router.get('/:id',
  param('id').isInt({ min: 1 }),
  handleValidation,
  async (req, res, next) => {
    try {
      const result = await pool.query('SELECT * FROM products WHERE id=$1', [req.params.id])
      if (!result.rows.length) return res.status(404).json({ error: 'Product not found' })
      res.json(result.rows[0])
    } catch (err) { next(err) }
  }
)

// POST /products  (admin only)
router.post('/',
  requireAdmin,
  body('name').isString().trim().notEmpty().isLength({ max: 256 }),
  body('price').isInt({ min: 1 }),
  body('price_discounted').optional().isInt({ min: 1 }),
  body('weight').isString().trim().notEmpty().isLength({ max: 64 }),
  body('images').isArray(),
  body('images.*').isURL(),
  body('category').isString().trim().notEmpty().isLength({ max: 64 }),
  body('origin').optional().isString().trim().isLength({ max: 128 }),
  body('tags').optional().isArray(),
  body('description').optional().isString().trim().isLength({ max: 2048 }),
  body('calories').optional().isFloat({ min: 0 }),
  body('carbs').optional().isFloat({ min: 0 }),
  body('fats').optional().isFloat({ min: 0 }),
  body('ripeness').optional().isString().trim().isLength({ max: 64 }),
  body('stock').isInt({ min: 0 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const { name, price, price_discounted, weight, images, category, origin,
            tags, description, calories, carbs, fats, ripeness, stock } = req.body
    try {
      const result = await pool.query(
        `INSERT INTO products
           (name, price, price_discounted, weight, images, category, origin,
            tags, description, calories, carbs, fats, ripeness, stock)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *`,
        [name, price, price_discounted ?? null, weight, images, category,
         origin ?? null, tags ?? [], description ?? null,
         calories ?? null, carbs ?? null, fats ?? null, ripeness ?? null, stock]
      )
      res.status(201).json(result.rows[0])
    } catch (err) { next(err) }
  }
)

// PUT /products/:id  (admin only)
router.put('/:id',
  requireAdmin,
  param('id').isInt({ min: 1 }),
  body('name').optional().isString().trim().notEmpty().isLength({ max: 256 }),
  body('price').optional().isInt({ min: 1 }),
  body('price_discounted').optional().isInt({ min: 1 }),
  body('weight').optional().isString().trim().notEmpty().isLength({ max: 64 }),
  body('images').optional().isArray(),
  body('category').optional().isString().trim().notEmpty().isLength({ max: 64 }),
  body('stock').optional().isInt({ min: 0 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    const fields = ['name','price','price_discounted','weight','images',
                    'category','origin','tags','description','calories',
                    'carbs','fats','ripeness','stock']
    const sets: string[] = []
    const vals: unknown[] = []
    fields.forEach(f => {
      if (req.body[f] !== undefined) { vals.push(req.body[f]); sets.push(`${f}=$${vals.length}`) }
    })
    if (!sets.length) return res.status(400).json({ error: 'Nothing to update' })
    vals.push(req.params.id)
    try {
      const result = await pool.query(
        `UPDATE products SET ${sets.join(', ')} WHERE id=$${vals.length} RETURNING *`,
        vals
      )
      if (!result.rows.length) return res.status(404).json({ error: 'Product not found' })
      res.json(result.rows[0])
    } catch (err) { next(err) }
  }
)

// DELETE /products/:id  (admin only)
router.delete('/:id',
  requireAdmin,
  param('id').isInt({ min: 1 }),
  handleValidation,
  async (req: AuthRequest, res, next) => {
    try {
      const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING id', [req.params.id])
      if (!result.rows.length) return res.status(404).json({ error: 'Product not found' })
      res.json({ deleted: result.rows[0].id })
    } catch (err: unknown) {
      if ((err as { code?: string }).code === '23503') {
        return res.status(409).json({ error: 'Нельзя удалить товар: есть заказы с этим товаром' })
      }
      next(err)
    }
  }
)

export default router
