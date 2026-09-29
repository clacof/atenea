import { describe, expect, it } from 'vitest'
import {
  categoriaCreateSchema,
  chicaCreateSchema,
  chicaUpdateSchema,
  cierreCajaSchema,
  comandaCreateSchema,
} from '@/lib/schemas'

describe('schemas', () => {
  it('chica: recorta nombre y convierte vacios en null', () => {
    const r = chicaCreateSchema.parse({ nombre: '  Maria ', alias: '', telefono: ' +56 9 1234 ' })
    expect(r).toMatchObject({ nombre: 'Maria', alias: null, telefono: '+56 9 1234' })
  })

  it('chica: rechaza nombre vacio', () => {
    const r = chicaCreateSchema.safeParse({ nombre: '   ' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('El nombre es requerido')
  })

  it('chica update: exige al menos un campo', () => {
    expect(chicaUpdateSchema.safeParse({}).success).toBe(false)
    expect(chicaUpdateSchema.safeParse({ activa: false }).success).toBe(true)
  })

  it('comanda: acepta ids null y rechaza medio de pago invalido', () => {
    const base = { categoriaId: 1, tipoConsumo: 'cliente', medioPago: 'efectivo', clienteNombre: 'C1' }
    expect(comandaCreateSchema.safeParse({ ...base, chica1Id: null, chica2Id: null }).success).toBe(true)
    const malo = comandaCreateSchema.safeParse({ ...base, medioPago: 'bitcoin' })
    expect(malo.success).toBe(false)
    expect(malo.error?.issues[0].message).toBe('Medio de pago es requerido')
  })

  it('categoria: trago exige precios y comision de chica', () => {
    const r = categoriaCreateSchema.safeParse({ nombre: 'Pisco', tipo: 'trago', comision: 0, precioCliente: 1000 })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toContain('Para tragos')
  })

  it('caja: montos faltantes quedan en 0 y negativos se rechazan', () => {
    expect(cierreCajaSchema.parse({ totalEfectivo: 1000 })).toEqual({
      totalEfectivo: 1000,
      totalTransferencia: 0,
      totalDebito: 0,
      totalCredito: 0,
    })
    expect(cierreCajaSchema.safeParse({ totalEfectivo: -1 }).success).toBe(false)
  })
})
