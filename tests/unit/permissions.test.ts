import { describe, expect, it } from 'vitest'
import { can } from '@/lib/permissions'

describe('can', () => {
  it('admin puede todo', () => {
    for (const accion of ['chicas.editar', 'chicas.eliminar', 'auditoria.ver', 'caja.gestionar'] as const) {
      expect(can('admin', accion)).toBe(true)
    }
  })

  it('supervisor edita chicas pero no elimina ni ve auditoria', () => {
    expect(can('supervisor', 'chicas.editar')).toBe(true)
    expect(can('supervisor', 'chicas.eliminar')).toBe(false)
    expect(can('supervisor', 'auditoria.ver')).toBe(false)
  })

  it('caja gestiona caja pero no chicas', () => {
    expect(can('caja', 'caja.gestionar')).toBe(true)
    expect(can('caja', 'chicas.editar')).toBe(false)
  })

  it('sin rol o rol desconocido no puede nada', () => {
    expect(can(null, 'chicas.editar')).toBe(false)
    expect(can('hacker', 'chicas.editar')).toBe(false)
  })
})
