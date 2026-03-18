import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getUserFromRequest } from '../../../../lib/auth'

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
    const categoria = await prisma.categoria.findUnique({
      where: { id: Number(id) },
    })

    if (!categoria) {
      return NextResponse.json({ error: 'Categoria no encontrada' }, { status: 404 })
    }

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Error fetching categoria:', error)
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

    const categoria = await prisma.categoria.update({
      where: { id: Number(id) },
      data,
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Error updating categoria:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user || !['admin', 'supervisor'].includes(user.rol)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.categoria.update({
      where: { id: Number(id) },
      data: { activa: false },
    })

    return NextResponse.json({ message: 'Categoria desactivada' })
  } catch (error) {
    console.error('Error deleting categoria:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
