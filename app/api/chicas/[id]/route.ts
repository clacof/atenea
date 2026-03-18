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

    const chica = await prisma.chica.update({
      where: { id: Number(id) },
      data,
    })

    return NextResponse.json(chica)
  } catch (error) {
    console.error('Error updating chica:', error)
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
    await prisma.chica.update({
      where: { id: Number(id) },
      data: { activa: false },
    })

    return NextResponse.json({ message: 'Chica desactivada' })
  } catch (error) {
    console.error('Error deleting chica:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
