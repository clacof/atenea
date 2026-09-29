'use client'

import { useEffect, useState } from 'react'
import Button from '../../../components/atoms/Button'
import Input from '../../../components/atoms/Input'
import Select from '../../../components/atoms/Select'
import LoadingState from '../../../components/atoms/LoadingState'
import StatusBadge from '../../../components/atoms/StatusBadge'
import DataTable, { type DataTableColumn } from '../../../components/molecules/DataTable'
import FormField from '../../../components/molecules/FormField'
import PageHeader from '../../../components/molecules/PageHeader'
import Modal from '../../../components/Modal'
import { getAuthHeaders } from '../../../lib/client-auth'
import { confirmar } from '../../../lib/feedback'
import { can } from '../../../lib/permissions'
import { useCurrentUser } from '../../../lib/use-current-user'

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: 'admin' | 'caja' | 'supervisor'
  activo: boolean
  ultimoLogin: string | null
}

interface CreateFormData {
  nombre: string
  email: string
  password: string
  rol: string
}

interface EditFormData {
  nombre: string
  email: string
  rol: string
  password: string
}

const ROL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  caja: 'Cajera',
  supervisor: 'Supervisor',
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user: currentUser } = useCurrentUser()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({})
  const [createError, setCreateError] = useState('')
  const [createForm, setCreateForm] = useState<CreateFormData>({
    nombre: '',
    email: '',
    password: '',
    rol: 'caja',
  })

  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [editForm, setEditForm] = useState<EditFormData>({
    nombre: '',
    email: '',
    rol: 'caja',
    password: '',
  })
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({})
  const [editError, setEditError] = useState('')
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/usuarios', { headers: getAuthHeaders() })
      if (!response.ok) throw new Error('Error al cargar usuarios')
      const data = await response.json()
      setUsuarios(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  // ── Create ──────────────────────────────────────────────────────────────────

  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!createForm.nombre.trim()) errors.nombre = 'El nombre es requerido'
    if (!createForm.email.trim()) errors.email = 'El email es requerido'
    if (!createForm.password || createForm.password.length < 6)
      errors.password = 'La contrasena debe tener al menos 6 caracteres'
    if (!createForm.rol) errors.rol = 'El rol es requerido'
    setCreateFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    if (!validateCreateForm()) return

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(createForm),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Error al crear usuario')
      }

      await fetchUsuarios()
      setShowCreateModal(false)
      setCreateForm({ nombre: '', email: '', password: '', rol: 'caja' })
      setCreateFieldErrors({})
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCreateForm(prev => ({ ...prev, [name]: value }))
    if (createFieldErrors[name]) setCreateFieldErrors({ ...createFieldErrors, [name]: '' })
  }

  // ── Edit ────────────────────────────────────────────────────────────────────

  const openEdit = (u: Usuario) => {
    setEditingUsuario(u)
    setEditForm({ nombre: u.nombre, email: u.email, rol: u.rol, password: '' })
    setEditFieldErrors({})
    setEditError('')
  }

  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!editForm.nombre.trim()) errors.nombre = 'El nombre es requerido'
    if (!editForm.email.trim()) errors.email = 'El email es requerido'
    if (!editForm.rol) errors.rol = 'El rol es requerido'
    if (editForm.password && editForm.password.length < 6)
      errors.password = 'La contrasena debe tener al menos 6 caracteres'
    setEditFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError('')
    if (!validateEditForm() || !editingUsuario) return

    try {
      setIsEditSubmitting(true)
      const body: Record<string, string> = {
        nombre: editForm.nombre,
        email: editForm.email,
        rol: editForm.rol,
      }
      if (editForm.password) body.password = editForm.password

      const response = await fetch(`/api/usuarios/${editingUsuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Error al actualizar usuario')
      }

      await fetchUsuarios()
      setEditingUsuario(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al actualizar usuario')
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
    if (editFieldErrors[name]) setEditFieldErrors({ ...editFieldErrors, [name]: '' })
  }

  // ── Toggle activo ────────────────────────────────────────────────────────────

  const handleToggleActivo = async (u: Usuario) => {
    const action = u.activo ? 'desactivar' : 'activar'
    const ok = await confirmar({
      title: `${action === 'activar' ? 'Activar' : 'Desactivar'} usuario`,
      message: `Deseas ${action} a ${u.nombre}?`,
      confirmLabel: action === 'activar' ? 'Activar' : 'Desactivar',
      tone: action === 'activar' ? 'primary' : 'danger',
    })
    if (!ok) return

    try {
      setTogglingId(u.id)
      const response = await fetch(`/api/usuarios/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ activo: !u.activo }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || `Error al ${action} usuario`)
      }

      await fetchUsuarios()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${action} usuario`)
    } finally {
      setTogglingId(null)
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  const handleDelete = async (u: Usuario) => {
    const ok = await confirmar({
      title: 'Eliminar usuario',
      message: `Eliminar a ${u.nombre}? El usuario quedara inactivo.`,
      confirmLabel: 'Eliminar',
    })
    if (!ok) return

    try {
      setDeletingId(u.id)
      const response = await fetch(`/api/usuarios/${u.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Error al eliminar usuario')
      }

      await fetchUsuarios()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Table columns ────────────────────────────────────────────────────────────

  const columns: DataTableColumn<Usuario>[] = [
    { key: 'id', header: 'ID', cell: (u) => u.id },
    { key: 'nombre', header: 'Nombre', cell: (u) => u.nombre },
    { key: 'email', header: 'Email', cell: (u) => u.email },
    {
      key: 'rol',
      header: 'Rol',
      cell: (u) => (
        <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
          u.rol === 'admin'
            ? 'bg-purple-700 text-purple-100'
            : u.rol === 'supervisor'
            ? 'bg-blue-700 text-blue-100'
            : 'bg-gray-600 text-gray-100'
        }`}>
          {ROL_LABELS[u.rol] ?? u.rol}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (u) => (
        <StatusBadge tone={u.activo ? 'success' : 'danger'}>
          {u.activo ? 'Activo' : 'Inactivo'}
        </StatusBadge>
      ),
    },
    {
      key: 'ultimoLogin',
      header: 'Ultimo acceso',
      cell: (u) =>
        u.ultimoLogin
          ? new Date(u.ultimoLogin).toLocaleString('es-CL', {
              dateStyle: 'short',
              timeStyle: 'short',
            })
          : '—',
    },
    {
      key: 'acciones',
      header: 'Acciones',
      cell: (u) =>
        can(currentUser?.rol, 'usuarios.gestionar') ? (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => openEdit(u)}>
              Editar
            </Button>
            <Button
              size="sm"
              variant={u.activo ? 'ghost' : 'secondary'}
              disabled={togglingId === u.id}
              onClick={() => handleToggleActivo(u)}
            >
              {u.activo ? 'Desactivar' : 'Activar'}
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={deletingId === u.id}
              onClick={() => handleDelete(u)}
            >
              Eliminar
            </Button>
          </div>
        ) : (
          <span className="text-xs text-gray-500">Solo admin</span>
        ),
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div>
        <PageHeader
          title="Usuarios"
          description="Administra las cuentas de acceso al sistema."
          actions={
            can(currentUser?.rol, 'usuarios.gestionar') ? (
              <Button onClick={() => setShowCreateModal(true)}>+ Agregar Usuario</Button>
            ) : undefined
          }
        />

        {error && (
          <div className="mb-4 rounded bg-red-900 p-3 text-sm text-red-200">
            {error}
            <button className="ml-3 underline" onClick={() => setError('')}>Cerrar</button>
          </div>
        )}

        <DataTable
          columns={columns}
          data={usuarios}
          getRowKey={(u) => u.id}
          emptyTitle="No hay usuarios registrados"
          emptyDescription="Agrega el primer usuario para comenzar."
        />

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          title="Agregar Usuario"
          onClose={() => {
            setShowCreateModal(false)
            setCreateFieldErrors({})
            setCreateError('')
            setCreateForm({ nombre: '', email: '', password: '', rol: 'caja' })
          }}
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {createError && (
              <div className="rounded bg-red-900 p-3 text-sm text-red-200">{createError}</div>
            )}
            <FormField label="Nombre" error={createFieldErrors.nombre}>
              <Input
                name="nombre"
                value={createForm.nombre}
                onChange={handleCreateChange}
                placeholder="Nombre completo"
                hasError={Boolean(createFieldErrors.nombre)}
              />
            </FormField>
            <FormField label="Email" error={createFieldErrors.email}>
              <Input
                type="email"
                name="email"
                value={createForm.email}
                onChange={handleCreateChange}
                placeholder="usuario@ejemplo.com"
                hasError={Boolean(createFieldErrors.email)}
              />
            </FormField>
            <FormField label="Contrasena" error={createFieldErrors.password}>
              <Input
                type="password"
                name="password"
                value={createForm.password}
                onChange={handleCreateChange}
                placeholder="Minimo 6 caracteres"
                hasError={Boolean(createFieldErrors.password)}
              />
            </FormField>
            <FormField label="Rol" error={createFieldErrors.rol}>
              <Select
                name="rol"
                value={createForm.rol}
                onChange={(value) => setCreateForm(prev => ({ ...prev, rol: value }))}
                hasError={Boolean(createFieldErrors.rol)}
                options={[
                  { value: 'caja', label: 'Cajera' },
                  { value: 'supervisor', label: 'Supervisor' },
                  { value: 'admin', label: 'Administrador' },
                ]}
              />
            </FormField>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateFieldErrors({})
                  setCreateError('')
                  setCreateForm({ nombre: '', email: '', password: '', rol: 'caja' })
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Agregar Usuario'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={editingUsuario !== null}
          title={`Editar: ${editingUsuario?.nombre ?? ''}`}
          onClose={() => {
            setEditingUsuario(null)
            setEditFieldErrors({})
            setEditError('')
          }}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && (
              <div className="rounded bg-red-900 p-3 text-sm text-red-200">{editError}</div>
            )}
            <FormField label="Nombre" error={editFieldErrors.nombre}>
              <Input
                name="nombre"
                value={editForm.nombre}
                onChange={handleEditChange}
                hasError={Boolean(editFieldErrors.nombre)}
              />
            </FormField>
            <FormField label="Email" error={editFieldErrors.email}>
              <Input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                hasError={Boolean(editFieldErrors.email)}
              />
            </FormField>
            <FormField label="Rol" error={editFieldErrors.rol}>
              <Select
                name="rol"
                value={editForm.rol}
                onChange={(value) => setEditForm(prev => ({ ...prev, rol: value }))}
                hasError={Boolean(editFieldErrors.rol)}
                options={[
                  { value: 'caja', label: 'Cajera' },
                  { value: 'supervisor', label: 'Supervisor' },
                  { value: 'admin', label: 'Administrador' },
                ]}
              />
            </FormField>
            <FormField
              label="Nueva contrasena"
              error={editFieldErrors.password}
            >
              <Input
                type="password"
                name="password"
                value={editForm.password}
                onChange={handleEditChange}
                placeholder="Dejar vacio para no cambiar"
                hasError={Boolean(editFieldErrors.password)}
              />
            </FormField>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingUsuario(null)
                  setEditFieldErrors({})
                  setEditError('')
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isEditSubmitting}>
                {isEditSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Modal>
    </div>
  )
}
