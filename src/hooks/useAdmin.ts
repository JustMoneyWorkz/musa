import { useState, useEffect } from 'react'
import { adminApi } from '../lib/api'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.check()
      .then(r => setIsAdmin(r.is_admin))
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false))
  }, [])

  return { isAdmin, loading }
}
