/**
 * Utilidades para exportacion de reportes a PDF y Excel
 */

export interface ExportData {
  resumen: {
    totalVentas: number
    totalComisiones: number
    totalComandas: number
    ventasClientes: number
    ventasChicas: number
    promedioPorComanda: number
  }
  porMedioPago: Array<{ medioPago: string; total: number; porcentaje: number }>
  porChica?: Array<{ nombre: string; cantidad: number; comision: number; ventas: number }>
  porCategoria?: Array<{ nombre: string; cantidad: number; total: number; comision: number }>
  periodo: string
}

/**
 * Genera Excel usando CSV (compatible con Excel)
 */
export function generateExcel(data: ExportData): Blob {
  let csv = '\uFEFFATENEA Night Club - Reporte\n'
  csv += `Periodo: ${data.periodo}\n`
  csv += `Generado: ${new Date().toLocaleString('es-ES')}\n\n`

  // Resumen
  csv += 'RESUMEN\n'
  csv += `Total Ventas,${data.resumen.totalVentas}\n`
  csv += `Total Comisiones,${data.resumen.totalComisiones}\n`
  csv += `Total Comandas,${data.resumen.totalComandas}\n`
  csv += `Ventas Clientes,${data.resumen.ventasClientes}\n`
  csv += `Ventas Chicas,${data.resumen.ventasChicas}\n`
  csv += `Promedio por Comanda,${data.resumen.promedioPorComanda}\n\n`

  // Por Medio de Pago
  csv += 'DISTRIBUCION POR MEDIO DE PAGO\n'
  csv += 'Medio,Total,Porcentaje\n'
  data.porMedioPago.forEach(item => {
    csv += `"${item.medioPago.toUpperCase()}",${item.total},"${item.porcentaje.toFixed(2)}%"\n`
  })
  csv += '\n'

  // Por Chica
  if (data.porChica && data.porChica.length > 0) {
    csv += 'TOTALES POR CHICA\n'
    csv += 'Chica,Cantidad,Comision,Ventas\n'
    data.porChica.forEach(item => {
      csv += `${csvCell(item.nombre)},${item.cantidad},${item.comision},${item.ventas ?? 0}\n`
    })
    csv += '\n'
  }

  // Por Categoria
  if (data.porCategoria && data.porCategoria.length > 0) {
    csv += 'TOTALES POR CATEGORIA\n'
    csv += 'Categoria,Cantidad,Total,Comision\n'
    data.porCategoria.forEach(item => {
      csv += `${csvCell(item.nombre)},${item.cantidad},${item.total},${item.comision}\n`
    })
  }

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Genera PDF descargable con jsPDF
 */
export async function generatePDF(data: ExportData): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const left = 40
  const right = 555
  let y = 50

  const addLine = (text: string, size = 11, color: [number, number, number] = [31, 41, 55]) => {
    pdf.setFontSize(size)
    pdf.setTextColor(color[0], color[1], color[2])
    const lines = pdf.splitTextToSize(text, right - left)
    pdf.text(lines, left, y)
    y += lines.length * (size + 3)
  }

  const addGap = (gap = 14) => {
    y += gap
    if (y > 760) {
      pdf.addPage()
      y = 50
    }
  }

  pdf.setFillColor(31, 41, 55)
  pdf.rect(0, 0, 595, 80, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(22)
  pdf.text('ATENEA Night Club', left, 40)
  pdf.setFontSize(11)
  pdf.text(`Periodo: ${data.periodo}`, left, 60)
  pdf.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 320, 60)

  y = 110
  addLine('Resumen General', 16)
  addGap(4)
  addLine(`Total ventas: $${data.resumen.totalVentas.toLocaleString()}`)
  addLine(`Total comisiones: $${data.resumen.totalComisiones.toLocaleString()}`)
  addLine(`Total comandas: ${data.resumen.totalComandas}`)
  addLine(`Ventas clientes: $${data.resumen.ventasClientes.toLocaleString()}`)
  addLine(`Ventas chicas: $${data.resumen.ventasChicas.toLocaleString()}`)
  addLine(`Promedio por comanda: $${data.resumen.promedioPorComanda.toLocaleString()}`)

  addGap()
  addLine('Distribucion por Medio de Pago', 16)
  addGap(4)
  data.porMedioPago.forEach((item) => {
    addLine(`${item.medioPago}: $${item.total.toLocaleString()} (${item.porcentaje.toFixed(2)}%)`)
  })

  if (data.porChica && data.porChica.length > 0) {
    addGap()
    addLine('Totales por Chica', 16)
    addGap(4)
    data.porChica.forEach((item) => {
      addLine(`${item.nombre}: ${item.cantidad} comandas, consumo $${Math.round(item.ventas ?? 0).toLocaleString()}, comision $${item.comision.toLocaleString()}`)
    })
  }

  if (data.porCategoria && data.porCategoria.length > 0) {
    addGap()
    addLine('Totales por Categoria', 16)
    addGap(4)
    data.porCategoria.forEach((item) => {
      addLine(`${item.nombre}: ${item.cantidad} items, total $${item.total.toLocaleString()}, comision $${item.comision.toLocaleString()}`)
    })
  }

  return pdf.output('blob')
}

// ── Liquidacion de comisiones por chica ────────────────────────

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const

export interface LiquidacionInput {
  periodo: string
  porChica: Array<{ nombre: string; cantidad: number; comision: number }>
  comisionesSemanales?: Array<Record<string, number | string> & { nombre: string; total: number }>
}

export interface LiquidacionFila {
  nombre: string
  comandas: number
  comision: number
  porDia?: Record<(typeof DIAS)[number], number>
}

/** Filas de liquidacion: solo chicas con comision, de mayor a menor. */
export function buildLiquidacion(data: LiquidacionInput): { filas: LiquidacionFila[]; total: number } {
  const semanal = new Map((data.comisionesSemanales ?? []).map((row) => [row.nombre, row]))
  const filas = data.porChica
    .filter((c) => c.comision > 0)
    .map((c) => {
      const dias = semanal.get(c.nombre)
      return {
        nombre: c.nombre,
        comandas: c.cantidad,
        comision: c.comision,
        ...(dias
          ? { porDia: Object.fromEntries(DIAS.map((d) => [d, Number(dias[d]) || 0])) as LiquidacionFila['porDia'] }
          : {}),
      }
    })
    .sort((a, b) => b.comision - a.comision)
  return { filas, total: filas.reduce((sum, f) => sum + f.comision, 0) }
}

/** Celda CSV segura: escapa comillas y neutraliza formulas (=, +, -, @). */
export function csvCell(value: string | number): string {
  if (typeof value === 'number') return String(value)
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

export function generateLiquidacionCSV(data: LiquidacionInput): Blob {
  const { filas, total } = buildLiquidacion(data)
  const conDias = filas.some((f) => f.porDia)
  let csv = '\uFEFFATENEA - Liquidacion de comisiones\n'
  csv += `Periodo,${csvCell(data.periodo)}\n`
  csv += `Generado,${csvCell(new Date().toLocaleString('es-ES'))}\n\n`
  csv += ['Chica', 'Comandas', ...(conDias ? DIAS.map((d) => d[0].toUpperCase() + d.slice(1)) : []), 'Comision', 'Firma'].join(',') + '\n'
  for (const f of filas) {
    const dias = conDias ? DIAS.map((d) => f.porDia?.[d] ?? 0) : []
    csv += [csvCell(f.nombre), f.comandas, ...dias, f.comision, ''].join(',') + '\n'
  }
  csv += `\nTotal a pagar,,${conDias ? ','.repeat(DIAS.length) : ''}${total}\n`
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

export async function generateLiquidacionPDF(data: LiquidacionInput): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const { filas, total } = buildLiquidacion(data)
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const left = 40
  const money = (n: number) => `$${n.toLocaleString('es-CO')}`

  pdf.setFillColor(31, 41, 55)
  pdf.rect(0, 0, 595, 80, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(20)
  pdf.text('Liquidacion de comisiones', left, 40)
  pdf.setFontSize(11)
  pdf.text(`Periodo: ${data.periodo}`, left, 60)
  pdf.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 320, 60)

  let y = 115
  pdf.setTextColor(31, 41, 55)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Chica', left, y)
  pdf.text('Comandas', 250, y)
  pdf.text('Comision', 330, y)
  pdf.text('Firma', 430, y)
  pdf.setFont('helvetica', 'normal')
  y += 8
  pdf.line(left, y, 555, y)
  y += 22

  for (const f of filas) {
    if (y > 780) {
      pdf.addPage()
      y = 60
    }
    pdf.setFontSize(11)
    pdf.text(pdf.splitTextToSize(f.nombre, 200)[0], left, y)
    pdf.text(String(f.comandas), 250, y)
    pdf.text(money(f.comision), 330, y)
    pdf.line(430, y + 2, 555, y + 2)
    y += 28
  }

  y += 6
  pdf.line(left, y, 555, y)
  y += 20
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.text('Total a pagar', left, y)
  pdf.text(money(total), 330, y)

  return pdf.output('blob')
}

/**
 * Descarga un archivo
 */
export function downloadFile(content: Blob, filename: string) {
  const url = URL.createObjectURL(content)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
