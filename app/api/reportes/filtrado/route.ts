import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { getCycleForDate } from '@/lib/reportUtils'

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

/**
 * Construye desglose diario de comisiones por chica para reporte semanal.
 * Retorna: { chicaNombre: { lunes: X, martes: Y, ..., total: Z } }[]
 */
function buildComisionesSemanales(
  comandas: Array<{
    fecha: Date
    chica1?: { nombre: string } | null
    chica2?: { nombre: string } | null
    comisionChica1?: number | null
    comisionChica2?: number | null
  }>,
  mondayStart: Date,
) {
  // Map: chicaNombre → { lunes: num, ..., domingo: num, total: num }
  const map = new Map<string, Record<string, number>>()

  const getOrCreate = (nombre: string) => {
    if (!map.has(nombre)) {
      const row: Record<string, number> = { total: 0 }
      for (const d of DIAS_SEMANA) row[d] = 0
      map.set(nombre, row)
    }
    return map.get(nombre)!
  }

  for (const cmd of comandas) {
    const fecha = new Date(cmd.fecha)
    const diffDays = Math.floor((fecha.getTime() - mondayStart.getTime()) / (1000 * 60 * 60 * 24))
    const diaIdx = Math.max(0, Math.min(6, diffDays))
    const dia = DIAS_SEMANA[diaIdx]

    if (cmd.chica1?.nombre && (cmd.comisionChica1 ?? 0) > 0) {
      const row = getOrCreate(cmd.chica1.nombre)
      row[dia] += cmd.comisionChica1!
      row.total += cmd.comisionChica1!
    }
    if (cmd.chica2?.nombre && (cmd.comisionChica2 ?? 0) > 0) {
      const row = getOrCreate(cmd.chica2.nombre)
      row[dia] += cmd.comisionChica2!
      row.total += cmd.comisionChica2!
    }
  }

  const result = Array.from(map.entries()).map(([nombre, dias]) => ({
    nombre,
    lunes: dias.lunes,
    martes: dias.martes,
    miercoles: dias.miercoles,
    jueves: dias.jueves,
    viernes: dias.viernes,
    sabado: dias.sabado,
    domingo: dias.domingo,
    total: dias.total,
  }))
  result.sort((a, b) => b.total - a.total)
  return result
}

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') || 'diario' // diario, semanal, mensual, anual
    const fecha = searchParams.get('fecha') // YYYY-MM-DD para diario
    const semana = searchParams.get('semana') // YYYY-MM-DD (lunes de la semana) para semanal
    const mes = searchParams.get('mes') // YYYY-MM para mensual
    const year = searchParams.get('year') // YYYY para anual

    // Obtener configuracion de ciclo
    const configCiclo = await prisma.configGeneral.findFirst({
      where: { clave: 'HORA_INICIO_CICLO' },
    })
    const startHour = configCiclo ? parseInt(configCiclo.valor) : 22

    let startDate: Date
    let endDate: Date
    let periodLabel: string

    // Determinar rango de fechas segun tipo de reporte
    if (tipo === 'diario') {
      const targetDate = fecha ? new Date(fecha) : new Date()
      const cycle = getCycleForDate(targetDate, startHour)
      startDate = cycle.startDate
      endDate = cycle.endDate
      periodLabel = cycle.label
    } else if (tipo === 'semanal') {
      // Semana: lunes a domingo
      const targetDate = semana ? new Date(semana) : new Date()
      const day = targetDate.getDay()
      const diff = day === 0 ? 6 : day - 1 // lunes = 0
      const monday = new Date(targetDate)
      monday.setDate(monday.getDate() - diff)
      monday.setHours(0, 0, 0, 0)
      const sunday = new Date(monday)
      sunday.setDate(sunday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)
      startDate = monday
      endDate = sunday

      const fmt = (d: Date) =>
        d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
      periodLabel = `Semana ${fmt(monday)} - ${fmt(sunday)}`
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
      periodLabel = `Ano ${targetYear}`
    } else {
      return NextResponse.json({ error: 'Tipo de reporte invalido' }, { status: 400 })
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

    // Calcular estadisticas
    const totalVentas = comandas.reduce((sum, c) => sum + c.precioFinal, 0)
    const totalComisiones = comandas.reduce((sum, c) => sum + c.comisionTotal, 0)
    const totalComandas = comandas.length

    const ventasClientes = comandas
      .filter(c => c.tipoConsumo === 'cliente')
      .reduce((sum, c) => sum + c.precioFinal, 0)

    const ventasChicas = comandas
      .filter(c => c.tipoConsumo === 'chica')
      .reduce((sum, c) => sum + c.precioFinal, 0)

    // Por categoria
    const porCategoria: Record<string, { cantidad: number; total: number; comision: number }> = {}
    comandas.forEach(cmd => {
      if (!porCategoria[cmd.categoria.nombre]) {
        porCategoria[cmd.categoria.nombre] = { cantidad: 0, total: 0, comision: 0 }
      }
      porCategoria[cmd.categoria.nombre].cantidad++
      porCategoria[cmd.categoria.nombre].total += cmd.precioFinal
      porCategoria[cmd.categoria.nombre].comision += cmd.comisionTotal
    })

    // Por chica
    const porChica: Record<string, { cantidad: number; comision: number; ventas: number }> = {}
    comandas.forEach(cmd => {
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

    comandas.forEach(cmd => {
      porMedioPagoObj[cmd.medioPago] = (porMedioPagoObj[cmd.medioPago] || 0) + cmd.precioFinal
    })

    const porMedioPago = Object.entries(porMedioPagoObj)
      .filter(([_key, total]) => total > 0)
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
      // Ranking: mayor comision primero, luego mayor consumo
      porChica: Object.entries(porChica)
        .map(([nombre, data]) => ({ nombre, ...data }))
        .sort((a, b) => b.comision - a.comision || b.ventas - a.ventas),
      porCategoria: Object.entries(porCategoria).map(([nombre, data]) => ({ nombre, ...data })),
      // Desglose diario de comisiones por chica para reporte semanal
      ...(tipo === 'semanal' ? { comisionesSemanales: buildComisionesSemanales(comandas, startDate) } : {}),
    })
  } catch (error) {
    console.error('Error generating report:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: `Error al generar reporte: ${errorMessage}` }, { status: 500 })
  }
}
