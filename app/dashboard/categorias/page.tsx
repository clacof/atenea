'use client'

import { useEffect, useState } from 'react'
import Button from '../../../components/atoms/Button'
import Input from '../../../components/atoms/Input'
import LoadingState from '../../../components/atoms/LoadingState'
import Select from '../../../components/atoms/Select'
import StatusBadge from '../../../components/atoms/StatusBadge'
import DataTable, { type DataTableColumn } from '../../../components/molecules/DataTable'
import FormField from '../../../components/molecules/FormField'
import PageHeader from '../../../components/molecules/PageHeader'
import Modal from '../../../components/Modal'
import { getAuthHeaders } from '../../../lib/client-auth'
import { confirmar } from '../../../lib/feedback'
import { can } from '../../../lib/permissions'
import { useCurrentUser } from '../../../lib/use-current-user'
import { formatCurrency } from '../../../lib/formatters'
import { REGLAS_TIPO, TIPOS_CATEGORIA, type TipoCategoria } from '../../../lib/tipoCategoria'

interface Categoria {
  id: number
  nombre: string
  tipo: TipoCategoria
  seccion?: string | null
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

interface FormData {
  nombre: string
  tipo: TipoCategoria
  seccion: string
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

interface CategoriaPayload {
  nombre: string
  tipo: TipoCategoria
  seccion: string | null
  isAfterhour: boolean
  soloTransferencia: boolean
  comision: number
  recargoCreditoCliente: number | null
  recargoCreditoChica: number | null
  precioCliente?: number | null
  precioChica?: number | null
  comisionChica?: number | null
  precio?: number | null
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { user: currentUser } = useCurrentUser()
  const [actionId, setActionId] = useState<number | null>(null)
  const [editingCategoriaId, setEditingCategoriaId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo: 'trago',
    seccion: '',
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
        seccion: prev.seccion,
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

    if (REGLAS_TIPO[formData.tipo].generaComision && (formData.comision === '' || formData.comision < 0)) {
      errors.comision = 'Comisión debe ser mayor o igual a 0'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      tipo: 'trago',
      seccion: '',
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
      seccion: categoria.seccion ?? '',
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
      
      const regla = REGLAS_TIPO[formData.tipo]
      const payload: CategoriaPayload = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        seccion: formData.seccion.trim() || null,
        isAfterhour: regla.admiteRecargos ? formData.isAfterhour : false,
        soloTransferencia: formData.soloTransferencia,
        comision: regla.generaComision ? Number(formData.comision) : 0,
        recargoCreditoCliente:
          regla.admiteRecargos && formData.recargoCreditoCliente ? Number(formData.recargoCreditoCliente) : null,
        recargoCreditoChica:
          regla.admiteRecargos && formData.recargoCreditoChica ? Number(formData.recargoCreditoChica) : null,
      }

      if (regla.precioPorConsumo) {
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
    const ok = await confirmar({
      title: `${accion === 'activar' ? 'Activar' : 'Desactivar'} categoria`,
      message: `Deseas ${accion} la categoria "${categoria.nombre}"?`,
      confirmLabel: accion === 'activar' ? 'Activar' : 'Desactivar',
      tone: accion === 'activar' ? 'primary' : 'danger',
    })
    if (!ok) return

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
    const ok = await confirmar({
      title: 'Eliminar categoria',
      message: `Eliminar permanentemente "${categoria.nombre}"? Esta accion no se puede deshacer.`,
      confirmLabel: 'Eliminar',
    })
    if (!ok) return

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
      {can(currentUser?.rol, 'categorias.editar') && (
        <Button
          size="sm"
          variant="secondary"
          disabled={actionId === categoria.id}
          onClick={() => openEditModal(categoria)}
        >
          Editar
        </Button>
      )}
      {can(currentUser?.rol, 'categorias.editar') && (
        <Button
          size="sm"
          variant="secondary"
          disabled={actionId === categoria.id}
          onClick={() => handleToggleActiva(categoria)}
        >
          {categoria.activa ? 'Desactivar' : 'Activar'}
        </Button>
      )}
      {can(currentUser?.rol, 'categorias.eliminar') && (
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

  const comidaColumns: DataTableColumn<Categoria>[] = [
    { key: 'id', header: 'ID', className: 'hidden sm:table-cell w-12', cell: (categoria) => categoria.id },
    {
      key: 'nombre',
      header: 'Nombre',
      cell: (categoria) => (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="font-medium">{categoria.nombre}</span>
          {!categoria.activa && (
            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300 sm:hidden">Inactiva</span>
          )}
          <span className="text-xs text-gray-400 sm:hidden">{formatCurrency(categoria.precio ?? 0)}</span>
        </div>
      ),
    },
    { key: 'seccion', header: 'Seccion', className: 'hidden sm:table-cell', cell: (categoria) => categoria.seccion || '—' },
    { key: 'precio', header: 'Precio', className: 'hidden sm:table-cell', cell: (categoria) => formatCurrency(categoria.precio ?? 0) },
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

  const columnasPorTipo: Record<TipoCategoria, DataTableColumn<Categoria>[]> = {
    trago: tragosColumns,
    botella: botellasColumns,
    comida: comidaColumns,
  }
  const colorPorTipo: Record<TipoCategoria, string> = {
    trago: 'text-purple-400',
    botella: 'text-blue-400',
    comida: 'text-orange-400',
  }
  const ordenarPorSeccion = (lista: Categoria[]) =>
    [...lista].sort(
      (a, b) => (a.seccion ?? '').localeCompare(b.seccion ?? '') || a.nombre.localeCompare(b.nombre),
    )
  const reglaForm = REGLAS_TIPO[formData.tipo]
  const secciones = Array.from(
    new Set(categorias.filter((c) => c.tipo === formData.tipo && c.seccion).map((c) => c.seccion as string)),
  ).sort()

  return (
    <div>
        <PageHeader
          title="Categorias"
          description="Tragos, botellas y carta de comida con precios y comisiones consistentes."
          actions={<Button onClick={openCreateModal}>+ Agregar Categoria</Button>}
        />

        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-8">
            {TIPOS_CATEGORIA.map((tipo) => {
              const regla = REGLAS_TIPO[tipo]
              const delTipo = categorias.filter((c) => c.tipo === tipo)
              return (
                <div key={tipo}>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className={`text-base sm:text-xl font-semibold ${colorPorTipo[tipo]}`}>
                      {regla.icono} {regla.plural}
                    </h2>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{delTipo.length}</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl">
                    <DataTable
                      columns={columnasPorTipo[tipo]}
                      data={tipo === 'comida' ? ordenarPorSeccion(delTipo) : delTipo}
                      getRowKey={(categoria) => categoria.id}
                      emptyTitle={`Sin registros en ${regla.plural.toLowerCase()}`}
                    />
                  </div>
                </div>
              )
            })}
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
                onChange={(value) => setFormData(prev => ({ ...prev, tipo: value as TipoCategoria }))}
                options={TIPOS_CATEGORIA.map((tipo) => ({
                  value: tipo,
                  label: `${REGLAS_TIPO[tipo].icono} ${REGLAS_TIPO[tipo].label}`,
                }))}
              />
            </FormField>

            <FormField label="Nombre de Categoria" error={fieldErrors.nombre}>
              <Input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder={formData.tipo === 'comida' ? 'Ej: Tabla de quesos, Papas fritas' : 'Ej: Cerveza, Whisky, Champagne'}
                hasError={Boolean(fieldErrors.nombre)}
              />
            </FormField>

            {formData.tipo === 'comida' && (
              <FormField label="Seccion de la carta">
                <Input
                  type="text"
                  name="seccion"
                  value={formData.seccion}
                  onChange={handleChange}
                  placeholder="Ej: Tablas, Sandwich, Postres"
                  list="secciones-carta"
                />
                <datalist id="secciones-carta">
                  {secciones.map((seccion) => (
                    <option key={seccion} value={seccion} />
                  ))}
                </datalist>
              </FormField>
            )}

            {reglaForm.admiteRecargos && (
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
            )}

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

            {reglaForm.generaComision && (
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
            )}

            {reglaForm.admiteRecargos && (
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
            )}

            {reglaForm.precioPorConsumo && (
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

            {!reglaForm.precioPorConsumo && (
              <FormField label={`Precio ${reglaForm.label}`} error={fieldErrors.precio}>
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
  )
}
