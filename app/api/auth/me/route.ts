import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/** Usuario actual segun la cookie firmada. La UI lo usa en vez de localStorage. */
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { id: true, nombre: true, email: true, rol: true, activo: true },
  })
  if (!usuario || !usuario.activo) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  return NextResponse.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol })
}
