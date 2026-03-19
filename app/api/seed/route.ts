import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Limpiar datos anteriores
    await prisma.comanda.deleteMany()
    await prisma.chica.deleteMany()
    await prisma.categoria.deleteMany()
    await prisma.usuario.deleteMany()
    await prisma.configGeneral.deleteMany()

    // Config general
    await prisma.configGeneral.createMany({
      data: [
        { clave: 'HORA_CAMBIO_AFTER', valor: '04:00', descripcion: 'Hora de cambio de turno' },
        { clave: 'MAX_CHICAS_BOTELLA', valor: '2', descripcion: 'Máximo de chicas por botella' },
        { clave: 'PORC_BOTELLA_100K', valor: '0.40', descripcion: 'Porcentaje comisión botella < 150k' },
        { clave: 'PORC_BOTELLA_150K_MAS', valor: '0.30', descripcion: 'Porcentaje comisión botella >= 150k' },
        { clave: 'MIN_VALOR_150K', valor: '150000', descripcion: 'Valor mínimo para porcentaje 30%' },
        { clave: 'COMISION_PREMIUM_FIJA', valor: '10000', descripcion: 'Comisión fija premium' },
        { clave: 'COMISION_NORMAL_FIJA', valor: '5000', descripcion: 'Comisión fija normal' },
      ],
    })

    // Categorías
    await prisma.categoria.createMany({
      data: [
        { nombre: 'Cocktelería / Trago preparado', precioCliente: 30000, precioChica: 35000, comisionChica: 12000 },
        { nombre: 'Vodka naranja', precioCliente: 20000, precioChica: 25000, comisionChica: 10000 },
      ],
    })

    // Usuario admin
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.usuario.create({
      data: {
        nombre: 'Admin',
        email: 'admin@atenea.com',
        passwordHash: hashedPassword,
        rol: 'admin',
      },
    })

    // Chicas de ejemplo
    await prisma.chica.createMany({
      data: [
        { nombre: 'Ana' },
        { nombre: 'Maria' },
        { nombre: 'Sofia' },
      ],
    })

    return NextResponse.json({ message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json({ error: 'Seeding failed', details: String(error) }, { status: 500 })
  }
}