import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function main() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Iniciando seed...')
    
    // Limpiar datos anteriores
    await prisma.comanda.deleteMany()
    await prisma.chica.deleteMany()
    await prisma.categoria.deleteMany()
    await prisma.usuario.deleteMany()
    await prisma.configGeneral.deleteMany()

    console.log('Datos anteriores eliminados')

    // Config general
    await prisma.configGeneral.createMany({
      data: [
        { clave: 'HORA_CAMBIO_AFTER', valor: '04:00', descripcion: 'Hora de cambio de turno' },
        { clave: 'MAX_CHICAS_BOTELLA', valor: '2', descripcion: 'Maximo de chicas por botella' },
        { clave: 'PORC_BOTELLA_100K', valor: '0.40', descripcion: 'Porcentaje comision botella < 150k' },
        { clave: 'PORC_BOTELLA_150K_MAS', valor: '0.30', descripcion: 'Porcentaje comision botella >= 150k' },
        { clave: 'MIN_VALOR_150K', valor: '150000', descripcion: 'Valor minimo para porcentaje 30%' },
        { clave: 'COMISION_PREMIUM_FIJA', valor: '10000', descripcion: 'Comision fija premium' },
        { clave: 'COMISION_NORMAL_FIJA', valor: '5000', descripcion: 'Comision fija normal' },
      ],
    })

    console.log('Configuración general creada')

    // Categorías
    await prisma.categoria.createMany({
      data: [
        { nombre: 'Cockteles / Trago preparado', precioCliente: 30000, precioChica: 35000, comisionChica: 12000 },
        { nombre: 'Vodka naranja', precioCliente: 20000, precioChica: 25000, comisionChica: 10000 },
        { nombre: 'Botella Premium', precioCliente: 150000, precioChica: 160000, comisionChica: 48000 },
        { nombre: 'Botella Super Premium', precioCliente: 250000, precioChica: 270000, comisionChica: 81000 },
      ],
    })

    console.log('Categorías creadas')

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

    console.log('Usuario admin creado')

    // Chicas de ejemplo
    await prisma.chica.createMany({
      data: [
        { nombre: 'Ana' },
        { nombre: 'Maria' },
        { nombre: 'Sofia' },
        { nombre: 'Valentina' },
        { nombre: 'Lucia' },
      ],
    })

    console.log('Chicas creadas')

    console.log('✅ Seed completado exitosamente!')
  } catch (e) {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()