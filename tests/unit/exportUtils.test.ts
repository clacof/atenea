import { describe, expect, it } from 'vitest'
import { buildLiquidacion, csvCell } from '@/lib/exportUtils'

describe('csvCell', () => {
  it('escapa comillas', () => {
    expect(csvCell('Ana "La Reina"')).toBe('"Ana ""La Reina"""')
  })

  it('neutraliza formulas para Excel', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"')
    expect(csvCell('+56')).toBe('"\'+56"')
    expect(csvCell('-1')).toBe('"\'-1"')
  })

  it('numeros van sin comillas', () => {
    expect(csvCell(1500)).toBe('1500')
  })
})

describe('buildLiquidacion', () => {
  it('excluye chicas sin comision, ordena y suma el total', () => {
    const { filas, total } = buildLiquidacion({
      periodo: 'Semana',
      porChica: [
        { nombre: 'Ana', cantidad: 2, comision: 5000 },
        { nombre: 'Bea', cantidad: 1, comision: 0 },
        { nombre: 'Cata', cantidad: 4, comision: 12000 },
      ],
    })
    expect(filas.map((f) => f.nombre)).toEqual(['Cata', 'Ana'])
    expect(total).toBe(17000)
  })

  it('agrega desglose diario en reporte semanal', () => {
    const { filas } = buildLiquidacion({
      periodo: 'Semana',
      porChica: [{ nombre: 'Ana', cantidad: 2, comision: 5000 }],
      comisionesSemanales: [
        { nombre: 'Ana', lunes: 2000, martes: 0, miercoles: 0, jueves: 0, viernes: 3000, sabado: 0, domingo: 0, total: 5000 },
      ],
    })
    expect(filas[0].porDia).toMatchObject({ lunes: 2000, viernes: 3000, domingo: 0 })
  })
})
