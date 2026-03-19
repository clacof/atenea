import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-2xl border border-gray-800 bg-gray-900/85 shadow-sm ${className}`.trim()}>
      {children}
    </div>
  )
}