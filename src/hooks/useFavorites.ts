import { useState, useCallback, useEffect, useRef } from 'react'
import { favoritesApi, ApiError } from '../lib/api'

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  // ── Fetch on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true
    favoritesApi.get()
      .then(products => {
        if (!mounted.current) return
        setFavoriteIds(products.map(p => String(p.id)))
      })
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) return
        console.warn('[useFavorites] fetch failed:', err)
      })
      .finally(() => { if (mounted.current) setLoading(false) })
    return () => { mounted.current = false }
  }, [])

  // ── Refresh (called after closing product overlay) ───────────────────────
  const refreshFavorites = useCallback(() => {
    favoritesApi.get()
      .then(products => setFavoriteIds(products.map(p => String(p.id))))
      .catch(err => console.warn('[useFavorites] refresh failed:', err))
  }, [])

  // ── Toggle (optimistic) ──────────────────────────────────────────────────
  const toggleFavorite = useCallback(async (id: string) => {
    const isFav = favoriteIds.includes(id)
    // Optimistic update
    setFavoriteIds(prev =>
      isFav ? prev.filter(x => x !== id) : [...prev, id]
    )
    try {
      if (isFav) {
        await favoritesApi.remove(parseInt(id))
      } else {
        await favoritesApi.add(parseInt(id))
      }
    } catch (err) {
      // Rollback
      setFavoriteIds(prev =>
        isFav ? [...prev, id] : prev.filter(x => x !== id)
      )
      console.warn('[useFavorites] toggle failed:', err)
    }
  }, [favoriteIds])

  const favoritesCount = favoriteIds.length

  return { favoriteIds, favoritesCount, loading, toggleFavorite, refreshFavorites }
}
