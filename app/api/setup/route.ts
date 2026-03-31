import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Crear usuario admin
    const hashedPassword = await bcrypt.hash('admin', 10)
    
    // Limpiar datos anteriores
    await prisma.comanda.deleteMany()
    await prisma.chica.deleteMany()
    await prisma.categoria.deleteMany()
    await prisma.usuario.deleteMany()
    
    const user = await prisma.usuario.create({
      data: {
        nombre: 'Admin',
        email: 'admin@atenea.com',
        passwordHash: hashedPassword,
        rol: 'admin',
      },
    })

    // Crear categorias de ejemplo
    await prisma.categoria.create({
      data: {
        nombre: 'Cockteleria / Trago preparado',
        precioCliente: 30000,
        precioChica: 35000,
        comisionChica: 12000,
      },
    })

    await prisma.categoria.create({
      data: {
        nombre: 'Vodka naranja',
        precioCliente: 20000,
        precioChica: 25000,
        comisionChica: 10000,
      },
    })

    // Crear chicas de ejemplo
    await prisma.chica.create({
      data: { nombre: 'Ana' },
    })

    await prisma.chica.create({
      data: { nombre: 'Maria' },
    })

    return NextResponse.json({
      message: 'Setup completado',
      user: { id: user.id, email: user.email, rol: user.rol }
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Error en setup', details: String(error) }, { status: 500 })
  }
}