import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPrismaNotFound } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { audit, diff, type AuditAccion } from '@/lib/audit'
import { chicaUpdateSchema, parseBody, parseId } from '@/lib/schemas'
import { findNombreDuplicado } from '@/lib/chicas'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const id = parseId((await params).id)
    if (!id) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }
    const chica = await prisma.chica.findUnique({ where: { id } })

    if (!chica) {
      return NextResponse.json({ error: 'Chica no encontrada' }, { status: 404 })
    }

    return NextResponse.json(chica)
  } catch (error) {
    console.error('Error fetching chica:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'chicas.editar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const id = parseId((await params).id)
  if (!id) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
  }

  const { data, response } = await parseBody(request, chicaUpdateSchema)
  if (response) return response

  try {
    const actual = await prisma.chica.findUnique({ where: { id } })
    if (!actual) {
      return NextResponse.json({ error: 'Chica no encontrada' }, { status: 404 })
    }

    if (data.nombre && (await findNombreDuplicado(data.nombre, id))) {
      return NextResponse.json({ error: `Ya existe una chica llamada "${data.nombre}"` }, { status: 409 })
    }

    const quedaArchivada = data.archivada ?? actual.archivada
    if (quedaArchivada && data.activa === true) {
      return NextResponse.json({ error: 'Restaura la chica antes de activarla' }, { status: 409 })
    }
    // Una chica archivada nunca queda disponible para comandas
    if (data.archivada === true) data.activa = false

    const chica = await prisma.chica.update({ where: { id }, data })

    const cambios = diff(actual, data)
    if (Object.keys(cambios).length > 0) {
      let accion: AuditAccion = 'EDITAR'
      if ('archivada' in cambios) accion = chica.archivada ? 'ARCHIVAR' : 'RESTAURAR'
      else if (Object.keys(cambios).length === 1 && 'activa' in cambios) accion = 'CAMBIO_ESTADO'
      audit({ user, accion, tabla: 'Chica', registroId: id, detalles: cambios })
    }

    return NextResponse.json(chica)
  } catch (error) {
    console.error('Error updating chica:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Chica no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error al actualizar chica' }, { status: 500 })
  }
}

/**
 * Elimina la chica si no tiene comandas. Si tiene historial, la archiva para
 * conservar reportes y comisiones.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'chicas.eliminar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const id = parseId((await params).id)
    if (!id) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const chica = await prisma.chica.findUnique({ where: { id } })
    if (!chica) {
      return NextResponse.json({ error: 'Chica no encontrada' }, { status: 404 })
    }

    const comandas = await prisma.comanda.count({
      where: { OR: [{ chica1Id: id }, { chica2Id: id }, { chicaRecibeComisionId: id }] },
    })

    if (comandas > 0) {
      await prisma.chica.update({ where: { id }, data: { archivada: true, activa: false } })
      audit({ user, accion: 'ARCHIVAR', tabla: 'Chica', registroId: id, detalles: { nombre: chica.nombre, comandas } })
      return NextResponse.json({
        archivada: true,
        message: `${chica.nombre} tiene ${comandas} comandas en su historial: se archivo en vez de eliminarse`,
      })
    }

    await prisma.chica.delete({ where: { id } })
    audit({ user, accion: 'ELIMINAR', tabla: 'Chica', registroId: id, detalles: { nombre: chica.nombre } })

    return NextResponse.json({ archivada: false, message: 'Chica eliminada' })
  } catch (error) {
    console.error('Error deleting chica:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Chica no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error al eliminar chica' }, { status: 500 })
  }
}
