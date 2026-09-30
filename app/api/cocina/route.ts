import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { can } from '@/lib/permissions'

// Los listos se muestran un rato para poder deshacer; los pendientes nunca caducan
// (un turno nocturno cruza la medianoche).
const VENTANA_LISTOS_MS = 12 * 60 * 60 * 1000

/**
 * GET /api/cocina
 * Pedidos de comida: pendientes (todos) y listos recientes.
 */
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'cocina.gestionar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const desde = new Date(Date.now() - VENTANA_LISTOS_MS)
    const pedidos = await prisma.comanda.findMany({
      where: {
        estado: { not: 'anulada' },
        OR: [{ estadoCocina: 'pendiente' }, { estadoCocina: 'listo', cocinaListoAt: { gte: desde } }],
      },
      select: {
        id: true,
        fecha: true,
        hora: true,
        cantidad: true,
        notas: true,
        estadoCocina: true,
        cocinaListoAt: true,
        clienteNombre: true,
        tipoConsumo: true,
        categoria: { select: { nombre: true, seccion: true } },
        chica1: { select: { nombre: true } },
      },
      orderBy: { fecha: 'asc' },
    })

    return NextResponse.json({
      pendientes: pedidos.filter((p) => p.estadoCocina === 'pendiente'),
      listos: pedidos
        .filter((p) => p.estadoCocina === 'listo')
        .sort((a, b) => (b.cocinaListoAt?.getTime() ?? 0) - (a.cocinaListoAt?.getTime() ?? 0)),
    })
  } catch (error) {
    console.error('Error fetching cocina:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
