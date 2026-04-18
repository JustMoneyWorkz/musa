import { useState, useEffect, useCallback, useRef } from 'react'
import { productsAdminApi, AdminProduct, ApiError } from '../lib/api'
import type { Product } from '../components/ProductCard'

/**
 * Convert an API product (DB shape) to the frontend Product used by ProductCard etc.
 */
export function apiToFrontend(p: AdminProduct): Product {
  const hasDiscount = p.price_discounted != null && p.price_discounted < p.price
  return {
    id: String(p.id),
    title: p.name,
    weight: p.weight,
    price: hasDiscount ? p.price_discounted! : p.price,
    oldPrice: hasDiscount ? p.price : undefined,
    discount: hasDiscount
      ? `-${Math.round((1 - (p.price_discounted! / p.price)) * 100)}%`
      : undefined,
    imageSrc: p.images[0] ?? '',
    images: p.images,
    category: p.category,
    inStock: p.stock > 0,
  }
}

/**
 * Загружает товары из API (источник правды). Используется и в каталоге пользователя,
 * и в админке. Поддерживает refresh после CRUD-операций.
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productsAdminApi.getAll()
      if (!mounted.current) return
      setProducts(data.map(apiToFrontend))
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return
      console.warn('[useProducts] fetch failed:', err)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    fetchProducts()
    return () => { mounted.current = false }
  }, [fetchProducts])

  return { products, loading, refresh: fetchProducts }
}
