'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'
import { isSessionExpired, getSessionExpiry, logout } from '../lib/client-auth'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }

    if (isSessionExpired()) {
      logout().then(() => router.push('/login'))
      return
    }

    const expiry = getSessionExpiry()
    if (expiry) {
      const msLeft = expiry - Date.now()
      timerRef.current = setTimeout(() => {
        logout().then(() => router.push('/login'))
      }, msLeft)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [router])

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(88,28,135,0.18),_transparent_35%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)] text-white">
      <Sidebar />
      <div className="flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </div>
    </div>
  )
}