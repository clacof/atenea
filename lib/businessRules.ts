/**
 * Reglas de negocio centralizadas para cálculo de precios y comisiones.
 * Mantener aquí evita duplicar la lógica entre el API y el formulario cliente.
 */

export interface CommissionInput {
  precioBase: number
  tipoConsumo: 'cliente' | 'chica'
  cortesia?: boolean
  descuentoMonto?: number | null
  descuentoPorcentaje?: number | null
  chica1Id?: number | null
  chica2Id?: number | null
}

export interface CommissionResult {
  precioFinal: number
  comisionTotal: number
  comisionChica1: number
  comisionChica2: number
}

/**
 * Calcula precio final y comisiones de una comanda.
 *  - precioBase >= 150.000 → 30 % de comisión
 *  - precioBase < 150.000  → 40 % de comisión
 * Los montos intermedios se redondean para evitar centavos.
 */
export function calculateComision(input: CommissionInput): CommissionResult {
  const {
    precioBase,
    tipoConsumo,
    cortesia = false,
    descuentoMonto,
    descuentoPorcentaje,
    chica1Id,
    chica2Id,
  } = input

  let precioFinal = precioBase

  if (cortesia) {
    precioFinal = 0
  } else {
    if (descuentoMonto) precioFinal -= descuentoMonto
    if (descuentoPorcentaje) precioFinal -= precioFinal * (descuentoPorcentaje / 100)
  }

  precioFinal = Math.max(0, Math.round(precioFinal))

  let comisionTotal = 0
  let comisionChica1 = 0
  let comisionChica2 = 0

  if (tipoConsumo === 'chica' && !cortesia && precioFinal > 0) {
    const rate = precioBase >= 150_000 ? 0.3 : 0.4
    comisionTotal = Math.round(precioFinal * rate)

    if (chica1Id && chica2Id) {
      comisionChica1 = Math.round(comisionTotal / 2)
      comisionChica2 = comisionTotal - comisionChica1
    } else if (chica1Id) {
      comisionChica1 = comisionTotal
    }
  }

  return { precioFinal, comisionTotal, comisionChica1, comisionChica2 }
}
