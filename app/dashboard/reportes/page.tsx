'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'

interface ReportData {
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
}

export default function Reportes() {
  const [isExporting, setIsExporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState<ReportData | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reportes', {
        headers: { 'Authorization': `Bearer ${token}` },
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
  }

  if (loading) return <DashboardLayout><div className="text-center text-gray-400">Cargando reportes...</div></DashboardLayout>
  if (error) return <DashboardLayout><div className="text-red-400">{error}</div></DashboardLayout>

  const { resumen, porMedioPago } = reportData || {}
  const totalVentas = resumen?.totalVentas || 0
  const pagoStats = Array.isArray(porMedioPago)
    ? porMedioPago.reduce((acc, item) => {
        acc[item.medioPago] = item.total
        return acc
      }, {} as Record<string, number>)
    : {}

  const handleDownloadExcel = () => {
    setIsExporting(true)
    // Simular descarga
    setTimeout(() => {
      alert('📊 Excel descargado: Reporte_Completo_' + new Date().toISOString().split('T')[0] + '.xlsx')
      setIsExporting(false)
    }, 1000)
  }

  const handleGeneratePDF = () => {
    setIsExporting(true)
    // Simular generación
    setTimeout(() => {
      alert('📄 PDF generado: Reporte_Completo_' + new Date().toISOString().split('T')[0] + '.pdf')
      setIsExporting(false)
    }, 1000)
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Reportes y Estadísticas</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-900 to-green-700 p-6 rounded-lg">
            <h3 className="text-sm text-gray-300 mb-2">Total Ventas</h3>
            <p className="text-3xl font-bold">${resumen?.totalVentas.toLocaleString() || '0'}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-6 rounded-lg">
            <h3 className="text-sm text-gray-300 mb-2">Total Comisiones</h3>
            <p className="text-3xl font-bold">${resumen?.totalComisiones.toLocaleString() || '0'}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900 to-purple-700 p-6 rounded-lg">
            <h3 className="text-sm text-gray-300 mb-2">Ticket Promedio</h3>
            <p className="text-3xl font-bold">${Math.round(resumen?.promedioPorComanda || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-900 to-orange-700 p-6 rounded-lg">
            <h3 className="text-sm text-gray-300 mb-2">Total Comandas</h3>
            <p className="text-3xl font-bold">{resumen?.totalComandas || '0'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Distribución por Medio de Pago</h3>
            <div className="space-y-4">
              {Array.isArray(porMedioPago) ? (
                porMedioPago.map((item) => (
                  <div key={item.medioPago}>
                    <div className="flex justify-between mb-2">
                      <span className="capitalize">{item.medioPago}</span>
                      <span className="font-bold">${item.total.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${item.porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No hay datos de pagos disponibles</p>
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Resumen Hoy</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Período: {new Date().toLocaleDateString('es-ES')}
              </p>
              <div className="pt-3 border-t border-gray-700">
                <p className="mb-2"><span className="text-gray-400">Día:</span> {new Date().toLocaleDateString('es-ES', { weekday: 'long' })}</p>
                <p className="mb-2"><span className="text-gray-400">Comandas:</span> {resumen?.totalComandas || '0'}</p>
                <p className="mb-2"><span className="text-gray-400">Ventas Chicas:</span> ${resumen?.ventasChicas.toLocaleString() || '0'}</p>
                <p><span className="text-gray-400">Comisiones:</span> <span className="text-green-400">${resumen?.totalComisiones.toLocaleString() || '0'}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* TOTALES POR CHICA */}
        {reportData?.porChica && reportData.porChica.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg mt-6">
            <h3 className="text-xl font-bold mb-4">💄 Totales por Chica</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-3">Chica</th>
                    <th className="text-left p-3">Comandas</th>
                    <th className="text-left p-3">Ventas</th>
                    <th className="text-left p-3">Comisión</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.porChica.map((chica) => (
                    <tr key={chica.nombre} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-3 font-semibold">{chica.nombre}</td>
                      <td className="p-3">{chica.cantidad}</td>
                      <td className="p-3 text-green-400">${Math.round(chica.ventas).toLocaleString()}</td>
                      <td className="p-3 text-blue-400">${chica.comision.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-lg mt-6">
          <h3 className="text-xl font-bold mb-4">Exportar Datos</h3>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadExcel}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? '⏳ Procesando...' : '📥 Descargar Excel'}
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? '⏳ Procesando...' : '📄 Generar PDF'}
            </button>
            <button
              onClick={fetchReports}
              disabled={isExporting}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? '⏳ Actualizando...' : '🔄 Actualizar'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}