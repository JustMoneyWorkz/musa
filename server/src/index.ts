import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { validateInitData } from './middleware/auth'
import { userRateLimit, authRateLimit } from './middleware/rateLimiter'
import usersRouter    from './routes/users'
import productsRouter from './routes/products'
import ordersRouter   from './routes/orders'
import cartRouter     from './routes/cart'
import favoritesRouter from './routes/favorites'
import promoRouter    from './routes/promo'
import adminRouter    from './routes/admin'
import uploadRouter   from './routes/upload'

const app  = express()
const PORT = parseInt(process.env.PORT ?? '3000', 10)

// ─── Security headers ────────────────────────────────────────
app.use(helmet())

// ─── CORS ────────────────────────────────────────────────────
const allowedOrigin = process.env.ALLOWED_ORIGIN ?? ''
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, server-to-server) in dev only
    if (!origin && process.env.NODE_ENV === 'development') return cb(null, true)
    if (origin === allowedOrigin) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// ─── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))

// ─── Health check (no auth) ──────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

// ─── All API routes need auth + rate limit ───────────────────
app.use('/api', authRateLimit, validateInitData, userRateLimit)

app.use('/api/users',     usersRouter)
app.use('/api/products',  productsRouter)
app.use('/api/orders',    ordersRouter)
app.use('/api/cart',      cartRouter)
app.use('/api/favorites', favoritesRouter)
app.use('/api/promo',     promoRouter)
app.use('/api/admin',     adminRouter)
app.use('/api/upload',    uploadRouter)

// ─── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// ─── Global error handler ────────────────────────────────────
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof Error && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' })
  }
  console.error('[error]', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`[server] Musa API running on port ${PORT}`)
})

export default app
