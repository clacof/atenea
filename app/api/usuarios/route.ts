import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { audit } from '@/lib/audit'
import { Rol } from '@prisma/client'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'usuarios.gestionar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        ultimoLogin: true,
      },
    })
    return NextResponse.json(usuarios)
  } catch (error) {
    console.error('Error fetching usuarios:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'usuarios.gestionar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const data = await request.json()
    const { nombre, email, password, rol } = data as {
      nombre?: string
      email?: string
      password?: string
      rol?: string
    }

    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'El email es requerido' }, { status: 400 })
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'La contrasena debe tener al menos 6 caracteres' }, { status: 400 })
    }
    if (!rol || !Object.values(Rol).includes(rol as Rol)) {
      return NextResponse.json({ error: 'Rol invalido' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const nuevo = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        rol: rol as Rol,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        ultimoLogin: true,
      },
    })

    audit({
      user,
      accion: 'CREAR',
      tabla: 'Usuario',
      registroId: nuevo.id,
      detalles: { nombre: nuevo.nombre, email: nuevo.email, rol: nuevo.rol },
    })

    return NextResponse.json(nuevo, { status: 201 })
  } catch (error) {
    console.error('Error creating usuario:', error)
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}
