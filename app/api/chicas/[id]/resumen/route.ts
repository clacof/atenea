import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { parseId } from '@/lib/schemas'
import { getCycleForDate } from '@/lib/reportUtils'
import { comisionDeChica, fueLiberada, sumarComisiones } from '@/lib/chicas'

interface RouteParams {
  params: Promise<{ id: string }>
}

/** Ficha de una chica: comisiones del turno y del mes, y sus ultimas comandas. */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const id = parseId((await params).id)
  if (!id) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
  }

  try {
    const chica = await prisma.chica.findUnique({ where: { id } })
    if (!chica) {
      return NextResponse.json({ error: 'Chica no encontrada' }, { status: 404 })
    }

    const configCiclo = await prisma.configGeneral.findFirst({ where: { clave: 'HORA_INICIO_CICLO' } })
    const startHour = configCiclo ? parseInt(configCiclo.valor) : 22
    const ahora = new Date()
    const turno = getCycleForDate(ahora, startHour)
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

    // El turno puede haber empezado el mes anterior (ej: dia 1 a las 03:00)
    const desde = turno.startDate < inicioMes ? turno.startDate : inicioMes

    const participa = { OR: [{ chica1Id: id }, { chica2Id: id }] }
    const [validas, recientes] = await Promise.all([
      prisma.comanda.findMany({
        where: { ...participa, estado: { not: 'anulada' }, fecha: { gte: desde } },
        select: { fecha: true, chica1Id: true, chica2Id: true, comisionChica1: true, comisionChica2: true },
      }),
      prisma.comanda.findMany({
        where: participa,
        orderBy: { fecha: 'desc' },
        take: 50,
        include: { categoria: { select: { nombre: true } } },
      }),
    ])

    const delMes = validas.filter((c) => c.fecha >= inicioMes)
    const delTurno = validas.filter((c) => c.fecha >= turno.startDate && c.fecha < turno.endDate)

    return NextResponse.json({
      chica,
      turno: { label: turno.label, ...sumarComisiones(delTurno, id) },
      mes: sumarComisiones(delMes, id),
      comandas: recientes.map((c) => ({
        id: c.id,
        fecha: c.fecha,
        hora: c.hora,
        categoria: c.categoria.nombre,
        clienteNombre: c.clienteNombre,
        estado: c.estado,
        precioFinal: c.precioFinal,
        comision: comisionDeChica(c, id),
        liberada: fueLiberada(c, id),
      })),
    })
  } catch (error) {
    console.error('Error fetching resumen chica:', error)
    return NextResponse.json({ error: 'Error al obtener la ficha' }, { status: 500 })
  }
}
