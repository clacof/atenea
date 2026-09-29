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
    const chica = await prisma.chica.findUnique({
      where: { id: Number(id) },
    })

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
  if (!user || !['admin', 'supervisor'].includes(user.rol)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    const { nombre, activa } = data as { nombre?: string; activa?: boolean }
    if (!nombre && activa === undefined) {
      return NextResponse.json({ error: 'No se proporcionaron campos validos' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {}
    if (nombre !== undefined) updateData.nombre = String(nombre).trim().slice(0, 100)
    if (activa !== undefined) updateData.activa = Boolean(activa)

    const chica = await prisma.chica.update({
      where: { id: Number(id) },
      data: updateData,
    })

    return NextResponse.json(chica)
  } catch (error) {
    console.error('Error updating chica:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Chica no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error al actualizar chica' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user || user.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.chica.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ message: 'Chica eliminada' })
  } catch (error) {
    console.error('Error deleting chica:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Chica no encontrada' }, { status: 404 })
    }
    // Error de restriccion de clave foranea (P2003 = Foreign key constraint failed)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2003') {
      return NextResponse.json({ error: 'No se puede eliminar: tiene registros historicos asociados' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al eliminar chica' }, { status: 500 })
  }
}
