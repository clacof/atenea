'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Turno Activo', href: '/dashboard/turno', icon: '🟢' },
  { name: 'Nueva Comanda', href: '/dashboard/comandas/nueva', icon: '➕' },
  { name: 'Comandas', href: '/dashboard/comandas', icon: '📋' },
  { name: 'Caja', href: '/dashboard/caja', icon: '💰' },
  { name: 'Chicas', href: '/dashboard/chicas', icon: '👩' },
  { name: 'Categorias', href: '/dashboard/categorias', icon: '🏷️' },
  { name: 'Reportes', href: '/dashboard/reportes', icon: '📈' },
  { name: 'Usuarios', href: '/dashboard/usuarios', icon: '👤' },
  { name: 'Configuracion', href: '/dashboard/config', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="min-h-screen w-64 border-r border-white/5 bg-slate-950/80 p-4 backdrop-blur">
      <div className="mb-8 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-white">
        <div className="text-xs uppercase tracking-[0.3em] text-purple-200">Sistema</div>
        <div className="mt-1 text-xl font-bold">Atenea</div>
      </div>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center rounded-xl p-3 transition-colors ${
                  pathname === item.href
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}