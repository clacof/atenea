'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../../components/DashboardLayout'
import FormError from '../../../../components/FormError'
import { DomainValidator } from '../../../../lib/validations'
import { getAuthHeaders } from '../../../../lib/client-auth'

interface Categoria {
  id: number
  nombre: string
  precioCliente: number
  precioChica: number
}

interface Chica {
  id: number
  nombre: string
}

export default function NuevaComanda() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [chicas, setChicas] = useState<Chica[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [precioInfo, setPrecioInfo] = useState({ precioBase: 0, precioFinal: 0, comision: 0 })
  const [formData, setFormData] = useState({
    categoriaId: '',
    tipoConsumo: 'cliente',
    clienteNombre: '',
    chica1Id: '',
    chica2Id: '',
    descuentoPorcentaje: '',
    descuentoMonto: '',
    cortesia: false,
    medioPago: 'efectivo',
  })
  const router = useRouter()

  useEffect(() => {
    // Cargar categorias
    fetch('/api/categorias', {
      headers: getAuthHeaders(),
    })
      .then(r => r.json())
      .then(data => setCategorias(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error cargando categorias:', err))

    // Cargar chicas
    fetch('/api/chicas', {
      headers: getAuthHeaders(),
    })
      .then(r => r.json())
      .then(data => setChicas(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error cargando chicas:', err))
  }, [])

  // Calcular precios cuando cambien los valores
  useEffect(() => {
    const categoria = categorias.find(c => c.id === Number(formData.categoriaId))
    if (!categoria) {
      setPrecioInfo({ precioBase: 0, precioFinal: 0, comision: 0 })
      return
    }

    let precioBase = formData.tipoConsumo === 'cliente' ? categoria.precioCliente : categoria.precioChica
    let precioFinal = precioBase

    if (formData.cortesia) {
      precioFinal = 0
    } else {
      if (formData.descuentoMonto) {
        precioFinal -= Number(formData.descuentoMonto)
      }
      if (formData.descuentoPorcentaje) {
        precioFinal -= precioFinal * (Number(formData.descuentoPorcentaje) / 100)
      }
    }

    let comision = 0
    if (formData.tipoConsumo === 'chica') {
      if (precioBase >= 150000) {
        comision = precioFinal * 0.3
      } else {
        comision = precioFinal * 0.4
      }
    }

    setPrecioInfo({ precioBase, precioFinal, comision })
  }, [formData, categorias])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Validar usando DomainValidator
    const validationData = {
      categoriaId: formData.categoriaId ? Number(formData.categoriaId) : null,
      tipoConsumo: formData.tipoConsumo,
      chica1Id: formData.chica1Id ? Number(formData.chica1Id) : null,
      chica2Id: formData.chica2Id ? Number(formData.chica2Id) : null,
      medioPago: formData.medioPago,
      precioBase: precioInfo.precioBase,
    }

    const validation = DomainValidator.validateComanda(validationData)
    if (!validation.isValid) {
      const errors: Record<string, string> = {}
      validation.errors.forEach((err) => {
        errors[err.field] = err.message
      })
      setFieldErrors(errors)
      setError('Por favor corrige los errores en el formulario')
      return
    }

    try {
      setLoading(true)
      const payload = {
        categoriaId: Number(formData.categoriaId),
        tipoConsumo: formData.tipoConsumo,
        clienteNombre: formData.clienteNombre.trim() || null,
        chica1Id: formData.chica1Id ? Number(formData.chica1Id) : null,
        chica2Id: formData.chica2Id ? Number(formData.chica2Id) : null,
        descuentoPorcentaje: formData.descuentoPorcentaje ? Number(formData.descuentoPorcentaje) : null,
        descuentoMonto: formData.descuentoMonto ? Number(formData.descuentoMonto) : null,
        cortesia: formData.cortesia,
        medioPago: formData.medioPago,
      }

      const response = await fetch('/api/comandas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Error al crear comanda')
        return
      }

      router.push('/dashboard/comandas')
    } catch (err) {
      setError('Error al crear comanda: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }


  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Nueva Comanda</h1>
        
        {error && (
          <div className="bg-red-900 text-red-100 p-4 rounded mb-6 border border-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900 text-red-200 p-4 rounded">
              {error}
            </div>
          )}

          {/* Cliente */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <label className="block text-sm font-medium mb-2">Nombre del Cliente</label>
            <input
              type="text"
              name="clienteNombre"
              value={formData.clienteNombre}
              onChange={handleChange}
              placeholder="Ej: Mesa 3, Juan, VIP..."
              maxLength={100}
              className="w-full p-2 bg-gray-700 text-white rounded placeholder-gray-500"
            />
            <p className="mt-1 text-xs text-gray-400">Opcional — sirve para agrupar comandas del mismo cliente</p>
          </div>

          {/* Categoria */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <label className="block text-sm font-medium mb-2">Categoria *</label>
            <select
              name="categoriaId"
              value={formData.categoriaId}
              onChange={(e) => {
                handleChange(e)
                if (fieldErrors.categoriaId) {
                  setFieldErrors({ ...fieldErrors, categoriaId: '' })
                }
              }}
              className={`w-full p-2 bg-gray-700 text-white rounded ${
                fieldErrors.categoriaId ? 'border-2 border-red-500' : ''
              }`}
            >
              <option value="">Seleccionar categoria</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            <FormError message={fieldErrors.categoriaId} />
          </div>

          {/* Tipo de Consumo */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <label className="block text-sm font-medium mb-2">Tipo de Consumo</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoConsumo"
                  value="cliente"
                  checked={formData.tipoConsumo === 'cliente'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Cliente
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoConsumo"
                  value="chica"
                  checked={formData.tipoConsumo === 'chica'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Chica
              </label>
            </div>
          </div>

          {/* Chicas */}
          {formData.tipoConsumo === 'chica' && (
            <div className="bg-gray-800 p-6 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Chica 1 *</label>
                <select
                  name="chica1Id"
                  value={formData.chica1Id}
                  onChange={(e) => {
                    handleChange(e)
                    if (fieldErrors.chica1Id) {
                      setFieldErrors({ ...fieldErrors, chica1Id: '' })
                    }
                  }}
                  className={`w-full p-2 bg-gray-700 text-white rounded ${
                    fieldErrors.chica1Id ? 'border-2 border-red-500' : ''
                  }`}
                >
                  <option value="">Seleccionar chica</option>
                  {chicas.map(chica => (
                    <option key={chica.id} value={chica.id}>{chica.nombre}</option>
                  ))}
                </select>
                <FormError message={fieldErrors.chica1Id} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Chica 2 (opcional)</label>
                <select
                  name="chica2Id"
                  value={formData.chica2Id}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="">Ninguna</option>
                  {chicas.map(chica => (
                    <option key={chica.id} value={chica.id}>{chica.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Descuentos */}
          <div className="bg-gray-800 p-6 rounded-lg grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Descuento %</label>
              <input
                type="number"
                name="descuentoPorcentaje"
                value={formData.descuentoPorcentaje}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 text-white rounded"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descuento Monto ($)</label>
              <input
                type="number"
                name="descuentoMonto"
                value={formData.descuentoMonto}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 text-white rounded"
                min="0"
              />
            </div>
          </div>

          {/* Cortesía y Pago */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="cortesia"
                checked={formData.cortesia}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm font-medium">Cortesia (sin costo)</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">Medio de Pago</label>
              <select
                name="medioPago"
                value={formData.medioPago}
                onChange={(e) => {
                  handleChange(e)
                  if (fieldErrors.medioPago) {
                    setFieldErrors({ ...fieldErrors, medioPago: '' })
                  }
                }}
                className={`w-full p-2 bg-gray-700 text-white rounded ${
                  fieldErrors.medioPago ? 'border-2 border-red-500' : ''
                }`}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="debito">Debito</option>
                <option value="credito">Credito</option>
              </select>
              <FormError message={fieldErrors.medioPago} />
            </div>
          </div>

          {/* Preview de totales */}
          <div className="bg-purple-900 p-6 rounded-lg border border-purple-700">
            <h3 className="font-bold mb-4 text-lg">Resumen</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-300">Precio Base</p>
                <p className="text-xl font-bold text-blue-400">${precioInfo.precioBase.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-300">Precio Final</p>
                <p className="text-xl font-bold text-green-400">${precioInfo.precioFinal.toLocaleString()}</p>
              </div>
              {formData.tipoConsumo === 'chica' && (
                <div>
                  <p className="text-gray-300">Comisión</p>
                  <p className="text-xl font-bold text-yellow-400">${Math.round(precioInfo.comision).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !formData.categoriaId}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded disabled:opacity-50 font-semibold"
            >
              {loading ? 'Creando...' : 'Crear Comanda'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white p-3 rounded"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}