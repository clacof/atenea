'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'

interface CajaTurno {
  totalEfectivo: number
  totalTransferencia: number
  totalDebito: number
  totalCredito: number
  totalGeneral: number
}

export default function Caja() {
  const [cajaTurno, setCajaTurno] = useState<CajaTurno | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch('/api/caja/turno', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setCajaTurno(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  const handleCloseTurno = async () => {
    if (!cajaTurno || confirm('¿Deseas cerrar el turno? Esta accion no se puede deshacer.')) {
      const token = localStorage.getItem('token')
      if (!token) return

      setIsClosing(true)
      try {
        const response = await fetch('/api/caja/turno', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(cajaTurno),
        })

        if (response.ok && cajaTurno) {
          alert(
            '✓ Turno cerrado correctamente\n\nResumen:\n' +
            `- Total: $${cajaTurno.totalGeneral.toLocaleString()}\n` +
            `- Efectivo: $${cajaTurno.totalEfectivo.toLocaleString()}\n` +
            `- Transferencia: $${cajaTurno.totalTransferencia.toLocaleString()}\n` +
            `- Debito: $${cajaTurno.totalDebito.toLocaleString()}\n` +
            `- Credito: $${cajaTurno.totalCredito.toLocaleString()}\n` +
            '\n🔗 Link público: https://yellow-banks-divide.loca.lt\n'
          )
          // Recargar datos
          location.reload()
        } else {
          alert('Error al cerrar turno')
        }
      } catch (err) {
        alert('Error de conexion')
      } finally {
        setIsClosing(false)
      }
    }
  }

  if (loading) return <DashboardLayout><div>Cargando datos de caja...</div></DashboardLayout>
  if (!cajaTurno) return <DashboardLayout><div>Error cargando datos</div></DashboardLayout>

  const calcularPorcentaje = (monto: number, total: number) => {
    return total > 0 ? Math.round((monto / total) * 100) : 0
  }

  const porcentajeEfectivo = calcularPorcentaje(cajaTurno.totalEfectivo, cajaTurno.totalGeneral)
  const porcentajeTransferencia = calcularPorcentaje(
    cajaTurno.totalTransferencia,
    cajaTurno.totalGeneral
  )
  const porcentajeDebito = calcularPorcentaje(cajaTurno.totalDebito, cajaTurno.totalGeneral)
  const porcentajeCredito = calcularPorcentaje(cajaTurno.totalCredito, cajaTurno.totalGeneral)

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Control de Caja</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Resumen de Hoy</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Efectivo:</span>
                <span className="font-bold">${cajaTurno.totalEfectivo.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Transferencia:</span>
                <span className="font-bold">${cajaTurno.totalTransferencia.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Debito:</span>
                <span className="font-bold">${cajaTurno.totalDebito.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Credito:</span>
                <span className="font-bold">${cajaTurno.totalCredito.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-700 pt-3 mt-3 flex justify-between">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-green-400">${cajaTurno.totalGeneral.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Analisis de Pagos</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-700 rounded">
                <p className="text-sm text-gray-400">Efectivo: {porcentajeEfectivo}%</p>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${porcentajeEfectivo}%` }}
                  ></div>
                </div>
              </div>
              <div className="p-3 bg-gray-700 rounded">
                <p className="text-sm text-gray-400">Transferencia: {porcentajeTransferencia}%</p>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${porcentajeTransferencia}%` }}
                  ></div>
                </div>
              </div>
              <div className="p-3 bg-gray-700 rounded">
                <p className="text-sm text-gray-400">Débito: {porcentajeDebito}%</p>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${porcentajeDebito}%` }}
                  ></div>
                </div>
              </div>
              {porcentajeCredito > 0 && (
                <div className="p-3 bg-gray-700 rounded">
                  <p className="text-sm text-gray-400">Crédito: {porcentajeCredito}%</p>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${porcentajeCredito}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Cierre de Turno</h3>
          <button
            onClick={handleCloseTurno}
            disabled={isClosing}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClosing ? '⏳ Procesando...' : 'Cerrar Turno'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}