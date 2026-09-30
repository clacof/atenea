import { describe, expect, it } from 'vitest'
import { calculateComision } from '@/lib/businessRules'
import { categoriaCreateSchema, comandaCocinaSchema, comandaCreateSchema } from '@/lib/schemas'
import { REGLAS_TIPO, TIPOS_CATEGORIA, precioUnitario, reglaTipo } from '@/lib/tipoCategoria'

describe('REGLAS_TIPO', () => {
  it('define reglas para cada tipo del enum', () => {
    for (const tipo of TIPOS_CATEGORIA) expect(REGLAS_TIPO[tipo]).toBeDefined()
    expect(reglaTipo('desconocido')).toBeNull()
    expect(reglaTipo(null)).toBeNull()
  })
})

describe('precioUnitario', () => {
  it('trago: precio distinto para cliente y chica', () => {
    const trago = { tipo: 'trago', precioCliente: 8000, precioChica: 15000 }
    expect(precioUnitario(trago, 'cliente')).toBe(8000)
    expect(precioUnitario(trago, 'chica')).toBe(15000)
  })

  it('botella: chica sin precioChica sigue sin precio (comportamiento previo)', () => {
    const botella = { tipo: 'botella', precio: 120000 }
    expect(precioUnitario(botella, 'cliente')).toBe(120000)
    expect(precioUnitario(botella, 'chica')).toBeNull()
  })

  it('comida: chica paga el mismo precio que el cliente', () => {
    const comida = { tipo: 'comida', precio: 9000 }
    expect(precioUnitario(comida, 'cliente')).toBe(9000)
    expect(precioUnitario(comida, 'chica')).toBe(9000)
  })
})

describe('calculateComision con comida', () => {
  it('cliente: todo para la casa', () => {
    const r = calculateComision({ precioBase: 18000, tipoConsumo: 'cliente', categoriaTipo: 'comida', comisionBotella: 5000 })
    expect(r).toMatchObject({ precioFinal: 18000, comisionTotal: 0, comisionChica1: 0, comisionChica2: 0 })
  })

  it('chica: sin comision aunque la categoria tenga valores', () => {
    const r = calculateComision({
      precioBase: 9000,
      tipoConsumo: 'chica',
      categoriaTipo: 'comida',
      comisionChicaCategoria: 3000,
      chica1Id: 4,
    })
    expect(r).toMatchObject({ precioFinal: 9000, comisionTotal: 0, comisionChica1: 0 })
  })

  it('credito: no aplica recargo', () => {
    const r = calculateComision({
      precioBase: 9000,
      tipoConsumo: 'cliente',
      categoriaTipo: 'comida',
      medioPago: 'credito',
      recargoCreditoCliente: 1500,
    })
    expect(r).toMatchObject({ precioFinal: 9000, recargoCredito: 0 })
  })

  it('descuentos y cortesia siguen aplicando', () => {
    expect(calculateComision({ precioBase: 10000, tipoConsumo: 'cliente', categoriaTipo: 'comida', descuentoPorcentaje: 10 }).precioFinal).toBe(9000)
    expect(calculateComision({ precioBase: 10000, tipoConsumo: 'cliente', categoriaTipo: 'comida', cortesia: true }).precioFinal).toBe(0)
  })
})

describe('schemas de comida', () => {
  it('categoria comida exige precio y acepta seccion', () => {
    expect(categoriaCreateSchema.safeParse({ nombre: 'Tabla', tipo: 'comida', comision: 0 }).success).toBe(false)
    const ok = categoriaCreateSchema.parse({ nombre: 'Tabla', tipo: 'comida', comision: 0, precio: 15000, seccion: ' Tablas ' })
    expect(ok.seccion).toBe('Tablas')
  })

  it('comanda: cantidad entre 1 y 50, notas recortadas', () => {
    const base = { categoriaId: 1, tipoConsumo: 'cliente', medioPago: 'efectivo', clienteNombre: 'C1' }
    expect(comandaCreateSchema.safeParse({ ...base, cantidad: 0 }).success).toBe(false)
    expect(comandaCreateSchema.safeParse({ ...base, cantidad: 51 }).success).toBe(false)
    expect(comandaCreateSchema.parse({ ...base, cantidad: '3', notas: '  sin cebolla ' })).toMatchObject({
      cantidad: 3,
      notas: 'sin cebolla',
    })
  })

  it('estado de cocina solo pendiente o listo', () => {
    expect(comandaCocinaSchema.safeParse({ estadoCocina: 'listo' }).success).toBe(true)
    expect(comandaCocinaSchema.safeParse({ estadoCocina: 'quemado' }).success).toBe(false)
  })
})
