'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../../components/atoms/Button'
import LoadingState from '../../components/atoms/LoadingState'
import StatusBadge from '../../components/atoms/StatusBadge'
import DashboardLayout from '../../components/DashboardLayout'
import DataTable, { type DataTableColumn } from '../../components/molecules/DataTable'
import MetricCard from '../../components/molecules/MetricCard'
import PageHeader from '../../components/molecules/PageHeader'
import { logout, getAuthHeaders, getStoredUser } from '../../lib/client-auth'
import { formatCurrency, formatDate } from '../../lib/formatters'

interface User {
  id: number
  nombre: string
  email: string
  rol: string
}

interface Comanda {
  id: number
  fecha: string
  precioFinal: number
  comisionTotal: number
  estado: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalComisiones: 0,
    comandasHoy: 0,
  })
  const router = useRouter()

  useEffect(() => {
    const currentUser = getStoredUser<User>()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    
    fetch('/api/stats', { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.totalVentas === 'number') {
          setStats({
            totalVentas: data.totalVentas,
            totalComisiones: data.totalComisiones,
            comandasHoy: data.comandasHoy,
          })
        }
      })
      .catch((err) => console.error('Error cargando stats:', err))

    fetch('/api/comandas?limit=5', { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => setComandas(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error cargando comandas recientes:', err))
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const recentColumns: DataTableColumn<Comanda>[] = [
    { key: 'id', header: 'ID', cell: (comanda) => comanda.id },
    { key: 'fecha', header: 'Fecha', cell: (comanda) => formatDate(comanda.fecha) },
    { key: 'precio', header: 'Precio', cell: (comanda) => formatCurrency(comanda.precioFinal) },
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

  if (!user) {
    return (
      <DashboardLayout>
        <LoadingState message="Cargando dashboard..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description={`Bienvenido ${user.nombre}. Resumen operativo del turno actual.`}
        actions={
          <>
            <span className="text-sm text-gray-300">{user.nombre} ({user.rol})</span>
            <Button variant="danger" onClick={handleLogout}>Salir</Button>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard label="Ventas Hoy" value={formatCurrency(stats.totalVentas)} accent="green" />
        <MetricCard label="Comisiones Hoy" value={formatCurrency(stats.totalComisiones)} accent="blue" />
        <MetricCard label="Comandas Hoy" value={stats.comandasHoy} accent="purple" />
      </div>

      <DataTable
        columns={recentColumns}
        data={comandas.slice(0, 5)}
        getRowKey={(comanda) => comanda.id}
        emptyTitle="No hay comandas recientes"
        emptyDescription="Cuando se registren ventas, apareceran aqui."
      />
    </DashboardLayout>
  )
}