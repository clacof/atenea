/**
 * Reglas de negocio centralizadas para calculo de precios y comisiones.
 * Mantener aqui evita duplicar la logica entre el API y el formulario cliente.
 */

export interface CommissionInput {
  precioBase: number
  tipoConsumo: 'cliente' | 'chica'
  categoriaTipo?: 'trago' | 'botella' | null
  isAfterhour?: boolean
  chicasAdicionalesBotella?: number | null
  comisionPorChicaBotella?: number | null
  cortesia?: boolean
  descuentoMonto?: number | null
  descuentoPorcentaje?: number | null
  chica1Id?: number | null
  chica2Id?: number | null
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
 *  - precioBase >= 150.000 → 30 % de comision
 *  - precioBase < 150.000  → 40 % de comision
 *  - Pago con credito agrega recargo configurable por categoria
 * Los montos intermedios se redondean para evitar centavos.
 */
export function calculateComision(input: CommissionInput): CommissionResult {
  const {
    precioBase,
    tipoConsumo,
    categoriaTipo,
    isAfterhour = false,
    chicasAdicionalesBotella,
    comisionPorChicaBotella,
    cortesia = false,
    descuentoMonto,
    descuentoPorcentaje,
    chica1Id,
    chica2Id,
    medioPago,
    recargoCreditoCliente,
    recargoCreditoChica,
  } = input

  // Calcular recargo por credito
  let recargoCredito = 0
  if (medioPago === 'credito' && !cortesia) {
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
  if (isAfterhour) {
    // Regla de negocio: afterhour no paga comision a chicas, es solo para la casa.
    return { precioFinal, comisionTotal: 0, comisionChica1: 0, comisionChica2: 0, recargoCredito }
  }

  if (
    categoriaTipo === 'botella' &&
    tipoConsumo === 'cliente' &&
    !cortesia &&
    precioFinal > 0 &&
    (chicasAdicionalesBotella ?? 0) > 0
  ) {
    const deltaComision = Math.round((chicasAdicionalesBotella ?? 0) * (comisionPorChicaBotella ?? 0))
    precioFinal = Math.max(0, precioFinal + deltaComision)
    comisionTotal = deltaComision
  } else if (tipoConsumo === 'chica' && !cortesia && precioFinal > 0) {
    const rate = precioBase >= 150_000 ? 0.3 : 0.4
    comisionTotal = Math.round(precioFinal * rate)
  }

  if (comisionTotal > 0) {
    if (chica1Id && chica2Id) {
      comisionChica1 = Math.round(comisionTotal / 2)
      comisionChica2 = comisionTotal - comisionChica1
    } else if (chica1Id) {
      comisionChica1 = comisionTotal
    }
  }

  return { precioFinal, comisionTotal, comisionChica1, comisionChica2, recargoCredito }
}
