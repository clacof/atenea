'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar, { SidebarToggle } from '../components/Sidebar'
import { isSessionExpired, logout, useAuthStore } from '../store/authSlice'
import { useUIStore } from '../store'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export default function DashboardLayout({ children, showSidebar = true }: DashboardLayoutProps) {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)

  useEffect(() => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (isSessionExpired()) {
      logout().then(() => router.push('/login'))
      return
    }

    const expiresAt = useAuthStore.getState().sessionExpiresAt
    if (expiresAt) {
      const msLeft = expiresAt - Date.now()
      timerRef.current = setTimeout(() => {
        logout().then(() => router.push('/login'))
      }, msLeft)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [router])

  const handleSidebarClose = () => setSidebarOpen(false)

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(88,28,135,0.18),_transparent_35%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)] text-white">
      {showSidebar && (
        <>
          <Sidebar variant="desktop" />
          <Sidebar variant="mobile" isOpen={sidebarOpen} onClose={handleSidebarClose} />
          <SidebarToggle onClick={() => setSidebarOpen(true)} />
        </>
      )}
      <main
        className={cn(
          'relative z-0 px-4 pb-12 pt-20 sm:px-6 md:pb-14 md:pt-10 lg:px-12',
          showSidebar && 'md:ml-64'
        )}
        role="main"
      >
        <div className="mx-auto w-full max-w-7xl space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}
