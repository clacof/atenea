import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const includeInactive =
      searchParams.get('includeInactive') === '1' ||
      searchParams.get('includeInactive') === 'true'

    const categorias = await prisma.categoria.findMany({
      where: includeInactive ? undefined : { activa: true },
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Error fetching categorias:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: `Error al obtener categorias: ${errorMessage}` }, { status: 500 })
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
    if (!data.nombre || !data.tipo) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Validar segun el tipo
    if (data.tipo === 'trago') {
      if (!data.precioCliente || !data.precioChica || data.comisionChica === undefined) {
        return NextResponse.json({ error: 'Para tragos se requieren precioCliente, precioChica y comisionChica' }, { status: 400 })
      }
    } else if (data.tipo === 'botella') {
      if (!data.precio) {
        return NextResponse.json({ error: 'Para botellas se requiere precio' }, { status: 400 })
      }
    }

    const categoria = await prisma.categoria.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        isAfterhour: Boolean(data.isAfterhour),
        precioCliente: data.precioCliente || null,
        precioChica: data.precioChica || null,
        comisionChica: data.comisionChica || null,
        precio: data.precio || null,
        recargoCreditoCliente: data.recargoCreditoCliente || null,
        recargoCreditoChica: data.recargoCreditoChica || null,
        soloTransferencia: Boolean(data.soloTransferencia),
      },
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    console.error('Error creating categoria:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}