import { useState, useCallback, useEffect, useRef } from 'react'
import { cartApi, ApiError } from '../lib/api'

export type CartQty = Record<string, number>

export function useCart() {
  const [cartQty, setCartQty] = useState<CartQty>({})
  const [loading, setLoading] = useState(true)
  // Abort in-flight requests on unmount
  const mounted = useRef(true)
  // Live ref на cartQty, чтобы стабильные useCallback-методы видели актуальное состояние
  const cartQtyRef = useRef<CartQty>({})
  cartQtyRef.current = cartQty

  // ── Fetch from API on mount ──────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true
    cartApi.get()
      .then(items => {
        if (!mounted.current) return
        const qty: CartQty = {}
        items.forEach(i => { qty[String(i.product_id)] = i.quantity })
        setCartQty(qty)
      })
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) return // not in TG
        console.warn('[useCart] fetch failed:', err)
      })
      .finally(() => { if (mounted.current) setLoading(false) })
    return () => { mounted.current = false }
  }, [])

  // ── Optimistic add (по умолчанию +1, можно передать кастомное delta) ────
  const addToCart = useCallback(async (id: string, delta: number = 1) => {
    if (delta < 1) return
    const prev = cartQtyRef.current[id] ?? 0
    const next = prev + delta
    setCartQty(q => ({ ...q, [id]: next }))
    try {
      await cartApi.set(parseInt(id), next)
    } catch (err) {
      // Rollback
      setCartQty(q => {
        const r = { ...q }
        if (prev === 0) delete r[id]
        else r[id] = prev
        return r
      })
      console.warn('[useCart] addToCart failed:', err)
    }
  }, [])

  // ── Optimistic decrement ─────────────────────────────────────────────────
  const decrement = useCallback(async (id: string) => {
    const prev = cartQtyRef.current[id] ?? 0
    if (prev === 0) return
    const next = prev - 1

    setCartQty(q => {
      const r = { ...q }
      if (next === 0) delete r[id]
      else r[id] = next
      return r
    })

    try {
      if (next === 0) {
        await cartApi.remove(parseInt(id))
      } else {
        await cartApi.set(parseInt(id), next)
      }
    } catch (err) {
      // Rollback
      setCartQty(q => ({ ...q, [id]: prev }))
      console.warn('[useCart] decrement failed:', err)
    }
  }, [])

  // ── Clear cart ───────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    const prev = { ...cartQtyRef.current }
    setCartQty({})
    try {
      await cartApi.clear()
    } catch (err) {
      setCartQty(prev)
      console.warn('[useCart] clear failed:', err)
    }
  }, [])

  const cartCount = Object.values(cartQty).reduce((s, q) => s + q, 0)

  return { cartQty, cartCount, loading, addToCart, decrement, clearCart }
}
