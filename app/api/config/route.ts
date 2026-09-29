import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

type ConfigValue = string | number | boolean

const CONFIG_KEYS = [
  'horaCambioAfter',
  'maxChicasBottella',
  'porcBottella100k',
  'porcBottella150kMas',
  'minValor150k',
  'comisionPremiumFija',
  'comisionNormalFija',
  'comisionAcompananteBotella',
]

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Solo admin puede acceder a configuracion
  if (user.rol !== 'admin') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    // Obtener todas las configuraciones
    const configs = await prisma.configGeneral.findMany()

    // Convertir a objeto
    const configObj: Record<string, ConfigValue> = {}
    configs.forEach((config) => {
      // Intentar parsear como numero
      const numValue = Number(config.valor)
      configObj[config.clave] = isNaN(numValue) ? config.valor : numValue
    })

    // Asegurar que tienen valores por defecto
    const defaultConfig = {
      horaCambioAfter: '04:00',
      maxChicasBottella: 2,
      porcBottella100k: 0.4,
      porcBottella150kMas: 0.3,
      minValor150k: 150000,
      comisionPremiumFija: 10000,
      comisionNormalFija: 5000,
      comisionAcompananteBotella: 5000,
    }

    const finalConfig = { ...defaultConfig, ...configObj }

    return NextResponse.json(finalConfig)
  } catch (error) {
    console.error('Error fetching config:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: `Error al obtener configuracion: ${errorMessage}` }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Solo admin puede modificar configuracion
  if (user.rol !== 'admin') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const data = await request.json()

    // Validar que solo hay keys conocidas
    for (const key of Object.keys(data)) {
      if (!CONFIG_KEYS.includes(key)) {
        return NextResponse.json({ error: `Key desconocida: ${key}` }, { status: 400 })
      }
    }

    // Actualizar cada configuracion
    for (const [key, value] of Object.entries(data)) {
      await prisma.configGeneral.upsert({
        where: { clave: key },
        update: { valor: String(value) },
        create: {
          clave: key,
          valor: String(value),
          descripcion: `Configuracion: ${key}`,
        },
      })
    }

    // Retornar la configuracion actualizada
    const updatedConfigs = await prisma.configGeneral.findMany()
    const configObj: Record<string, ConfigValue> = {}
    updatedConfigs.forEach((config) => {
      const numValue = Number(config.valor)
      configObj[config.clave] = isNaN(numValue) ? config.valor : numValue
    })

    return NextResponse.json(configObj)
  } catch (error) {
    console.error('Error updating config:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: `Error al actualizar configuracion: ${errorMessage}` }, { status: 500 })
  }
}
