import Card from '../atoms/Card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  helper?: string
  accent?: 'green' | 'blue' | 'purple' | 'orange'
}

const accentStyles: Record<NonNullable<MetricCardProps['accent']>, { glow: string; text: string }> = {
  green: { glow: 'from-emerald-400/40 via-emerald-500/5 to-transparent', text: 'text-emerald-300' },
  blue: { glow: 'from-sky-400/40 via-sky-500/5 to-transparent', text: 'text-sky-300' },
  purple: { glow: 'from-purple-400/40 via-purple-500/5 to-transparent', text: 'text-purple-300' },
  orange: { glow: 'from-orange-400/40 via-orange-500/5 to-transparent', text: 'text-orange-300' },
}

export default function MetricCard({ label, value, helper, accent = 'purple' }: MetricCardProps) {
  const accentStyle = accentStyles[accent]

  return (
    <Card className="relative overflow-hidden border-white/5 bg-slate-950/40 p-5">
      <div className={cn('pointer-events-none absolute inset-0 opacity-70 blur-3xl', `bg-gradient-to-br ${accentStyle.glow}`)} aria-hidden="true" />
      <div className="relative flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">{label}</p>
        <p className={cn('text-3xl font-semibold leading-tight', accentStyle.text)}>{value}</p>
        {helper ? <p className="text-sm text-gray-400">{helper}</p> : null}
      </div>
    </Card>
  )
}
