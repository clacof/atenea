import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: number
  email: string
  nombre: string
  rol: 'admin' | 'usuario'
}

interface AuthState {
  user: User | null
  sessionExpiresAt: number | null
  isAuthenticated: boolean
  setUser: (user: User | null, expiresAt?: number | null) => void
  clearAuth: () => void
  isSessionValid: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      sessionExpiresAt: null,
      isAuthenticated: false,
      setUser: (user, expiresAt) =>
        set({
          user,
          sessionExpiresAt: expiresAt ?? null,
          isAuthenticated: !!user,
        }),
      clearAuth: () =>
        set({
          user: null,
          sessionExpiresAt: null,
          isAuthenticated: false,
        }),
      isSessionValid: () => {
        const { sessionExpiresAt, isAuthenticated } = get()
        if (!isAuthenticated || !sessionExpiresAt) return false
        return Date.now() < sessionExpiresAt
      },
    }),
    {
      name: 'atenea-auth-storage',
      partialize: (state) => ({
        user: state.user,
        sessionExpiresAt: state.sessionExpiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export const isSessionExpired = (): boolean => {
  const { sessionExpiresAt, isAuthenticated } = useAuthStore.getState()
  if (!isAuthenticated || !sessionExpiresAt) return true
  return Date.now() >= sessionExpiresAt
}

export const logout = async (): Promise<void> => {
  useAuthStore.getState().clearAuth()
  await fetch('/api/auth/logout', { method: 'POST' }).catch(console.error)
}