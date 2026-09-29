'use client'

import { useEffect, useState } from 'react'

export interface CurrentUser {
  id: number
  nombre: string
  email: string
  rol: 'admin' | 'caja' | 'supervisor'
}

// Una sola peticion por carga de pagina, compartida por todos los componentes
let pending: Promise<CurrentUser | null> | null = null

function fetchCurrentUser(): Promise<CurrentUser | null> {
  pending ??= fetch('/api/auth/me', { cache: 'no-store' })
    .then((res) => (res.ok ? (res.json() as Promise<CurrentUser>) : null))
    .catch(() => {
      pending = null
      return null
    })
  return pending
}

/** Usuario actual validado por el servidor (no depende de localStorage). */
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchCurrentUser().then((u) => {
      if (!active) return
      setUser(u)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  return { user, loading }
}

/** Limpiar al cerrar sesion para que el proximo login consulte de nuevo. */
export function resetCurrentUser() {
  pending = null
}
