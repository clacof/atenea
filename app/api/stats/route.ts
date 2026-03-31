import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/stats
 * Returns today's aggregated operational metrics using DB-level aggregation.
 * Avoids fetching all rows to the application layer.
 */
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    const where = {
      fecha: { gte: startOfDay, lte: endOfDay },
      estado: { not: 'anulada' as const },
    }

    const [agg, count] = await prisma.$transaction([
      prisma.comanda.aggregate({
        where,
        _sum: { precioFinal: true, comisionTotal: true },
      }),
      prisma.comanda.count({ where }),
    ])

    return NextResponse.json({
      totalVentas: agg._sum.precioFinal ?? 0,
      totalComisiones: agg._sum.comisionTotal ?? 0,
      comandasHoy: count,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Error al obtener estadisticas' }, { status: 500 })
  }
}
