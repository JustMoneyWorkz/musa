import { useState, useCallback, useEffect, useRef } from 'react'
import { cartApi, ApiError } from '../lib/api'

export type CartQty = Record<string, number>

export function useCart() {
  const [cartQty, setCartQty] = useState<CartQty>({})
  const [loading, setLoading] = useState(true)
  // Abort in-flight requests on unmount
  const mounted = useRef(true)

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

  // ── Optimistic add (increment by 1) ─────────────────────────────────────
  const addToCart = useCallback(async (id: string) => {
    const prev = cartQty[id] ?? 0
    const next = prev + 1
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
  }, [cartQty])

  // ── Optimistic decrement ─────────────────────────────────────────────────
  const decrement = useCallback(async (id: string) => {
    const prev = cartQty[id] ?? 0
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
  }, [cartQty])

  // ── Clear cart ───────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    const prev = { ...cartQty }
    setCartQty({})
    try {
      await cartApi.clear()
    } catch (err) {
      setCartQty(prev)
      console.warn('[useCart] clear failed:', err)
    }
  }, [cartQty])

  const cartCount = Object.values(cartQty).reduce((s, q) => s + q, 0)

  return { cartQty, cartCount, loading, addToCart, decrement, clearCart }
}
