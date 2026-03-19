/**
 * Cookies (httpOnly) carry the auth token automatically for same-origin requests.
 * This function exists for API calls that may need extra headers in addition to cookies.
 */
export function getAuthHeaders(): HeadersInit {
  return {}
}

export function getStoredUser<T>() {
  if (typeof window === 'undefined') return null

  const rawUser = localStorage.getItem('user')
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser) as T
  } catch {
    return null
  }
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token') // Legacy cleanup
  localStorage.removeItem('user')
  localStorage.removeItem('sessionExpiresAt')
}

// ── Session expiry ──────────────────────────────────────────────

export function setSessionExpiry(expiresAt: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('sessionExpiresAt', String(expiresAt))
}

export function getSessionExpiry(): number | null {
  if (typeof window === 'undefined') return null
  const val = localStorage.getItem('sessionExpiresAt')
  const parsed = Number(val)
  return val && !isNaN(parsed) ? parsed : null
}

export function isSessionExpired(): boolean {
  const exp = getSessionExpiry()
  if (!exp) return true
  return Date.now() >= exp
}

// ── Remember me ─────────────────────────────────────────────────

export function getRememberedEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('rememberEmail')
}

export function setRememberedEmail(email: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('rememberEmail', email)
}

export function clearRememberedEmail(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('rememberEmail')
}

/**
 * Full logout: clears user data from localStorage and invalidates the httpOnly cookie via the API.
 */
export async function logout(): Promise<void> {
  clearStoredAuth()
  await fetch('/api/auth/logout', { method: 'POST' }).catch(console.error)
}