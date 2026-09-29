import { after } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { AuthUser } from '@/lib/auth'

export type AuditAccion =
  | 'CREAR'
  | 'EDITAR'
  | 'ELIMINAR'
  | 'ARCHIVAR'
  | 'RESTAURAR'
  | 'CAMBIO_ESTADO'
  | 'ANULAR'
  | 'CIERRE_CAJA'

interface AuditInput {
  user: AuthUser | null
  accion: AuditAccion
  tabla: string
  registroId?: number | null
  detalles?: Record<string, unknown> | string
}

/**
 * Registra una accion en AuditLog despues de responder. Un fallo de auditoria
 * nunca bloquea la operacion principal.
 */
export function audit({ user, accion, tabla, registroId, detalles }: AuditInput): void {
  const texto =
    detalles === undefined
      ? null
      : typeof detalles === 'string'
        ? detalles
        : JSON.stringify(detalles)

  // after(): corre tras enviar la respuesta sin que la funcion serverless la corte
  after(() =>
    prisma.auditLog
      .create({
        data: {
          usuarioId: user?.id ?? null,
          accion,
          tabla,
          registroId: registroId ?? null,
          detalles: texto?.slice(0, 2000) ?? null,
        },
      })
      .catch((error) => console.error('Error registrando auditoria:', error)),
  )
}

/** Devuelve solo los campos que cambiaron entre dos objetos, como { campo: [antes, despues] }. */
export function diff<T extends Record<string, unknown>>(
  antes: T,
  despues: Partial<T>,
): Record<string, [unknown, unknown]> {
  const cambios: Record<string, [unknown, unknown]> = {}
  for (const key of Object.keys(despues)) {
    const a = antes[key]
    const d = despues[key]
    const norm = (v: unknown) => (v instanceof Date ? v.toISOString() : v)
    if (norm(a) !== norm(d)) cambios[key] = [norm(a), norm(d)]
  }
  return cambios
}
