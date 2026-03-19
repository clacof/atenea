interface StatusBadgeProps {
  tone: 'success' | 'danger' | 'warning' | 'neutral'
  children: string
}

const toneClasses = {
  success: 'bg-green-500/15 text-green-300 ring-green-500/30',
  danger: 'bg-red-500/15 text-red-300 ring-red-500/30',
  warning: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  neutral: 'bg-gray-500/15 text-gray-300 ring-gray-500/30',
}

export default function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}