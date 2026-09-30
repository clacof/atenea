'use client'

import { useCallback, useEffect, useState } from 'react'
import Button from '../../../components/atoms/Button'
import LoadingState from '../../../components/atoms/LoadingState'
import PageHeader from '../../../components/molecules/PageHeader'
import { getAuthHeaders } from '../../../lib/client-auth'
import { apiError, notify } from '../../../lib/feedback'
import { cn } from '@/lib/utils'

interface PedidoCocina {
  id: number
  hora: string
  cantidad: number
  notas: string | null
  estadoCocina: 'pendiente' | 'listo'
  cocinaListoAt: string | null
  clienteNombre: string | null
  tipoConsumo: 'cliente' | 'chica'
  categoria: { nombre: string; seccion: string | null }
  chica1: { nombre: string } | null
}

interface CocinaData {
  pendientes: PedidoCocina[]
  listos: PedidoCocina[]
}

const REFRESCO_MS = 10_000

function minutosDesde(hora: string) {
  const [h, m] = hora.split(':').map(Number)
  const ahora = new Date()
  const pedido = new Date(ahora)
  pedido.setHours(h, m, 0, 0)
  // Pedido de antes de medianoche visto despues de medianoche
  if (pedido > ahora) pedido.setDate(pedido.getDate() - 1)
  return Math.max(0, Math.floor((ahora.getTime() - pedido.getTime()) / 60000))
}

function PedidoCard({
  pedido,
  ocupado,
  onCambiar,
}: {
  pedido: PedidoCocina
  ocupado: boolean
  onCambiar: (pedido: PedidoCocina) => void
}) {
  const pendiente = pedido.estadoCocina === 'pendiente'
  const espera = pendiente ? minutosDesde(pedido.hora) : 0

  return (
    <li
      className={cn(
        'rounded-2xl border p-4',
        pendiente ? 'border-orange-500/30 bg-orange-500/5' : 'border-emerald-500/20 bg-emerald-500/5 opacity-80',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-semibold text-white">
            <span className="text-orange-300">{pedido.cantidad}×</span> {pedido.categoria.nombre}
          </p>
          {pedido.categoria.seccion && <p className="text-xs text-gray-400">{pedido.categoria.seccion}</p>}
          {pedido.notas && (
            <p className="mt-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-sm font-medium text-yellow-200">
              {pedido.notas}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-bold text-white">{pedido.clienteNombre ?? '—'}</p>
          <p className="text-xs font-mono text-gray-400">{pedido.hora.slice(0, 5)}</p>
          {pendiente && (
            <p className={cn('text-xs font-semibold', espera >= 20 ? 'text-red-400' : 'text-gray-400')}>
              {espera} min
            </p>
          )}
        </div>
      </div>
      {pedido.tipoConsumo === 'chica' && pedido.chica1 && (
        <p className="mt-2 text-xs text-purple-300">Para {pedido.chica1.nombre}</p>
      )}
      <div className="mt-3 flex justify-end">
        <Button
          size={pendiente ? 'md' : 'sm'}
          variant={pendiente ? 'primary' : 'ghost'}
          disabled={ocupado}
          onClick={() => onCambiar(pedido)}
        >
          {pendiente ? 'Marcar listo' : 'Volver a pendiente'}
        </Button>
      </div>
    </li>
  )
}

export default function Cocina() {
  const [data, setData] = useState<CocinaData | null>(null)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    try {
      const response = await fetch('/api/cocina', { headers: getAuthHeaders(), cache: 'no-store' })
      if (!response.ok) {
        setError(await apiError(response, 'No se pudieron cargar los pedidos'))
        return
      }
      setData(await response.json())
      setError('')
    } catch {
      setError('No se pudieron cargar los pedidos')
    }
  }, [])

  useEffect(() => {
    cargar()
    const id = setInterval(cargar, REFRESCO_MS)
    return () => clearInterval(id)
  }, [cargar])

  const cambiarEstado = async (pedido: PedidoCocina) => {
    const estadoCocina = pedido.estadoCocina === 'pendiente' ? 'listo' : 'pendiente'
    try {
      setActionId(pedido.id)
      const response = await fetch(`/api/comandas/${pedido.id}/cocina`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ estadoCocina }),
      })
      if (!response.ok) {
        notify.error(await apiError(response, 'No se pudo actualizar el pedido'))
        return
      }
      await cargar()
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Cocina"
        description="Pedidos de comida del turno. Se actualiza solo cada 10 segundos."
        actions={
          <Button variant="secondary" onClick={cargar}>
            Actualizar
          </Button>
        }
      />

      {error && <div className="mb-6 rounded bg-red-900 p-3 text-sm text-red-200">{error}</div>}

      {!data ? (
        <LoadingState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-orange-400">
              Pendientes
              <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">{data.pendientes.length}</span>
            </h2>
            {data.pendientes.length === 0 ? (
              <p className="rounded-2xl border border-white/5 bg-gray-800/50 p-6 text-center text-sm text-gray-500">
                Sin pedidos pendientes
              </p>
            ) : (
              <ul className="space-y-3">
                {data.pendientes.map((pedido) => (
                  <PedidoCard key={pedido.id} pedido={pedido} ocupado={actionId === pedido.id} onCambiar={cambiarEstado} />
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-emerald-400">
              Listos
              <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">{data.listos.length}</span>
            </h2>
            {data.listos.length === 0 ? (
              <p className="rounded-2xl border border-white/5 bg-gray-800/50 p-6 text-center text-sm text-gray-500">
                Aun no hay pedidos listos
              </p>
            ) : (
              <ul className="space-y-3">
                {data.listos.map((pedido) => (
                  <PedidoCard key={pedido.id} pedido={pedido} ocupado={actionId === pedido.id} onCambiar={cambiarEstado} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
