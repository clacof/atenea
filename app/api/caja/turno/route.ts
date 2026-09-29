import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { audit } from '@/lib/audit'
import { cierreCajaSchema, parseBody } from '@/lib/schemas'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'caja.gestionar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    // Obtener comandas del dia actual
    const hoy = new Date().toISOString().split('T')[0]
    const comandas = await prisma.comanda.findMany({
      where: {
        fecha: {
          gte: new Date(`${hoy}T00:00:00Z`),
          lt: new Date(`${hoy}T23:59:59Z`),
        },
        estado: { not: 'anulada' },
      },
      include: { categoria: true },
    })

    // Calcular totales por medio de pago
    const totales = {
      totalEfectivo: 0,
      totalTransferencia: 0,
      totalDebito: 0,
      totalCredito: 0,
      totalGeneral: 0,
    }

    const detallesPago: Record<string, number> = {
      efectivo: 0,
      transferencia: 0,
      debito: 0,
      credito: 0,
    }

    comandas.forEach(cmd => {
      detallesPago[cmd.medioPago] = (detallesPago[cmd.medioPago] || 0) + cmd.precioFinal
      totales.totalGeneral += cmd.precioFinal
    })

    totales.totalEfectivo = detallesPago.efectivo
    totales.totalTransferencia = detallesPago.transferencia
    totales.totalDebito = detallesPago.debito
    totales.totalCredito = detallesPago.credito

    return NextResponse.json({
      fecha: hoy,
      turno: '1',
      ...totales,
      detalle: detallesPago,
      responsable: user.id.toString(),
    })
  } catch (error) {
    console.error('Error fetching turno:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!can(user.rol, 'caja.gestionar')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { data, response } = await parseBody(request, cierreCajaSchema)
  if (response) return response
  const { totalEfectivo, totalTransferencia, totalDebito, totalCredito } = data

  try {
    // Crear registro de cierre de turno
    const turno = await prisma.cajaTurno.create({
      data: {
        fecha: new Date(),
        turno: '1',
        totalEfectivo,
        totalTransferencia,
        totalDebito,
        totalCredito,
        totalGeneral: totalEfectivo + totalTransferencia + totalDebito + totalCredito,
        responsable: user.id.toString(),
      },
    })
    audit({
      user,
      accion: 'CIERRE_CAJA',
      tabla: 'CajaTurno',
      registroId: turno.id,
      detalles: { totalEfectivo, totalTransferencia, totalDebito, totalCredito, totalGeneral: turno.totalGeneral },
    })

    return NextResponse.json(turno, { status: 201 })
  } catch (error) {
    console.error('Error closing turno:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
