import { describe, expect, it } from 'vitest'
import { normalizeCommissionSlots } from '@/lib/commission-utils'

describe('normalizeCommissionSlots', () => {
  it('respeta una distribucion que ya suma el total', () => {
    expect(
      normalizeCommissionSlots({
        comisionTotal: 10000,
        comisionChica1: 7000,
        comisionChica2: 3000,
        hasChica1: true,
        hasChica2: true,
      }),
    ).toEqual({ comisionChica1: 7000, comisionChica2: 3000 })
  })

  it('reparte en partes iguales si falta la distribucion', () => {
    expect(
      normalizeCommissionSlots({ comisionTotal: 10001, hasChica1: true, hasChica2: true }),
    ).toEqual({ comisionChica1: 5001, comisionChica2: 5000 })
  })

  it('rebalancea si la suma no coincide con el total', () => {
    const r = normalizeCommissionSlots({
      comisionTotal: 8000,
      comisionChica1: 1000,
      comisionChica2: 1000,
      hasChica1: true,
      hasChica2: true,
    })
    expect(r).toEqual({ comisionChica1: 4000, comisionChica2: 4000 })
  })

  it('fuerza reparto parejo cuando se pide', () => {
    const r = normalizeCommissionSlots({
      comisionTotal: 10000,
      comisionChica1: 7000,
      comisionChica2: 3000,
      hasChica1: true,
      hasChica2: true,
      enforceEvenSplit: true,
    })
    expect(r).toEqual({ comisionChica1: 5000, comisionChica2: 5000 })
  })

  it('asigna todo a la unica chica presente y nada a slots vacios', () => {
    expect(normalizeCommissionSlots({ comisionTotal: 6000, hasChica2: true })).toEqual({
      comisionChica1: 0,
      comisionChica2: 6000,
    })
  })

  it('nunca devuelve montos negativos', () => {
    expect(
      normalizeCommissionSlots({ comisionTotal: -500, comisionChica1: -100, hasChica1: true }),
    ).toEqual({ comisionChica1: 0, comisionChica2: 0 })
  })
})
