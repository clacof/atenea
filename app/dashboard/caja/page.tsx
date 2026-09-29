'use client'

import { useEffect, useState } from 'react'
import Button from '../../../components/atoms/Button'
import Card from '../../../components/atoms/Card'
import LoadingState from '../../../components/atoms/LoadingState'
import MetricCard from '../../../components/molecules/MetricCard'
import PageHeader from '../../../components/molecules/PageHeader'
import { getAuthHeaders } from '../../../lib/client-auth'
import { formatCurrency } from '../../../lib/formatters'

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
    fetch('/api/caja/turno', {
      headers: getAuthHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        setCajaTurno(data)
        setLoading(false)
      })
      .catch((fetchError) => {
        console.error('Error:', fetchError)
        setLoading(false)
      })
  }, [])

  const handleCloseTurno = async () => {
    if (!cajaTurno || confirm('Deseas cerrar el turno? Esta accion no se puede deshacer.')) {
      setIsClosing(true)
      try {
        const response = await fetch('/api/caja/turno', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
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
            '\n🔗 Link publico: https://yellow-banks-divide.loca.lt\n'
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

  if (loading) return <LoadingState message="Cargando datos de caja..." />
  if (!cajaTurno) return <div>Error cargando datos</div>

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
    <div>
      <PageHeader
        title="Control de Caja"
        description="Monitorea el reparto por medio de pago y ejecuta el cierre del turno."
      />

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
        <MetricCard label="Efectivo" value={formatCurrency(cajaTurno.totalEfectivo)} accent="green" />
        <MetricCard label="Transferencia" value={formatCurrency(cajaTurno.totalTransferencia)} accent="blue" />
        <MetricCard label="Debito" value={formatCurrency(cajaTurno.totalDebito)} accent="purple" />
        <MetricCard label="Credito" value={formatCurrency(cajaTurno.totalCredito)} accent="orange" />
        <MetricCard label="Total General" value={formatCurrency(cajaTurno.totalGeneral)} accent="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resumen de Hoy</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Efectivo:</span>
              <span className="font-bold">{formatCurrency(cajaTurno.totalEfectivo)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transferencia:</span>
              <span className="font-bold">{formatCurrency(cajaTurno.totalTransferencia)}</span>
            </div>
            <div className="flex justify-between">
              <span>Debito:</span>
              <span className="font-bold">{formatCurrency(cajaTurno.totalDebito)}</span>
            </div>
            <div className="flex justify-between">
              <span>Credito:</span>
              <span className="font-bold">{formatCurrency(cajaTurno.totalCredito)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-gray-700 pt-3">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-green-400">{formatCurrency(cajaTurno.totalGeneral)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Analisis de Pagos</h3>
          <div className="space-y-3">
            <div className="rounded bg-gray-700 p-3">
              <p className="text-sm text-gray-400">Efectivo: {porcentajeEfectivo}%</p>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-600">
                <div className="h-2 rounded-full bg-green-500" style={{ width: `${porcentajeEfectivo}%` }} />
              </div>
            </div>
            <div className="rounded bg-gray-700 p-3">
              <p className="text-sm text-gray-400">Transferencia: {porcentajeTransferencia}%</p>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-600">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${porcentajeTransferencia}%` }} />
              </div>
            </div>
            <div className="rounded bg-gray-700 p-3">
              <p className="text-sm text-gray-400">Debito: {porcentajeDebito}%</p>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-600">
                <div className="h-2 rounded-full bg-purple-500" style={{ width: `${porcentajeDebito}%` }} />
              </div>
            </div>
            {porcentajeCredito > 0 && (
              <div className="rounded bg-gray-700 p-3">
                <p className="text-sm text-gray-400">Credito: {porcentajeCredito}%</p>
                <div className="mt-1 h-2 w-full rounded-full bg-gray-600">
                  <div className="h-2 rounded-full bg-orange-500" style={{ width: `${porcentajeCredito}%` }} />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cierre de Turno</h3>
        <Button onClick={handleCloseTurno} disabled={isClosing} className="bg-green-600 hover:bg-green-700">
          {isClosing ? '⏳ Procesando...' : 'Cerrar Turno'}
        </Button>
      </Card>
    </div>
  )
}
