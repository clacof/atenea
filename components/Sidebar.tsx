'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Nueva Comanda', href: '/dashboard/comandas/nueva', icon: '➕' },
  { name: 'Comandas', href: '/dashboard/comandas', icon: '📋' },
  { name: 'Caja', href: '/dashboard/caja', icon: '💰' },
  { name: 'Chicas', href: '/dashboard/chicas', icon: '👩' },
  { name: 'Categorías', href: '/dashboard/categorias', icon: '🏷️' },
  { name: 'Reportes', href: '/dashboard/reportes', icon: '📈' },
  { name: 'Configuración', href: '/dashboard/config', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="bg-gray-800 w-64 min-h-screen p-4">
      <div className="text-white text-xl font-bold mb-8">Atenea</div>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
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