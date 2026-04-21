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
  isAfterhour: boolean
  precioCliente?: number
  precioChica?: number
  comisionChica?: number
  precio?: number
  comision?: number
  recargoCreditoCliente?: number
  recargoCreditoChica?: number
  soloTransferencia?: boolean
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
  isAfterhour: boolean
  precioCliente: number | ''
  precioChica: number | ''
  comisionChica: number | ''
  precio: number | ''
  comision: number | ''
  recargoCreditoCliente: number | ''
  recargoCreditoChica: number | ''
  soloTransferencia: boolean
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
  const [editingCategoriaId, setEditingCategoriaId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo: 'trago',
    isAfterhour: false,
    precioCliente: '',
    precioChica: '',
    comisionChica: '',
    precio: '',
    comision: '',
    recargoCreditoCliente: '',
    recargoCreditoChica: '',
    soloTransferencia: false,
  })

  useEffect(() => {
    setCurrentUser(getStoredUser<AuthUser>())
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/categorias?includeInactive=1', {
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
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))

      if (fieldErrors[name]) {
        setFieldErrors({ ...fieldErrors, [name]: '' })
      }
      return
    }
    
    if (name === 'tipo') {
      // Limpiar campos cuando cambia el tipo
      setFormData(prev => ({
        nombre: prev.nombre,
        tipo: value as TipoCategoria,
        isAfterhour: prev.isAfterhour,
        precioCliente: '',
        precioChica: '',
        comisionChica: '',
        precio: '',
        comision: '',
        recargoCreditoCliente: '',
        recargoCreditoChica: '',
        soloTransferencia: prev.soloTransferencia,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['precioCliente', 'precioChica', 'comisionChica', 'precio', 'comision', 'recargoCreditoCliente', 'recargoCreditoChica'].includes(name)
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

    if (formData.comision === '' || formData.comision < 0) {
      errors.comision = 'Comisión debe ser mayor o igual a 0'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      tipo: 'trago',
      isAfterhour: false,
      precioCliente: '',
      precioChica: '',
      comisionChica: '',
      precio: '',
      comision: '',
      recargoCreditoCliente: '',
      recargoCreditoChica: '',
      soloTransferencia: false,
    })
    setFieldErrors({})
    setError('')
    setEditingCategoriaId(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (categoria: Categoria) => {
    setEditingCategoriaId(categoria.id)
    setError('')
    setFieldErrors({})
    setFormData({
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      isAfterhour: categoria.isAfterhour,
      precioCliente: categoria.precioCliente ?? '',
      precioChica: categoria.precioChica ?? '',
      comisionChica: categoria.comisionChica ?? '',
      precio: categoria.precio ?? '',
      comision: categoria.comision ?? '',
      recargoCreditoCliente: categoria.recargoCreditoCliente ?? '',
      recargoCreditoChica: categoria.recargoCreditoChica ?? '',
      soloTransferencia: categoria.soloTransferencia ?? false,
    })
    setShowModal(true)
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
        isAfterhour: formData.isAfterhour,
        soloTransferencia: formData.soloTransferencia,
        comision: Number(formData.comision),
        recargoCreditoCliente: formData.recargoCreditoCliente ? Number(formData.recargoCreditoCliente) : null,
        recargoCreditoChica: formData.recargoCreditoChica ? Number(formData.recargoCreditoChica) : null,
      }

      if (formData.tipo === 'trago') {
        payload.precioCliente = Number(formData.precioCliente)
        payload.precioChica = Number(formData.precioChica)
        payload.comisionChica = Number(formData.comisionChica)
        payload.precio = null
      } else {
        payload.precio = Number(formData.precio)
        payload.precioCliente = null
        payload.precioChica = null
        payload.comisionChica = null
      }

      const isEditing = editingCategoriaId !== null
      const response = await fetch(
        isEditing ? `/api/categorias/${editingCategoriaId}` : '/api/categorias',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(
          errData.error || (isEditing ? 'Error al actualizar la categoria' : 'Error al crear la categoria'),
        )
      }

      await fetchCategorias()
      resetForm()
      setShowModal(false)
    } catch (err) {
      const fallback = editingCategoriaId ? 'Error al actualizar la categoria' : 'Error al crear la categoria'
      setError(err instanceof Error ? err.message : fallback)
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleToggleActiva = async (categoria: Categoria) => {
    const accion = categoria.activa ? 'desactivar' : 'activar'
    if (!confirm(`Deseas ${accion} la categoria "${categoria.nombre}"?`)) return

    try {
      setActionId(categoria.id)
      const response = await fetch(`/api/categorias/${categoria.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ activa: !categoria.activa }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `No se pudo ${accion} la categoria`)
      }

      await fetchCategorias()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${accion} la categoria`)
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (categoria: Categoria) => {
    if (!confirm(`Eliminar permanentemente "${categoria.nombre}"? Esta accion no se puede deshacer.`)) return

    try {
      setActionId(categoria.id)
      const response = await fetch(`/api/categorias/${categoria.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'No se pudo eliminar la categoria')
      }

      await fetchCategorias()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la categoria')
    } finally {
      setActionId(null)
    }
  }

  const accionesCell = (categoria: Categoria) => (
    <div className="flex flex-wrap gap-1.5">
      {['admin', 'supervisor'].includes(currentUser?.rol ?? '') && (
        <Button
          size="sm"
          variant="secondary"
          disabled={actionId === categoria.id}
          onClick={() => openEditModal(categoria)}
        >
          Editar
        </Button>
      )}
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
    { key: 'id', header: 'ID', className: 'hidden sm:table-cell w-12', cell: (categoria) => categoria.id },
    {
      key: 'nombre',
      header: 'Nombre',
      cell: (categoria) => (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="font-medium">{categoria.nombre}</span>
          <div className="flex gap-1 flex-wrap">
            {categoria.isAfterhour && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">Afterhour</span>
            )}
            {!categoria.activa && (
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300 sm:hidden">Inactiva</span>
            )}
          </div>
          <div className="flex gap-1 text-xs text-gray-400 sm:hidden">
            <span>{formatCurrency(categoria.precioCliente ?? 0)}</span>
            <span>/</span>
            <span>{formatCurrency(categoria.precioChica ?? 0)}</span>
          </div>
        </div>
      ),
    },
    { key: 'precioCliente', header: 'P. Cliente', className: 'hidden sm:table-cell', cell: (categoria) => formatCurrency(categoria.precioCliente ?? 0) },
    { key: 'precioChica', header: 'P. Chica', className: 'hidden sm:table-cell', cell: (categoria) => formatCurrency(categoria.precioChica ?? 0) },
    { key: 'comision', header: 'Comision', className: 'hidden md:table-cell', cell: (categoria) => formatCurrency(categoria.comision ?? 0) },
    { key: 'estado', header: 'Estado', className: 'hidden sm:table-cell', cell: statusCell },
    { key: 'acciones', header: '', cell: accionesCell },
  ]

  const botellasColumns: DataTableColumn<Categoria>[] = [
    { key: 'id', header: 'ID', className: 'hidden sm:table-cell w-12', cell: (categoria) => categoria.id },
    {
      key: 'nombre',
      header: 'Nombre',
      cell: (categoria) => (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="font-medium">{categoria.nombre}</span>
          <div className="flex gap-1 flex-wrap">
            {categoria.isAfterhour && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">Afterhour</span>
            )}
            {!categoria.activa && (
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300 sm:hidden">Inactiva</span>
            )}
          </div>
          <span className="text-xs text-gray-400 sm:hidden">{formatCurrency(categoria.precio ?? 0)}</span>
        </div>
      ),
    },
    { key: 'precio', header: 'Precio', className: 'hidden sm:table-cell', cell: (categoria) => formatCurrency(categoria.precio ?? 0) },
    { key: 'comision', header: 'Comision', className: 'hidden md:table-cell', cell: (categoria) => formatCurrency(categoria.comision ?? 0) },
    { key: 'estado', header: 'Estado', className: 'hidden sm:table-cell', cell: statusCell },
    { key: 'acciones', header: '', cell: accionesCell },
  ]

  return (
    <DashboardLayout>
      <div>
        <PageHeader
          title="Categorias"
          description="Agrupa tragos y botellas con precios y comisiones consistentes."
          actions={<Button onClick={openCreateModal}>+ Agregar Categoria</Button>}
        />

        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base sm:text-xl font-semibold text-purple-400">🍹 Tragos o vasos</h2>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{tragos.length}</span>
              </div>
              <div className="overflow-x-auto rounded-xl">
                <DataTable
                  columns={tragosColumns}
                  data={tragos}
                  getRowKey={(categoria) => categoria.id}
                  emptyTitle="No hay tragos registrados"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base sm:text-xl font-semibold text-blue-400">🍾 Botellas</h2>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{botellas.length}</span>
              </div>
              <div className="overflow-x-auto rounded-xl">
                <DataTable
                  columns={botellasColumns}
                  data={botellas}
                  getRowKey={(categoria) => categoria.id}
                  emptyTitle="No hay botellas registradas"
                />
              </div>
            </div>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            resetForm()
          }}
          title={editingCategoriaId ? 'Editar Categoria' : 'Agregar Nueva Categoria'}
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

            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                name="isAfterhour"
                checked={formData.isAfterhour}
                onChange={handleChange}
                className="accent-purple-500"
              />
              Categoria afterhour (comision solo casa)
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                name="soloTransferencia"
                checked={formData.soloTransferencia}
                onChange={handleChange}
                className="accent-yellow-500"
              />
              Solo transferencia (ej: Blue Label)
            </label>

            <FormField label="Comisión General" error={fieldErrors.comision}>
              <Input
                type="number"
                name="comision"
                value={formData.comision}
                onChange={handleChange}
                placeholder="0"
                hasError={Boolean(fieldErrors.comision)}
                min="0"
              />
            </FormField>

            <div className="border border-gray-700 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-orange-400">💳 Recargo por pago con credito</p>
              <p className="text-xs text-gray-400">Monto adicional que se suma al precio cuando se paga con credito</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Recargo Credito Cliente ($)">
                  <Input
                    type="number"
                    name="recargoCreditoCliente"
                    value={formData.recargoCreditoCliente}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                </FormField>
                <FormField label="Recargo Credito Chica ($)">
                  <Input
                    type="number"
                    name="recargoCreditoChica"
                    value={formData.recargoCreditoChica}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                </FormField>
              </div>
            </div>

            {formData.tipo === 'trago' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>
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
                  resetForm()
                }}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Guardando...'
                  : editingCategoriaId
                    ? 'Guardar Cambios'
                    : 'Agregar Categoria'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
