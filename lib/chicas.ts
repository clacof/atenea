import { prisma } from '@/lib/prisma'

/** Busca otra chica no archivada con el mismo nombre (sin distinguir mayusculas). */
export async function findNombreDuplicado(nombre: string, excludeId?: number) {
  return prisma.chica.findFirst({
    where: {
      nombre: { equals: nombre, mode: 'insensitive' },
      archivada: false,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  })
}

export interface ComandaConChicas {
  chica1Id: number | null
  chica2Id: number | null
  comisionChica1: number | null
  comisionChica2: number | null
  chica1Liberada?: boolean
  chica2Liberada?: boolean
}

/** Comision que le corresponde a una chica en una comanda (0 si no participa). */
export function comisionDeChica(comanda: ComandaConChicas, chicaId: number): number {
  let total = 0
  if (comanda.chica1Id === chicaId) total += comanda.comisionChica1 ?? 0
  if (comanda.chica2Id === chicaId) total += comanda.comisionChica2 ?? 0
  return total
}

/** Indica si la chica fue liberada (dejo de atender) en esa comanda. */
export function fueLiberada(comanda: ComandaConChicas, chicaId: number): boolean {
  if (comanda.chica1Id === chicaId) return Boolean(comanda.chica1Liberada)
  if (comanda.chica2Id === chicaId) return Boolean(comanda.chica2Liberada)
  return false
}

export function sumarComisiones(comandas: ComandaConChicas[], chicaId: number) {
  return comandas.reduce(
    (acc, c) => ({
      comandas: acc.comandas + 1,
      comision: acc.comision + comisionDeChica(c, chicaId),
    }),
    { comandas: 0, comision: 0 },
  )
}
