/**
 * Utilidades para exportación de reportes a PDF y Excel
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
  csv += `Período: ${data.periodo}\n`
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
  csv += 'DISTRIBUCIÓN POR MEDIO DE PAGO\n'
  csv += 'Medio,Total,Porcentaje\n'
  data.porMedioPago.forEach(item => {
    csv += `"${item.medioPago.toUpperCase()}",${item.total},"${item.porcentaje.toFixed(2)}%"\n`
  })
  csv += '\n'

  // Por Chica
  if (data.porChica && data.porChica.length > 0) {
    csv += 'TOTALES POR CHICA\n'
    csv += 'Chica,Cantidad,Comisión,Ventas\n'
    data.porChica.forEach(item => {
      csv += `"${item.nombre}",${item.cantidad},${item.comision},${item.ventas}\n`
    })
    csv += '\n'
  }

  // Por Categoría
  if (data.porCategoria && data.porCategoria.length > 0) {
    csv += 'TOTALES POR CATEGORÍA\n'
    csv += 'Categoría,Cantidad,Total,Comisión\n'
    data.porCategoria.forEach(item => {
      csv += `"${item.nombre}",${item.cantidad},${item.total},${item.comision}\n`
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
      addLine(`${item.nombre}: ${item.cantidad} comandas, ventas $${Math.round(item.ventas).toLocaleString()}, comision $${item.comision.toLocaleString()}`)
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
