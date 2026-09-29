/**
 * Utilidades para reportes con ciclos 10 PM - 10 AM
 */

export interface ReportCycle {
  startDate: Date
  endDate: Date
  label: string
}

/**
 * Obtiene el ciclo de reporte para una fecha dada
 * Ciclo: 10 PM del dia anterior a 10 AM del dia actual
 * Por ejemplo: viernes 10 PM - sabado 10 AM
 */
export function getCycleForDate(date: Date, startHour: number = 22, startMinute: number = 0): ReportCycle {
  const d = new Date(date)
  
  // Si es antes de las 10 AM, el ciclo empezo el dia anterior
  if (d.getHours() < startHour || (d.getHours() === startHour && d.getMinutes() < startMinute)) {
    // Ciclo comenzo ayer a las 10 PM
    const startDate = new Date(d)
    startDate.setDate(startDate.getDate() - 1)
    startDate.setHours(startHour, startMinute, 0, 0)

    const endDate = new Date(d)
    endDate.setHours(startHour, startMinute, 0, 0)

    const dayName = startDate.toLocaleDateString('es-ES', { weekday: 'long' })
    const dayName2 = endDate.toLocaleDateString('es-ES', { weekday: 'long' })
    
    return {
      startDate,
      endDate,
      label: `${dayName} 10 PM - ${dayName2} 10 AM`,
    }
  } else {
    // Ciclo comenzo hoy a las 10 PM
    const startDate = new Date(d)
    startDate.setHours(startHour, startMinute, 0, 0)

    const endDate = new Date(d)
    endDate.setDate(endDate.getDate() + 1)
    endDate.setHours(startHour, startMinute, 0, 0)

    const dayName = startDate.toLocaleDateString('es-ES', { weekday: 'long' })
    const dayName2 = endDate.toLocaleDateString('es-ES', { weekday: 'long' })

    return {
      startDate,
      endDate,
      label: `${dayName} 10 PM - ${dayName2} 10 AM`,
    }
  }
}

/**
 * Obtiene ciclos para un rango de meses
 */
export function getCyclesForMonth(year: number, month: number, startHour: number = 22): ReportCycle[] {
  const cycles: ReportCycle[] = []
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  let current = new Date(firstDay)
  while (current <= lastDay) {
    const cycle = getCycleForDate(current, startHour)
    if (!cycles.find(c => c.startDate.getTime() === cycle.startDate.getTime())) {
      cycles.push(cycle)
    }
    const nextDate = new Date(current)
    nextDate.setDate(current.getDate() + 1)
    current = nextDate
  }

  return cycles
}

/**
 * Obtiene ciclos para un ano
 */
export function getCyclesForYear(year: number, startHour: number = 22): ReportCycle[] {
  const cycles: ReportCycle[] = []

  for (let month = 1; month <= 12; month++) {
    const monthCycles = getCyclesForMonth(year, month, startHour)
    cycles.push(...monthCycles)
  }

  return cycles
}

/**
 * Calcula el rango de fechas para un ciclo diario
 */
export function getDailyCycleRange(date: Date, startHour: number = 22): [Date, Date] {
  const cycle = getCycleForDate(date, startHour)
  return [cycle.startDate, cycle.endDate]
}
