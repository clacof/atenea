import { describe, expect, it } from 'vitest'
import { calculateComision } from '@/lib/businessRules'

describe('calculateComision', () => {
  it('trago para cliente no paga comision a chicas', () => {
    const r = calculateComision({
      precioBase: 30000,
      tipoConsumo: 'cliente',
      categoriaTipo: 'trago',
      comisionChicaCategoria: 12000,
      chica1Id: 1,
    })
    expect(r).toMatchObject({ precioFinal: 30000, comisionTotal: 0, comisionChica1: 0, comisionChica2: 0 })
  })

  it('botella para cliente divide la comision entre las chicas', () => {
    const r = calculateComision({
      precioBase: 150000,
      tipoConsumo: 'cliente',
      categoriaTipo: 'botella',
      comisionBotella: 40001,
      cantidadChicas: 2,
      chica1Id: 1,
      chica2Id: 2,
    })
    // 40001 / 2 = 20000.5 -> redondea a 20001 por chica
    expect(r.comisionTotal).toBe(40002)
    expect(r.comisionChica1 + r.comisionChica2).toBe(r.comisionTotal)
    expect(Math.abs(r.comisionChica1 - r.comisionChica2)).toBeLessThanOrEqual(1)
  })

  it('consumo de chica paga comision completa a ella', () => {
    const r = calculateComision({
      precioBase: 35000,
      tipoConsumo: 'chica',
      categoriaTipo: 'trago',
      comisionChicaCategoria: 12000,
      chica1Id: 7,
    })
    expect(r).toMatchObject({ comisionTotal: 12000, comisionChica1: 12000, comisionChica2: 0 })
  })

  it('consumo de chica respeta chicaRecibeComisionId', () => {
    const r = calculateComision({
      precioBase: 35000,
      tipoConsumo: 'chica',
      comisionChicaCategoria: 12000,
      chica1Id: 1,
      chica2Id: 2,
      chicaRecibeComisionId: 2,
    })
    expect(r).toMatchObject({ comisionChica1: 0, comisionChica2: 12000 })
  })

  it('afterhour no paga comision', () => {
    const r = calculateComision({
      precioBase: 150000,
      tipoConsumo: 'cliente',
      categoriaTipo: 'botella',
      isAfterhour: true,
      comisionBotella: 40000,
      cantidadChicas: 2,
      chica1Id: 1,
      chica2Id: 2,
    })
    expect(r).toMatchObject({ precioFinal: 150000, comisionTotal: 0 })
  })

  it('cortesia deja precio y comision en cero', () => {
    const r = calculateComision({
      precioBase: 35000,
      tipoConsumo: 'chica',
      comisionChicaCategoria: 12000,
      cortesia: true,
      medioPago: 'credito',
      recargoCreditoChica: 2000,
      chica1Id: 1,
    })
    expect(r).toMatchObject({ precioFinal: 0, comisionTotal: 0, recargoCredito: 0 })
  })

  it('credito suma recargo segun tipo de consumo', () => {
    const cliente = calculateComision({
      precioBase: 30000,
      tipoConsumo: 'cliente',
      medioPago: 'credito',
      recargoCreditoCliente: 3000,
      recargoCreditoChica: 5000,
    })
    const chica = calculateComision({
      precioBase: 30000,
      tipoConsumo: 'chica',
      medioPago: 'credito',
      recargoCreditoCliente: 3000,
      recargoCreditoChica: 5000,
    })
    expect(cliente).toMatchObject({ precioFinal: 33000, recargoCredito: 3000 })
    expect(chica).toMatchObject({ precioFinal: 35000, recargoCredito: 5000 })
  })

  it('aplica descuento en monto y luego porcentaje, sin bajar de cero', () => {
    const r = calculateComision({
      precioBase: 20000,
      tipoConsumo: 'cliente',
      descuentoMonto: 10000,
      descuentoPorcentaje: 10,
    })
    expect(r.precioFinal).toBe(9000)

    const negativo = calculateComision({ precioBase: 5000, tipoConsumo: 'cliente', descuentoMonto: 9000 })
    expect(negativo.precioFinal).toBe(0)
  })
})
