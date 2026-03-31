import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { isPrismaNotFound } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { Rol } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user || user.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        ultimoLogin: true,
      },
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Error fetching usuario:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user || user.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()
    const { nombre, email, rol, password } = data as {
      nombre?: string
      email?: string
      rol?: string
      password?: string
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {}

    if (nombre !== undefined) updateData.nombre = String(nombre).trim()
    if (email !== undefined) updateData.email = String(email).trim().toLowerCase()
    if (rol !== undefined) {
      if (!Object.values(Rol).includes(rol as Rol)) {
        return NextResponse.json({ error: 'Rol invalido' }, { status: 400 })
      }
      updateData.rol = rol as Rol
    }
    if (password !== undefined) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'La contrasena debe tener al menos 6 caracteres' }, { status: 400 })
      }
      updateData.passwordHash = await bcrypt.hash(password, 12)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron campos validos' }, { status: 400 })
    }

    // Prevent removing admin role from the last admin
    if (rol && rol !== 'admin') {
      const targetUsuario = await prisma.usuario.findUnique({ where: { id: Number(id) } })
      if (targetUsuario?.rol === 'admin') {
        const adminCount = await prisma.usuario.count({ where: { rol: 'admin', activo: true } })
        if (adminCount <= 1) {
          return NextResponse.json({ error: 'No se puede cambiar el rol del unico administrador activo' }, { status: 409 })
        }
      }
    }

    const updated = await prisma.usuario.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        ultimoLogin: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating usuario:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user || user.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { activo } = await request.json() as { activo?: boolean }

    if (activo === undefined) {
      return NextResponse.json({ error: 'Campo activo requerido' }, { status: 400 })
    }

    // Cannot deactivate the last active admin
    if (!activo) {
      const targetUsuario = await prisma.usuario.findUnique({ where: { id: Number(id) } })
      if (targetUsuario?.rol === 'admin') {
        const adminCount = await prisma.usuario.count({ where: { rol: 'admin', activo: true } })
        if (adminCount <= 1) {
          return NextResponse.json({ error: 'No se puede desactivar el unico administrador activo' }, { status: 409 })
        }
      }
    }

    const updated = await prisma.usuario.update({
      where: { id: Number(id) },
      data: { activo: Boolean(activo) },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        ultimoLogin: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating usuario status:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error al actualizar estado del usuario' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user || user.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Prevent deleting yourself
    if (Number(id) === user.id) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 409 })
    }

    // Prevent deleting the last admin
    const targetUsuario = await prisma.usuario.findUnique({ where: { id: Number(id) } })
    if (targetUsuario?.rol === 'admin') {
      const adminCount = await prisma.usuario.count({ where: { rol: 'admin', activo: true } })
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'No se puede eliminar el unico administrador activo' }, { status: 409 })
      }
    }

    // Soft delete: deactivate instead of removing
    await prisma.usuario.update({
      where: { id: Number(id) },
      data: { activo: false },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting usuario:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
  }
}
