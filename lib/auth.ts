import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface AuthUser {
  id: number
  email: string
  rol: string
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not configured')
  return secret
}

function validatePayload(payload: unknown): AuthUser | null {
  if (!payload || typeof payload !== 'object') return null
  const p = payload as Record<string, unknown>
  if (typeof p.id !== 'number' || typeof p.email !== 'string' || typeof p.rol !== 'string') return null
  return { id: p.id, email: p.email, rol: p.rol }
}

export function signToken(payload: { id: number; email: string; rol: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '8h' })
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return validatePayload(jwt.verify(token, getJwtSecret()))
  } catch {
    return null
  }
}

export function getUserFromRequest(request: NextRequest): AuthUser | null {
  // Prefer httpOnly cookie (more secure)
  const cookieToken = request.cookies.get('token')?.value
  if (cookieToken) return verifyToken(cookieToken)

  // Fallback: Authorization header for backward compatibility
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return verifyToken(authHeader.substring(7))
  }
  return null
}