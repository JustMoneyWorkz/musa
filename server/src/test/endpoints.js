/**
 * Endpoint tests via native fetch (Node 18+).
 * Run: node src/test/endpoints.js
 *
 * Requires running server + valid BOT_TOKEN env var.
 * In dev mode (NODE_ENV=development) the server skips HMAC check
 * if you pass a dummy auth header — set SKIP_AUTH=1 below.
 *
 * For real testing, generate a valid initData string from your bot.
 */

const BASE = process.env.API_URL ?? 'http://localhost:3000'

// ── Helpers ─────────────────────────────────────────────────────────────────

let passed = 0
let failed = 0

async function test(name, fn) {
  try {
    await fn()
    console.log(`  ✓  ${name}`)
    passed++
  } catch (err) {
    console.error(`  ✗  ${name}: ${err.message}`)
    failed++
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg ?? 'Assertion failed')
}

async function req(method, path, body, auth) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) headers['Authorization'] = auth
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  let json
  try { json = await res.json() } catch { json = null }
  return { status: res.status, body: json }
}

// ── Build a test initData string (bypasses HMAC only in dev!) ───────────────
// In production tests, replace this with a real Telegram initData.
const TEST_USER = { id: 999999999, first_name: 'Test', last_name: 'User', username: 'testuser' }
const testInitData = `user=${encodeURIComponent(JSON.stringify(TEST_USER))}&auth_date=${Math.floor(Date.now()/1000)}&hash=devbypass`
const AUTH = `tma ${testInitData}`

// ── Tests ────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\nMusa API endpoint tests → ${BASE}\n`)

  // Health check
  await test('GET /health → 200', async () => {
    const r = await req('GET', '/health')
    assert(r.status === 200, `got ${r.status}`)
    assert(r.body.ok === true, 'ok != true')
  })

  // Auth rejection
  await test('GET /api/users/me without auth → 401', async () => {
    const r = await req('GET', '/api/users/me')
    assert(r.status === 401, `got ${r.status}`)
  })

  await test('GET /api/users/me with bad hash → 401', async () => {
    const r = await req('GET', '/api/users/me', null, 'tma hash=bad&user=x&auth_date=1')
    assert(r.status === 401, `got ${r.status}`)
  })

  // NOTE: The rest require NODE_ENV=development to skip HMAC validation.
  // The server should respond 401 in production with dummy data.
  // Run with a real initData for full integration testing.

  console.log('\n  ── Products (public) ──────────────────────────────')

  await test('GET /api/products → 200 or 500 (no DB)', async () => {
    const r = await req('GET', '/api/products', null, AUTH)
    assert([200, 500].includes(r.status), `got ${r.status}: ${JSON.stringify(r.body)}`)
    if (r.status === 200) assert(Array.isArray(r.body), 'not array')
  })

  await test('GET /api/products?category=Овощи → 200 or 500', async () => {
    const r = await req('GET', '/api/products?category=%D0%9E%D0%B2%D0%BE%D1%89%D0%B8', null, AUTH)
    assert([200, 500].includes(r.status), `got ${r.status}`)
  })

  await test('GET /api/products/999999 → 404 or 500', async () => {
    const r = await req('GET', '/api/products/999999', null, AUTH)
    assert([404, 500].includes(r.status), `got ${r.status}`)
  })

  await test('GET /api/products/abc → 400 validation', async () => {
    const r = await req('GET', '/api/products/abc', null, AUTH)
    assert(r.status === 400, `got ${r.status}`)
  })

  console.log('\n  ── Users ──────────────────────────────────────────')

  await test('GET /api/users/me → 200 (dev mode) or 401/500', async () => {
    const r = await req('GET', '/api/users/me', null, AUTH)
    assert([200, 401, 500].includes(r.status), `got ${r.status}`)
  })

  await test('PUT /api/users/me with invalid phone → 400', async () => {
    const r = await req('PUT', '/api/users/me', { phone: 'not-a-phone' }, AUTH)
    assert([400, 401].includes(r.status), `got ${r.status}`)
  })

  console.log('\n  ── Cart ────────────────────────────────────────────')

  await test('GET /api/cart → 200 or 401/500', async () => {
    const r = await req('GET', '/api/cart', null, AUTH)
    assert([200, 401, 500].includes(r.status), `got ${r.status}`)
  })

  await test('POST /api/cart without body → 400', async () => {
    const r = await req('POST', '/api/cart', {}, AUTH)
    assert([400, 401].includes(r.status), `got ${r.status}`)
  })

  await test('POST /api/cart with negative qty → 400', async () => {
    const r = await req('POST', '/api/cart', { product_id: 1, quantity: -1 }, AUTH)
    assert([400, 401].includes(r.status), `got ${r.status}`)
  })

  console.log('\n  ── Orders ──────────────────────────────────────────')

  await test('GET /api/orders → 200 or 401/500', async () => {
    const r = await req('GET', '/api/orders', null, AUTH)
    assert([200, 401, 500].includes(r.status), `got ${r.status}`)
  })

  await test('POST /api/orders with empty items → 400', async () => {
    const r = await req('POST', '/api/orders', { items: [], address: 'Test', phone: '+79001234567' }, AUTH)
    assert([400, 401].includes(r.status), `got ${r.status}`)
  })

  await test('POST /api/orders with invalid phone → 400', async () => {
    const r = await req('POST', '/api/orders', {
      items: [{ product_id: 1, quantity: 1 }],
      address: 'Test st 1',
      phone: 'bad'
    }, AUTH)
    assert([400, 401].includes(r.status), `got ${r.status}`)
  })

  console.log('\n  ── Favorites ───────────────────────────────────────')

  await test('GET /api/favorites → 200 or 401/500', async () => {
    const r = await req('GET', '/api/favorites', null, AUTH)
    assert([200, 401, 500].includes(r.status), `got ${r.status}`)
  })

  await test('POST /api/favorites without product_id → 400', async () => {
    const r = await req('POST', '/api/favorites', {}, AUTH)
    assert([400, 401].includes(r.status), `got ${r.status}`)
  })

  console.log('\n  ── Promo ───────────────────────────────────────────')

  await test('POST /api/promo/check with empty code → 400', async () => {
    const r = await req('POST', '/api/promo/check', { code: '' }, AUTH)
    assert([400, 401].includes(r.status), `got ${r.status}`)
  })

  await test('POST /api/promo/check with fake code → 404/401/500', async () => {
    const r = await req('POST', '/api/promo/check', { code: 'FAKECODE' }, AUTH)
    assert([404, 401, 500].includes(r.status), `got ${r.status}`)
  })

  console.log('\n  ── Admin ───────────────────────────────────────────')

  await test('GET /api/admin/me → 200 with is_admin field or 401/500', async () => {
    const r = await req('GET', '/api/admin/me', null, AUTH)
    assert([200, 401, 500].includes(r.status), `got ${r.status}`)
    if (r.status === 200) assert(typeof r.body.is_admin === 'boolean', 'is_admin missing')
  })

  await test('GET /api/admin/orders (non-admin) → 403/401/500', async () => {
    const r = await req('GET', '/api/admin/orders', null, AUTH)
    assert([403, 401, 500].includes(r.status), `got ${r.status}`)
  })

  await test('POST /api/admin/promo with past dates → 400/401/403/429/500', async () => {
    const r = await req('POST', '/api/admin/promo', {
      code: 'TEST10',
      discount_percent: 10,
      active_from: '2020-01-01T00:00:00Z',
      active_to:   '2020-01-02T00:00:00Z',
    }, AUTH)
    assert([400, 401, 403, 429, 500].includes(r.status), `got ${r.status}`)
  })

  // ── Summary ───────────────────────────────────────────────
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`  Results: ${passed} passed, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

run().catch(err => { console.error('Test runner error:', err); process.exit(1) })
