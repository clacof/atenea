import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { calculateComision } from '@/lib/businessRules'
import { audit } from '@/lib/audit'
import { comandaCreateSchema, parseBody } from '@/lib/schemas'
import { precioUnitario, reglaTipo } from '@/lib/tipoCategoria'

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

  const { data, response } = await parseBody(request, comandaCreateSchema)
  if (response) return response

  try {
    const {
      categoriaId,
      tipoConsumo,
      chica1Id,
      chica2Id,
      chicaRecibeComisionId,
      chicasAdicionalesBotella,
      descuentoPorcentaje,
      descuentoMonto,
      cortesia,
      medioPago,
      clienteNombre,
      cantidad: cantidadInput,
      notas,
    } = data

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

      const regla = reglaTipo(categoria.tipo)
      const cantidad = regla?.usaCantidad ? (cantidadInput ?? 1) : 1
      const cantidadChicasSeleccionadas = (chica1Id ? 1 : 0) + (chica2Id ? 1 : 0)

      // Tipos sin chicas para el cliente (comida): no se asignan acompanantes
      if (regla?.chicasCliente.max === 0 && tipoConsumo === 'cliente' && cantidadChicasSeleccionadas > 0) {
        throw Object.assign(new Error(`${regla.label} para cliente no lleva chicas asignadas`), { statusCode: 400 })
      }
      if (regla && tipoConsumo === 'chica' && !regla.generaComision && chica2Id) {
        throw Object.assign(new Error(`${regla.label} para chica se registra a una sola chica`), { statusCode: 400 })
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
        if (!chica || !chica.activa || chica.archivada) {
          throw Object.assign(new Error(`${label} no encontrada`), { statusCode: 400 })
        }

        const ocupacion = await tx.comanda.findFirst({
          where: {
            estado: 'activa',
            fecha: { gte: start, lte: end },
            OR: [
              { AND: [{ chica1Id: id }, { chica1Liberada: false }] },
              { AND: [{ chica2Id: id }, { chica2Liberada: false }] },
            ],
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
        select: {
          chica1Id: true,
          chica2Id: true,
          chica1Liberada: true,
          chica2Liberada: true,
          clienteNombre: true,
        },
      })
      const ocupadasPorOtroCliente = new Set<number>()
      for (const item of ocupadasHoy) {
        if (item.clienteNombre === clienteNombreSanitized) continue
        if (item.chica1Id && !item.chica1Liberada) ocupadasPorOtroCliente.add(item.chica1Id)
        if (item.chica2Id && !item.chica2Liberada) ocupadasPorOtroCliente.add(item.chica2Id)
      }
      const chicasDisponiblesCount = await tx.chica.count({
        where: {
          activa: true,
          archivada: false,
          id: {
            notIn: Array.from(ocupadasPorOtroCliente),
          },
        },
      })

      if (categoria.tipo === 'botella') {
        const cantidadChicas = (chica1Id ? 1 : 0) + (chica2Id ? 1 : 0)
        if (cantidadChicas < 2) {
          throw Object.assign(new Error('Para botellas se requieren al menos 2 chicas'), {
            statusCode: 400,
          })
        }
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

      // Validar TRAGO + cliente: solo 1 chica puede recibir comisión
      if (categoria.tipo === 'trago' && tipoConsumo === 'cliente') {
        const cantidadChicas = (chica1Id ? 1 : 0) + (chica2Id ? 1 : 0)
        if (cantidadChicas > 1) {
          throw Object.assign(new Error('Para tragos solo una chica recibe la comisión'), {
            statusCode: 400,
          })
        }
      }

      const unitario = precioUnitario(categoria, tipoConsumo)
      if (!unitario) {
        throw Object.assign(
          new Error('La categoria no tiene precio configurado para este tipo de consumo'),
          { statusCode: 400 },
        )
      }
      const precioBase = unitario * cantidad

      const { precioFinal, comisionTotal, comisionChica1, comisionChica2 } = calculateComision({
        precioBase,
        tipoConsumo,
        categoriaTipo: categoria.tipo,
        isAfterhour: categoria.isAfterhour,
        cantidadChicas: (chica1Id ? 1 : 0) + (chica2Id ? 1 : 0),
        comisionChicaCategoria: categoria.comisionChica ?? 0,
        comisionBotella: categoria.comision ?? 0,
        cortesia: cortesia ?? false,
        descuentoMonto: descuentoMonto ?? null,
        descuentoPorcentaje: descuentoPorcentaje ?? null,
        chica1Id: chica1Id ?? null,
        chica2Id: chica2Id ?? null,
        chicaRecibeComisionId: chicaRecibeComisionId ?? chica1Id ?? null,
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
          chicaRecibeComisionId:
            categoria.tipo === 'trago' || regla?.generaComision === false
              ? null
              : (chicaRecibeComisionId ?? chica1Id ?? null),
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
          cantidad,
          notas: notas ?? null,
          estadoCocina: regla?.usaCocina ? 'pendiente' : null,
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

    audit({
      user,
      accion: 'CREAR',
      tabla: 'Comanda',
      registroId: comanda.id,
      detalles: {
        cliente: comanda.clienteNombre,
        categoria: comanda.categoria.nombre,
        ...(comanda.cantidad > 1 ? { cantidad: comanda.cantidad } : {}),
        precioFinal: comanda.precioFinal,
        medioPago: comanda.medioPago,
        ...(comanda.cortesia ? { cortesia: true } : {}),
        ...(comanda.descuentoMonto || comanda.descuentoPorcentaje
          ? { descuentoMonto: comanda.descuentoMonto, descuentoPorcentaje: comanda.descuentoPorcentaje }
          : {}),
      },
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
