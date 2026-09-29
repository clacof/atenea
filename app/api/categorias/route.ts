import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { audit } from '@/lib/audit'
import { categoriaCreateSchema, parseBody } from '@/lib/schemas'

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
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'categorias.editar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { data, response } = await parseBody(request, categoriaCreateSchema)
  if (response) return response

  try {
    const categoria = await prisma.categoria.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        isAfterhour: Boolean(data.isAfterhour),
        precioCliente: data.precioCliente || null,
        precioChica: data.precioChica || null,
        comisionChica: data.comisionChica || null,
        precio: data.precio || null,
        comision: data.comision,
        recargoCreditoCliente: data.recargoCreditoCliente || null,
        recargoCreditoChica: data.recargoCreditoChica || null,
        soloTransferencia: Boolean(data.soloTransferencia),
      },
    })

    audit({ user, accion: 'CREAR', tabla: 'Categoria', registroId: categoria.id, detalles: { nombre: categoria.nombre } })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    console.error('Error creating categoria:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}