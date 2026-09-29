import { describe, expect, it } from 'vitest'
import { comisionDeChica, fueLiberada, sumarComisiones } from '@/lib/chicas'

const comanda = (overrides = {}) => ({
  chica1Id: 1,
  chica2Id: 2,
  comisionChica1: 5000,
  comisionChica2: 3000,
  chica1Liberada: false,
  chica2Liberada: true,
  ...overrides,
})

describe('helpers de chicas', () => {
  it('comisionDeChica toma el slot correcto', () => {
    expect(comisionDeChica(comanda(), 1)).toBe(5000)
    expect(comisionDeChica(comanda(), 2)).toBe(3000)
    expect(comisionDeChica(comanda(), 9)).toBe(0)
    expect(comisionDeChica(comanda({ comisionChica1: null }), 1)).toBe(0)
  })

  it('fueLiberada lee el flag del slot', () => {
    expect(fueLiberada(comanda(), 1)).toBe(false)
    expect(fueLiberada(comanda(), 2)).toBe(true)
    expect(fueLiberada(comanda(), 9)).toBe(false)
  })

  it('sumarComisiones acumula comandas y comision', () => {
    expect(sumarComisiones([comanda(), comanda({ comisionChica1: 1000 })], 1)).toEqual({ comandas: 2, comision: 6000 })
    expect(sumarComisiones([], 1)).toEqual({ comandas: 0, comision: 0 })
  })
})
