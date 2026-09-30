import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { audit } from '@/lib/audit'
import { comandaCocinaSchema, parseBody, parseId } from '@/lib/schemas'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/comandas/[id]/cocina
 * Body: { estadoCocina: 'pendiente' | 'listo' }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'cocina.gestionar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const id = parseId((await params).id)
  if (!id) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
  }

  const { data, response } = await parseBody(request, comandaCocinaSchema)
  if (response) return response
  const { estadoCocina } = data

  try {
    const actual = await prisma.comanda.findUnique({
      where: { id },
      select: { estadoCocina: true, estado: true },
    })
    if (!actual) {
      return NextResponse.json({ error: 'Comanda no encontrada' }, { status: 404 })
    }
    if (!actual.estadoCocina) {
      return NextResponse.json({ error: 'La comanda no pasa por cocina' }, { status: 400 })
    }
    if (actual.estado === 'anulada') {
      return NextResponse.json({ error: 'La comanda esta anulada' }, { status: 409 })
    }

    const comanda = await prisma.comanda.update({
      where: { id },
      data: {
        estadoCocina,
        cocinaListoAt: estadoCocina === 'listo' ? new Date() : null,
      },
      select: { id: true, estadoCocina: true, cocinaListoAt: true },
    })

    if (actual.estadoCocina !== estadoCocina) {
      audit({ user, accion: 'CAMBIO_ESTADO', tabla: 'Comanda', registroId: id, detalles: { estadoCocina } })
    }

    return NextResponse.json(comanda)
  } catch (error) {
    console.error('Error updating estado cocina:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
