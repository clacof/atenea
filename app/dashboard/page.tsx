import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import DashboardClient from './DashboardClient'

async function getStats() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  const [totalVentas, totalComisiones, comandasHoy] = await Promise.all([
    prisma.comanda.aggregate({
      where: { fecha: { gte: startOfDay, lte: endOfDay }, estado: { not: 'anulada' } },
      _sum: { precioFinal: true },
    }),
    prisma.comanda.aggregate({
      where: { fecha: { gte: startOfDay, lte: endOfDay }, estado: { not: 'anulada' } },
      _sum: { comisionTotal: true },
    }),
    prisma.comanda.count({
      where: { fecha: { gte: startOfDay, lte: endOfDay }, estado: { not: 'anulada' } },
    }),
  ])

  return {
    totalVentas: totalVentas._sum.precioFinal || 0,
    totalComisiones: totalComisiones._sum.comisionTotal || 0,
    comandasHoy,
  }
}

async function getRecentComandas() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  const comandas = await prisma.comanda.findMany({
    where: { fecha: { gte: startOfDay, lte: endOfDay } },
    orderBy: { fecha: 'desc' },
    take: 5,
    include: { categoria: { select: { nombre: true } } },
  })

  return comandas.map(c => ({
    ...c,
    fecha: c.fecha.toISOString(),
  }))
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const user = verifyToken(token)
  if (!user) {
    redirect('/login')
  }

  const [stats, comandas] = await Promise.all([getStats(), getRecentComandas()])

  const usuario = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { nombre: true },
  })

  const userWithName = { ...user, nombre: usuario?.nombre || 'Usuario' }

  return <DashboardClient user={userWithName} stats={stats} comandas={comandas} />
}