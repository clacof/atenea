import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { parseBody } from '@/lib/schemas'

const cambioPasswordSchema = z.object({
  actual: z.string({ error: 'Ingresa tu contrasena actual' }).min(1, 'Ingresa tu contrasena actual').max(256),
  nueva: z
    .string({ error: 'La contrasena debe tener al menos 6 caracteres' })
    .min(6, 'La contrasena debe tener al menos 6 caracteres')
    .max(256),
})

/** Cambio de contrasena del propio usuario, verificando la actual. */
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, response } = await parseBody(request, cambioPasswordSchema)
  if (response) return response

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: user.id } })
    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!(await bcrypt.compare(data.actual, usuario.passwordHash))) {
      return NextResponse.json({ error: 'La contrasena actual no es correcta' }, { status: 400 })
    }

    await prisma.usuario.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(data.nueva, 12) },
    })
    audit({ user, accion: 'EDITAR', tabla: 'Usuario', registroId: user.id, detalles: { password: 'cambiada por el propio usuario' } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Error al cambiar la contrasena' }, { status: 500 })
  }
}
