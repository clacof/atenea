'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../components/DashboardLayout'
import { mockComandas } from '../../lib/mockData'

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
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    
    // Cargar comandas desde la API
    fetch('/api/comandas', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setComandas(Array.isArray(data) ? data : [])
        calculateStats(Array.isArray(data) ? data : [])
      })
      .catch(err => console.error('Error cargando comandas:', err))
  }, [router])

  const calculateStats = (comandasData: any[]) => {
    const hoy = new Date().toISOString().split('T')[0]
    const hoyComandas = comandasData.filter(c => c.fecha.startsWith(hoy) && c.estado === 'activa')
    
    setStats({
      totalVentas: hoyComandas.reduce((sum, c) => sum + c.precioFinal, 0),
      totalComisiones: hoyComandas.reduce((sum, c) => sum + c.comisionTotal, 0),
      comandasHoy: hoyComandas.length,
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (!user) return <div>Cargando...</div>

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>{user.nombre} ({user.rol})</span>
          <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
            Salir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Ventas Hoy</h3>
          <p className="text-3xl font-bold text-green-400">${stats.totalVentas.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Comisiones Hoy</h3>
          <p className="text-3xl font-bold text-blue-400">${stats.totalComisiones.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Comandas Hoy</h3>
          <p className="text-3xl font-bold text-purple-400">{stats.comandasHoy}</p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Comandas Recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Fecha</th>
                <th className="text-left p-2">Precio</th>
                <th className="text-left p-2">Comision</th>
                <th className="text-left p-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {comandas.slice(0, 5).map((comanda) => (
                <tr key={comanda.id} className="border-b border-gray-700">
                  <td className="p-2">{comanda.id}</td>
                  <td className="p-2">{new Date(comanda.fecha).toLocaleDateString()}</td>
                  <td className="p-2">${comanda.precioFinal}</td>
                  <td className="p-2">${comanda.comisionTotal}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      comanda.estado === 'activa' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {comanda.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}