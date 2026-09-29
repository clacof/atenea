'use client'

import { useCallback, useEffect, useState } from 'react'
import Button from '../../../components/atoms/Button'
import Input from '../../../components/atoms/Input'
import StatusBadge from '../../../components/atoms/StatusBadge'
import DataTable, { type DataTableColumn } from '../../../components/molecules/DataTable'
import FormField from '../../../components/molecules/FormField'
import PageHeader from '../../../components/molecules/PageHeader'
import { apiError } from '../../../lib/feedback'
import { formatDateTime } from '../../../lib/formatters'

interface Registro {
  id: number
  usuarioId: number | null
  usuarioNombre: string
  accion: string
  tabla: string
  registroId: number | null
  fecha: string
  detalles: string | null
}

interface Respuesta {
  total: number
  page: number
  limit: number
  usuarios: Array<{ id: number; nombre: string }>
  registros: Registro[]
}

interface Filtros {
  usuarioId: string
  tabla: string
  accion: string
  desde: string
  hasta: string
}

const TABLAS = ['Chica', 'Comanda', 'Categoria', 'Usuario', 'CajaTurno', 'ConfigGeneral']
const ACCIONES = ['CREAR', 'EDITAR', 'ELIMINAR', 'ARCHIVAR', 'RESTAURAR', 'CAMBIO_ESTADO', 'ANULAR', 'CIERRE_CAJA', 'LOGIN', 'LOGOUT']

const accionTone = (accion: string) => {
  if (['ELIMINAR', 'ANULAR', 'ARCHIVAR'].includes(accion)) return 'danger' as const
  if (['EDITAR', 'CAMBIO_ESTADO', 'CIERRE_CAJA'].includes(accion)) return 'warning' as const
  if (accion === 'CREAR' || accion === 'RESTAURAR') return 'success' as const
  return 'neutral' as const
}

const selectClass =
  'w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-white outline-none focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500'

function Detalles({ texto }: { texto: string | null }) {
  if (!texto) return <span className="text-gray-500">Sin detalles</span>
  let data: unknown = texto
  try {
    data = JSON.parse(texto)
  } catch {
    return <p className="whitespace-pre-line">{texto}</p>
  }
  if (!data || typeof data !== 'object') return <p>{String(data)}</p>

  return (
    <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
      {Object.entries(data as Record<string, unknown>).map(([campo, valor]) => (
        <div key={campo} className="contents">
          <dt className="font-mono text-xs text-gray-400">{campo}</dt>
          <dd className="break-all text-sm text-gray-100">
            {Array.isArray(valor) && valor.length === 2 && !campo.startsWith('ids')
              ? `${JSON.stringify(valor[0])} → ${JSON.stringify(valor[1])}`
              : JSON.stringify(valor)}
          </dd>
        </div>
      ))}
    </dl>
  )
}

const filtrosVacios: Filtros = { usuarioId: '', tabla: '', accion: '', desde: '', hasta: '' }

export default function Auditoria() {
  const [filtros, setFiltros] = useState<Filtros>(filtrosVacios)
  const [aplicados, setAplicados] = useState<Filtros>(filtrosVacios)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Respuesta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async (f: Filtros, p: number) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ ...f, page: String(p), limit: '50' })
      const res = await fetch(`/api/auditoria?${params}`)
      if (!res.ok) throw new Error(await apiError(res, 'No se pudo cargar la auditoria'))
      setData(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la auditoria')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar(aplicados, page)
  }, [aplicados, page, cargar])

  const set = (campo: keyof Filtros) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFiltros((prev) => ({ ...prev, [campo]: e.target.value }))

  const aplicar = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setAplicados(filtros)
  }

  const limpiar = () => {
    setFiltros(filtrosVacios)
    setPage(1)
    setAplicados(filtrosVacios)
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  const columns: DataTableColumn<Registro>[] = [
    { key: 'fecha', header: 'Fecha', essential: true, cell: (r) => formatDateTime(r.fecha) },
    { key: 'usuario', header: 'Usuario', essential: true, cell: (r) => r.usuarioNombre },
    {
      key: 'accion',
      header: 'Accion',
      essential: true,
      cell: (r) => <StatusBadge tone={accionTone(r.accion)}>{r.accion}</StatusBadge>,
    },
    {
      key: 'registro',
      header: 'Registro',
      cell: (r) => (
        <span>
          {r.tabla}
          {r.registroId ? <span className="text-gray-500"> #{r.registroId}</span> : null}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Auditoria" description="Quien hizo que y cuando. Haz clic en una fila para ver el detalle." />

      <form onSubmit={aplicar} className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
        <FormField label="Usuario">
          <select value={filtros.usuarioId} onChange={set('usuarioId')} className={selectClass}>
            <option value="">Todos</option>
            {data?.usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Tabla">
          <select value={filtros.tabla} onChange={set('tabla')} className={selectClass}>
            <option value="">Todas</option>
            {TABLAS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Accion">
          <select value={filtros.accion} onChange={set('accion')} className={selectClass}>
            <option value="">Todas</option>
            {ACCIONES.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Desde">
          <Input type="date" value={filtros.desde} onChange={set('desde')} />
        </FormField>
        <FormField label="Hasta">
          <Input type="date" value={filtros.hasta} onChange={set('hasta')} />
        </FormField>
        <div className="flex gap-2">
          <Button type="submit" fullWidth>
            Filtrar
          </Button>
          <Button type="button" variant="secondary" onClick={limpiar}>
            Limpiar
          </Button>
        </div>
      </form>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-900/60 p-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={data?.registros ?? []}
        loading={loading}
        getRowKey={(r) => r.id}
        renderExpanded={(r) => <Detalles texto={r.detalles} />}
        emptyTitle="Sin registros"
        emptyDescription="No hay acciones registradas con esos filtros."
      />

      {data && totalPages > 1 ? (
        <nav className="mt-3 flex items-center justify-end gap-3 text-sm text-gray-400" aria-label="Paginacion">
          <span>{data.total} registros</span>
          <Button size="sm" variant="secondary" disabled={page === 1 || loading} onClick={() => setPage(page - 1)} aria-label="Pagina anterior">
            ‹
          </Button>
          <span aria-current="page">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={page === totalPages || loading}
            onClick={() => setPage(page + 1)}
            aria-label="Pagina siguiente"
          >
            ›
          </Button>
        </nav>
      ) : null}
    </div>
  )
}
