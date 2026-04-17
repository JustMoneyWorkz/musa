import fs from 'fs'
import path from 'path'
import pool from './pool'

async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations')
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        filename TEXT PRIMARY KEY,
        ran_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `)

    for (const file of files) {
      const row = await client.query('SELECT 1 FROM _migrations WHERE filename=$1', [file])
      if (row.rowCount && row.rowCount > 0) {
        console.log(`[migrate] skip ${file}`)
        continue
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
      await client.query(sql)
      await client.query('INSERT INTO _migrations(filename) VALUES($1)', [file])
      console.log(`[migrate] applied ${file}`)
    }
    console.log('[migrate] done')
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch(err => { console.error(err); process.exit(1) })
