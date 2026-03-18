import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getUserFromRequest } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const comandas = await prisma.comanda.findMany({
      include: {
        categoria: true,
        chica1: true,
        chica2: true,
        usuario: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    })

    return NextResponse.json(comandas)
  } catch (error) {
    console.error('Error fetching comandas:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: `Error al obtener comandas: ${errorMessage}` }, { status: 500 })
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

    // Validar que el usuario exista en la base de datos
    const usuarioEnBD = await prisma.usuario.findUnique({
      where: { id: user.id },
    })

    if (!usuarioEnBD || !usuarioEnBD.activo) {
      return NextResponse.json({ error: 'Usuario no encontrado o inactivo' }, { status: 401 })
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id: categoriaId },
    })

    if (!categoria) {
      return NextResponse.json({ error: 'Categoria no encontrada' }, { status: 400 })
    }

    // Validar que las chicas existan
    if (chica1Id) {
      const chica1 = await prisma.chica.findUnique({
        where: { id: chica1Id },
      })
      if (!chica1) {
        return NextResponse.json({ error: 'Chica 1 no encontrada' }, { status: 400 })
      }
    }

    if (chica2Id) {
      const chica2 = await prisma.chica.findUnique({
        where: { id: chica2Id },
      })
      if (!chica2) {
        return NextResponse.json({ error: 'Chica 2 no encontrada' }, { status: 400 })
      }
    }

    let precioBase = tipoConsumo === 'cliente' ? categoria.precioCliente : categoria.precioChica

    if (!precioBase) {
      return NextResponse.json({ error: 'La categoria no tiene precio configurado para este tipo de consumo' }, { status: 400 })
    }

    let precioFinal = precioBase
    if (cortesia) {
      precioFinal = 0
    } else {
      if (descuentoMonto) {
        precioFinal -= descuentoMonto
      }
      if (descuentoPorcentaje) {
        precioFinal -= precioFinal * (descuentoPorcentaje / 100)
      }
    }

    // Calculate commission
    let comisionTotal = 0
    let comisionChica1 = 0
    let comisionChica2 = 0

    if (tipoConsumo === 'cliente') {
      comisionTotal = 0
    } else {
      if (precioBase >= 150000) {
        comisionTotal = precioFinal * 0.3
      } else {
        comisionTotal = precioFinal * 0.4
      }

      if (chica1Id && chica2Id) {
        comisionChica1 = comisionTotal / 2
        comisionChica2 = comisionTotal / 2
      } else if (chica1Id) {
        comisionChica1 = comisionTotal
      }
    }

    const hora = new Date().toTimeString().split(' ')[0]

    const comanda = await prisma.comanda.create({
      data: {
        categoriaId,
        tipoConsumo,
        chica1Id: chica1Id || null,
        chica2Id: chica2Id || null,
        precioBase,
        precioFinal,
        comisionTotal,
        comisionChica1,
        comisionChica2,
        descuentoPorcentaje: descuentoPorcentaje || null,
        descuentoMonto: descuentoMonto || null,
        cortesia: cortesia || false,
        medioPago,
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

    return NextResponse.json(comanda, { status: 201 })
  } catch (error) {
    console.error('Error creating comanda:', error)
    
    // Loguear detalles del error de Prisma
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      if ('code' in error) {
        console.error('Error code:', (error as any).code)
      }
      if ('meta' in error) {
        console.error('Error meta:', (error as any).meta)
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: `Error al crear comanda: ${errorMessage}` }, { status: 500 })
  }
}