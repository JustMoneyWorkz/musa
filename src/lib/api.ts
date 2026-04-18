/**
 * Musa API client
 * Auth: Telegram WebApp initData → Authorization: tma <initData>
 */

const BASE = import.meta.env.VITE_API_URL ?? ''

function getInitData(): string {
  const tg = (window as any).Telegram?.WebApp
  if (tg?.initData) return tg.initData
  // Dev fallback: dummy initData that passes dev-mode server check
  const user = { id: 999999999, first_name: 'Dev', username: 'devuser' }
  const authDate = Math.floor(Date.now() / 1000)
  return `user=${encodeURIComponent(JSON.stringify(user))}&auth_date=${authDate}&hash=devbypass`
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15_000)
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `tma ${getInitData()}`,
        ...(options.headers ?? {}),
      },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({} as any))
      const msg =
        body?.error ??
        (Array.isArray(body?.errors) && body.errors.length > 0
          ? `${body.errors[0].msg}${body.errors[0].path ? ` (${body.errors[0].path})` : ''}`
          : res.statusText)
      throw new ApiError(res.status, msg)
    }
    if (res.status === 204) return undefined as unknown as T
    return res.json()
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(0, 'Сервер не отвечает (таймаут 15с)')
    }
    throw new ApiError(0, err instanceof Error ? err.message : 'Сетевая ошибка')
  } finally {
    clearTimeout(timer)
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product_id: number
  quantity: number
  name: string
  price: number
  price_discounted: number | null
  images: string[]
  stock: number
  weight: string
}

export const cartApi = {
  get: () => apiFetch<CartItem[]>('/api/cart'),

  set: (productId: number, quantity: number) =>
    apiFetch<{ user_id: number; product_id: number; quantity: number }>(
      '/api/cart',
      { method: 'POST', body: JSON.stringify({ product_id: productId, quantity }) }
    ),

  remove: (productId: number) =>
    apiFetch<{ deleted: number }>(`/api/cart/${productId}`, { method: 'DELETE' }),

  clear: () =>
    apiFetch<{ cleared: boolean }>('/api/cart', { method: 'DELETE' }),
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export interface FavoriteProduct {
  id: number
  name: string
  price: number
  price_discounted: number | null
  images: string[]
  weight: string
  category: string
  stock: number
}

export const favoritesApi = {
  get: () => apiFetch<FavoriteProduct[]>('/api/favorites'),

  add: (productId: number) =>
    apiFetch<{ user_id: number; product_id: number }>(
      '/api/favorites',
      { method: 'POST', body: JSON.stringify({ product_id: productId }) }
    ),

  remove: (productId: number) =>
    apiFetch<{ deleted: number }>(`/api/favorites/${productId}`, { method: 'DELETE' }),
}

// ─── Addresses ───────────────────────────────────────────────────────────────

export interface Address {
  id: number
  user_id: number
  label: string
  address: string
  is_default: boolean
  created_at: string
}

export const addressesApi = {
  get: () => apiFetch<Address[]>('/api/users/me/addresses'),

  add: (data: { address: string; label?: string; is_default?: boolean }) =>
    apiFetch<Address>('/api/users/me/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<{ address: string; label: string; is_default: boolean }>) =>
    apiFetch<Address>(`/api/users/me/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    apiFetch<{ deleted: number }>(`/api/users/me/addresses/${id}`, { method: 'DELETE' }),
}

// ─── Delivery Slots ──────────────────────────────────────────────────────────

export interface DeliverySlot {
  id: number
  date: string        // 'YYYY-MM-DD'
  time_range: string  // '09:00 — 12:00'
  districts: string[]
  available: boolean
}

export const slotsApi = {
  get: () => apiFetch<DeliverySlot[]>('/api/orders/slots'),
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: number
  product_id: number
  quantity: number
  price: number
  name: string
  image: string
}

export interface Order {
  id: number
  user_id: number
  status: 'pending' | 'confirmed' | 'assembling' | 'delivering' | 'delivered' | 'cancelled'
  address: string
  phone: string
  delivery_slot_id: number | null
  slot_date: string | null      // from JOIN with delivery_slots
  slot_time: string | null      // from JOIN with delivery_slots
  promo_id: number | null
  promo_code: string | null     // from JOIN with promo_codes
  promo_discount: number | null // from JOIN with promo_codes (only in GET /:id)
  payment_method: 'cash' | 'transfer'
  delivery_fee: number
  total: number
  created_at: string
  items: OrderItem[]
}

export const ordersApi = {
  get: () => apiFetch<Order[]>('/api/orders'),

  getById: (id: number) => apiFetch<Order>(`/api/orders/${id}`),

  create: (data: {
    items: { product_id: number; quantity: number }[]
    address: string
    phone: string
    delivery_slot_id?: number
    promo_code?: string
    payment_method?: 'cash' | 'transfer'
  }) => apiFetch<Order>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),

  confirm: (id: number) =>
    apiFetch<Order>(`/api/orders/${id}/confirm`, { method: 'POST' }),
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminApi = {
  check: () => apiFetch<{ is_admin: boolean }>('/api/admin/check'),
}

export interface AdminProduct {
  id: number
  name: string
  price: number
  price_discounted: number | null
  weight: string
  images: string[]
  category: string
  origin: string | null
  tags: string[]
  description: string | null
  calories: number | null
  carbs: number | null
  fats: number | null
  ripeness: string | null
  stock: number
  created_at: string
}

export interface AdminPromo {
  id: number
  code: string
  discount_percent: number
  active_from: string  // ISO timestamp
  active_to: string    // ISO timestamp
  created_by: number | null
  created_at: string
}

export interface AdminDeliverySlot {
  id: number
  product_id: number | null
  date: string         // 'YYYY-MM-DD'
  time_range: string   // '09:00 — 12:00'
  districts: string[]
  available: boolean
  created_at?: string
}

export const adminSlotsApi = {
  getAll: () => apiFetch<AdminDeliverySlot[]>('/api/admin/delivery-slots'),
  create: (data: { date: string; time_range: string; districts: string[]; product_id?: number }) =>
    apiFetch<AdminDeliverySlot>('/api/admin/delivery-slots', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<{ deleted: number }>(`/api/admin/delivery-slots/${id}`, { method: 'DELETE' }),
}

export const adminPromosApi = {
  getAll: () => apiFetch<AdminPromo[]>('/api/admin/promos'),
  create: (data: { code: string; discount_percent: number; active_from: string; active_to: string }) =>
    apiFetch<AdminPromo>('/api/admin/promos', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) =>
    apiFetch<{ deleted: number; code: string }>(`/api/admin/promos/${id}`, { method: 'DELETE' }),
}

export const productsAdminApi = {
  getAll: () => apiFetch<AdminProduct[]>('/api/products?limit=200'),
  create: (data: Omit<AdminProduct, 'id' | 'created_at'>) =>
    apiFetch<AdminProduct>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Omit<AdminProduct, 'id' | 'created_at'>>) =>
    apiFetch<AdminProduct>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    apiFetch<{ deleted: number }>(`/api/products/${id}`, { method: 'DELETE' }),
}

export interface AdminOrder {
  id: number
  user_id: number
  status: Order['status']
  address: string
  phone: string
  delivery_slot_id: number | null
  slot_date: string | null
  slot_time: string | null
  promo_id: number | null
  promo_code: string | null
  payment_method: 'cash' | 'transfer'
  delivery_fee: number
  total: number
  created_at: string
  items: { product_id: number; quantity: number; price: number; name: string }[]
  // user fields from JOIN
  first_name: string
  last_name: string | null
  username: string | null
  user_phone: string | null
  user_photo: string | null
}

export const adminOrdersApi = {
  getAll: (status?: string) =>
    apiFetch<AdminOrder[]>(`/api/admin/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  updateStatus: (id: number, status: string) =>
    apiFetch<{ id: number; status: string; user_id: number }>(
      `/api/admin/orders/${id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) }
    ),
}

// ─── Promo ───────────────────────────────────────────────────────────────────

export interface PromoResult {
  id: number
  code: string
  discount_percent: number
}

export const promoApi = {
  check: (code: string) =>
    apiFetch<PromoResult>('/api/promo/check', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
}

export const fetchProductCount = (category: string): Promise<number> =>
  apiFetch<{ id: number }[]>(`/api/products?category=${encodeURIComponent(category)}&limit=200`)
    .then(r => r.length)
