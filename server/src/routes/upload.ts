import { Router } from 'express'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import { AuthRequest, requireAdmin } from '../middleware/auth'

const router = Router()

// ─── Supabase client (service_role — обходит RLS для server-side upload) ─────
const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const BUCKET = process.env.SUPABASE_BUCKET ?? 'product-images'

const supabaseEnabled = !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
const supabase = supabaseEnabled
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null

if (!supabaseEnabled) {
  console.warn('[upload] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY не заданы — upload отключён')
}

// ─── Multer (memory storage, 5 MB лимит, только изображения) ─────────────────
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error('Недопустимый тип файла. Разрешены: JPEG, PNG, WEBP, GIF'))
      return
    }
    cb(null, true)
  },
})

// ─── POST /upload/product-image (admin only) ─────────────────────────────────
// multipart/form-data с полем `file`. Ответ: { url: string, path: string }
router.post('/product-image',
  requireAdmin,
  (req, res, next) => {
    upload.single('file')(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'Файл слишком большой (максимум 5 MB)' })
        }
        return res.status(400).json({ error: err.message })
      }
      if (err instanceof Error) return res.status(400).json({ error: err.message })
      next()
    })
  },
  async (req: AuthRequest, res, next) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Storage не настроен на сервере' })
    }
    const file = (req as unknown as { file?: Express.Multer.File }).file
    if (!file) return res.status(400).json({ error: 'Файл не передан (поле "file")' })

    try {
      const ext = file.mimetype.split('/')[1].replace('jpeg', 'jpg')
      const randomId = Math.random().toString(36).slice(2, 10)
      const path = `products/${Date.now()}-${randomId}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '31536000',   // 1 год — immutable path
          upsert: false,
        })

      if (uploadErr) {
        console.error('[upload] supabase upload error:', uploadErr)
        return res.status(502).json({ error: `Ошибка загрузки: ${uploadErr.message}` })
      }

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
      res.status(201).json({ url: pub.publicUrl, path })
    } catch (err) { next(err) }
  }
)

export default router
