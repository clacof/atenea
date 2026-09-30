'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Button from '../../../components/atoms/Button'
import LoadingState from '../../../components/atoms/LoadingState'
import StatusBadge from '../../../components/atoms/StatusBadge'
import DataTable, { type DataTableColumn } from '../../../components/molecules/DataTable'
import PageHeader from '../../../components/molecules/PageHeader'
import { getAuthHeaders } from '../../../lib/client-auth'
import { apiError, confirmar, notify } from '../../../lib/feedback'
import { formatCurrency, formatDate } from '../../../lib/formatters'
import { normalizeCommissionSlots } from '@/lib/commission-utils'
import type { TipoCategoria } from '@/lib/tipoCategoria'

interface Comanda {
  id: number
  fecha: string
  hora: string
  categoria: { nombre: string; tipo: TipoCategoria }
  cantidad?: number
  notas?: string | null
  estadoCocina?: 'pendiente' | 'listo' | null
  tipoConsumo: string
  clienteNombre: string | null
  chica1?: { nombre: string } | undefined
  chica2?: { nombre: string } | undefined | null
  precioBase: number
  precioFinal: number
  comisionTotal: number
  comisionChica1?: number | null
  comisionChica2?: number | null
  medioPago: string
  estado: string
  cortesia: boolean
  usuario: { nombre: string }
}

export default function Comandas() {
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [updateError, setUpdateError] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [vistaAgrupada, setVistaAgrupada] = useState(false)
  const [paginaServidor, setPaginaServidor] = useState(1)
  const [hayMas, setHayMas] = useState(false)
  const [cargandoMas, setCargandoMas] = useState(false)

  const getChicaEntries = (comanda: Comanda) => {
    const split = normalizeCommissionSlots({
      comisionTotal: comanda.comisionTotal,
      comisionChica1: comanda.comisionChica1,
      comisionChica2: comanda.comisionChica2,
      hasChica1: Boolean(comanda.chica1?.nombre),
      hasChica2: Boolean(comanda.chica2?.nombre),
      enforceEvenSplit: comanda.tipoConsumo === 'cliente' && Boolean(comanda.chica1?.nombre && comanda.chica2?.nombre),
    })

    const chicas = [] as { nombre: string; comision: number }[]
    if (comanda.chica1?.nombre) {
      chicas.push({ nombre: comanda.chica1.nombre, comision: split.comisionChica1 })
    }
    if (comanda.chica2?.nombre) {
      chicas.push({ nombre: comanda.chica2.nombre, comision: split.comisionChica2 })
    }
    return chicas
  }

  const renderDetalleComanda = (comanda: Comanda) => {
    const chicas = getChicaEntries(comanda)

    return (
      <div className="space-y-3 text-sm text-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
          <span>
            <span className="uppercase tracking-wide">Estado:</span> {comanda.estado}
          </span>
          <span>
            Medio de pago: <span className="font-semibold text-white">{comanda.medioPago}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
          <span>Tipo consumo: {comanda.tipoConsumo}</span>
          {comanda.cortesia && <span className="text-amber-300 font-semibold">Cortesía</span>}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Comisión total</span>
          <span className="font-semibold text-purple-300">{formatCurrency(comanda.comisionTotal)}</span>
        </div>
        <div className="rounded-lg border border-white/5 bg-gray-900/40 p-3">
          <p className="text-xs uppercase tracking-wide text-gray-400">Chicas asignadas</p>
          {chicas.length > 0 ? (
            <div className="mt-2 space-y-1 text-sm">
              {chicas.map((chica) => (
                <div key={chica.nombre} className="flex items-center justify-between text-purple-100">
                  <span>{chica.nombre}</span>
                  <span className="font-semibold">{formatCurrency(chica.comision)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-gray-500">Sin chicas asignadas</p>
          )}
        </div>
      </div>
    )
  }

  const getComisionesPorChica = (items: Comanda[]) => {
    const resumen = new Map<string, number>()
    items.forEach((cmd) => {
      getChicaEntries(cmd).forEach(({ nombre, comision }) => {
        resumen.set(nombre, (resumen.get(nombre) ?? 0) + comision)
      })
    })
    return Array.from(resumen.entries())
  }

  const LOTE = 200

  const fetchComandas = () => {
    fetch(`/api/comandas?limit=${LOTE}&page=1`, {
      headers: getAuthHeaders(),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(await apiError(response, 'No se pudieron cargar las comandas'))
        return response.json()
      })
      .then((data) => {
        const lista = Array.isArray(data) ? data : []
        setComandas(lista)
        setHayMas(lista.length === LOTE)
        setLoading(false)
      })
      .catch((fetchError) => {
        notify.error(fetchError instanceof Error ? fetchError.message : 'No se pudieron cargar las comandas')
        setLoading(false)
      })
  }

  const cargarMas = async () => {
    try {
      setCargandoMas(true)
      const siguiente = paginaServidor + 1
      const response = await fetch(`/api/comandas?limit=${LOTE}&page=${siguiente}`, { headers: getAuthHeaders() })
      if (!response.ok) throw new Error(await apiError(response, 'No se pudieron cargar mas comandas'))
      const data: Comanda[] = await response.json()
      setComandas((prev) => {
        const ids = new Set(prev.map((c) => c.id))
        return [...prev, ...data.filter((c) => !ids.has(c.id))]
      })
      setPaginaServidor(siguiente)
      setHayMas(data.length === LOTE)
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'No se pudieron cargar mas comandas')
    } finally {
      setCargandoMas(false)
    }
  }

  useEffect(() => {
    fetchComandas()
  }, [])

  const handleEstadoChange = async (comandaId: number, estado: 'pagada' | 'anulada') => {
    if (estado === 'anulada') {
      const ok = await confirmar({
        title: 'Anular comanda',
        message: `La comanda #${comandaId} dejara de contar en ventas, caja y comisiones. Quedara registrada en auditoria.`,
        confirmLabel: 'Anular',
      })
      if (!ok) return
    }

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

      const actualizada: Comanda = await response.json()
      setComandas((prev) => prev.map((c) => (c.id === comandaId ? actualizada : c)))
      notify.success(estado === 'anulada' ? `Comanda #${comandaId} anulada` : `Comanda #${comandaId} pagada`)
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

  // Agrupacion por clienteNombre
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
    {
      key: 'categoria',
      header: 'Categoria',
      cell: (comanda) => (
        <div>
          <span>
            {comanda.cantidad && comanda.cantidad > 1 ? `${comanda.cantidad}× ` : ''}
            {comanda.categoria.nombre}
          </span>
          {comanda.notas && <span className="block text-xs italic text-gray-400">“{comanda.notas}”</span>}
        </div>
      ),
    },
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
              onClick={(event) => {
                event.stopPropagation()
                handleEstadoChange(comanda.id, 'pagada')
              }}
            >
              Pagar
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={updatingId === comanda.id}
              onClick={(event) => {
                event.stopPropagation()
                handleEstadoChange(comanda.id, 'anulada')
              }}
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

  if (loading) return <LoadingState />

  return (
    <div className="space-y-6">
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
          ) : grupos.map(([clienteKey, grupo]) => {
            const resumenChicas = getComisionesPorChica(grupo.comandas)
            return (
              <div key={clienteKey} className="rounded-lg border border-gray-700 bg-gray-800">
                <div className="flex items-center justify-between rounded-t-lg bg-gray-700 px-4 py-3">
                  <span className="font-semibold text-white">{clienteKey}</span>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                    <span>{grupo.comandas.length} comanda{grupo.comandas.length !== 1 ? 's' : ''}</span>
                    <span>Total: <span className="text-green-400 font-medium">{formatCurrency(grupo.total)}</span></span>
                    <span>Comision: <span className="text-blue-400 font-medium">{formatCurrency(grupo.comision)}</span></span>
                  </div>
                </div>
                {resumenChicas.length > 0 && (
                  <div className="border-t border-gray-700 bg-gray-900/40 px-4 py-3 text-sm text-gray-200">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Comisiones por chica</p>
                    <div className="flex flex-wrap gap-2">
                      {resumenChicas.map(([nombre, total]) => (
                        <span key={nombre} className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-indigo-100">
                          {nombre}: <span className="font-semibold">{formatCurrency(total)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <DataTable
                    columns={columns}
                    data={grupo.comandas}
                    getRowKey={(c) => c.id}
                    emptyTitle="Sin comandas"
                    renderExpanded={renderDetalleComanda}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Vista lista normal ───────────────────────────────── */
        <DataTable
          columns={columns}
          data={comandasFiltradas}
          pageSize={25}
          getRowKey={(comanda) => comanda.id}
          emptyTitle="No hay comandas registradas"
          emptyDescription="Las comandas creadas apareceran en este tablero."
          renderExpanded={renderDetalleComanda}
        />
      )}

      {hayMas && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={cargarMas} isLoading={cargandoMas}>
            Cargar comandas mas antiguas
          </Button>
        </div>
      )}
    </div>
  )
}
