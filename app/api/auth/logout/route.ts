import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (user) {
    prisma.auditLog
      .create({
        data: {
          usuarioId: user.id,
          accion: 'LOGOUT',
          tabla: 'Usuario',
          registroId: user.id,
        },
      })
      .catch(console.error)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  return response
}
