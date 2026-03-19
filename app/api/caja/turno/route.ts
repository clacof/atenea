import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || !['admin', 'caja'].includes(user.rol)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Obtener comandas del día actual
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
  if (!user || !['admin', 'caja'].includes(user.rol)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { totalEfectivo, totalTransferencia, totalDebito, totalCredito } = data

    // Crear registro de cierre de turno
    const turno = await prisma.cajaTurno.create({
      data: {
        fecha: new Date(),
        turno: '1',
        totalEfectivo: Number(totalEfectivo || 0),
        totalTransferencia: Number(totalTransferencia || 0),
        totalDebito: Number(totalDebito || 0),
        totalCredito: Number(totalCredito || 0),
        totalGeneral:
          Number(totalEfectivo || 0) +
          Number(totalTransferencia || 0) +
          Number(totalDebito || 0) +
          Number(totalCredito || 0),
        responsable: user.id.toString(),
      },
    })

    return NextResponse.json(turno, { status: 201 })
  } catch (error) {
    console.error('Error closing turno:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
