'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import Modal from '../../../components/Modal'
import FormError from '../../../components/FormError'

interface Chica {
  id: number
  nombre: string
  activa: boolean
}

interface FormData {
  nombre: string
}

export default function Chicas() {
  const [chicas, setChicas] = useState<Chica[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
  })

  useEffect(() => {
    fetchChicas()
  }, [])

  const fetchChicas = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/chicas', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      setChicas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    
    // Limpiar error del campo
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/chicas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: formData.nombre,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Error al crear la chica')
      }

      // Recargar chicas
      await fetchChicas()
      
      // Limpiar formulario y cerrar modal
      setFormData({
        nombre: '',
      })
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la chica')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <DashboardLayout><div>Cargando...</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Chicas</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold"
          >
            + Agregar Chica
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {chicas.map(chica => (
                <tr key={chica.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-3">{chica.id}</td>
                  <td className="p-3">{chica.nombre}</td>
                  <td className="p-3">
                    <span className={chica.activa ? 'text-green-400' : 'text-red-400'}>
                      {chica.activa ? '✓ Activa' : '✗ Inactiva'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {chicas.length === 0 && (
            <div className="p-6 text-center text-gray-400">
              No hay chicas registradas
            </div>
          )}
        </div>

        {/* Modal para agregar chica */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setFieldErrors({})
            setError('')
          }}
          title="Agregar Nueva Chica"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900 text-red-200 p-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Maria, Juanita, etc"
                className={`w-full p-2 bg-gray-700 text-white rounded ${
                  fieldErrors.nombre ? 'border-2 border-red-500' : ''
                }`}
              />
              <FormError message={fieldErrors.nombre} />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setFieldErrors({})
                  setError('')
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Agregar Chica'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}