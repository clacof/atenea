import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export default function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-8 rounded-3xl border border-white/5 bg-white/5/0 bg-gradient-to-br from-white/5 via-white/0 to-white/5 px-6 py-6 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur',
        className
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-purple-200/80">Resumen</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-white md:text-4xl">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm text-gray-300">{description}</p> : null}
        </div>
        {actions ? (
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto md:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}
