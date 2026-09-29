import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { audit } from '@/lib/audit'

/**
 * GET: Obtener configuracion de ciclo de reporte
 */
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const startHourConfig = await prisma.configGeneral.findFirst({
      where: { clave: 'HORA_INICIO_CICLO' },
    })

    const startMinuteConfig = await prisma.configGeneral.findFirst({
      where: { clave: 'MINUTO_INICIO_CICLO' },
    })

    const startHour = startHourConfig ? parseInt(startHourConfig.valor) : 22
    const startMinute = startMinuteConfig ? parseInt(startMinuteConfig.valor) : 0

    return NextResponse.json({
      horaInicio: startHour,
      minutoInicio: startMinute,
      etiqueta: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')} PM`,
    })
  } catch (error) {
    console.error('Error fetching cycle config:', error)
    return NextResponse.json({ error: 'Error al obtener configuracion' }, { status: 500 })
  }
}

/**
 * POST: Actualizar configuracion de ciclo de reporte (solo admin)
 */
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Verificar que sea admin
  if (!can(user.rol, 'config.editar')) {
    return NextResponse.json({ error: 'Solo admins pueden cambiar configuracion' }, { status: 403 })
  }

  try {
    const { horaInicio, minutoInicio } = await request.json()

    // Validar valores
    if (typeof horaInicio !== 'number' || horaInicio < 0 || horaInicio > 23) {
      return NextResponse.json({ error: 'Hora invalida (0-23)' }, { status: 400 })
    }
    if (typeof minutoInicio !== 'number' || minutoInicio < 0 || minutoInicio > 59) {
      return NextResponse.json({ error: 'Minuto invalido (0-59)' }, { status: 400 })
    }

    // Actualizar configuracion
    await prisma.configGeneral.upsert({
      where: { clave: 'HORA_INICIO_CICLO' },
      update: { valor: horaInicio.toString(), descripcion: 'Hora de inicio del ciclo de reporte (0-23)' },
      create: {
        clave: 'HORA_INICIO_CICLO',
        valor: horaInicio.toString(),
        descripcion: 'Hora de inicio del ciclo de reporte (0-23)',
      },
    })

    await prisma.configGeneral.upsert({
      where: { clave: 'MINUTO_INICIO_CICLO' },
      update: { valor: minutoInicio.toString(), descripcion: 'Minuto de inicio del ciclo de reporte (0-59)' },
      create: {
        clave: 'MINUTO_INICIO_CICLO',
        valor: minutoInicio.toString(),
        descripcion: 'Minuto de inicio del ciclo de reporte (0-59)',
      },
    })

    audit({ user, accion: 'EDITAR', tabla: 'ConfigGeneral', detalles: { cicloInicio: `${horaInicio}:${minutoInicio}` } })

    return NextResponse.json({
      success: true,
      mensaje: 'Configuracion actualizada correctamente',
      horaInicio,
      minutoInicio,
      etiqueta: `${String(horaInicio).padStart(2, '0')}:${String(minutoInicio).padStart(2, '0')}`,
    })
  } catch (error) {
    console.error('Error updating cycle config:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: `Error al actualizar: ${errorMessage}` }, { status: 500 })
  }
}
