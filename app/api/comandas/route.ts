import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { calculateComision } from '@/lib/businessRules'

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
      descuentoPorcentaje,
      descuentoMonto,
      cortesia,
      medioPago,
      clienteNombre,
    } = data

    // Validación de campos requeridos
    if (!categoriaId) {
      return NextResponse.json({ error: 'Categoria es requerida' }, { status: 400 })
    }
    if (!tipoConsumo) {
      return NextResponse.json({ error: 'Tipo de consumo es requerido' }, { status: 400 })
    }
    if (!medioPago) {
      return NextResponse.json({ error: 'Medio de pago es requerido' }, { status: 400 })
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

      if (chica1Id) {
        const chica1 = await tx.chica.findUnique({ where: { id: chica1Id } })
        if (!chica1 || !chica1.activa) {
          throw Object.assign(new Error('Chica 1 no encontrada'), { statusCode: 400 })
        }
      }

      if (chica2Id) {
        const chica2 = await tx.chica.findUnique({ where: { id: chica2Id } })
        if (!chica2 || !chica2.activa) {
          throw Object.assign(new Error('Chica 2 no encontrada'), { statusCode: 400 })
        }
      }

      const precioBase = tipoConsumo === 'cliente' ? categoria.precioCliente : categoria.precioChica
      if (!precioBase) {
        throw Object.assign(
          new Error('La categoria no tiene precio configurado para este tipo de consumo'),
          { statusCode: 400 },
        )
      }

      const { precioFinal, comisionTotal, comisionChica1, comisionChica2 } = calculateComision({
        precioBase,
        tipoConsumo,
        cortesia: cortesia ?? false,
        descuentoMonto: descuentoMonto ?? null,
        descuentoPorcentaje: descuentoPorcentaje ?? null,
        chica1Id: chica1Id ?? null,
        chica2Id: chica2Id ?? null,
      })

      const hora = new Date().toTimeString().split(' ')[0]

      const clienteNombreSanitized =
        typeof clienteNombre === 'string' && clienteNombre.trim() !== ''
          ? clienteNombre.trim().slice(0, 100)
          : null

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