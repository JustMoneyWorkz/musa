import { Pool, types } from 'pg'

// pg по умолчанию маппит DATE (oid 1082) → JS Date, который сериализуется как
// ISO timestamp с временем (`2026-04-19T00:00:00.000Z`). Фронт ожидает чистый
// `YYYY-MM-DD` (split('-') в formatSlotDate / formatFullSlotDate), иначе видит
// «Invalid Date». Возвращаем строку как есть.
types.setTypeParser(1082, (v: string) => v)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err)
})

export default pool
