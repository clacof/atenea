'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import Modal from '../../../components/Modal'
import FormError from '../../../components/FormError'

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
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo: 'trago',
    precioCliente: '',
    precioChica: '',
    comisionChica: '',
    precio: '',
  })

  useEffect(() => {
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/categorias', {
        headers: { 'Authorization': `Bearer ${token}` },
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
      const token = localStorage.getItem('token')
      
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
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Error al crear la categoria')
      }

      // Recargar categorias
      await fetchCategorias()
      
      // Limpiar formulario y cerrar modal
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


  const tragos = categorias.filter(c => c.tipo === 'trago')
  const botellas = categorias.filter(c => c.tipo === 'botella')

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Categorias</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold"
          >
            + Agregar Categoria
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Cargando...</div>
        ) : (
          <div className="space-y-8">
            {/* TRAGOS */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-purple-400">🍹 Tragos</h2>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="text-left p-3">ID</th>
                      <th className="text-left p-3">Nombre</th>
                      <th className="text-left p-3">Precio Cliente</th>
                      <th className="text-left p-3">Precio Chica</th>
                      <th className="text-left p-3">Comision Chica</th>
                      <th className="text-left p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tragos.map(cat => (
                      <tr key={cat.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-3">{cat.id}</td>
                        <td className="p-3">{cat.nombre}</td>
                        <td className="p-3">${cat.precioCliente?.toLocaleString()}</td>
                        <td className="p-3">${cat.precioChica?.toLocaleString()}</td>
                        <td className="p-3">${cat.comisionChica?.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={cat.activa ? 'text-green-400' : 'text-red-400'}>
                            {cat.activa ? '✓ Activa' : '✗ Inactiva'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tragos.length === 0 && (
                  <div className="p-6 text-center text-gray-400">
                    No hay tragos registrados
                  </div>
                )}
              </div>
            </div>

            {/* BOTELLAS */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-400">🍾 Botellas</h2>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="text-left p-3">ID</th>
                      <th className="text-left p-3">Nombre</th>
                      <th className="text-left p-3">Precio</th>
                      <th className="text-left p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {botellas.map(cat => (
                      <tr key={cat.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-3">{cat.id}</td>
                        <td className="p-3">{cat.nombre}</td>
                        <td className="p-3">${cat.precio?.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={cat.activa ? 'text-green-400' : 'text-red-400'}>
                            {cat.activa ? '✓ Activa' : '✗ Inactiva'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {botellas.length === 0 && (
                  <div className="p-6 text-center text-gray-400">
                    No hay botellas registradas
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal para agregar categoria */}
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

            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Categoria</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 text-white rounded"
              >
                <option value="trago">🍹 Trago</option>
                <option value="botella">🍾 Botella</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nombre de Categoria</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Cerveza, Whisky, Champagne"
                className={`w-full p-2 bg-gray-700 text-white rounded ${
                  fieldErrors.nombre ? 'border-2 border-red-500' : ''
                }`}
              />
              <FormError message={fieldErrors.nombre} />
            </div>

            {/* Campos para TRAGO */}
            {formData.tipo === 'trago' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Precio Cliente</label>
                  <input
                    type="number"
                    name="precioCliente"
                    value={formData.precioCliente}
                    onChange={handleChange}
                    placeholder="0"
                    className={`w-full p-2 bg-gray-700 text-white rounded ${
                      fieldErrors.precioCliente ? 'border-2 border-red-500' : ''
                    }`}
                  />
                  <FormError message={fieldErrors.precioCliente} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Precio Chica</label>
                  <input
                    type="number"
                    name="precioChica"
                    value={formData.precioChica}
                    onChange={handleChange}
                    placeholder="0"
                    className={`w-full p-2 bg-gray-700 text-white rounded ${
                      fieldErrors.precioChica ? 'border-2 border-red-500' : ''
                    }`}
                  />
                  <FormError message={fieldErrors.precioChica} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Comision Chica</label>
                  <input
                    type="number"
                    name="comisionChica"
                    value={formData.comisionChica}
                    onChange={handleChange}
                    placeholder="0"
                    className={`w-full p-2 bg-gray-700 text-white rounded ${
                      fieldErrors.comisionChica ? 'border-2 border-red-500' : ''
                    }`}
                  />
                  <FormError message={fieldErrors.comisionChica} />
                </div>
              </>
            )}

            {/* Campos para BOTELLA */}
            {formData.tipo === 'botella' && (
              <div>
                <label className="block text-sm font-medium mb-2">Precio Botella</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="0"
                  className={`w-full p-2 bg-gray-700 text-white rounded ${
                    fieldErrors.precio ? 'border-2 border-red-500' : ''
                  }`}
                />
                <FormError message={fieldErrors.precio} />
              </div>
            )}

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
                {isSubmitting ? 'Guardando...' : 'Agregar Categoria'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
