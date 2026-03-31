'use client'

import { useState, useEffect, useCallback } from 'react'
import Button from '../../../components/atoms/Button'
import Card from '../../../components/atoms/Card'
import LoadingState from '../../../components/atoms/LoadingState'
import DashboardLayout from '../../../components/DashboardLayout'
import DataTable, { type DataTableColumn } from '../../../components/molecules/DataTable'
import MetricCard from '../../../components/molecules/MetricCard'
import PageHeader from '../../../components/molecules/PageHeader'
import ReportFilters from '../../../components/organisms/reportes/ReportFilters'
import { getAuthHeaders } from '../../../lib/client-auth'
import { downloadFile, generateExcel, generatePDF, type ExportData } from '../../../lib/exportUtils'
import { formatCurrency, formatPercentage } from '../../../lib/formatters'

interface ReportData {
  tipo: string
  periodo: string
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
}

export default function Reportes() {
  const [isExporting, setIsExporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  
  // Filtros
  const [tipoReporte, setTipoReporte] = useState<'diario' | 'mensual' | 'anual'>('diario')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0])
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().toISOString().split('T')[0].slice(0, 7))
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear().toString())

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      
      let url = '/api/reportes/filtrado?tipo=' + tipoReporte
      
      if (tipoReporte === 'diario') {
        url += '&fecha=' + fechaSeleccionada
      } else if (tipoReporte === 'mensual') {
        url += '&mes=' + mesSeleccionado
      } else if (tipoReporte === 'anual') {
        url += '&year=' + anioSeleccionado
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      })
      
      if (!response.ok) throw new Error('Error al cargar reportes')
      
      const data = await response.json()
      setReportData(data)
      setError('')
    } catch (err) {
      setError('Error cargando los reportes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [tipoReporte, fechaSeleccionada, mesSeleccionado, anioSeleccionado])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleFechaChange = (fecha: string) => {
    setFechaSeleccionada(fecha)
  }

  const handleMesChange = (mes: string) => {
    setMesSeleccionado(mes)
  }

  const handleAnioChange = (anio: string) => {
    setAnioSeleccionado(anio)
  }

  const aplicarFiltro = () => {
    fetchReports()
  }

  if (loading) return <DashboardLayout><LoadingState message="Cargando reportes..." /></DashboardLayout>
  if (error) return <DashboardLayout><div className="text-red-400">{error}</div></DashboardLayout>

  const { resumen, porMedioPago } = reportData || {}
  const paymentColumns: DataTableColumn<NonNullable<ReportData['porMedioPago']>[number]>[] = [
    { key: 'medio', header: 'Medio', cell: (item) => item.medioPago },
    { key: 'total', header: 'Total', cell: (item) => formatCurrency(item.total) },
    { key: 'porcentaje', header: 'Porcentaje', cell: (item) => formatPercentage(item.porcentaje) },
  ]

  const chicaColumns: DataTableColumn<NonNullable<ReportData['porChica']>[number]>[] = [
    { key: 'nombre', header: 'Chica', cell: (item) => item.nombre },
    { key: 'cantidad', header: 'Comandas', cell: (item) => item.cantidad },
    { key: 'ventas', header: 'Ventas', cell: (item) => formatCurrency(Math.round(item.ventas)) },
    { key: 'comision', header: 'Comision', cell: (item) => formatCurrency(item.comision) },
  ]

  const categoriaColumns: DataTableColumn<NonNullable<ReportData['porCategoria']>[number]>[] = [
    { key: 'nombre', header: 'Categoria', cell: (item) => item.nombre },
    { key: 'cantidad', header: 'Cantidad', cell: (item) => item.cantidad },
    { key: 'total', header: 'Total', cell: (item) => formatCurrency(item.total) },
    { key: 'comision', header: 'Comision', cell: (item) => formatCurrency(item.comision) },
  ]

  const handleDownloadExcel = () => {
    if (!reportData) return

    setIsExporting(true)
    try {
      const blob = generateExcel(reportData as ExportData)
      const suffix = getReportSuffix()
      downloadFile(blob, `reporte_${suffix}.csv`)
    } catch (exportError) {
      console.error('Error exporting Excel:', exportError)
      setError('No se pudo descargar el Excel')
    } finally {
      setIsExporting(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!reportData) return

    setIsExporting(true)
    try {
      const blob = await generatePDF(reportData as ExportData)
      const suffix = getReportSuffix()
      downloadFile(blob, `reporte_${suffix}.pdf`)
    } catch (exportError) {
      console.error('Error exporting PDF:', exportError)
      setError('No se pudo descargar el PDF')
    } finally {
      setIsExporting(false)
    }
  }

  const getReportSuffix = () => {
    if (tipoReporte === 'diario') return fechaSeleccionada
    if (tipoReporte === 'mensual') return mesSeleccionado
    return anioSeleccionado
  }

  return (
    <DashboardLayout>
      <div>
        <PageHeader
          title="Reportes y Estadisticas"
          description="Consulta el rendimiento del negocio por rango operativo y exporta resultados." 
        />

        <ReportFilters
          tipoReporte={tipoReporte}
          fechaSeleccionada={fechaSeleccionada}
          mesSeleccionado={mesSeleccionado}
          anioSeleccionado={anioSeleccionado}
          periodoActual={reportData?.periodo}
          onTipoReporteChange={setTipoReporte}
          onFechaChange={handleFechaChange}
          onMesChange={handleMesChange}
          onAnioChange={handleAnioChange}
          onApply={aplicarFiltro}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Ventas" value={formatCurrency(resumen?.totalVentas || 0)} accent="green" />
          <MetricCard label="Total Comisiones" value={formatCurrency(resumen?.totalComisiones || 0)} accent="blue" />
          <MetricCard label="Ticket Promedio" value={formatCurrency(Math.round(resumen?.promedioPorComanda || 0))} accent="purple" />
          <MetricCard label="Total Comandas" value={resumen?.totalComandas || '0'} accent="orange" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataTable
            columns={paymentColumns}
            data={porMedioPago || []}
            getRowKey={(item) => item.medioPago}
            emptyTitle="No hay datos de pagos disponibles"
          />

          <Card className="p-6">
            <h3 className="mb-4 text-xl font-bold">Resumen del Periodo</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Periodo: {reportData?.periodo || '-'}
              </p>
              <div className="pt-3 border-t border-gray-700">
                <p className="mb-2"><span className="text-gray-400">Tipo:</span> <span className="capitalize">{tipoReporte}</span></p>
                <p className="mb-2"><span className="text-gray-400">Comandas:</span> {resumen?.totalComandas || '0'}</p>
                <p className="mb-2"><span className="text-gray-400">Ventas Chicas:</span> {formatCurrency(resumen?.ventasChicas || 0)}</p>
                <p><span className="text-gray-400">Comisiones:</span> <span className="text-green-400">{formatCurrency(resumen?.totalComisiones || 0)}</span></p>
              </div>
            </div>
          </Card>
        </div>

        {reportData?.porChica && reportData.porChica.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-4 text-xl font-bold">💄 Totales por Chica</h3>
            <DataTable
              columns={chicaColumns}
              data={reportData.porChica}
              getRowKey={(item) => item.nombre}
              emptyTitle="No hay datos por chica"
            />
          </div>
        )}

        {reportData?.porCategoria && reportData.porCategoria.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-4 text-xl font-bold">🍸 Totales por Categoria</h3>
            <DataTable
              columns={categoriaColumns}
              data={reportData.porCategoria}
              getRowKey={(item) => item.nombre}
              emptyTitle="No hay datos por categoria"
            />
          </div>
        )}

        <Card className="mt-6 p-6">
          <h3 className="text-xl font-bold mb-4">Exportar Datos</h3>
          <div className="flex gap-3">
            <Button
              onClick={handleDownloadExcel}
              disabled={isExporting}
              variant="secondary"
            >
              {isExporting ? '⏳ Procesando...' : '📥 Descargar Excel'}
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={isExporting}
            >
              {isExporting ? '⏳ Procesando...' : '📄 Generar PDF'}
            </Button>
            <Button
              onClick={fetchReports}
              disabled={isExporting}
              variant="ghost"
            >
              {isExporting ? '⏳ Actualizando...' : '🔄 Actualizar'}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}