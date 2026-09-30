import { create } from 'zustand'
import type { TipoCategoria } from '@/lib/tipoCategoria'

export interface Categoria {
  id: number
  nombre: string
  tipo: TipoCategoria
  seccion?: string | null
  isAfterhour: boolean
  precioCliente?: number | null
  precioChica?: number | null
  precio?: number | null
  comisionChica?: number | null
  comision?: number | null
  recargoCreditoCliente?: number | null
  recargoCreditoChica?: number | null
  soloTransferencia?: boolean
}

export interface ChicaDisponibilidad {
  id: number
  nombre: string
  disponible: boolean
  clienteAtendiendo?: string | null
}

export interface ClienteActivo {
  clienteNombre: string
  count: number
  subtotal: number
}

export interface TurnoData {
  fecha: string
  clientesActivos: ClienteActivo[]
  chicas: ChicaDisponibilidad[]
  siguienteNumeroCliente: number
  config: {
    maxChicasBottella: number
    comisionAcompananteBotella: number
  }
}

export interface ComandaFormData {
  categoriaId: string
  tipoConsumo: 'cliente' | 'chica'
  clienteNombre: string
  clienteExistente: string
  chica1Id: string
  chica2Id: string
  descuentoPorcentaje: string
  descuentoMonto: string
  cortesia: boolean
  medioPago: 'efectivo' | 'transferencia' | 'debito' | 'credito'
}

export interface PrecioInfo {
  precioBase: number
  precioFinal: number
  comision: number
  deltaBotella: number
  recargoCredito: number
}

interface ComandasState {
  categorias: Categoria[]
  turnoData: TurnoData | null
  isLoadingCategorias: boolean
  isLoadingTurno: boolean
  error: string | null
  fetchCategorias: () => Promise<void>
  fetchTurnoData: () => Promise<TurnoData | null>
  clearError: () => void
}

export const useComandasStore = create<ComandasState>()((set) => ({
  categorias: [],
  turnoData: null,
  isLoadingCategorias: false,
  isLoadingTurno: false,
  error: null,

  fetchCategorias: async () => {
    set({ isLoadingCategorias: true, error: null })
    try {
      const response = await fetch('/api/categorias')
      if (!response.ok) throw new Error('Error fetching categorias')
      const data = await response.json()
      set({ categorias: Array.isArray(data) ? data : [], isLoadingCategorias: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error cargando categorías',
        isLoadingCategorias: false,
      })
    }
  },

  fetchTurnoData: async () => {
    set({ isLoadingTurno: true, error: null })
    try {
      const response = await fetch('/api/comandas/turno-activo')
      if (!response.ok) throw new Error('Error fetching turno')
      const data = await response.json()
      set({ turnoData: data, isLoadingTurno: false })
      return data as TurnoData
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error cargando turno',
        isLoadingTurno: false,
      })
      return null
    }
  },

  clearError: () => set({ error: null }),
}))