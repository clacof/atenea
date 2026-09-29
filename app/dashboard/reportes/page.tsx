'use client'

import { useState, useEffect, useCallback } from 'react'
import Button from '../../../components/atoms/Button'
import Card from '../../../components/atoms/Card'
import LoadingState from '../../../components/atoms/LoadingState'
import DataTable, { type DataTableColumn } from '../../../components/molecules/DataTable'
import MetricCard from '../../../components/molecules/MetricCard'
import PageHeader from '../../../components/molecules/PageHeader'
import ReportFilters from '../../../components/organisms/reportes/ReportFilters'
import { getAuthHeaders } from '../../../lib/client-auth'
import { downloadFile, generateExcel, generatePDF, type ExportData } from '../../../lib/exportUtils'
import { formatCurrency, formatPercentage } from '../../../lib/formatters'

interface ComisionSemanal {
  nombre: string
  lunes: number
  martes: number
  miercoles: number
  jueves: number
  viernes: number
  sabado: number
  domingo: number
  total: number
  [key: string]: number | string
}

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
  porChica?: Array<{ nombre: string; cantidad: number; comision: number }>
  porCategoria?: Array<{ nombre: string; cantidad: number; total: number; comision: number }>
  comisionesSemanales?: ComisionSemanal[]
}

export default function Reportes() {
  const [isExporting, setIsExporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  
  // Filtros
  const [tipoReporte, setTipoReporte] = useState<'diario' | 'semanal' | 'mensual' | 'anual'>('diario')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0])
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(new Date().toISOString().split('T')[0])
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().toISOString().split('T')[0].slice(0, 7))
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear().toString())

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      
      let url = '/api/reportes/filtrado?tipo=' + tipoReporte
      
      if (tipoReporte === 'diario') {
        url += '&fecha=' + fechaSeleccionada
      } else if (tipoReporte === 'semanal') {
        url += '&semana=' + semanaSeleccionada
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
  }, [tipoReporte, fechaSeleccionada, semanaSeleccionada, mesSeleccionado, anioSeleccionado])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleFechaChange = (fecha: string) => {
    setFechaSeleccionada(fecha)
  }

  const handleSemanaChange = (semana: string) => {
    setSemanaSeleccionada(semana)
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

  if (loading) return <LoadingState message="Cargando reportes..." />
  if (error) return <div className="text-red-400">{error}</div>

  const { resumen, porMedioPago } = reportData || {}
  const paymentColumns: DataTableColumn<NonNullable<ReportData['porMedioPago']>[number]>[] = [
    { key: 'medio', header: 'Medio', cell: (item) => item.medioPago },
    { key: 'total', header: 'Total', cell: (item) => formatCurrency(item.total) },
    { key: 'porcentaje', header: 'Porcentaje', cell: (item) => formatPercentage(item.porcentaje) },
  ]

  const chicaColumns: DataTableColumn<NonNullable<ReportData['porChica']>[number]>[] = [
    { key: 'nombre', header: 'Chica', cell: (item) => item.nombre },
    { key: 'cantidad', header: 'Comandas', cell: (item) => item.cantidad },
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
    <div>
        <PageHeader
          title="Reportes y Estadisticas"
          description="Consulta el rendimiento del negocio por rango operativo y exporta resultados." 
        />

        <ReportFilters
          tipoReporte={tipoReporte}
          fechaSeleccionada={fechaSeleccionada}
          semanaSeleccionada={semanaSeleccionada}
          mesSeleccionado={mesSeleccionado}
          anioSeleccionado={anioSeleccionado}
          periodoActual={reportData?.periodo}
          onTipoReporteChange={setTipoReporte}
          onFechaChange={handleFechaChange}
          onSemanaChange={handleSemanaChange}
          onMesChange={handleMesChange}
          onAnioChange={handleAnioChange}
          onApply={aplicarFiltro}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Ventas" value={formatCurrency(resumen?.totalVentas || 0)} accent="green" />
          <MetricCard label="Comisiones" value={formatCurrency(resumen?.totalComisiones || 0)} accent="blue" />
          <MetricCard label="Ticket Promedio" value={formatCurrency(Math.round(resumen?.promedioPorComanda || 0))} accent="purple" />
          <MetricCard label="Comandas" value={resumen?.totalComandas || '0'} accent="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="mb-3 text-base font-semibold text-gray-300 flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-blue-400" />
              Medios de Pago
            </h3>
            <DataTable
              columns={paymentColumns}
              data={porMedioPago || []}
              getRowKey={(item) => item.medioPago}
              emptyTitle="No hay datos de pagos disponibles"
            />
          </div>

          <div>
            <h3 className="mb-3 text-base font-semibold text-gray-300 flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-purple-400" />
              Resumen del Periodo
            </h3>
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tipo</p>
                  <p className="mt-1 text-lg font-semibold capitalize">{tipoReporte}</p>
                </div>
                <div className="rounded-lg bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Comandas</p>
                  <p className="mt-1 text-lg font-semibold">{resumen?.totalComandas || '0'}</p>
                </div>
                <div className="rounded-lg bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Ventas Clientes</p>
                  <p className="mt-1 text-lg font-semibold text-blue-400">{formatCurrency(resumen?.ventasClientes || 0)}</p>
                </div>
                <div className="rounded-lg bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Ventas Chicas</p>
                  <p className="mt-1 text-lg font-semibold text-purple-400">{formatCurrency(resumen?.ventasChicas || 0)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3">
                <span className="text-sm text-gray-400">Total Comisiones</span>
                <span className="text-xl font-bold text-green-400">{formatCurrency(resumen?.totalComisiones || 0)}</span>
              </div>
            </Card>
          </div>
        </div>

        {reportData?.porChica && reportData.porChica.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 text-base font-semibold text-gray-300 flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-pink-400" />
              Totales por Chica
            </h3>
            <DataTable
              columns={chicaColumns}
              data={reportData.porChica}
              getRowKey={(item) => item.nombre}
              emptyTitle="No hay datos por chica"
            />
          </div>
        )}

        {tipoReporte === 'semanal' && (
          <div className="mt-8">
            <h3 className="mb-3 text-base font-semibold text-gray-300 flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-green-400" />
              Comisiones Semanales por Chica
            </h3>
            <Card className="p-6 border border-purple-700/30 bg-gradient-to-b from-purple-900/10 to-transparent">
              <p className="text-sm text-gray-400 mb-4">{reportData?.periodo || ''} — Desglose diario para pago de comisiones</p>

              {reportData?.comisionesSemanales && reportData.comisionesSemanales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400">
                        <th className="text-left py-2 pr-3 font-medium">Chica</th>
                        <th className="text-right py-2 px-2 font-medium">Lun</th>
                        <th className="text-right py-2 px-2 font-medium">Mar</th>
                        <th className="text-right py-2 px-2 font-medium">Mie</th>
                        <th className="text-right py-2 px-2 font-medium">Jue</th>
                        <th className="text-right py-2 px-2 font-medium">Vie</th>
                        <th className="text-right py-2 px-2 font-medium">Sab</th>
                        <th className="text-right py-2 px-2 font-medium">Dom</th>
                        <th className="text-right py-2 pl-3 font-bold text-purple-300">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.comisionesSemanales.map((row) => (
                        <tr key={row.nombre} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-2.5 pr-3 font-medium text-gray-100">{row.nombre}</td>
                          <td className="text-right py-2.5 px-2 text-gray-300">{row.lunes ? formatCurrency(row.lunes) : '-'}</td>
                          <td className="text-right py-2.5 px-2 text-gray-300">{row.martes ? formatCurrency(row.martes) : '-'}</td>
                          <td className="text-right py-2.5 px-2 text-gray-300">{row.miercoles ? formatCurrency(row.miercoles) : '-'}</td>
                          <td className="text-right py-2.5 px-2 text-gray-300">{row.jueves ? formatCurrency(row.jueves) : '-'}</td>
                          <td className="text-right py-2.5 px-2 text-gray-300">{row.viernes ? formatCurrency(row.viernes) : '-'}</td>
                          <td className="text-right py-2.5 px-2 text-gray-300">{row.sabado ? formatCurrency(row.sabado) : '-'}</td>
                          <td className="text-right py-2.5 px-2 text-gray-300">{row.domingo ? formatCurrency(row.domingo) : '-'}</td>
                          <td className="text-right py-2.5 pl-3 font-bold text-green-400">{formatCurrency(row.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-purple-700">
                        <td className="py-3 pr-3 font-bold text-purple-300">TOTAL</td>
                        {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((dia) => (
                          <td key={dia} className="text-right py-3 px-2 font-semibold text-gray-200">
                            {formatCurrency(
                              (reportData.comisionesSemanales || []).reduce(
                                (sum, r) => sum + (Number(r[dia]) || 0),
                                0,
                              ),
                            )}
                          </td>
                        ))}
                        <td className="text-right py-3 pl-3 font-bold text-xl text-green-400">
                          {formatCurrency(
                            (reportData.comisionesSemanales || []).reduce((sum, r) => sum + (Number(r.total) || 0), 0),
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay comisiones registradas en esta semana.</p>
              )}
            </Card>
          </div>
        )}

        {reportData?.porCategoria && reportData.porCategoria.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 text-base font-semibold text-gray-300 flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-orange-400" />
              Totales por Categoria
            </h3>
            <DataTable
              columns={categoriaColumns}
              data={reportData.porCategoria}
              getRowKey={(item) => item.nombre}
              emptyTitle="No hay datos por categoria"
            />
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/60 p-4" role="region" aria-label="Opciones de exportación">
          <span className="mr-auto text-sm font-medium text-gray-400">Exportar reporte</span>
          <Button
            onClick={handleDownloadExcel}
            disabled={isExporting}
            variant="secondary"
            size="sm"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75M16.5 12 12 16.5m0 0L12 12m4.5-4.5V12" /></svg>
              {isExporting ? 'Procesando...' : 'Excel'}
            </span>
          </Button>
          <Button
            onClick={handleGeneratePDF}
            disabled={isExporting}
            size="sm"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
              {isExporting ? 'Procesando...' : 'PDF'}
            </span>
          </Button>
          <Button
            onClick={fetchReports}
            disabled={isExporting}
            variant="ghost"
            size="sm"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
              Actualizar
            </span>
          </Button>
        </div>
    </div>
  )
}
