'use client'

import { useEffect, useState } from 'react'
import Button from '../../../components/atoms/Button'
import Input from '../../../components/atoms/Input'
import LoadingState from '../../../components/atoms/LoadingState'
import Select from '../../../components/atoms/Select'
import StatusBadge from '../../../components/atoms/StatusBadge'
import DashboardLayout from '../../../components/DashboardLayout'
import DataTable, { type DataTableColumn } from '../../../components/molecules/DataTable'
import FormField from '../../../components/molecules/FormField'
import PageHeader from '../../../components/molecules/PageHeader'
import Modal from '../../../components/Modal'
import { getAuthHeaders, getStoredUser } from '../../../lib/client-auth'
import { formatCurrency } from '../../../lib/formatters'

interface Categoria {
  id: number
  nombre: string
  tipo: 'trago' | 'botella'
  precioCliente?: number
  precioChica?: number
  comisionChica?: number
  precio?: number
  activa: boolean
}

type TipoCategoria = 'trago' | 'botella'

interface AuthUser {
  id: number
  nombre: string
  email: string
  rol: string
}

interface FormData {
  nombre: string
  tipo: TipoCategoria
  precioCliente: number | ''
  precioChica: number | ''
  comisionChica: number | ''
  precio: number | ''
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo: 'trago',
    precioCliente: '',
    precioChica: '',
    comisionChica: '',
    precio: '',
  })

  useEffect(() => {
    setCurrentUser(getStoredUser<AuthUser>())
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/categorias', {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      setCategorias(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'tipo') {
      // Limpiar campos cuando cambia el tipo
      setFormData(prev => ({
        nombre: prev.nombre,
        tipo: value as TipoCategoria,
        precioCliente: '',
        precioChica: '',
        comisionChica: '',
        precio: '',
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['precioCliente', 'precioChica', 'comisionChica', 'precio'].includes(name)
          ? (value === '' ? '' : Number(value))
          : value,
      }))
    }
    
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

    if (formData.tipo === 'trago') {
      if (!formData.precioCliente || formData.precioCliente <= 0) {
        errors.precioCliente = 'Precio cliente debe ser mayor a 0'
      }
      if (!formData.precioChica || formData.precioChica <= 0) {
        errors.precioChica = 'Precio chica debe ser mayor a 0'
      }
      if (formData.comisionChica === '' || formData.comisionChica < 0) {
        errors.comisionChica = 'Comision debe ser mayor o igual a 0'
      }
    } else if (formData.tipo === 'botella') {
      if (!formData.precio || formData.precio <= 0) {
        errors.precio = 'Precio debe ser mayor a 0'
      }
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
      
      const payload: any = {
        nombre: formData.nombre,
        tipo: formData.tipo,
      }

      if (formData.tipo === 'trago') {
        payload.precioCliente = Number(formData.precioCliente)
        payload.precioChica = Number(formData.precioChica)
        payload.comisionChica = Number(formData.comisionChica)
      } else {
        payload.precio = Number(formData.precio)
      }

      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Error al crear la categoria')
      }

      await fetchCategorias()
      setFormData({
        nombre: '',
        tipo: 'trago',
        precioCliente: '',
        precioChica: '',
        comisionChica: '',
        precio: '',
      })
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la categoria')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleToggleActiva = async (categoria: Categoria) => {
    const accion = categoria.activa ? 'desactivar' : 'activar'
    if (!confirm(`¿Deseas ${accion} la categoría "${categoria.nombre}"?`)) return

    try {
      setActionId(categoria.id)
      const response = await fetch(`/api/categorias/${categoria.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ activa: !categoria.activa }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `No se pudo ${accion} la categoría`)
      }

      await fetchCategorias()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${accion} la categoría`)
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (categoria: Categoria) => {
    if (!confirm(`¿Eliminar permanentemente "${categoria.nombre}"? Esta acción no se puede deshacer.`)) return

    try {
      setActionId(categoria.id)
      const response = await fetch(`/api/categorias/${categoria.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'No se pudo eliminar la categoría')
      }

      await fetchCategorias()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la categoría')
    } finally {
      setActionId(null)
    }
  }

  const accionesCell = (categoria: Categoria) => (
    <div className="flex gap-2">
      {['admin', 'supervisor'].includes(currentUser?.rol ?? '') && (
        <Button
          size="sm"
          variant="secondary"
          disabled={actionId === categoria.id}
          onClick={() => handleToggleActiva(categoria)}
        >
          {categoria.activa ? 'Desactivar' : 'Activar'}
        </Button>
      )}
      {currentUser?.rol === 'admin' && (
        <Button
          size="sm"
          variant="danger"
          disabled={actionId === categoria.id}
          onClick={() => handleDelete(categoria)}
        >
          Eliminar
        </Button>
      )}
    </div>
  )

  const tragos = categorias.filter(c => c.tipo === 'trago')
  const botellas = categorias.filter(c => c.tipo === 'botella')

  const statusCell = (categoria: Categoria) => (
    <StatusBadge tone={categoria.activa ? 'success' : 'danger'}>
      {categoria.activa ? 'Activa' : 'Inactiva'}
    </StatusBadge>
  )

  const tragosColumns: DataTableColumn<Categoria>[] = [
    { key: 'id', header: 'ID', cell: (categoria) => categoria.id },
    { key: 'nombre', header: 'Nombre', cell: (categoria) => categoria.nombre },
    { key: 'precioCliente', header: 'Precio Cliente', cell: (categoria) => formatCurrency(categoria.precioCliente ?? 0) },
    { key: 'precioChica', header: 'Precio Chica', cell: (categoria) => formatCurrency(categoria.precioChica ?? 0) },
    { key: 'comision', header: 'Comision Chica', cell: (categoria) => formatCurrency(categoria.comisionChica ?? 0) },
    { key: 'estado', header: 'Estado', cell: statusCell },
    { key: 'acciones', header: 'Acciones', cell: accionesCell },
  ]

  const botellasColumns: DataTableColumn<Categoria>[] = [
    { key: 'id', header: 'ID', cell: (categoria) => categoria.id },
    { key: 'nombre', header: 'Nombre', cell: (categoria) => categoria.nombre },
    { key: 'precio', header: 'Precio', cell: (categoria) => formatCurrency(categoria.precio ?? 0) },
    { key: 'estado', header: 'Estado', cell: statusCell },
    { key: 'acciones', header: 'Acciones', cell: accionesCell },
  ]

  return (
    <DashboardLayout>
      <div>
        <PageHeader
          title="Categorias"
          description="Agrupa tragos y botellas con precios y comisiones consistentes."
          actions={<Button onClick={() => setShowModal(true)}>+ Agregar Categoria</Button>}
        />

        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-purple-400">🍹 Tragos</h2>
              <DataTable
                columns={tragosColumns}
                data={tragos}
                getRowKey={(categoria) => categoria.id}
                emptyTitle="No hay tragos registrados"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-400">🍾 Botellas</h2>
              <DataTable
                columns={botellasColumns}
                data={botellas}
                getRowKey={(categoria) => categoria.id}
                emptyTitle="No hay botellas registradas"
              />
            </div>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setFieldErrors({})
            setError('')
          }}
          title="Agregar Nueva Categoria"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900 text-red-200 p-3 rounded text-sm">
                {error}
              </div>
            )}

            <FormField label="Tipo de Categoria">
              <Select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
              >
                <option value="trago">🍹 Trago</option>
                <option value="botella">🍾 Botella</option>
              </Select>
            </FormField>

            <FormField label="Nombre de Categoria" error={fieldErrors.nombre}>
              <Input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Cerveza, Whisky, Champagne"
                hasError={Boolean(fieldErrors.nombre)}
              />
            </FormField>

            {formData.tipo === 'trago' && (
              <>
                <FormField label="Precio Cliente" error={fieldErrors.precioCliente}>
                  <Input
                    type="number"
                    name="precioCliente"
                    value={formData.precioCliente}
                    onChange={handleChange}
                    placeholder="0"
                    hasError={Boolean(fieldErrors.precioCliente)}
                  />
                </FormField>

                <FormField label="Precio Chica" error={fieldErrors.precioChica}>
                  <Input
                    type="number"
                    name="precioChica"
                    value={formData.precioChica}
                    onChange={handleChange}
                    placeholder="0"
                    hasError={Boolean(fieldErrors.precioChica)}
                  />
                </FormField>

                <FormField label="Comision Chica" error={fieldErrors.comisionChica}>
                  <Input
                    type="number"
                    name="comisionChica"
                    value={formData.comisionChica}
                    onChange={handleChange}
                    placeholder="0"
                    hasError={Boolean(fieldErrors.comisionChica)}
                  />
                </FormField>
              </>
            )}

            {formData.tipo === 'botella' && (
              <FormField label="Precio Botella" error={fieldErrors.precio}>
                <Input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="0"
                  hasError={Boolean(fieldErrors.precio)}
                />
              </FormField>
            )}

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
                {isSubmitting ? 'Guardando...' : 'Agregar Categoria'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
