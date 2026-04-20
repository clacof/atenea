'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '../../../../components/DashboardLayout'
import FormError from '../../../../components/FormError'
import { DomainValidator } from '../../../../lib/validations'
import { getAuthHeaders } from '../../../../lib/client-auth'
import { formatCurrency } from '../../../../lib/formatters'

interface Categoria {
  id: number
  nombre: string
  tipo: 'trago' | 'botella'
  isAfterhour: boolean
  precioCliente?: number | null
  precioChica?: number | null
  precio?: number | null
  recargoCreditoCliente?: number | null
  recargoCreditoChica?: number | null
  soloTransferencia?: boolean
}

interface ChicaDisponibilidad {
  id: number
  nombre: string
  disponible: boolean
  clienteAtendiendo?: string | null
}

interface ClienteActivo {
  clienteNombre: string
  count: number
  subtotal: number
}

interface TurnoData {
  fecha: string
  clientesActivos: ClienteActivo[]
  chicas: ChicaDisponibilidad[]
  siguienteNumeroCliente: number
  config: {
    maxChicasBottella: number
    comisionAcompananteBotella: number
  }
}

function NuevaComandaContent() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [turnoData, setTurnoData] = useState<TurnoData | null>(null)
  const [modoCliente, setModoCliente] = useState<'nuevo' | 'existente'>('nuevo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [precioInfo, setPrecioInfo] = useState({
    precioBase: 0,
    precioFinal: 0,
    comision: 0,
    deltaBotella: 0,
    recargoCredito: 0,
  })
  const [formData, setFormData] = useState({
    categoriaId: '',
    tipoConsumo: 'cliente',
    clienteNombre: '',
    clienteExistente: '',
    chica1Id: '',
    chica2Id: '',
    chicasAdicionalesBotella: '0',
    descuentoPorcentaje: '',
    descuentoMonto: '',
    cortesia: false,
    medioPago: 'efectivo',
  })
  const router = useRouter()
  const searchParams = useSearchParams()

  const loadData = async () => {
    const [cats, turno] = await Promise.all([
      fetch('/api/categorias', { headers: getAuthHeaders() }).then((r) => r.json()),
      fetch('/api/comandas/turno-activo', { headers: getAuthHeaders() }).then((r) => r.json()),
    ])
    setCategorias(Array.isArray(cats) ? cats : [])
    setTurnoData(turno)
    return turno as TurnoData
  }

  useEffect(() => {
    loadData()
      .then((turno) => {
        const clienteParam = searchParams.get('cliente')
        if (clienteParam) {
          setModoCliente('existente')
          setFormData((prev) => ({
            ...prev,
            clienteExistente: clienteParam,
            clienteNombre: clienteParam,
          }))
          return
        }

        setFormData((prev) => ({
          ...prev,
          clienteNombre: `C${turno.siguienteNumeroCliente}`,
        }))
      })
      .catch((err) => {
        console.error('Error cargando datos de nueva comanda:', err)
        setError('No se pudo cargar la informacion del turno')
      })
  }, [searchParams])

  useEffect(() => {
    const categoria = categorias.find((c) => c.id === Number(formData.categoriaId))
    if (!categoria) {
      setPrecioInfo({ precioBase: 0, precioFinal: 0, comision: 0, deltaBotella: 0, recargoCredito: 0 })
      return
    }

    const baseCliente = categoria.precioCliente ?? categoria.precio ?? 0
    const baseChica = categoria.precioChica ?? 0
    const precioBase = formData.tipoConsumo === 'cliente' ? baseCliente : baseChica

    // Calcular recargo por credito
    let recargoCredito = 0
    if (formData.medioPago === 'credito' && !formData.cortesia) {
      if (formData.tipoConsumo === 'chica' && categoria.recargoCreditoChica) {
        recargoCredito = categoria.recargoCreditoChica
      } else if (categoria.recargoCreditoCliente) {
        recargoCredito = categoria.recargoCreditoCliente
      }
    }

    let precioFinal = precioBase + recargoCredito

    if (formData.cortesia) {
      precioFinal = 0
      recargoCredito = 0
    } else {
      if (formData.descuentoMonto) {
        precioFinal -= Number(formData.descuentoMonto)
      }
      if (formData.descuentoPorcentaje) {
        precioFinal -= precioFinal * (Number(formData.descuentoPorcentaje) / 100)
      }
    }

    let comision = 0
    let deltaBotella = 0
    const isAfterhour = categoria.isAfterhour

    if (!isAfterhour) {
      if (formData.tipoConsumo === 'chica') {
        const rate = precioBase >= 150000 ? 0.3 : 0.4
        comision = Math.round(precioFinal * rate)
      }

      if (categoria.tipo === 'botella' && formData.tipoConsumo === 'cliente' && !formData.cortesia) {
        const adicionales = Number(formData.chicasAdicionalesBotella || '0')
        const comisionPorChica = turnoData?.config.comisionAcompananteBotella ?? 5000
        deltaBotella = adicionales * comisionPorChica
        comision += deltaBotella
        precioFinal += deltaBotella
      }
    }

    setPrecioInfo({
      precioBase: Math.max(0, Math.round(precioBase)),
      precioFinal: Math.max(0, Math.round(precioFinal)),
      comision: Math.max(0, Math.round(comision)),
      deltaBotella,
      recargoCredito,
    })
  }, [formData, categorias])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleModoCliente = (modo: 'nuevo' | 'existente') => {
    setModoCliente(modo)
    setError('')

    if (modo === 'nuevo') {
      setFormData((prev) => ({
        ...prev,
        clienteExistente: '',
        clienteNombre: `C${turnoData?.siguienteNumeroCliente ?? 1}`,
        chica1Id: '',
        chica2Id: '',
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      clienteExistente: '',
      clienteNombre: '',
      chica1Id: '',
      chica2Id: '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const clienteSeleccionado =
      modoCliente === 'existente' ? formData.clienteExistente : formData.clienteNombre

    if (!clienteSeleccionado || !/^C\d+$/i.test(clienteSeleccionado.trim())) {
      setError('Selecciona o define un cliente con formato C1, C2, C3...')
      return
    }

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
        clienteNombre: clienteSeleccionado.trim().toUpperCase(),
        chica1Id: formData.chica1Id ? Number(formData.chica1Id) : null,
        chica2Id: formData.chica2Id ? Number(formData.chica2Id) : null,
        chicasAdicionalesBotella: Number(formData.chicasAdicionalesBotella || '0'),
        descuentoPorcentaje: formData.descuentoPorcentaje
          ? Number(formData.descuentoPorcentaje)
          : null,
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

      router.push('/dashboard/turno')
    } catch (err) {
      setError('Error al crear comanda: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  const clienteSeleccionadoNombre =
    modoCliente === 'existente' ? formData.clienteExistente : formData.clienteNombre
  const clienteActivo = turnoData?.clientesActivos.find(
    (c) => c.clienteNombre === formData.clienteExistente,
  )
  const subtotalAnterior = clienteActivo?.subtotal ?? 0
  const totalPagar = subtotalAnterior + precioInfo.precioFinal
  // Mostrar chicas disponibles + chicas ya asignadas al mismo cliente
  const disponibles = (turnoData?.chicas ?? []).filter(
    (c) => c.disponible || c.clienteAtendiendo === clienteSeleccionadoNombre,
  )
  const maxAcompanantesBotella = Math.min(
    disponibles.length,
    turnoData?.config.maxChicasBottella ?? disponibles.length,
  )

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Nueva Comanda</h1>

        {error && (
          <div className="bg-red-900 text-red-100 p-4 rounded mb-6 border border-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <p className="text-sm font-semibold">Es Nuevo Cliente o Cliente Existente?</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={modoCliente === 'nuevo'}
                  onChange={() => handleModoCliente('nuevo')}
                  className="accent-purple-500"
                />
                Nuevo Cliente
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={modoCliente === 'existente'}
                  onChange={() => handleModoCliente('existente')}
                  className="accent-purple-500"
                />
                Cliente Existente
              </label>
            </div>

            {modoCliente === 'nuevo' ? (
              <div>
                <label className="block text-sm mb-2">Cliente (correlativo del dia)</label>
                <input
                  type="text"
                  name="clienteNombre"
                  value={formData.clienteNombre}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
                <p className="mt-1 text-xs text-gray-400">Formato esperado: C1, C2, C3...</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm mb-2">Selecciona cliente registrado</label>
                <select
                  name="clienteExistente"
                  value={formData.clienteExistente}
                  onChange={(e) => {
                    const selectedCliente = e.target.value
                    handleChange(e)
                    // Auto-populate chicas assigned to this client
                    const chicasDelCliente = (turnoData?.chicas ?? []).filter(
                      (c) => c.clienteAtendiendo === selectedCliente,
                    )
                    setFormData((prev) => ({
                      ...prev,
                      clienteNombre: selectedCliente,
                      chica1Id: chicasDelCliente[0] ? String(chicasDelCliente[0].id) : prev.chica1Id,
                      chica2Id: chicasDelCliente[1] ? String(chicasDelCliente[1].id) : '',
                      tipoConsumo: chicasDelCliente.length > 0 ? 'chica' : prev.tipoConsumo,
                    }))
                  }}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="">Seleccionar cliente</option>
                  {(turnoData?.clientesActivos ?? []).map((cliente) => {
                    const chicasDelCliente = (turnoData?.chicas ?? []).filter(
                      (c) => c.clienteAtendiendo === cliente.clienteNombre,
                    )
                    const chicaNames = chicasDelCliente.map((c) => c.nombre).join(', ')
                    return (
                      <option key={cliente.clienteNombre} value={cliente.clienteNombre}>
                        {cliente.clienteNombre} - {formatCurrency(cliente.subtotal)}
                        {chicaNames ? ` (${chicaNames})` : ''}
                      </option>
                    )
                  })}
                </select>

                {formData.clienteExistente && (() => {
                  const chicasAsignadas = (turnoData?.chicas ?? []).filter(
                    (c) => c.clienteAtendiendo === formData.clienteExistente,
                  )
                  if (chicasAsignadas.length === 0) return null
                  return (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {chicasAsignadas.map((c) => (
                        <span key={c.id} className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/30 px-2.5 py-1 text-xs font-medium text-purple-300">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400" />
                          {c.nombre}
                        </span>
                      ))}
                      <span className="text-xs text-gray-500 self-center">asignadas actualmente</span>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

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
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            <FormError message={fieldErrors.categoriaId} />
          </div>

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

          {formData.tipoConsumo === 'chica' && (
            <div className="bg-gray-800 p-6 rounded-lg space-y-4">
              <p className="text-xs text-gray-400">
                Disponibles ahora: {disponibles.length} de {(turnoData?.chicas ?? []).length}
                {modoCliente === 'existente' && disponibles.some((c) => c.clienteAtendiendo === clienteSeleccionadoNombre) && (
                  <span className="ml-1 text-purple-400"> · Incluye chicas ya asignadas a {clienteSeleccionadoNombre}</span>
                )}
              </p>
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
                  {disponibles.map((chica) => (
                    <option key={chica.id} value={chica.id}>
                      {chica.nombre}{chica.clienteAtendiendo === clienteSeleccionadoNombre ? ' ★' : ''}
                    </option>
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
                  {disponibles
                    .filter((chica) => String(chica.id) !== formData.chica1Id)
                    .map((chica) => (
                      <option key={chica.id} value={chica.id}>
                        {chica.nombre}{chica.clienteAtendiendo === clienteSeleccionadoNombre ? ' ★' : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {(() => {
            const categoriaSeleccionada = categorias.find((c) => c.id === Number(formData.categoriaId))
            const mostrarDelta =
              categoriaSeleccionada?.tipo === 'botella' && formData.tipoConsumo === 'cliente'

            if (!mostrarDelta) return null

            return (
              <div className="bg-gray-800 p-6 rounded-lg">
                <label className="block text-sm font-medium mb-2">
                  Chicas adicionales acompanando (delta comision)
                </label>
                <input
                  type="number"
                  min="0"
                  max={String(maxAcompanantesBotella)}
                  name="chicasAdicionalesBotella"
                  value={formData.chicasAdicionalesBotella}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Maximo permitido: {maxAcompanantesBotella} · Comision por acompanante:{' '}
                  {formatCurrency(turnoData?.config.comisionAcompananteBotella ?? 5000)}
                </p>
              </div>
            )
          })()}

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
              {(() => {
                const categoriaSeleccionada = categorias.find((c) => c.id === Number(formData.categoriaId))
                const esSoloTransferencia = categoriaSeleccionada?.soloTransferencia

                if (esSoloTransferencia && formData.medioPago !== 'transferencia') {
                  setTimeout(() => {
                    setFormData((prev) => ({ ...prev, medioPago: 'transferencia' }))
                  }, 0)
                }

                return (
                  <>
                    <select
                      name="medioPago"
                      value={esSoloTransferencia ? 'transferencia' : formData.medioPago}
                      onChange={(e) => {
                        handleChange(e)
                        if (fieldErrors.medioPago) {
                          setFieldErrors({ ...fieldErrors, medioPago: '' })
                        }
                      }}
                      disabled={esSoloTransferencia}
                      className={`w-full p-2 bg-gray-700 text-white rounded ${
                        fieldErrors.medioPago ? 'border-2 border-red-500' : ''
                      } ${esSoloTransferencia ? 'opacity-60' : ''}`}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="debito">Debito</option>
                      <option value="credito">Credito</option>
                    </select>
                    {esSoloTransferencia && (
                      <p className="mt-1 text-xs text-yellow-400">
                        ⚠ {categoriaSeleccionada.nombre} solo permite pago por transferencia
                      </p>
                    )}
                    {formData.medioPago === 'credito' && precioInfo.recargoCredito > 0 && (
                      <p className="mt-1 text-xs text-orange-400">
                        💳 Recargo por credito: +{formatCurrency(precioInfo.recargoCredito)}
                      </p>
                    )}
                  </>
                )
              })()}
              <FormError message={fieldErrors.medioPago} />
            </div>
          </div>

          <div className="bg-purple-900 p-6 rounded-lg border border-purple-700">
            <h3 className="font-bold mb-4 text-lg">Resumen</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-200">
                <span>Subtotal anterior</span>
                <span>{formatCurrency(subtotalAnterior)}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Nuevos servicios</span>
                <span>{formatCurrency(precioInfo.precioFinal)}</span>
              </div>
              <div className="flex justify-between text-white font-semibold border-t border-purple-700 pt-2">
                <span>Total a pagar</span>
                <span>{formatCurrency(totalPagar)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-300">Precio Base</p>
                <p className="text-xl font-bold text-blue-400">{formatCurrency(precioInfo.precioBase)}</p>
              </div>
              <div>
                <p className="text-gray-300">Precio Final</p>
                <p className="text-xl font-bold text-green-400">{formatCurrency(precioInfo.precioFinal)}</p>
              </div>
              <div>
                <p className="text-gray-300">Comision</p>
                <p className="text-xl font-bold text-yellow-400">{formatCurrency(precioInfo.comision)}</p>
              </div>
            </div>

            {precioInfo.deltaBotella > 0 && (
              <p className="text-xs mt-3 text-gray-300">
                Delta botella aplicado por acompanantes: {formatCurrency(precioInfo.deltaBotella)}
              </p>
            )}

            {precioInfo.recargoCredito > 0 && (
              <p className="text-xs mt-2 text-orange-300">
                💳 Recargo credito incluido: +{formatCurrency(precioInfo.recargoCredito)}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !formData.categoriaId}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded disabled:opacity-50 font-semibold"
            >
              {loading ? 'Creando...' : 'Anadir a Comanda'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/turno')}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white p-3 rounded"
            >
              Volver al Turno
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default function NuevaComanda() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="py-16 text-center text-gray-400">Cargando...</div>
        </DashboardLayout>
      }
    >
      <NuevaComandaContent />
    </Suspense>
  )
}