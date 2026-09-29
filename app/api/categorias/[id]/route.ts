import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { audit, diff } from '@/lib/audit'
import { categoriaUpdateSchema, parseBody, parseId } from '@/lib/schemas'

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

async function actualizar(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'categorias.editar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const id = parseId((await params).id)
  if (!id) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
  }

  const { data, response } = await parseBody(request, categoriaUpdateSchema)
  if (response) return response

  try {
    const actual = await prisma.categoria.findUnique({ where: { id } })
    if (!actual) {
      return NextResponse.json({ error: 'Categoria no encontrada' }, { status: 404 })
    }

    const categoria = await prisma.categoria.update({ where: { id }, data })

    const cambios = diff(actual, data)
    if (Object.keys(cambios).length > 0) {
      const soloEstado = Object.keys(cambios).length === 1 && 'activa' in cambios
      audit({
        user,
        accion: soloEstado ? 'CAMBIO_ESTADO' : 'EDITAR',
        tabla: 'Categoria',
        registroId: id,
        detalles: cambios,
      })
    }

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Error updating categoria:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export const PUT = actualizar
export const PATCH = actualizar

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'categorias.eliminar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const numericId = parseId((await params).id)
    if (!numericId) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const linked = await prisma.comanda.count({ where: { categoriaId: numericId } })
    if (linked > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: hay ${linked} comanda(s) que usan esta categoria. Desactivala en su lugar.` },
        { status: 409 },
      )
    }

    const eliminada = await prisma.categoria.delete({ where: { id: numericId } })
    audit({ user, accion: 'ELIMINAR', tabla: 'Categoria', registroId: numericId, detalles: { nombre: eliminada.nombre } })
    return NextResponse.json({ message: 'Categoria eliminada' })
  } catch (error) {
    console.error('Error deleting categoria:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
