'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { getAuthHeaders } from '../../../lib/client-auth'
import { formatCurrency } from '../../../lib/formatters'
import { cn } from '@/lib/utils'
import { normalizeCommissionSlots } from '@/lib/commission-utils'

interface ComandaHistorial {
  id: number
  hora: string
  categoria: string
  categoriaTipo: 'trago' | 'botella'
  precioFinal: number
  chica1: string | null
  chica2: string | null
  chica1Liberada?: boolean
  chica2Liberada?: boolean
  tipoConsumo: string
  cortesia: boolean
  comisionTotal: number
  comisionChica1: number
  comisionChica2: number
}

interface ClienteActivo {
  clienteNombre: string
  count: number
  subtotal: number
  comandas: ComandaHistorial[]
}

interface ChicaDisponibilidad {
  id: number
  nombre: string
  disponible: boolean
  clienteAtendiendo: string | null
}

interface TurnoData {
  fecha: string
  clientesActivos: ClienteActivo[]
  chicas: ChicaDisponibilidad[]
  siguienteNumeroCliente: number
}

export default function TurnoActivo() {
  const [turno, setTurno] = useState<TurnoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cerrando, setCerrando] = useState<string | null>(null)
  const [liberando, setLiberando] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [expandedCliente, setExpandedCliente] = useState<string | null>(null)
  const [expandedComandas, setExpandedComandas] = useState<Set<number>>(new Set())
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadTurno = useCallback(async () => {
    try {
      const data = await fetch('/api/comandas/turno-activo', {
        headers: getAuthHeaders(),
      }).then((r) => r.json())
      setTurno(data)
      setExpandedComandas(new Set())
      setLastRefreshed(new Date())
    } catch (err) {
      console.error('Error cargando turno:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTurno()
    intervalRef.current = setInterval(loadTurno, 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [loadTurno])

  const handleCerrarCuenta = async (clienteNombre: string) => {
    if (
      !confirm(
        `Cerrar cuenta de ${clienteNombre}?\nSe marcaran todas sus comandas activas como pagadas.`,
      )
    )
      return

    try {
      setCerrando(clienteNombre)
      setError('')
      const res = await fetch('/api/comandas/turno-activo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ clienteNombre }),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Error al cerrar cuenta')
      }

      if (expandedCliente === clienteNombre) setExpandedCliente(null)
      await loadTurno()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar cuenta')
    } finally {
      setCerrando(null)
    }
  }

  const disponiblesCount = turno?.chicas.filter((c) => c.disponible).length ?? 0

  const toggleComandaDetalle = (comandaId: number) => {
    setExpandedComandas((prev) => {
      const next = new Set(prev)
      if (next.has(comandaId)) {
        next.delete(comandaId)
      } else {
        next.add(comandaId)
      }
      return next
    })
  }

  const getComisionSplit = (cmd: ComandaHistorial) =>
    normalizeCommissionSlots({
      comisionTotal: cmd.comisionTotal,
      comisionChica1: cmd.comisionChica1,
      comisionChica2: cmd.comisionChica2,
      hasChica1: Boolean(cmd.chica1),
      hasChica2: Boolean(cmd.chica2),
      enforceEvenSplit: cmd.tipoConsumo === 'cliente' && Boolean(cmd.chica1 && cmd.chica2),
    })

  const handleLiberarChica = async (chicaId: number, chicaNombre: string) => {
    if (
      !confirm(
        `Liberar a ${chicaNombre}? Seguirá visible en sus comandas, pero quedara disponible para nuevos clientes.`,
      )
    )
      return

    try {
      setLiberando(chicaId)
      setError('')
      const res = await fetch('/api/comandas/turno-activo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ chicaId }),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Error al liberar chica')
      }

      await loadTurno()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al liberar chica')
    } finally {
      setLiberando(null)
    }
  }

  const ocupadasCount = turno?.chicas.filter((c) => !c.disponible).length ?? 0
  const totalActivo = turno?.clientesActivos.reduce((s, c) => s + c.subtotal, 0) ?? 0

  return (
    <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold">Turno Activo</h1>
            {turno && (
              <p className="text-sm text-gray-400 mt-1">
                {turno.fecha} · Proximo cliente:{' '}
                <span className="text-purple-400 font-mono font-semibold">
                  C{turno.siguienteNumeroCliente}
                </span>
                {lastRefreshed && (
                  <span className="ml-3 text-gray-500">
                    · {lastRefreshed.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadTurno}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
            >
              🔄 Actualizar
            </button>
            <Link
              href="/dashboard/comandas/nueva"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
            >
              + Nueva Comanda
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        {turno && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-800 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{turno.clientesActivos.length}</p>
              <p className="text-xs text-gray-400 mt-1">Clientes activos</p>
            </div>
            <div className="bg-gray-800 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-bold text-green-400">{disponiblesCount}</p>
              <p className="text-xs text-gray-400 mt-1">Chicas disponibles</p>
            </div>
            <div className="bg-gray-800 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(totalActivo)}</p>
              <p className="text-xs text-gray-400 mt-1">Total abierto</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-gray-400 py-16 text-center">Cargando turno...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chica availability panel */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-b from-slate-800 to-slate-900/90 rounded-xl p-6 lg:mr-2 sticky top-6 border border-slate-700/70 shadow-lg shadow-black/25">
                <div className="mb-6">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold text-gray-100 text-sm uppercase tracking-wide">
                      👩 Disponibilidad
                    </h2>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-400/25">
                      {disponiblesCount} libre{disponiblesCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {ocupadasCount > 0 && (
                    <p className="text-xs text-rose-300 mt-1">{ocupadasCount} ocupada{ocupadasCount !== 1 ? 's' : ''}</p>
                  )}
                  <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all"
                      style={{
                        width: `${
                          turno?.chicas.length ? (disponiblesCount / turno.chicas.length) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {turno?.chicas.length === 0 && (
                    <p className="text-gray-500 text-sm">No hay chicas registradas.</p>
                  )}
                  {turno?.chicas.map((ch) => (
                    <div
                      key={ch.id}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm border transition-colors ${
                        ch.disponible
                          ? 'bg-emerald-500/10 border-emerald-400/20'
                          : 'bg-rose-500/10 border-rose-400/20'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <p className="font-medium text-gray-100 truncate">{ch.nombre}</p>
                        {!ch.disponible && ch.clienteAtendiendo && (
                          <p className="text-[11px] text-rose-200/90 truncate">Atiende: {ch.clienteAtendiendo}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!ch.disponible && (
                          <button
                            onClick={() => handleLiberarChica(ch.id, ch.nombre)}
                            disabled={liberando === ch.id}
                            className="text-[10px] px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 disabled:opacity-50"
                          >
                            {liberando === ch.id ? '...' : 'Liberar'}
                          </button>
                        )}
                        <span
                          className={`text-[11px] px-2 py-1 rounded-full font-semibold ${
                            ch.disponible
                              ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-300/25'
                              : 'bg-rose-400/15 text-rose-300 border border-rose-300/25'
                          }`}
                        >
                          {ch.disponible ? 'Disponible' : 'Ocupada'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active clients panel */}
            <div className="lg:col-span-2">
              <h2 className="font-semibold text-gray-200 mb-4 text-sm uppercase tracking-wide">
                🧾 Clientes activos ({turno?.clientesActivos.length ?? 0})
              </h2>

              {turno?.clientesActivos.length === 0 && (
                <div className="bg-gray-800 rounded-xl border border-white/5 min-h-[340px] px-6 py-10 flex flex-col items-center justify-center text-center text-gray-500">
                  <p className="text-lg">Sin clientes activos en este turno.</p>
                  <Link
                    href="/dashboard/comandas/nueva"
                    className="inline-block mt-4 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
                  >
                    + Registrar primer cliente
                  </Link>
                </div>
              )}

              <div className="space-y-3">
                {turno?.clientesActivos.map((cliente) => (
                  <div
                    key={cliente.clienteNombre}
                    className="bg-gray-800 rounded-xl overflow-hidden border border-white/5"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between px-5 py-4">
                      <button
                        onClick={() => {
                          const next =
                            expandedCliente === cliente.clienteNombre
                              ? null
                              : cliente.clienteNombre
                          setExpandedCliente(next)
                          setExpandedComandas(new Set())
                        }}
                        className="flex items-center gap-3 text-left flex-1 min-w-0"
                      >
                        <span className="font-mono font-bold text-purple-400 text-xl">
                          {cliente.clienteNombre}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {cliente.count} item{cliente.count !== 1 ? 's' : ''}
                        </span>
                        <span className="text-white font-semibold">
                          {formatCurrency(cliente.subtotal)}
                        </span>
                        <span className="text-gray-500 text-xs ml-auto">
                          {expandedCliente === cliente.clienteNombre ? '▲' : '▼'}
                        </span>
                      </button>
                      <div className="flex gap-2 ml-4 shrink-0">
                        <Link
                          href={`/dashboard/comandas/nueva?cliente=${encodeURIComponent(cliente.clienteNombre)}`}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium"
                        >
                          + Agregar
                        </Link>
                        <button
                          disabled={cerrando === cliente.clienteNombre}
                          onClick={() => handleCerrarCuenta(cliente.clienteNombre)}
                          className="px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium"
                        >
                          {cerrando === cliente.clienteNombre ? '...' : 'Cerrar Cta'}
                        </button>
                      </div>
                    </div>

                    {/* Expandable detail */}
                    {expandedCliente === cliente.clienteNombre && (() => {
                      const comisionPorChica = new Map<string, number>()
                      for (const cmd of cliente.comandas) {
                        const split = getComisionSplit(cmd)
                        if (cmd.chica1) {
                          comisionPorChica.set(
                            cmd.chica1,
                            (comisionPorChica.get(cmd.chica1) ?? 0) + split.comisionChica1,
                          )
                        }
                        if (cmd.chica2) {
                          comisionPorChica.set(
                            cmd.chica2,
                            (comisionPorChica.get(cmd.chica2) ?? 0) + split.comisionChica2,
                          )
                        }
                      }
                      const resumen = Array.from(comisionPorChica.entries())

                      return (
                        <div className="border-t border-gray-700 px-5 py-3 space-y-3">
                          {resumen.length > 0 && (
                            <div className="rounded-lg border border-indigo-900/40 bg-indigo-950/20 p-3 text-xs sm:text-sm text-indigo-100">
                              <p className="mb-2 font-semibold text-indigo-200">Comisiones por chica</p>
                              <div className="flex flex-wrap gap-2">
                                {resumen.map(([nombre, total]) => (
                                  <span
                                    key={nombre}
                                    className="rounded-full bg-indigo-500/10 px-3 py-1 text-indigo-100 border border-indigo-500/20"
                                  >
                                    {nombre}: <span className="font-semibold">{formatCurrency(total)}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            {cliente.comandas.map((cmd) => {
                              const isExpanded = expandedComandas.has(cmd.id)
                              const split = getComisionSplit(cmd)
                              return (
                                <div
                                  key={cmd.id}
                                  className="rounded-xl border border-gray-700/50 bg-slate-900/40"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleComandaDetalle(cmd.id)}
                                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-gray-200"
                                  >
                                    <div>
                                      <span className="mr-2 text-xs font-mono text-gray-500">{cmd.hora}</span>
                                      <span className="font-semibold text-white">{cmd.categoria}</span>
                                        {cmd.chica1 && (
                                      <span className="text-purple-300 inline-flex items-center gap-2">
                                        · {cmd.chica1}
                                        {cmd.chica1Liberada && (
                                          <span className="rounded-full bg-gray-700/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-200">
                                            Liberada
                                          </span>
                                        )}
                                      </span>
                                    )}
                                    {cmd.chica2 && (
                                      <span className="text-purple-300 inline-flex items-center gap-2">
                                        + {cmd.chica2}
                                        {cmd.chica2Liberada && (
                                          <span className="rounded-full bg-gray-700/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-200">
                                            Liberada
                                          </span>
                                        )}
                                      </span>
                                    )}
                                      {cmd.cortesia && (
                                        <span className="ml-2 text-xs uppercase tracking-wide text-amber-300">
                                          Cortesia
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold text-white">
                                        {formatCurrency(cmd.precioFinal)}
                                      </span>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        className={cn('h-4 w-4 text-gray-400 transition-transform', isExpanded ? 'rotate-180' : '')}
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                                      </svg>
                                    </div>
                                  </button>

                                  {isExpanded && (
                                    <div className="border-t border-gray-700 px-4 py-3 text-sm text-gray-300">
                                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                                        <span className="text-gray-400">Comision total</span>
                                        <span className="font-semibold text-purple-300">
                                          {formatCurrency(cmd.comisionTotal)}
                                        </span>
                                      </div>
                                      <div className="mt-3 space-y-1 text-xs sm:text-sm">
                                        {cmd.chica1 || cmd.chica2 ? (
                                          <>
                                            {cmd.chica1 && (
                                              <div className="flex items-center justify-between text-purple-200">
                                                <span className="flex items-center gap-2">
                                                  {cmd.chica1}
                                                  {cmd.chica1Liberada && (
                                                    <span className="rounded bg-gray-700/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-200">
                                                      Liberada
                                                    </span>
                                                  )}
                                                </span>
                                                <span className="font-semibold">
                                                  {formatCurrency(split.comisionChica1)}
                                                </span>
                                              </div>
                                            )}
                                            {cmd.chica2 && (
                                              <div className="flex items-center justify-between text-purple-200">
                                                <span className="flex items-center gap-2">
                                                  {cmd.chica2}
                                                  {cmd.chica2Liberada && (
                                                    <span className="rounded bg-gray-700/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-200">
                                                      Liberada
                                                    </span>
                                                  )}
                                                </span>
                                                <span className="font-semibold">
                                                  {formatCurrency(split.comisionChica2)}
                                                </span>
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <p className="text-gray-500">Sin chicas asignadas</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          <div className="flex justify-between font-semibold text-purple-400 pt-1">
                            <span>Total abierto</span>
                            <span>{formatCurrency(cliente.subtotal)}</span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
