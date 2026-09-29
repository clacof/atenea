import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const chicas = await prisma.chica.findMany({
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json(chicas)
  } catch (error) {
    console.error('Error fetching chicas:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: `Error al obtener chicas: ${errorMessage}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || !['admin', 'supervisor'].includes(user.rol)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const data = await request.json()
    
    // Validacion basica
    if (!data.nombre || !data.nombre.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const chica = await prisma.chica.create({
      data: {
        nombre: data.nombre.trim(),
      },
    })

    return NextResponse.json(chica, { status: 201 })
  } catch (error) {
    console.error('Error creating chica:', error)
    return NextResponse.json({ error: 'Error al crear la chica' }, { status: 500 })
  }
}