import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

// Basic in-memory rate limiting — resets per 15-minute window
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const rec = loginAttempts.get(ip)
  if (!rec || now > rec.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (rec.count >= MAX_ATTEMPTS) return false
  rec.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
        { status: 429 },
      )
    }

    const body: unknown = await request.json()
    if (
      !body ||
      typeof body !== 'object' ||
      typeof (body as Record<string, unknown>).email !== 'string' ||
      typeof (body as Record<string, unknown>).password !== 'string'
    ) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 400 })
    }

    const { email, password } = body as { email: string; password: string }
    if (email.length > 254 || password.length > 256) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 400 })
    }

    const user = await prisma.usuario.findUnique({ where: { email } })
    if (!user || !user.activo) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    await prisma.usuario.update({
      where: { id: user.id },
      data: { ultimoLogin: new Date() },
    })

    // Fire-and-forget audit log — don't block login on audit failure
    prisma.auditLog
      .create({
        data: {
          usuarioId: user.id,
          accion: 'LOGIN',
          tabla: 'Usuario',
          registroId: user.id,
          detalles: `Login desde IP ${ip}`,
        },
      })
      .catch(console.error)

    const token = signToken({ id: user.id, email: user.email, rol: user.rol })

    const maxAgeSeconds = 8 * 60 * 60
    const expiresAt = Date.now() + maxAgeSeconds * 1000

    const response = NextResponse.json({
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
      expiresAt,
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: maxAgeSeconds,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}