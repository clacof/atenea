import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPrismaNotFound } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { audit } from '@/lib/audit'
import { comandaEstadoSchema, parseBody, parseId } from '@/lib/schemas'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const comanda = await prisma.comanda.findUnique({
      where: { id: Number(id) },
      include: {
        categoria: true,
        chica1: true,
        chica2: true,
        usuario: { select: { nombre: true } },
      },
    })

    if (!comanda) {
      return NextResponse.json({ error: 'Comanda no encontrada' }, { status: 404 })
    }

    return NextResponse.json(comanda)
  } catch (error) {
    console.error('Error fetching comanda:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const id = parseId((await params).id)
  if (!id) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
  }

  const { data, response } = await parseBody(request, comandaEstadoSchema)
  if (response) return response
  const { estado } = data

  try {
    const anterior = await prisma.comanda.findUnique({ where: { id }, select: { estado: true } })
    if (!anterior) {
      return NextResponse.json({ error: 'Comanda no encontrada' }, { status: 404 })
    }

    const comanda = await prisma.comanda.update({
      where: { id },
      data: { estado },
      include: {
        categoria: true,
        chica1: true,
        chica2: true,
        usuario: { select: { nombre: true } },
      },
    })

    if (anterior.estado !== estado) {
      audit({
        user,
        accion: estado === 'anulada' ? 'ANULAR' : 'CAMBIO_ESTADO',
        tabla: 'Comanda',
        registroId: id,
        detalles: {
          estado: [anterior.estado, estado],
          cliente: comanda.clienteNombre,
          precioFinal: comanda.precioFinal,
        },
      })
    }

    return NextResponse.json(comanda)
  } catch (error) {
    console.error('Error updating comanda:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Comanda no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error al actualizar comanda' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'comandas.anular')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const id = parseId((await params).id)
    if (!id) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }
    const comanda = await prisma.comanda.update({
      where: { id },
      data: { estado: 'anulada' },
    })
    audit({
      user,
      accion: 'ANULAR',
      tabla: 'Comanda',
      registroId: id,
      detalles: { cliente: comanda.clienteNombre, precioFinal: comanda.precioFinal },
    })

    return NextResponse.json({ message: 'Comanda anulada' })
  } catch (error) {
    console.error('Error deleting comanda:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Comanda no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error al anular comanda' }, { status: 500 })
  }
}
