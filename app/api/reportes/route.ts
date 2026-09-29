import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

interface CategoryStats {
  cantidad: number
  total: number
  comision: number
}

interface ChicaStats {
  cantidad: number
  comision: number
  ventas: number
}

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const hoy = new Date().toISOString().split('T')[0]

    // Comandas de hoy
    const comandasHoy = await prisma.comanda.findMany({
      where: {
        fecha: {
          gte: new Date(`${hoy}T00:00:00Z`),
          lt: new Date(`${hoy}T23:59:59Z`),
        },
        estado: { not: 'anulada' },
      },
      include: { categoria: true, chica1: true, chica2: true },
    })

    // Estadisticas generales
    const totalVentas = comandasHoy.reduce((sum, c) => sum + c.precioFinal, 0)
    const totalComisiones = comandasHoy.reduce((sum, c) => sum + c.comisionTotal, 0)
    const totalComandas = comandasHoy.length

    // Por tipo de consumo
    const ventasClientes = comandasHoy
      .filter(c => c.tipoConsumo === 'cliente')
      .reduce((sum, c) => sum + c.precioFinal, 0)

    const ventasChicas = comandasHoy
      .filter(c => c.tipoConsumo === 'chica')
      .reduce((sum, c) => sum + c.precioFinal, 0)

    // Por categoria
    const porCategoria: Record<string, CategoryStats> = {}
    comandasHoy.forEach(cmd => {
      if (!porCategoria[cmd.categoria.nombre]) {
        porCategoria[cmd.categoria.nombre] = { cantidad: 0, total: 0, comision: 0 }
      }
      porCategoria[cmd.categoria.nombre].cantidad++
      porCategoria[cmd.categoria.nombre].total += cmd.precioFinal
      porCategoria[cmd.categoria.nombre].comision += cmd.comisionTotal
    })

    // Por chica
    const porChica: Record<string, ChicaStats> = {}
    comandasHoy.forEach(cmd => {
      if (cmd.chica1) {
        if (!porChica[cmd.chica1.nombre]) {
          porChica[cmd.chica1.nombre] = { cantidad: 0, comision: 0, ventas: 0 }
        }
        porChica[cmd.chica1.nombre].cantidad++
        porChica[cmd.chica1.nombre].comision += cmd.comisionChica1 || 0
        // Consumo generado: monto total de las comandas en que participo
        porChica[cmd.chica1.nombre].ventas += cmd.precioFinal
      }
      if (cmd.chica2) {
        if (!porChica[cmd.chica2.nombre]) {
          porChica[cmd.chica2.nombre] = { cantidad: 0, comision: 0, ventas: 0 }
        }
        porChica[cmd.chica2.nombre].cantidad++
        porChica[cmd.chica2.nombre].comision += cmd.comisionChica2 || 0
        // Consumo generado: monto total de las comandas en que participo
        porChica[cmd.chica2.nombre].ventas += cmd.precioFinal
      }
    })

    // Por medio de pago
    const porMedioPagoObj: Record<string, number> = {
      efectivo: 0,
      transferencia: 0,
      debito: 0,
      credito: 0,
    }

    comandasHoy.forEach(cmd => {
      porMedioPagoObj[cmd.medioPago] = (porMedioPagoObj[cmd.medioPago] || 0) + cmd.precioFinal
    })

    // Convertir a array con porcentajes
    const porMedioPago = Object.entries(porMedioPagoObj).map(([medioPago, total]) => ({
      medioPago,
      total,
      porcentaje: totalVentas > 0 ? (total / totalVentas) * 100 : 0,
    }))

    return NextResponse.json({
      fecha: hoy,
      resumen: {
        totalVentas,
        totalComisiones,
        totalComandas,
        ventasClientes,
        ventasChicas,
        promedioPorComanda: totalComandas > 0 ? Math.round(totalVentas / totalComandas) : 0,
      },
      porCategoria: Object.entries(porCategoria).map(([nombre, datos]) => ({
        nombre,
        ...datos,
      })),
      porChica: Object.entries(porChica)
        .map(([nombre, datos]) => ({ nombre, ...datos }))
        .sort((a, b) => b.comision - a.comision || b.ventas - a.ventas),
      porMedioPago,
    })
  } catch (error) {
    console.error('Error fetching reportes:', error)
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 })
  }
}
