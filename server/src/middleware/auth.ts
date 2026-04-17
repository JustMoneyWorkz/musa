import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import pool from '../db/pool'

export interface AuthRequest extends Request {
  telegramId?: number
  isAdmin?: boolean
}

/**
 * Validates Telegram WebApp initData per official spec (HMAC-SHA256).
 * Header: Authorization: tma <initData string>
 */
export function validateInitData(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'] ?? ''
  if (!auth.startsWith('tma ')) {
    return res.status(401).json({ error: 'Missing authorization' })
  }

  const initData = auth.slice(4)
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return res.status(401).json({ error: 'Missing hash' })

  // Build check string: all params except hash, sorted, joined by \n
  params.delete('hash')
  const checkArr: string[] = []
  params.forEach((v, k) => checkArr.push(`${k}=${v}`))
  checkArr.sort()
  const checkString = checkArr.join('\n')

  const secret = crypto.createHmac('sha256', 'WebAppData')
    .update(process.env.BOT_TOKEN ?? '')
    .digest()
  const expectedHash = crypto.createHmac('sha256', secret)
    .update(checkString)
    .digest('hex')

  // In development, skip strict HMAC check to allow local testing
  if (process.env.NODE_ENV !== 'development' && expectedHash !== hash) {
    return res.status(401).json({ error: 'Invalid initData signature' })
  }

  // Parse user from initData
  const userStr = params.get('user')
  if (!userStr) return res.status(401).json({ error: 'No user in initData' })

  let user: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string }
  try {
    user = JSON.parse(decodeURIComponent(userStr))
  } catch {
    return res.status(401).json({ error: 'Malformed user field' })
  }

  req.telegramId = user.id

  // Upsert user into DB (non-blocking, fire-and-forget)
  pool.query(
    `INSERT INTO users(telegram_id, username, first_name, last_name, photo_url)
     VALUES($1,$2,$3,$4,$5)
     ON CONFLICT(telegram_id) DO UPDATE SET
       username   = EXCLUDED.username,
       first_name = EXCLUDED.first_name,
       last_name  = EXCLUDED.last_name,
       photo_url  = COALESCE(EXCLUDED.photo_url, users.photo_url)`,
    [user.id, user.username ?? null, user.first_name, user.last_name ?? null, user.photo_url ?? null]
  ).catch(err => console.error('[auth] upsert user error:', err))

  next()
}

/**
 * Must be used AFTER validateInitData.
 * Adds req.isAdmin = true if telegram_id is in admins table.
 */
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.telegramId) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const result = await pool.query('SELECT 1 FROM admins WHERE telegram_id=$1', [req.telegramId])
    if (!result.rowCount || result.rowCount === 0) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    req.isAdmin = true
    next()
  } catch (err) {
    next(err)
  }
}
