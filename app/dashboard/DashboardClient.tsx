'use client'

import { useRouter } from 'next/navigation'
import Button from '@/components/atoms/Button'
import StatusBadge from '@/components/atoms/StatusBadge'
import DataTable, { type DataTableColumn } from '@/components/molecules/DataTable'
import MetricCard from '@/components/molecules/MetricCard'
import PageHeader from '@/components/molecules/PageHeader'
import { Grid } from '@/components/Grid'
import { logout } from '@/lib/client-auth'
import { formatCurrency, formatDate } from '@/lib/formatters'

interface User {
  id: number
  nombre: string
  email: string
  rol: string
}

interface Stats {
  totalVentas: number
  totalComisiones: number
  comandasHoy: number
}

interface Comanda {
  id: number
  fecha: string
  precioFinal: number
  comisionTotal: number
  estado: string
  categoria: { nombre: string }
}

interface DashboardClientProps {
  user: User
  stats: Stats
  comandas: Comanda[]
}

export default function DashboardClient({ user, stats, comandas }: DashboardClientProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleNewComanda = () => {
    router.push('/dashboard/comandas/nueva')
  }

  const handleGoToReportes = () => {
    router.push('/dashboard/reportes')
  }

  const recentColumns: DataTableColumn<Comanda>[] = [
    { key: 'id', header: 'ID', cell: (comanda) => comanda.id, essential: true, className: 'w-20 text-gray-400' },
    { key: 'fecha', header: 'Fecha', cell: (comanda) => formatDate(comanda.fecha), essential: true },
    { key: 'categoria', header: 'Categoria', cell: (comanda) => comanda.categoria?.nombre || '-', essential: true },
    { key: 'precio', header: 'Precio', cell: (comanda) => formatCurrency(comanda.precioFinal), essential: true },
    { key: 'comision', header: 'Comision', cell: (comanda) => formatCurrency(comanda.comisionTotal) },
    {
      key: 'estado',
      header: 'Estado',
      cell: (comanda) => (
        <StatusBadge tone={comanda.estado === 'anulada' ? 'danger' : comanda.estado === 'pagada' ? 'neutral' : 'success'}>
          {comanda.estado}
        </StatusBadge>
      ),
    },
  ]

  return (
    <div className="space-y-10">
      <PageHeader
        title="Dashboard"
        description={`Bienvenido ${user.nombre}. Aquí tienes el pulso del turno en tiempo real.`}
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
              {user.nombre} · {user.rol}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleGoToReportes}>
                Ver reportes
              </Button>
              <Button onClick={handleNewComanda}>
                Nueva comanda
              </Button>
              <Button variant="danger" onClick={handleLogout}>
                Salir
              </Button>
            </div>
          </>
        }
      />

      <Grid cols={3} gap="lg" className="w-full">
        <MetricCard label="Ventas Hoy" value={formatCurrency(stats.totalVentas)} helper="Ingresos brutos del dia" accent="green" />
        <MetricCard label="Comisiones Hoy" value={formatCurrency(stats.totalComisiones)} helper="Total acumulado del staff" accent="blue" />
        <MetricCard label="Comandas Hoy" value={stats.comandasHoy} helper="Operaciones registradas" accent="purple" />
      </Grid>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Actividad reciente</h2>
            <p className="text-sm text-gray-400">Ultimas comandas registradas durante el turno.</p>
          </div>
          <Button variant="ghost" className="text-sm text-gray-300 hover:text-white" onClick={handleGoToReportes}>
            Ver todo el historial
          </Button>
        </div>
        <DataTable
          columns={recentColumns}
          data={comandas.slice(0, 5)}
          getRowKey={(comanda) => comanda.id}
          emptyTitle="No hay comandas recientes"
          emptyDescription="Cuando se registren ventas, apareceran aqui."
        />
      </section>
    </div>
  )
}
