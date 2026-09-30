/**
 * Reglas de negocio centralizadas para calculo de precios y comisiones.
 * Mantener aqui evita duplicar la logica entre el API y el formulario cliente.
 */

import { reglaTipo, type TipoCategoria } from './tipoCategoria'

export interface CommissionInput {
  precioBase: number
  tipoConsumo: 'cliente' | 'chica'
  categoriaTipo?: TipoCategoria | null
  isAfterhour?: boolean
  comisionChicaCategoria?: number | null
  comisionBotella?: number | null
  cantidadChicas?: number // Cantidad TOTAL de chicas en la comanda
  cortesia?: boolean
  descuentoMonto?: number | null
  descuentoPorcentaje?: number | null
  chica1Id?: number | null
  chica2Id?: number | null
  chicaRecibeComisionId?: number | null // Para trago: específica quién recibe
  medioPago?: string | null
  recargoCreditoCliente?: number | null
  recargoCreditoChica?: number | null
}

export interface CommissionResult {
  precioFinal: number
  comisionTotal: number
  comisionChica1: number
  comisionChica2: number
  recargoCredito: number
}

/**
 * Calcula precio final y comisiones de una comanda.
 * 
 * Reglas de negocio:
 * - Para TRAGO + cliente: TODA la comisión a UNA sola chica (chicaRecibeComisionId o chica1Id)
 * - Para BOTELLA + cliente: La comisión se divide entre TODAS las chicas
 * - Para tipoConsumo='chica': comisión sin dividir (consumo propio)
 * - Tipos sin comision (comida): todo para la casa, sin recargo por credito ni afterhour
 * - Pago con credito agrega recargo configurable por categoria
 * 
 * Los montos intermedios se redondean para evitar centavos.
 */
export function calculateComision(input: CommissionInput): CommissionResult {
  const {
    precioBase,
    tipoConsumo,
    categoriaTipo,
    isAfterhour = false,
    comisionChicaCategoria,
    comisionBotella,
    cantidadChicas = 1,
    cortesia = false,
    descuentoMonto,
    descuentoPorcentaje,
    chica1Id,
    chica2Id,
    chicaRecibeComisionId,
    medioPago,
    recargoCreditoCliente,
    recargoCreditoChica,
  } = input

  const regla = reglaTipo(categoriaTipo)
  const generaComision = regla?.generaComision ?? true
  const admiteRecargos = regla?.admiteRecargos ?? true

  // Calcular recargo por credito
  let recargoCredito = 0
  if (medioPago === 'credito' && !cortesia && admiteRecargos) {
    if (tipoConsumo === 'chica' && recargoCreditoChica) {
      recargoCredito = recargoCreditoChica
    } else if (recargoCreditoCliente) {
      recargoCredito = recargoCreditoCliente
    }
  }

  let precioFinal = precioBase + recargoCredito

  if (cortesia) {
    precioFinal = 0
    recargoCredito = 0
  } else {
    if (descuentoMonto) precioFinal -= descuentoMonto
    if (descuentoPorcentaje) precioFinal -= precioFinal * (descuentoPorcentaje / 100)
  }

  precioFinal = Math.max(0, Math.round(precioFinal))

  let comisionTotal = 0
  let comisionChica1 = 0
  let comisionChica2 = 0

  if (isAfterhour || !generaComision) {
    // Regla de negocio: afterhour y tipos sin comision (comida) son solo para la casa.
    return { precioFinal, comisionTotal: 0, comisionChica1: 0, comisionChica2: 0, recargoCredito }
  }

  // Logica de comisiones por categoria y tipo de consumo
  if (categoriaTipo === 'trago' && tipoConsumo === 'cliente' && !cortesia && precioFinal > 0) {
    // Regla de negocio: TRAGOS para cliente NO dan comisión a las chicas
    comisionTotal = 0
  } else if (categoriaTipo === 'botella' && tipoConsumo === 'cliente' && !cortesia && precioFinal > 0) {
    // BOTELLA: La comisión se divide entre TODAS las chicas
    const comisionPorChica = Math.round((comisionBotella ?? comisionChicaCategoria ?? 0) / Math.max(1, cantidadChicas))
    comisionTotal = comisionPorChica * Math.max(1, cantidadChicas)
  } else if (tipoConsumo === 'chica' && !cortesia && precioFinal > 0) {
    // Consumo propio (chica consume): usar comisionChicaCategoria sin dividir
    comisionTotal = Math.round(comisionChicaCategoria ?? 0)
  }

  // Distribuir comision entre chica(s)
  if (comisionTotal > 0) {
    const multipleChicasCliente = tipoConsumo === 'cliente' && cantidadChicas > 1

    if (multipleChicasCliente) {
      const participantes = [] as Array<'chica1' | 'chica2'>
      if (chica1Id) participantes.push('chica1')
      if (chica2Id) participantes.push('chica2')

      if (participantes.length === 0) {
        comisionChica1 = comisionTotal
      } else {
        const base = Math.floor(comisionTotal / participantes.length)
        let remainder = comisionTotal - base * participantes.length

        const nextValue = () => {
          const extra = remainder > 0 ? 1 : 0
          if (remainder > 0) remainder -= 1
          return base + extra
        }

        if (participantes.includes('chica1')) {
          comisionChica1 = nextValue()
        }
        if (participantes.includes('chica2')) {
          comisionChica2 = nextValue()
        }
      }
    } else {
      const comisionChicaDestino = chicaRecibeComisionId ?? chica1Id ?? chica2Id ?? null

      if (comisionChicaDestino === chica1Id) {
        comisionChica1 = comisionTotal
      } else if (comisionChicaDestino === chica2Id) {
        comisionChica2 = comisionTotal
      } else if (chica1Id && chica2Id) {
        comisionChica1 = Math.round(comisionTotal / 2)
        comisionChica2 = comisionTotal - comisionChica1
      } else if (chica1Id) {
        comisionChica1 = comisionTotal
      } else if (chica2Id) {
        comisionChica2 = comisionTotal
      }
    }
  }

  return { precioFinal, comisionTotal, comisionChica1, comisionChica2, recargoCredito }
}
