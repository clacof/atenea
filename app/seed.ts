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
        { clave: 'horaCambioAfter', valor: '04:00', descripcion: 'Hora de cambio de turno' },
        { clave: 'maxChicasBottella', valor: '2', descripcion: 'Maximo de chicas por botella' },
        { clave: 'porcBottella100k', valor: '0.40', descripcion: 'Porcentaje comision botella < 150k' },
        { clave: 'porcBottella150kMas', valor: '0.30', descripcion: 'Porcentaje comision botella >= 150k' },
        { clave: 'minValor150k', valor: '150000', descripcion: 'Valor minimo para porcentaje 30%' },
        { clave: 'comisionPremiumFija', valor: '10000', descripcion: 'Comision fija premium' },
        { clave: 'comisionNormalFija', valor: '5000', descripcion: 'Comision fija normal' },
        { clave: 'comisionAcompananteBotella', valor: '5000', descripcion: 'Comision por chica adicional acompanando botella' },
      ],
    })

    console.log('Configuracion general creada')

    // Categorias
    await prisma.categoria.createMany({
      data: [
        { nombre: 'Cockteles / Trago preparado', tipo: 'trago', precioCliente: 30000, precioChica: 35000, comisionChica: 12000 },
        { nombre: 'Vodka naranja', tipo: 'trago', precioCliente: 20000, precioChica: 25000, comisionChica: 10000 },
        { nombre: 'Botella Premium', tipo: 'botella', precio: 150000 },
        { nombre: 'Botella Super Premium', tipo: 'botella', precio: 250000 },
        { nombre: 'After Hour', tipo: 'trago', isAfterhour: true, precioCliente: 80000, precioChica: 80000, comisionChica: 0 },
      ],
    })

    console.log('Categorias creadas')

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