import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { normalizeCommissionSlots } from '@/lib/commission-utils'

function getTodayBounds() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return { start, end }
}

/**
 * GET /api/comandas/turno-activo
 * Returns live state for the current shift:
 *   - clientesActivos: clients with at least one 'activa' comanda today
 *   - chicas: all active chicas with availability derived from active comandas
 *   - siguienteNumeroCliente: next auto C-number (based on all of today's Cx labels)
 */
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { start, end } = getTodayBounds()

    // All non-anulada comandas from today (for computing next C-number)
    const todasHoy = await prisma.comanda.findMany({
      where: {
        fecha: { gte: start, lte: end },
        estado: { not: 'anulada' },
        clienteNombre: { not: null },
      },
      include: {
        categoria: { select: { nombre: true, tipo: true } },
        chica1: { select: { id: true, nombre: true } },
        chica2: { select: { id: true, nombre: true } },
      },
      orderBy: { fecha: 'asc' },
    })

    // Compute next C-number from ALL today's clienteNombre values matching C\d+
    const cRegex = /^C(\d+)$/i
    const nums = todasHoy
      .map((c) => c.clienteNombre?.match(cRegex)?.[1])
      .filter(Boolean)
      .map(Number)
    const siguienteNumeroCliente = nums.length > 0 ? Math.max(...nums) + 1 : 1

    // Only activa comandas for the live client view
    const activasHoy = todasHoy.filter((c) => c.estado === 'activa')

    // Group activa comandas by clienteNombre
    const clienteMap = new Map<string, typeof activasHoy>()
    for (const cmd of activasHoy) {
      if (!cmd.clienteNombre) continue
      if (!clienteMap.has(cmd.clienteNombre)) clienteMap.set(cmd.clienteNombre, [])
      clienteMap.get(cmd.clienteNombre)!.push(cmd)
    }

    const clientesActivos = Array.from(clienteMap.entries()).map(([clienteNombre, cmds]) => ({
      clienteNombre,
      count: cmds.length,
      subtotal: cmds.reduce((sum, c) => sum + c.precioFinal, 0),
      comandas: cmds.map((c) => {
        const normalized = normalizeCommissionSlots({
          comisionTotal: c.comisionTotal,
          comisionChica1: c.comisionChica1,
          comisionChica2: c.comisionChica2,
          hasChica1: Boolean(c.chica1Id),
          hasChica2: Boolean(c.chica2Id),
          enforceEvenSplit: c.tipoConsumo === 'cliente' && Boolean(c.chica1Id && c.chica2Id),
        })

        return {
          id: c.id,
          hora: c.hora,
          categoria: c.categoria.nombre,
          categoriaTipo: c.categoria.tipo,
          tipoConsumo: c.tipoConsumo,
          precioFinal: c.precioFinal,
          chica1: c.chica1?.nombre ?? null,
          chica2: c.chica2?.nombre ?? null,
          chica1Liberada: c.chica1Liberada,
          chica2Liberada: c.chica2Liberada,
          comisionTotal: c.comisionTotal,
          comisionChica1: normalized.comisionChica1,
          comisionChica2: normalized.comisionChica2,
          cortesia: c.cortesia,
        }
      }),
    }))

    // Sort naturally by C-number; non-C names go last
    clientesActivos.sort((a, b) => {
      const aNum = Number(a.clienteNombre.match(cRegex)?.[1] ?? 9999)
      const bNum = Number(b.clienteNombre.match(cRegex)?.[1] ?? 9999)
      return aNum - bNum
    })

    // Chica availability: occupied = assigned to any activa comanda today
    const chicasOcupadas = new Map<number, string>() // id → clienteNombre
    for (const cmd of activasHoy) {
      if (cmd.chica1Id && cmd.clienteNombre && !cmd.chica1Liberada) {
        chicasOcupadas.set(cmd.chica1Id, cmd.clienteNombre)
      }
      if (cmd.chica2Id && cmd.clienteNombre && !cmd.chica2Liberada) {
        chicasOcupadas.set(cmd.chica2Id, cmd.clienteNombre)
      }
    }

    const todasChicas = await prisma.chica.findMany({
      where: { activa: true, archivada: false },
      orderBy: { nombre: 'asc' },
    })

    const configRows = await prisma.configGeneral.findMany({
      where: {
        clave: { in: ['maxChicasBottella', 'comisionAcompananteBotella'] },
      },
    })
    const configMap = new Map(configRows.map((row) => [row.clave, row.valor]))

    const chicas = todasChicas.map((ch) => ({
      id: ch.id,
      nombre: ch.nombre,
      disponible: !chicasOcupadas.has(ch.id),
      clienteAtendiendo: chicasOcupadas.get(ch.id) ?? null,
    }))

    return NextResponse.json({
      fecha: start.toISOString().split('T')[0],
      clientesActivos,
      chicas,
      siguienteNumeroCliente,
      config: {
        maxChicasBottella: Number(configMap.get('maxChicasBottella') ?? 2),
        comisionAcompananteBotella: Number(configMap.get('comisionAcompananteBotella') ?? 5000),
      },
    })
  } catch (error) {
    console.error('Error fetching turno-activo:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

/**
 * POST /api/comandas/turno-activo
 * Body: { clienteNombre: string }
 * Marks all active comandas for that client today as 'pagada'.
 */
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const clienteNombre = typeof body.clienteNombre === 'string' ? body.clienteNombre.trim() : ''

    if (!clienteNombre) {
      return NextResponse.json({ error: 'clienteNombre es requerido' }, { status: 400 })
    }

    const { start, end } = getTodayBounds()

    const result = await prisma.comanda.updateMany({
      where: {
        clienteNombre,
        estado: 'activa',
        fecha: { gte: start, lte: end },
      },
      data: { estado: 'pagada' },
    })

    if (result.count > 0) {
      audit({ user, accion: 'CAMBIO_ESTADO', tabla: 'Comanda', detalles: { cierreCuenta: clienteNombre, comandas: result.count } })
    }

    return NextResponse.json({ closed: result.count })
  } catch (error) {
    console.error('Error closing client account:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

/**
 * PATCH /api/comandas/turno-activo
 * Body: { chicaId: number }
 * Libera una chica de todas sus comandas activas hoy (quita la asignacion).
 * Las comandas siguen activas; solo se remueve la referencia a la chica.
 */
export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const chicaId = typeof body.chicaId === 'number' ? body.chicaId : null

    if (!chicaId) {
      return NextResponse.json({ error: 'chicaId es requerido' }, { status: 400 })
    }

    const { start, end } = getTodayBounds()

    // Liberar como chica1
    const freed1 = await prisma.comanda.updateMany({
      where: {
        chica1Id: chicaId,
        chica1Liberada: false,
        estado: 'activa',
        fecha: { gte: start, lte: end },
      },
      data: { chica1Liberada: true },
    })

    // Liberar como chica2
    const freed2 = await prisma.comanda.updateMany({
      where: {
        chica2Id: chicaId,
        chica2Liberada: false,
        estado: 'activa',
        fecha: { gte: start, lte: end },
      },
      data: { chica2Liberada: true },
    })

    const freed = freed1.count + freed2.count
    if (freed > 0) {
      audit({ user, accion: 'CAMBIO_ESTADO', tabla: 'Chica', registroId: chicaId, detalles: { liberada: true, comandas: freed } })
    }

    return NextResponse.json({ freed })
  } catch (error) {
    console.error('Error liberando chica:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
