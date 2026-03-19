import Card from '../atoms/Card'

interface MetricCardProps {
  label: string
  value: string | number
  accent?: 'green' | 'blue' | 'purple' | 'orange'
}

const accentClasses = {
  green: 'text-green-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
}

export default function MetricCard({ label, value, accent = 'purple' }: MetricCardProps) {
  return (
    <Card className="p-6">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-3 text-3xl font-bold ${accentClasses[accent]}`}>{value}</p>
    </Card>
  )
}