'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Button from '../../../components/atoms/Button'
import LoadingState from '../../../components/atoms/LoadingState'
import StatusBadge from '../../../components/atoms/StatusBadge'
import DashboardLayout from '../../../components/DashboardLayout'
import DataTable, { type DataTableColumn } from '../../../components/molecules/DataTable'
import PageHeader from '../../../components/molecules/PageHeader'
import { getAuthHeaders } from '../../../lib/client-auth'
import { formatCurrency, formatDate } from '../../../lib/formatters'

interface Comanda {
  id: number
  fecha: string
  hora: string
  categoria: { nombre: string }
  tipoConsumo: string
  clienteNombre: string | null
  chica1?: { nombre: string } | undefined
  chica2?: { nombre: string } | undefined | null
  precioBase: number
  precioFinal: number
  comisionTotal: number
  medioPago: string
  estado: string
  usuario: { nombre: string }
}

export default function Comandas() {
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [updateError, setUpdateError] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [vistaAgrupada, setVistaAgrupada] = useState(false)

  const fetchComandas = () => {
    fetch('/api/comandas', {
      headers: getAuthHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        setComandas(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((fetchError) => {
        console.error('Error cargando comandas:', fetchError)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchComandas()
  }, [])

  const handleEstadoChange = async (comandaId: number, estado: 'pagada' | 'anulada') => {
    try {
      setUpdatingId(comandaId)
      const response = await fetch(`/api/comandas/${comandaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ estado }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'No se pudo actualizar la comanda')
      }

      fetchComandas()
    } catch (updateError) {
      console.error('Error actualizando comanda:', updateError)
      setUpdateError(updateError instanceof Error ? updateError.message : 'No se pudo actualizar la comanda')
    } finally {
      setUpdatingId(null)
    }
  }

  const comandasFiltradas = useMemo(() => {
    if (!filtroCliente.trim()) return comandas
    const q = filtroCliente.trim().toLowerCase()
    return comandas.filter(c => (c.clienteNombre ?? '').toLowerCase().includes(q))
  }, [comandas, filtroCliente])

  // Agrupación por clienteNombre
  const grupos = useMemo(() => {
    const map = new Map<string, { comandas: Comanda[]; total: number; comision: number }>()
    for (const c of comandasFiltradas) {
      const key = c.clienteNombre ?? '—'
      const entry = map.get(key) ?? { comandas: [], total: 0, comision: 0 }
      entry.comandas.push(c)
      if (c.estado !== 'anulada') {
        entry.total += c.precioFinal
        entry.comision += c.comisionTotal
      }
      map.set(key, entry)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [comandasFiltradas])

  const columns: DataTableColumn<Comanda>[] = [
    { key: 'id', header: 'ID', cell: (comanda) => comanda.id },
    { key: 'fecha', header: 'Fecha', cell: (comanda) => formatDate(comanda.fecha) },
    { key: 'hora', header: 'Hora', cell: (comanda) => comanda.hora },
    { key: 'cliente', header: 'Cliente', cell: (comanda) => comanda.clienteNombre ?? <span className="text-gray-500">—</span> },
    { key: 'categoria', header: 'Categoria', cell: (comanda) => comanda.categoria.nombre },
    { key: 'tipo', header: 'Tipo', cell: (comanda) => comanda.tipoConsumo },
    {
      key: 'chicas',
      header: 'Chicas',
      cell: (comanda) => [comanda.chica1?.nombre, comanda.chica2?.nombre].filter(Boolean).join(', ') || '-',
    },
    { key: 'precioBase', header: 'Precio Base', cell: (comanda) => formatCurrency(comanda.precioBase) },
    { key: 'precioFinal', header: 'Precio Final', cell: (comanda) => formatCurrency(comanda.precioFinal) },
    { key: 'comision', header: 'Comision', cell: (comanda) => formatCurrency(comanda.comisionTotal) },
    { key: 'pago', header: 'Pago', cell: (comanda) => comanda.medioPago },
    {
      key: 'estado',
      header: 'Estado',
      cell: (comanda) => (
        <StatusBadge tone={comanda.estado === 'anulada' ? 'danger' : comanda.estado === 'pagada' ? 'neutral' : 'success'}>
          {comanda.estado}
        </StatusBadge>
      ),
    },
    { key: 'usuario', header: 'Usuario', cell: (comanda) => comanda.usuario.nombre },
    {
      key: 'acciones',
      header: 'Acciones',
      cell: (comanda) => (
        comanda.estado === 'activa' ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={updatingId === comanda.id}
              onClick={() => handleEstadoChange(comanda.id, 'pagada')}
            >
              Pagar
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={updatingId === comanda.id}
              onClick={() => handleEstadoChange(comanda.id, 'anulada')}
            >
              Anular
            </Button>
          </div>
        ) : (
          <span className="text-xs text-gray-500">Sin acciones</span>
        )
      ),
    },
  ]

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>

  return (
    <DashboardLayout>
      <PageHeader
        title="Comandas"
        description="Listado operativo de ventas registradas y su estado actual."
        actions={
          <Link href="/dashboard/comandas/nueva">
            <Button>Nueva Comanda</Button>
          </Link>
        }
      />

      {updateError && (
        <div className="mb-4 rounded border border-red-500 bg-red-900/40 p-3 text-sm text-red-300">
          {updateError}
          <button className="ml-3 underline" onClick={() => setUpdateError('')}>Cerrar</button>
        </div>
      )}

      {/* Barra de filtro y toggle de vista */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Filtrar por cliente..."
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          className="w-full rounded bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 sm:max-w-xs"
        />
        <button
          onClick={() => setVistaAgrupada(v => !v)}
          className="rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
        >
          {vistaAgrupada ? 'Ver lista' : 'Agrupar por cliente'}
        </button>
      </div>

      {vistaAgrupada ? (
        /* ── Vista agrupada por cliente ───────────────────────── */
        <div className="space-y-6">
          {grupos.length === 0 ? (
            <p className="text-gray-400">Sin resultados.</p>
          ) : grupos.map(([clienteKey, grupo]) => (
            <div key={clienteKey} className="rounded-lg border border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between rounded-t-lg bg-gray-700 px-4 py-3">
                <span className="font-semibold text-white">{clienteKey}</span>
                <div className="flex gap-4 text-sm text-gray-300">
                  <span>{grupo.comandas.length} comanda{grupo.comandas.length !== 1 ? 's' : ''}</span>
                  <span>Total: <span className="text-green-400 font-medium">{formatCurrency(grupo.total)}</span></span>
                  <span>Comisión: <span className="text-blue-400 font-medium">{formatCurrency(grupo.comision)}</span></span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <DataTable
                  columns={columns}
                  data={grupo.comandas}
                  getRowKey={(c) => c.id}
                  emptyTitle="Sin comandas"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Vista lista normal ───────────────────────────────── */
        <DataTable
          columns={columns}
          data={comandasFiltradas}
          getRowKey={(comanda) => comanda.id}
          emptyTitle="No hay comandas registradas"
          emptyDescription="Las comandas creadas aparecerán en este tablero."
        />
      )}
    </DashboardLayout>
  )
}