import { useState, useCallback, useEffect, useRef } from 'react'
import { addressesApi, Address, ApiError } from '../lib/api'

export const MAX_ADDRESSES = 5

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  // ── Fetch on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true
    addressesApi.get()
      .then(data => { if (mounted.current) setAddresses(data) })
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) return
        console.warn('[useAddresses] fetch failed:', err)
      })
      .finally(() => { if (mounted.current) setLoading(false) })
    return () => { mounted.current = false }
  }, [])

  // ── Add ──────────────────────────────────────────────────────────────────
  const addAddress = useCallback(async (data: {
    address: string
    label?: string
    is_default?: boolean
  }): Promise<{ error?: string }> => {
    if (addresses.length >= MAX_ADDRESSES) {
      return { error: `Максимум ${MAX_ADDRESSES} адресов` }
    }
    try {
      const created = await addressesApi.add(data)
      setAddresses(prev => {
        // If new is default, unset others
        const updated = data.is_default
          ? prev.map(a => ({ ...a, is_default: false }))
          : [...prev]
        return [...updated, created]
      })
      return {}
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Ошибка сервера'
      return { error: msg }
    }
  }, [addresses.length])

  // ── Delete ───────────────────────────────────────────────────────────────
  const removeAddress = useCallback(async (id: number): Promise<void> => {
    const prev = addresses
    setAddresses(a => a.filter(x => x.id !== id))
    try {
      await addressesApi.remove(id)
    } catch (err) {
      setAddresses(prev)
      console.warn('[useAddresses] remove failed:', err)
    }
  }, [addresses])

  // ── Set default ──────────────────────────────────────────────────────────
  const setDefault = useCallback(async (id: number): Promise<void> => {
    const prev = addresses
    setAddresses(a => a.map(x => ({ ...x, is_default: x.id === id })))
    try {
      await addressesApi.update(id, { is_default: true })
    } catch (err) {
      setAddresses(prev)
      console.warn('[useAddresses] setDefault failed:', err)
    }
  }, [addresses])

  const canAdd = addresses.length < MAX_ADDRESSES

  return { addresses, loading, canAdd, addAddress, removeAddress, setDefault }
}
