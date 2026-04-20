import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { calculateComision } from '@/lib/businessRules'

function getTodayBounds() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return { start, end }
}

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit') ?? '200'), 500)
    const page = Math.max(Number(searchParams.get('page') ?? '1'), 1)

    const comandas = await prisma.comanda.findMany({
      include: {
        categoria: true,
        chica1: true,
        chica2: true,
        usuario: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    })

    return NextResponse.json(comandas)
  } catch (error) {
    console.error('Error fetching comandas:', error)
    return NextResponse.json({ error: 'Error al obtener comandas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const {
      categoriaId,
      tipoConsumo,
      chica1Id,
      chica2Id,
      chicasAdicionalesBotella,
      descuentoPorcentaje,
      descuentoMonto,
      cortesia,
      medioPago,
      clienteNombre,
    } = data

    // Validacion de campos requeridos
    if (!categoriaId) {
      return NextResponse.json({ error: 'Categoria es requerida' }, { status: 400 })
    }
    if (!tipoConsumo) {
      return NextResponse.json({ error: 'Tipo de consumo es requerido' }, { status: 400 })
    }
    if (!medioPago) {
      return NextResponse.json({ error: 'Medio de pago es requerido' }, { status: 400 })
    }

    const clienteNombreSanitized =
      typeof clienteNombre === 'string' && clienteNombre.trim() !== ''
        ? clienteNombre.trim().toUpperCase().slice(0, 100)
        : null

    if (!clienteNombreSanitized || !/^C\d+$/.test(clienteNombreSanitized)) {
      return NextResponse.json(
        { error: 'El cliente es requerido y debe tener formato C1, C2, C3...' },
        { status: 400 },
      )
    }

    // Run all reads + write atomically
    const comanda = await prisma.$transaction(async (tx) => {
      const usuarioEnBD = await tx.usuario.findUnique({ where: { id: user.id } })
      if (!usuarioEnBD || !usuarioEnBD.activo) {
        throw Object.assign(new Error('Usuario no encontrado o inactivo'), { statusCode: 401 })
      }

      const categoria = await tx.categoria.findUnique({ where: { id: categoriaId } })
      if (!categoria) {
        throw Object.assign(new Error('Categoria no encontrada'), { statusCode: 400 })
      }

      // Validar restriccion soloTransferencia (ej: Blue Label)
      if (categoria.soloTransferencia && medioPago !== 'transferencia') {
        throw Object.assign(
          new Error(`${categoria.nombre} solo permite pago por transferencia`),
          { statusCode: 400 },
        )
      }

      const { start, end } = getTodayBounds()

      const configRows = await tx.configGeneral.findMany({
        where: {
          clave: {
            in: [
              'comisionNormalFija',
              'COMISION_NORMAL_FIJA',
              'maxChicasBottella',
              'MAX_CHICAS_BOTELLA',
              'comisionAcompananteBotella',
            ],
          },
        },
      })
      const configMap = new Map(configRows.map((row) => [row.clave, Number(row.valor)]))
      const normalCommissionValue =
        configMap.get('comisionNormalFija') ?? configMap.get('COMISION_NORMAL_FIJA') ?? 5000
      const maxChicasBotella =
        configMap.get('maxChicasBottella') ?? configMap.get('MAX_CHICAS_BOTELLA') ?? 2
      const comisionAcompananteBotella =
        configMap.get('comisionAcompananteBotella') ?? normalCommissionValue

      const validateChicaDisponible = async (id: number, label: string) => {
        const chica = await tx.chica.findUnique({ where: { id } })
        if (!chica || !chica.activa) {
          throw Object.assign(new Error(`${label} no encontrada`), { statusCode: 400 })
        }

        const ocupacion = await tx.comanda.findFirst({
          where: {
            estado: 'activa',
            fecha: { gte: start, lte: end },
            OR: [{ chica1Id: id }, { chica2Id: id }],
          },
          select: { clienteNombre: true },
        })

        if (ocupacion && ocupacion.clienteNombre && ocupacion.clienteNombre !== clienteNombreSanitized) {
          throw Object.assign(
            new Error(`${label} esta ocupada atendiendo ${ocupacion.clienteNombre}`),
            { statusCode: 409 },
          )
        }
      }

      if (chica1Id) {
        await validateChicaDisponible(chica1Id, 'Chica 1')
      }

      if (chica2Id) {
        await validateChicaDisponible(chica2Id, 'Chica 2')
      }

      const ocupadasHoy = await tx.comanda.findMany({
        where: {
          estado: 'activa',
          fecha: { gte: start, lte: end },
        },
        select: { chica1Id: true, chica2Id: true, clienteNombre: true },
      })
      const ocupadasPorOtroCliente = new Set<number>()
      for (const item of ocupadasHoy) {
        if (item.clienteNombre === clienteNombreSanitized) continue
        if (item.chica1Id) ocupadasPorOtroCliente.add(item.chica1Id)
        if (item.chica2Id) ocupadasPorOtroCliente.add(item.chica2Id)
      }
      const chicasDisponiblesCount = await tx.chica.count({
        where: {
          activa: true,
          id: {
            notIn: Array.from(ocupadasPorOtroCliente),
          },
        },
      })

      if (categoria.tipo === 'botella') {
        const adicionales = Number(chicasAdicionalesBotella ?? 0)
        if (adicionales < 0) {
          throw Object.assign(new Error('La cantidad de chicas adicionales no puede ser negativa'), {
            statusCode: 400,
          })
        }
        if (adicionales > maxChicasBotella) {
          throw Object.assign(
            new Error(`La botella permite maximo ${maxChicasBotella} chicas adicionales`),
            { statusCode: 400 },
          )
        }
        if (adicionales > chicasDisponiblesCount) {
          throw Object.assign(
            new Error(`Solo hay ${chicasDisponiblesCount} chicas disponibles para acompanar`),
            { statusCode: 409 },
          )
        }
      }

      const precioBase =
        tipoConsumo === 'cliente'
          ? (categoria.precioCliente ?? categoria.precio)
          : categoria.precioChica
      if (!precioBase) {
        throw Object.assign(
          new Error('La categoria no tiene precio configurado para este tipo de consumo'),
          { statusCode: 400 },
        )
      }

      const { precioFinal, comisionTotal, comisionChica1, comisionChica2 } = calculateComision({
        precioBase,
        tipoConsumo,
        categoriaTipo: categoria.tipo,
        isAfterhour: categoria.isAfterhour,
        chicasAdicionalesBotella: Number(chicasAdicionalesBotella ?? 0),
        comisionPorChicaBotella: comisionAcompananteBotella,
        cortesia: cortesia ?? false,
        descuentoMonto: descuentoMonto ?? null,
        descuentoPorcentaje: descuentoPorcentaje ?? null,
        chica1Id: chica1Id ?? null,
        chica2Id: chica2Id ?? null,
        medioPago,
        recargoCreditoCliente: categoria.recargoCreditoCliente ?? null,
        recargoCreditoChica: categoria.recargoCreditoChica ?? null,
      })

      const hora = new Date().toTimeString().split(' ')[0]

      return tx.comanda.create({
        data: {
          categoriaId,
          tipoConsumo,
          chica1Id: chica1Id ?? null,
          chica2Id: chica2Id ?? null,
          precioBase,
          precioFinal,
          comisionTotal,
          comisionChica1,
          comisionChica2,
          descuentoPorcentaje: descuentoPorcentaje ?? null,
          descuentoMonto: descuentoMonto ?? null,
          cortesia: cortesia ?? false,
          medioPago,
          clienteNombre: clienteNombreSanitized,
          usuarioId: user.id,
          hora,
        },
        include: {
          categoria: true,
          chica1: true,
          chica2: true,
          usuario: { select: { nombre: true } },
        },
      })
    })

    return NextResponse.json(comanda, { status: 201 })
  } catch (error) {
    console.error('Error creating comanda:', error)
    if (error instanceof Error && 'statusCode' in error) {
      const code = (error as Error & { statusCode: number }).statusCode
      return NextResponse.json({ error: error.message }, { status: code })
    }
    return NextResponse.json({ error: 'Error al crear comanda' }, { status: 500 })
  }
}