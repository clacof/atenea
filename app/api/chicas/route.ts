import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { audit } from '@/lib/audit'
import { chicaBulkSchema, chicaCreateSchema, parseBody } from '@/lib/schemas'
import { findNombreDuplicado } from '@/lib/chicas'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const incluirArchivadas = request.nextUrl.searchParams.get('archivadas') === '1'
    const chicas = await prisma.chica.findMany({
      where: incluirArchivadas ? undefined : { archivada: false },
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
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'chicas.editar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { data, response } = await parseBody(request, chicaCreateSchema)
  if (response) return response

  try {
    if (await findNombreDuplicado(data.nombre)) {
      return NextResponse.json({ error: `Ya existe una chica llamada "${data.nombre}"` }, { status: 409 })
    }

    const chica = await prisma.chica.create({ data })
    audit({ user, accion: 'CREAR', tabla: 'Chica', registroId: chica.id, detalles: { nombre: chica.nombre } })

    return NextResponse.json(chica, { status: 201 })
  } catch (error) {
    console.error('Error creating chica:', error)
    return NextResponse.json({ error: 'Error al crear la chica' }, { status: 500 })
  }
}

/** Cambio de estado masivo: { ids: number[], activa: boolean } */
export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'chicas.editar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { data, response } = await parseBody(request, chicaBulkSchema)
  if (response) return response

  try {
    const result = await prisma.chica.updateMany({
      where: { id: { in: data.ids }, archivada: false },
      data: { activa: data.activa },
    })
    audit({
      user,
      accion: 'CAMBIO_ESTADO',
      tabla: 'Chica',
      detalles: { ids: data.ids, activa: data.activa, actualizadas: result.count },
    })

    return NextResponse.json({ actualizadas: result.count })
  } catch (error) {
    console.error('Error bulk updating chicas:', error)
    return NextResponse.json({ error: 'Error al actualizar chicas' }, { status: 500 })
  }
}
