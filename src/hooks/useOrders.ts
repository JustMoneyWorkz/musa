import { useState, useCallback, useEffect, useRef } from 'react'
import { ordersApi, Order, ApiError } from '../lib/api'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  const fetchOrders = useCallback(async () => {
    try {
      const data = await ordersApi.get()
      if (mounted.current) setOrders(data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return
      console.warn('[useOrders] fetch failed:', err)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    fetchOrders()
    return () => { mounted.current = false }
  }, [fetchOrders])

  const ACTIVE_STATUSES = ['pending', 'confirmed', 'assembling', 'delivering']
  const activeOrder = orders.find(o => ACTIVE_STATUSES.includes(o.status)) ?? null
  const ordersCount = orders.length

  return { orders, loading, activeOrder, ordersCount, refreshOrders: fetchOrders }
}
