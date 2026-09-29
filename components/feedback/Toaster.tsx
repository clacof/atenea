'use client'

import { useEffect } from 'react'
import { useUIStore, type Toast } from '@/store/uiSlice'
import { cn } from '@/lib/utils'

const toneClasses: Record<Toast['type'], string> = {
  success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100',
  error: 'border-red-500/40 bg-red-950/90 text-red-100',
  warning: 'border-amber-500/40 bg-amber-950/90 text-amber-100',
  info: 'border-sky-500/40 bg-sky-950/90 text-sky-100',
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((state) => state.removeToast)

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, removeToast])

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur',
        toneClasses[toast.type],
      )}
    >
      <p className="flex-1 whitespace-pre-line">{toast.message}</p>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        className="-mr-1 rounded px-1 text-lg leading-none opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        aria-label="Cerrar notificacion"
      >
        ×
      </button>
    </div>
  )
}

export default function Toaster() {
  const toasts = useUIStore((state) => state.toasts)

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col gap-2 sm:left-auto sm:right-6 sm:w-96"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
