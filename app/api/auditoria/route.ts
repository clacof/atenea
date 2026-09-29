import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { auditoriaQuerySchema } from '@/lib/schemas'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'auditoria.ver')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const params = Object.fromEntries(
    Array.from(request.nextUrl.searchParams.entries()).filter(([, v]) => v !== ''),
  )
  const parsed = auditoriaQuerySchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Filtros invalidos' }, { status: 400 })
  }
  const { usuarioId, tabla, accion, desde, hasta, page, limit } = parsed.data

  // "hasta" es inclusivo: cubre el dia completo
  const hastaFin = hasta ? new Date(hasta.getTime() + 24 * 60 * 60 * 1000 - 1) : undefined

  const where = {
    ...(usuarioId ? { usuarioId } : {}),
    ...(tabla ? { tabla } : {}),
    ...(accion ? { accion } : {}),
    ...(desde || hastaFin ? { fecha: { ...(desde ? { gte: desde } : {}), ...(hastaFin ? { lte: hastaFin } : {}) } } : {}),
  }

  try {
    const [total, registros, usuarios] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { fecha: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.usuario.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } }),
    ])

    const nombres = new Map(usuarios.map((u) => [u.id, u.nombre]))

    return NextResponse.json({
      total,
      page,
      limit,
      usuarios,
      registros: registros.map((r) => ({
        ...r,
        usuarioNombre: r.usuarioId ? (nombres.get(r.usuarioId) ?? `#${r.usuarioId}`) : 'Sistema',
      })),
    })
  } catch (error) {
    console.error('Error fetching auditoria:', error)
    return NextResponse.json({ error: 'Error al obtener auditoria' }, { status: 500 })
  }
}
