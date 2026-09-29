'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { name: 'Turno Activo', href: '/dashboard/turno', icon: 'play' },
  { name: 'Nueva Comanda', href: '/dashboard/comandas/nueva', icon: 'plus' },
  { name: 'Comandas', href: '/dashboard/comandas', icon: 'clipboard' },
  { name: 'Caja', href: '/dashboard/caja', icon: 'wallet' },
  { name: 'Chicas', href: '/dashboard/chicas', icon: 'users' },
  { name: 'Categorias', href: '/dashboard/categorias', icon: 'tag' },
  { name: 'Reportes', href: '/dashboard/reportes', icon: 'chart' },
  { name: 'Usuarios', href: '/dashboard/usuarios', icon: 'user' },
  { name: 'Configuracion', href: '/dashboard/config', icon: 'settings' },
]

const icons: Record<string, React.ReactNode> = {
  dashboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6v-4.5ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25a2.25 2.25 0 0 1-2.25 2.25h-2.25v-4.5ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>,
  play: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M8 5.14v14l11-7-11-7Z" /></svg>,
  plus: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0-15h-7.5" /></svg>,
  clipboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75M12 3v6.75M5.25 3h6.5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-.75.75h-6.5a.75.75 0 0 1-.75-.75V3.75a.75.75 0 0 1 .75-.75ZM5.25 12h13.5a.75.75 0 0 0 .75-.75V5.25a.75.75 0 0 0-.75-.75H5.25a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 .75.75Z" /></svg>,
  wallet: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>,
  users: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.277-2.148-.76-3.06a2.085 2.085 0 0 0-1.107-.663l-.105-.023A12.21 12.21 0 0 1 8.025 9c-1.913 0-3.59.447-4.95 1.2l-.104.024a2.013 2.013 0 0 0-.88.664l-.072.108C2.416 12.39 2.25 13.325 2.25 14.1v.003M15 19.128c0 1.113.277 2.148.76 3.06a2.085 2.085 0 0 0 1.107.663l.105.023c.675.16 1.392.283 2.143.283 1.913 0 3.59-.447 4.95-1.2l.104-.024a2.012 2.012 0 0 0 .88-.664l.072-.108c.833-1.413.999-2.348.999-3.123v-.003M6 10.5V6a3 3 0 0 1 3-3h2.25M6 10.5V6c.954 0 1.873.185 2.72.467a4.125 4.125 0 0 1 3.06.597M6 10.5v3.75c0 .728.334 1.378.86 1.773a4.125 4.125 0 0 1 3.064.597M6 10.5V6a3 3 0 0 1 3-3h2.25" /></svg>,
  tag: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.71.699 2.409 0l6.069-6.059c.41-.41.67-.95.66-1.547V5.25A2.25 2.25 0 0 0 18.75 3H14.5a.75.75 0 0 1-.53-.84l-.105-.152a2.25 2.25 0 0 0-.74-.74H9.568Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0Z" /></svg>,
  chart: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
  user: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0ZM2.25 15.75c0-2.556 1.35-4.92 3.605-6.318A8.001 8.001 0 0 1 14.25 21c2.557 0 4.92-1.35 6.318-2.68A8.001 8.001 0 0 0 19.5 15.75c0-4.414-3.582-8-8-8Z" /></svg>,
  settings: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>,
}

function SidebarList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      <div className="mb-8 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-white">
        <div className="text-xs uppercase tracking-[0.3em] text-purple-200">Sistema</div>
        <div className="mt-1 text-xl font-bold">Atenea</div>
      </div>
      <ul className="space-y-1" role="list">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={pathname === item.href ? 'page' : undefined}
              className={cn(
                'flex items-center rounded-xl p-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
                pathname === item.href
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              )}
            >
              <span className="mr-3 flex h-5 w-5 items-center justify-center" aria-hidden="true">
                {icons[item.icon]}
              </span>
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

interface SidebarProps {
  variant?: 'desktop' | 'mobile'
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ variant = 'desktop', isOpen = true, onClose }: SidebarProps) {
  useEffect(() => {
    if (variant !== 'mobile') return
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, variant])

  if (variant === 'desktop') {
    return (
      <nav
        className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:border-r md:border-white/5 md:bg-slate-950/85 md:px-5 md:py-6 md:backdrop-blur-xl md:shadow-[0_0_35px_rgba(2,6,23,0.85)] md:overflow-y-auto"
        aria-label="Navegacion principal"
      >
        <SidebarList />
      </nav>
    )
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <nav
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/5 bg-slate-950/95 p-4 backdrop-blur transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Navegacion principal"
      >
        <SidebarList onNavigate={onClose} />
      </nav>
    </>
  )
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed left-4 top-4 z-30 rounded-lg bg-slate-800 p-2 text-white shadow-lg transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 md:hidden"
      aria-label="Abrir menu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    </button>
  )
}
