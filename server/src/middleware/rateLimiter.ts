import rateLimit from 'express-rate-limit'
import { AuthRequest } from './auth'
import { Request } from 'express'

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'

/** 60 req/min per telegram user (falls back to IP if not authenticated yet) */
export const userRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  keyGenerator: (req: Request) => {
    const authReq = req as AuthRequest
    return authReq.telegramId ? String(authReq.telegramId) : (req.ip ?? 'unknown')
  },
  message: { error: 'Too many requests, slow down' },
})

/** Stricter limiter for auth endpoints */
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  message: { error: 'Too many requests' },
})
