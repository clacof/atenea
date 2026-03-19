'use client'

import { useEffect, useState } from 'react'
import Button from '../../../components/atoms/Button'
import Input from '../../../components/atoms/Input'
import LoadingState from '../../../components/atoms/LoadingState'
import StatusBadge from '../../../components/atoms/StatusBadge'
import DashboardLayout from '../../../components/DashboardLayout'
import DataTable, { type DataTableColumn } from '../../../components/molecules/DataTable'
import FormField from '../../../components/molecules/FormField'
import PageHeader from '../../../components/molecules/PageHeader'
import Modal from '../../../components/Modal'
import { getAuthHeaders, getStoredUser } from '../../../lib/client-auth'

interface Chica {
  id: number
  nombre: string
  activa: boolean
}

interface FormData {
  nombre: string
}

interface AuthUser {
  id: number
  nombre: string
  email: string
  rol: string
}

export default function Chicas() {
  const [chicas, setChicas] = useState<Chica[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
  })

  useEffect(() => {
    setCurrentUser(getStoredUser<AuthUser>())
    fetchChicas()
  }, [])

  const fetchChicas = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/chicas', {
        headers: getAuthHeaders(),
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
      
      const response = await fetch('/api/chicas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          nombre: formData.nombre,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Error al crear la chica')
      }

      await fetchChicas()
      setFormData({ nombre: '' })
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la chica')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (chicaId: number) => {
    if (!confirm('¿Deseas eliminar esta chica? Quedará inactiva.')) {
      return
    }

    try {
      setDeletingId(chicaId)
      const response = await fetch(`/api/chicas/${chicaId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'No se pudo eliminar la chica')
      }

      await fetchChicas()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la chica')
    } finally {
      setDeletingId(null)
    }
  }

  const columns: DataTableColumn<Chica>[] = [
    { key: 'id', header: 'ID', cell: (chica) => chica.id },
    { key: 'nombre', header: 'Nombre', cell: (chica) => chica.nombre },
    {
      key: 'estado',
      header: 'Estado',
      cell: (chica) => (
        <StatusBadge tone={chica.activa ? 'success' : 'danger'}>
          {chica.activa ? 'Activa' : 'Inactiva'}
        </StatusBadge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      cell: (chica) => currentUser?.rol === 'admin' ? (
        <Button
          size="sm"
          variant="danger"
          disabled={deletingId === chica.id}
          onClick={() => handleDelete(chica.id)}
        >
          Eliminar
        </Button>
      ) : (
        <span className="text-xs text-gray-500">Solo admin</span>
      ),
    },
  ]

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>

  return (
    <DashboardLayout>
      <div>
        <PageHeader
          title="Chicas"
          description="Administra el catálogo de chicas activas e inactivas."
          actions={<Button onClick={() => setShowModal(true)}>+ Agregar Chica</Button>}
        />

        <DataTable
          columns={columns}
          data={chicas}
          getRowKey={(chica) => chica.id}
          emptyTitle="No hay chicas registradas"
          emptyDescription="Agrega la primera chica para empezar a operar."
        />

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

            <FormField label="Nombre" error={fieldErrors.nombre}>
              <Input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Maria, Juanita, etc"
                hasError={Boolean(fieldErrors.nombre)}
              />
            </FormField>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setFieldErrors({})
                  setError('')
                }}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Agregar Chica'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}