/**
 * Reglas por tipo de categoria. Fuente unica para API, UI y calculo de comisiones:
 * agregar un tipo nuevo = agregar una entrada aqui (y al enum de Prisma).
 */

export const TIPOS_CATEGORIA = ['trago', 'botella', 'comida'] as const
export type TipoCategoria = (typeof TIPOS_CATEGORIA)[number]

export interface ReglaTipo {
  label: string
  plural: string
  icono: string
  /** true: precioCliente/precioChica distintos. false: un solo `precio` para todos. */
  precioPorConsumo: boolean
  /** true: si consume la chica paga el mismo precio que el cliente. */
  chicaPagaPrecioCliente: boolean
  /** Chicas exigidas/permitidas cuando consume el cliente. */
  chicasCliente: { min: number; max: number }
  /** false: todo para la casa, nunca paga comision. */
  generaComision: boolean
  /** false: el precio no cambia con credito ni afterhour. */
  admiteRecargos: boolean
  /** Se pide por cantidad (precio unitario x cantidad). */
  usaCantidad: boolean
  /** Pasa por cocina (estado pendiente/listo). */
  usaCocina: boolean
}

export const REGLAS_TIPO: Record<TipoCategoria, ReglaTipo> = {
  trago: {
    label: 'Trago',
    plural: 'Tragos o vasos',
    icono: '🍹',
    precioPorConsumo: true,
    chicaPagaPrecioCliente: false,
    chicasCliente: { min: 0, max: 1 },
    generaComision: true,
    admiteRecargos: true,
    usaCantidad: false,
    usaCocina: false,
  },
  botella: {
    label: 'Botella',
    plural: 'Botellas',
    icono: '🍾',
    precioPorConsumo: false,
    chicaPagaPrecioCliente: false,
    chicasCliente: { min: 2, max: 2 },
    generaComision: true,
    admiteRecargos: true,
    usaCantidad: false,
    usaCocina: false,
  },
  comida: {
    label: 'Comida',
    plural: 'Carta de comida',
    icono: '🍽️',
    precioPorConsumo: false,
    chicaPagaPrecioCliente: true,
    chicasCliente: { min: 0, max: 0 },
    generaComision: false,
    admiteRecargos: false,
    usaCantidad: true,
    usaCocina: true,
  },
}

export function reglaTipo(tipo: string | null | undefined): ReglaTipo | null {
  return tipo && tipo in REGLAS_TIPO ? REGLAS_TIPO[tipo as TipoCategoria] : null
}

interface PreciosCategoria {
  tipo: string
  precioCliente?: number | null
  precioChica?: number | null
  precio?: number | null
}

/** Precio unitario segun tipo de categoria y quien consume. */
export function precioUnitario(categoria: PreciosCategoria, tipoConsumo: 'cliente' | 'chica' | string): number | null {
  const precioCliente = categoria.precioCliente ?? categoria.precio ?? null
  if (tipoConsumo === 'cliente') return precioCliente
  return reglaTipo(categoria.tipo)?.chicaPagaPrecioCliente ? precioCliente : (categoria.precioChica ?? null)
}
