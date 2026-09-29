'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Card from '../../../../components/atoms/Card'
import LoadingState from '../../../../components/atoms/LoadingState'
import StatusBadge from '../../../../components/atoms/StatusBadge'
import DataTable, { type DataTableColumn } from '../../../../components/molecules/DataTable'
import MetricCard from '../../../../components/molecules/MetricCard'
import PageHeader from '../../../../components/molecules/PageHeader'
import { Grid } from '../../../../components/Grid'
import { apiError } from '../../../../lib/feedback'
import { formatCurrency, formatDate } from '../../../../lib/formatters'

interface ComandaFicha {
  id: number
  fecha: string
  hora: string
  categoria: string
  clienteNombre: string | null
  estado: 'activa' | 'pagada' | 'anulada'
  precioFinal: number
  comision: number
  liberada: boolean
}

interface Ficha {
  chica: {
    id: number
    nombre: string
    alias: string | null
    telefono: string | null
    notas: string | null
    activa: boolean
    archivada: boolean
    fechaIngreso: string
  }
  turno: { label: string; comandas: number; comision: number }
  mes: { comandas: number; comision: number }
  comandas: ComandaFicha[]
}

const estadoTone = { activa: 'success', pagada: 'neutral', anulada: 'danger' } as const

export default function FichaChica() {
  const { id } = useParams<{ id: string }>()
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch(`/api/chicas/${id}/resumen`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await apiError(res, 'No se pudo cargar la ficha'))
        return res.json() as Promise<Ficha>
      })
      .then((data) => active && setFicha(data))
      .catch((err) => active && setError(err instanceof Error ? err.message : 'No se pudo cargar la ficha'))
    return () => {
      active = false
    }
  }, [id])

  if (error) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-red-900/60 p-4 text-red-200" role="alert">
          {error}
        </p>
        <Link href="/dashboard/chicas" className="text-purple-300 hover:underline">
          ← Volver a chicas
        </Link>
      </div>
    )
  }
  if (!ficha) return <LoadingState message="Cargando ficha..." />

  const { chica } = ficha

  const columns: DataTableColumn<ComandaFicha>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      essential: true,
      cell: (c) => `${formatDate(c.fecha)} ${c.hora.slice(0, 5)}`,
    },
    { key: 'cliente', header: 'Cliente', essential: true, cell: (c) => c.clienteNombre ?? '—' },
    { key: 'categoria', header: 'Categoria', cell: (c) => c.categoria },
    { key: 'precio', header: 'Precio', cell: (c) => formatCurrency(c.precioFinal) },
    {
      key: 'comision',
      header: 'Comision',
      essential: true,
      cell: (c) => (c.estado === 'anulada' ? <span className="text-gray-500 line-through">{formatCurrency(c.comision)}</span> : formatCurrency(c.comision)),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (c) => (
        <div className="flex flex-wrap gap-1">
          <StatusBadge tone={estadoTone[c.estado]}>{c.estado}</StatusBadge>
          {c.liberada ? <StatusBadge tone="warning">liberada</StatusBadge> : null}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <Link href="/dashboard/chicas" className="text-sm text-purple-300 hover:underline">
        ← Volver a chicas
      </Link>

      <PageHeader
        title={chica.nombre}
        description={[chica.alias && `"${chica.alias}"`, `Ingreso ${formatDate(chica.fechaIngreso)}`, chica.telefono]
          .filter(Boolean)
          .join(' · ')}
        actions={
          chica.archivada ? (
            <StatusBadge tone="neutral">Archivada</StatusBadge>
          ) : (
            <StatusBadge tone={chica.activa ? 'success' : 'danger'}>{chica.activa ? 'Activa' : 'Ausente'}</StatusBadge>
          )
        }
      />

      <Grid cols={3} gap="lg" className="w-full">
        <MetricCard
          label="Comision del turno"
          value={formatCurrency(ficha.turno.comision)}
          helper={`${ficha.turno.comandas} comanda(s) · ${ficha.turno.label}`}
          accent="green"
        />
        <MetricCard
          label="Comision del mes"
          value={formatCurrency(ficha.mes.comision)}
          helper={`${ficha.mes.comandas} comanda(s) no anuladas`}
          accent="blue"
        />
        <MetricCard
          label="Promedio por comanda"
          value={formatCurrency(ficha.mes.comandas ? Math.round(ficha.mes.comision / ficha.mes.comandas) : 0)}
          helper="Este mes"
          accent="purple"
        />
      </Grid>

      {chica.notas ? (
        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Notas internas</h2>
          <p className="mt-2 whitespace-pre-line text-gray-200">{chica.notas}</p>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Ultimas comandas</h2>
        <DataTable
          columns={columns}
          data={ficha.comandas}
          pageSize={15}
          getRowKey={(c) => c.id}
          emptyTitle="Sin comandas registradas"
          emptyDescription="Cuando atienda clientes, sus comandas apareceran aqui."
        />
      </section>
    </div>
  )
}
