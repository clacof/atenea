'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { mockComandas } from '../../../lib/mockData'

interface Comanda {
  id: number
  fecha: string
  hora: string
  categoria: { nombre: string }
  tipoConsumo: string
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

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    fetch('/api/comandas', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setComandas(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error cargando comandas:', err)
        setLoading(false)
      })
  }, [])

  if (loading) return <DashboardLayout><div>Cargando...</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Comandas</h1>
        <a
          href="/dashboard/comandas/nueva"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Nueva Comanda
        </a>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Fecha</th>
                <th className="text-left p-3">Hora</th>
                <th className="text-left p-3">Categoria</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-left p-3">Chicas</th>
                <th className="text-left p-3">Precio Base</th>
                <th className="text-left p-3">Precio Final</th>
                <th className="text-left p-3">Comision</th>
                <th className="text-left p-3">Pago</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {comandas.map((comanda) => (
                <tr key={comanda.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-3">{comanda.id}</td>
                  <td className="p-3">{new Date(comanda.fecha).toLocaleDateString()}</td>
                  <td className="p-3">{comanda.hora}</td>
                  <td className="p-3">{comanda.categoria.nombre}</td>
                  <td className="p-3">{comanda.tipoConsumo}</td>
                  <td className="p-3">
                    {comanda.chica1?.nombre}
                    {comanda.chica2 && `, ${comanda.chica2.nombre}`}
                  </td>
                  <td className="p-3">${comanda.precioBase}</td>
                  <td className="p-3">${comanda.precioFinal}</td>
                  <td className="p-3">${comanda.comisionTotal}</td>
                  <td className="p-3">{comanda.medioPago}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      comanda.estado === 'activa' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {comanda.estado}
                    </span>
                  </td>
                  <td className="p-3">{comanda.usuario.nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}