// Permisos centralizados: una sola fuente de verdad para UI y API.

export type Rol = 'admin' | 'caja' | 'supervisor'

const PERMISOS = {
  'chicas.editar': ['admin', 'supervisor'],
  'chicas.eliminar': ['admin'],
  'categorias.editar': ['admin', 'supervisor'],
  'categorias.eliminar': ['admin'],
  'comandas.anular': ['admin', 'supervisor'],
  'cocina.gestionar': ['admin', 'caja', 'supervisor'],
  'caja.gestionar': ['admin', 'caja'],
  'usuarios.gestionar': ['admin'],
  'config.editar': ['admin'],
  'auditoria.ver': ['admin'],
} as const satisfies Record<string, readonly Rol[]>

export type Accion = keyof typeof PERMISOS

export function can(rol: string | null | undefined, accion: Accion): boolean {
  if (!rol) return false
  return (PERMISOS[accion] as readonly string[]).includes(rol)
}
