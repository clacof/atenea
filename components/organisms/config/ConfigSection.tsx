import type { ReactNode } from 'react'
import Card from '../../atoms/Card'

interface ConfigSectionProps {
  title: string
  children: ReactNode
}

export default function ConfigSection({ title, children }: ConfigSectionProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      <div className="space-y-4">{children}</div>
    </Card>
  )
}