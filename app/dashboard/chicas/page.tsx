'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Button from '../../../components/atoms/Button'
import Checkbox from '../../../components/atoms/Checkbox'
import Input from '../../../components/atoms/Input'
import StatusBadge from '../../../components/atoms/StatusBadge'
import DataTable, { type DataTableColumn } from '../../../components/molecules/DataTable'
import FormField from '../../../components/molecules/FormField'
import PageHeader from '../../../components/molecules/PageHeader'
import Modal from '../../../components/Modal'
import { getAuthHeaders } from '../../../lib/client-auth'
import { apiError, confirmar, notify } from '../../../lib/feedback'
import { formatDate } from '../../../lib/formatters'
import { can } from '../../../lib/permissions'
import { useCurrentUser } from '../../../lib/use-current-user'

interface Chica {
  id: number
  nombre: string
  alias: string | null
  telefono: string | null
  notas: string | null
  activa: boolean
  archivada: boolean
  fechaIngreso: string
}

interface FormData {
  nombre: string
  alias: string
  telefono: string
  notas: string
  fechaIngreso: string
  activa: boolean
}

type Filtro = 'todas' | 'activas' | 'ausentes' | 'archivadas'

const FILTROS: Array<{ value: Filtro; label: string }> = [
  { value: 'todas', label: 'Todas' },
  { value: 'activas', label: 'Activas' },
  { value: 'ausentes', label: 'Ausentes' },
  { value: 'archivadas', label: 'Archivadas' },
]

const hoyISO = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local

const emptyForm = (): FormData => ({
  nombre: '',
  alias: '',
  telefono: '',
  notas: '',
  fechaIngreso: hoyISO(),
  activa: true,
})

// Mediodia local para que la fecha no se corra de dia por zona horaria
const fechaAISO = (fecha: string) => new Date(`${fecha}T12:00:00`).toISOString()

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function Chicas() {
  const { user } = useCurrentUser()
  const canEdit = can(user?.rol, 'chicas.editar')
  const canDelete = can(user?.rol, 'chicas.eliminar')

  const [chicas, setChicas] = useState<Chica[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [seleccion, setSeleccion] = useState<Set<number>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editingChica, setEditingChica] = useState<Chica | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [changingId, setChangingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)

  useEffect(() => {
    fetchChicas()
  }, [])

  const fetchChicas = async () => {
    try {
      const response = await fetch('/api/chicas?archivadas=1', {
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error(await apiError(response, 'No se pudieron cargar las chicas'))
      const data = await response.json()
      setChicas(Array.isArray(data) ? data : [])
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'No se pudieron cargar las chicas')
    } finally {
      setLoading(false)
    }
  }

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim())
    return chicas.filter((chica) => {
      if (filtro === 'archivadas' ? !chica.archivada : chica.archivada) return false
      if (filtro === 'activas' && !chica.activa) return false
      if (filtro === 'ausentes' && chica.activa) return false
      if (!q) return true
      return [chica.nombre, chica.alias, chica.telefono].some((campo) => campo && normalizar(campo).includes(q))
    })
  }, [chicas, busqueda, filtro])

  const conteo = useMemo(
    () => ({
      activas: chicas.filter((c) => !c.archivada && c.activa).length,
      ausentes: chicas.filter((c) => !c.archivada && !c.activa).length,
      archivadas: chicas.filter((c) => c.archivada).length,
    }),
    [chicas],
  )

  // La seleccion solo considera chicas visibles y no archivadas
  const seleccionables = visibles.filter((c) => !c.archivada)
  const seleccionadas = seleccionables.filter((c) => seleccion.has(c.id))
  const todasSeleccionadas = seleccionables.length > 0 && seleccionadas.length === seleccionables.length

  const toggleSeleccion = (id: number) => {
    setSeleccion((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleTodas = () => {
    setSeleccion(todasSeleccionadas ? new Set() : new Set(seleccionables.map((c) => c.id)))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Limpiar error del campo
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    const nombre = formData.nombre.trim()

    if (!nombre) {
      errors.nombre = 'El nombre es requerido'
    } else if (
      chicas.some(
        (c) => !c.archivada && c.id !== editingChica?.id && normalizar(c.nombre) === normalizar(nombre),
      )
    ) {
      errors.nombre = 'Ya existe una chica con ese nombre'
    }
    if (formData.telefono && !/^[\d\s+()-]{6,30}$/.test(formData.telefono.trim())) {
      errors.telefono = 'Telefono invalido'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const openCreate = () => {
    setEditingChica(null)
    setFormData(emptyForm())
    setFieldErrors({})
    setError('')
    setShowModal(true)
  }

  const openEdit = (chica: Chica) => {
    setEditingChica(chica)
    setFormData({
      nombre: chica.nombre,
      alias: chica.alias ?? '',
      telefono: chica.telefono ?? '',
      notas: chica.notas ?? '',
      fechaIngreso: new Date(chica.fechaIngreso).toLocaleDateString('en-CA'),
      activa: chica.activa,
    })
    setFieldErrors({})
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingChica(null)
    setFieldErrors({})
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    const payload = {
      nombre: formData.nombre,
      alias: formData.alias,
      telefono: formData.telefono,
      notas: formData.notas,
      fechaIngreso: fechaAISO(formData.fechaIngreso),
      ...(editingChica && !editingChica.archivada ? { activa: formData.activa } : {}),
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(editingChica ? `/api/chicas/${editingChica.id}` : '/api/chicas', {
        method: editingChica ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(await apiError(response, 'Error al guardar la chica'))
      }

      await fetchChicas()
      notify.success(editingChica ? 'Cambios guardados' : `${formData.nombre.trim()} agregada`)
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la chica')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateChica = async (chica: Chica, body: Partial<Chica>, mensajeOk: string) => {
    try {
      setChangingId(chica.id)
      const response = await fetch(`/api/chicas/${chica.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(await apiError(response, 'No se pudo actualizar'))
      }

      await fetchChicas()
      notify.success(mensajeOk)
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'No se pudo actualizar')
    } finally {
      setChangingId(null)
    }
  }

  const handleToggleActiva = async (chica: Chica) => {
    const nuevaAccion = chica.activa ? 'marcar como ausente' : 'marcar como activa'
    const ok = await confirmar({
      title: chica.activa ? 'Marcar ausente' : 'Activar',
      message: `¿Seguro que deseas ${nuevaAccion} a ${chica.nombre}?`,
      confirmLabel: chica.activa ? 'Marcar ausente' : 'Activar',
      tone: chica.activa ? 'danger' : 'primary',
    })
    if (!ok) return
    await updateChica(chica, { activa: !chica.activa }, `${chica.nombre} ${chica.activa ? 'ausente' : 'activa'}`)
  }

  const handleRestaurar = async (chica: Chica) => {
    const ok = await confirmar({
      title: 'Restaurar chica',
      message: `${chica.nombre} volvera al catalogo como ausente. Podras activarla cuando llegue.`,
      confirmLabel: 'Restaurar',
      tone: 'primary',
    })
    if (!ok) return
    await updateChica(chica, { archivada: false }, `${chica.nombre} restaurada`)
  }

  const handleDelete = async (chica: Chica) => {
    const ok = await confirmar({
      title: 'Eliminar chica',
      message: `¿Seguro que deseas eliminar a ${chica.nombre}?\n\nSi tiene comandas en su historial se archivara en vez de borrarse, para conservar reportes y comisiones.`,
      confirmLabel: 'Eliminar',
    })
    if (!ok) return

    try {
      setChangingId(chica.id)
      const response = await fetch(`/api/chicas/${chica.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(await apiError(response, 'No se pudo eliminar la chica'))
      }

      const data = await response.json()
      await fetchChicas()
      if (data.archivada) notify.info(data.message)
      else notify.success(`${chica.nombre} eliminada`)
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'No se pudo eliminar la chica')
    } finally {
      setChangingId(null)
    }
  }

  const handleBulk = async (activa: boolean) => {
    const ids = seleccionadas.map((c) => c.id)
    const ok = await confirmar({
      title: activa ? 'Activar seleccionadas' : 'Marcar ausentes',
      message: `${activa ? 'Activar' : 'Marcar como ausentes'} ${ids.length} chica(s)?`,
      confirmLabel: activa ? 'Activar' : 'Marcar ausentes',
      tone: activa ? 'primary' : 'danger',
    })
    if (!ok) return

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/chicas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ ids, activa }),
      })
      if (!response.ok) throw new Error(await apiError(response, 'No se pudo actualizar'))
      const data = await response.json()
      setSeleccion(new Set())
      await fetchChicas()
      notify.success(`${data.actualizadas} chica(s) ${activa ? 'activadas' : 'marcadas ausentes'}`)
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'No se pudo actualizar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: DataTableColumn<Chica>[] = [
    ...(canEdit && filtro !== 'archivadas'
      ? [
          {
            key: 'sel',
            header: (
              <input
                type="checkbox"
                className="h-4 w-4 accent-purple-600"
                checked={todasSeleccionadas}
                onChange={toggleTodas}
                aria-label="Seleccionar todas"
              />
            ),
            className: 'w-10',
            cell: (chica: Chica) => (
              <input
                type="checkbox"
                className="h-4 w-4 accent-purple-600"
                checked={seleccion.has(chica.id)}
                onChange={() => toggleSeleccion(chica.id)}
                aria-label={`Seleccionar ${chica.nombre}`}
              />
            ),
          },
        ]
      : []),
    {
      key: 'nombre',
      header: 'Nombre',
      essential: true,
      cell: (chica) => (
        <div className="flex flex-col">
          <span className="font-medium">{chica.nombre}</span>
          {chica.alias ? <span className="text-xs text-gray-400">&ldquo;{chica.alias}&rdquo;</span> : null}
        </div>
      ),
    },
    { key: 'telefono', header: 'Telefono', cell: (chica) => chica.telefono ?? <span className="text-gray-600">—</span> },
    { key: 'ingreso', header: 'Ingreso', cell: (chica) => formatDate(chica.fechaIngreso) },
    {
      key: 'estado',
      header: 'Estado',
      essential: true,
      cell: (chica) =>
        chica.archivada ? (
          <StatusBadge tone="neutral">Archivada</StatusBadge>
        ) : (
          <StatusBadge tone={chica.activa ? 'success' : 'danger'}>{chica.activa ? 'Activa' : 'Ausente'}</StatusBadge>
        ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      cell: (chica) =>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/chicas/${chica.id}`}
            className="inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-semibold text-purple-300 hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            Ficha
          </Link>
          {canEdit &&
            (chica.archivada ? (
              <Button size="sm" variant="secondary" disabled={changingId === chica.id} onClick={() => handleRestaurar(chica)}>
                Restaurar
              </Button>
            ) : (
              <>
                <Button size="sm" variant="secondary" disabled={changingId === chica.id} onClick={() => openEdit(chica)}>
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant={chica.activa ? 'danger' : 'primary'}
                  disabled={changingId === chica.id}
                  onClick={() => handleToggleActiva(chica)}
                >
                  {chica.activa ? 'Ausente' : 'Activar'}
                </Button>
                {canDelete && (
                  <Button size="sm" variant="ghost" disabled={changingId === chica.id} onClick={() => handleDelete(chica)}>
                    Eliminar
                  </Button>
                )}
              </>
            ))}
        </div>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Chicas"
        description={`${conteo.activas} activas · ${conteo.ausentes} ausentes · ${conteo.archivadas} archivadas`}
        actions={canEdit && <Button onClick={openCreate}>+ Agregar Chica</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, alias o telefono"
            aria-label="Buscar chicas"
            className="sm:max-w-sm"
          />
          <div className="flex flex-wrap gap-1 rounded-lg border border-gray-700 bg-gray-900/60 p-1" role="group" aria-label="Filtrar por estado">
            {FILTROS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setFiltro(f.value)
                  setSeleccion(new Set())
                }}
                aria-pressed={filtro === f.value}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                  filtro === f.value ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {canEdit && seleccionadas.length > 0 && (
          <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Acciones masivas">
            <span className="text-sm text-gray-300">{seleccionadas.length} seleccionada(s)</span>
            <Button size="sm" variant="danger" disabled={isSubmitting} onClick={() => handleBulk(false)}>
              Marcar ausentes
            </Button>
            <Button size="sm" disabled={isSubmitting} onClick={() => handleBulk(true)}>
              Activar
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={visibles}
        loading={loading}
        pageSize={25}
        getRowKey={(chica) => chica.id}
        emptyTitle={busqueda || filtro !== 'todas' ? 'Sin resultados' : 'No hay chicas registradas'}
        emptyDescription={
          busqueda || filtro !== 'todas' ? 'Prueba con otra busqueda o filtro.' : 'Agrega la primera chica para empezar a operar.'
        }
      />

      <Modal isOpen={showModal} onClose={closeModal} title={editingChica ? 'Editar Chica' : 'Agregar Nueva Chica'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900 text-red-200 p-3 rounded text-sm" role="alert">
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
              maxLength={100}
              hasError={Boolean(fieldErrors.nombre)}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Alias (opcional)">
              <Input type="text" name="alias" value={formData.alias} onChange={handleChange} maxLength={100} />
            </FormField>
            <FormField label="Telefono (opcional)" error={fieldErrors.telefono}>
              <Input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56 9 ..."
                maxLength={30}
                hasError={Boolean(fieldErrors.telefono)}
              />
            </FormField>
          </div>

          <FormField label="Fecha de ingreso">
            <Input type="date" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} max={hoyISO()} required />
          </FormField>

          <FormField label="Notas internas (opcional)" hint="Solo visible para el equipo.">
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-white outline-none transition focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500"
            />
          </FormField>

          {editingChica && (
            <Checkbox
              name="activa"
              checked={formData.activa}
              onChange={handleChange}
              label="Activa (disponible para comandas)"
            />
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" onClick={closeModal} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : editingChica ? 'Guardar Cambios' : 'Agregar Chica'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
