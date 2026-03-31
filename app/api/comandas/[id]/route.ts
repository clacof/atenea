import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPrismaNotFound } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

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

  try {
    const { id } = await params
    const data = await request.json()
    const { estado } = data

    if (!['activa', 'pagada', 'anulada'].includes(estado)) {
      return NextResponse.json({ error: 'Estado invalido' }, { status: 400 })
    }

    const comanda = await prisma.comanda.update({
      where: { id: Number(id) },
      data: { estado },
      include: {
        categoria: true,
        chica1: true,
        chica2: true,
        usuario: { select: { nombre: true } },
      },
    })

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
  if (!user || !['admin', 'supervisor'].includes(user.rol)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.comanda.update({
      where: { id: Number(id) },
      data: { estado: 'anulada' },
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
