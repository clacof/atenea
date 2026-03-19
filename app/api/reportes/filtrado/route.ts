import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { getCycleForDate } from '@/lib/reportUtils'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') || 'diario' // diario, mensual, anual
    const fecha = searchParams.get('fecha') // YYYY-MM-DD para diario
    const mes = searchParams.get('mes') // YYYY-MM para mensual
    const year = searchParams.get('year') // YYYY para anual

    // Obtener configuración de ciclo
    const configCiclo = await prisma.configGeneral.findFirst({
      where: { clave: 'HORA_INICIO_CICLO' },
    })
    const startHour = configCiclo ? parseInt(configCiclo.valor) : 22

    let startDate: Date
    let endDate: Date
    let periodLabel: string

    // Determinar rango de fechas según tipo de reporte
    if (tipo === 'diario') {
      const targetDate = fecha ? new Date(fecha) : new Date()
      const cycle = getCycleForDate(targetDate, startHour)
      startDate = cycle.startDate
      endDate = cycle.endDate
      periodLabel = cycle.label
    } else if (tipo === 'mensual') {
      const [year, month] = (mes || new Date().toISOString().split('T')[0].slice(0, 7)).split('-').map(Number)
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
      
      const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(startDate)
      periodLabel = `Mes de ${monthName}`
    } else if (tipo === 'anual') {
      const targetYear = year ? parseInt(year) : new Date().getFullYear()
      startDate = new Date(targetYear, 0, 1)
      endDate = new Date(targetYear, 11, 31, 23, 59, 59)
      periodLabel = `Año ${targetYear}`
    } else {
      return NextResponse.json({ error: 'Tipo de reporte inválido' }, { status: 400 })
    }

    // Obtener comandas en el rango
    const comandas = await prisma.comanda.findMany({
      where: {
        fecha: {
          gte: startDate,
          lte: endDate,
        },
        estado: { not: 'anulada' },
      },
      include: { categoria: true, chica1: true, chica2: true },
    })

    // Calcular estadísticas
    const totalVentas = comandas.reduce((sum, c) => sum + c.precioFinal, 0)
    const totalComisiones = comandas.reduce((sum, c) => sum + c.comisionTotal, 0)
    const totalComandas = comandas.length

    const ventasClientes = comandas
      .filter(c => c.tipoConsumo === 'cliente')
      .reduce((sum, c) => sum + c.precioFinal, 0)

    const ventasChicas = comandas
      .filter(c => c.tipoConsumo === 'chica')
      .reduce((sum, c) => sum + c.precioFinal, 0)

    // Por categoría
    const porCategoria: Record<string, any> = {}
    comandas.forEach(cmd => {
      if (!porCategoria[cmd.categoria.nombre]) {
        porCategoria[cmd.categoria.nombre] = { cantidad: 0, total: 0, comision: 0 }
      }
      porCategoria[cmd.categoria.nombre].cantidad++
      porCategoria[cmd.categoria.nombre].total += cmd.precioFinal
      porCategoria[cmd.categoria.nombre].comision += cmd.comisionTotal
    })

    // Por chica
    const porChica: Record<string, any> = {}
    comandas.forEach(cmd => {
      if (cmd.chica1) {
        if (!porChica[cmd.chica1.nombre]) {
          porChica[cmd.chica1.nombre] = { cantidad: 0, comision: 0, ventas: 0 }
        }
        porChica[cmd.chica1.nombre].cantidad++
        porChica[cmd.chica1.nombre].comision += cmd.comisionChica1 || 0
        porChica[cmd.chica1.nombre].ventas += cmd.precioFinal / (cmd.chica2 ? 2 : 1)
      }
      if (cmd.chica2) {
        if (!porChica[cmd.chica2.nombre]) {
          porChica[cmd.chica2.nombre] = { cantidad: 0, comision: 0, ventas: 0 }
        }
        porChica[cmd.chica2.nombre].cantidad++
        porChica[cmd.chica2.nombre].comision += cmd.comisionChica2 || 0
        porChica[cmd.chica2.nombre].ventas += cmd.precioFinal / 2
      }
    })

    // Por medio de pago
    const porMedioPagoObj: Record<string, number> = {
      efectivo: 0,
      transferencia: 0,
      debito: 0,
      credito: 0,
    }

    comandas.forEach(cmd => {
      porMedioPagoObj[cmd.medioPago] = (porMedioPagoObj[cmd.medioPago] || 0) + cmd.precioFinal
    })

    const porMedioPago = Object.entries(porMedioPagoObj)
      .filter(([_, total]) => total > 0)
      .map(([medioPago, total]) => ({
        medioPago,
        total,
        porcentaje: totalVentas > 0 ? (total / totalVentas) * 100 : 0,
      }))

    return NextResponse.json({
      tipo,
      periodo: periodLabel,
      fechaInicio: startDate.toISOString(),
      fechaFin: endDate.toISOString(),
      resumen: {
        totalVentas,
        totalComisiones,
        totalComandas,
        ventasClientes,
        ventasChicas,
        promedioPorComanda: totalComandas > 0 ? Math.round(totalVentas / totalComandas) : 0,
      },
      porMedioPago,
      porChica: Object.entries(porChica).map(([nombre, data]) => ({ nombre, ...data })),
      porCategoria: Object.entries(porCategoria).map(([nombre, data]) => ({ nombre, ...data })),
    })
  } catch (error) {
    console.error('Error generating report:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: `Error al generar reporte: ${errorMessage}` }, { status: 500 })
  }
}
