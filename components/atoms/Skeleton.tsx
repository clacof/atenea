interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

const variantClasses = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
}

export default function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  }

  return (
    <div
      className={`animate-pulse bg-gray-700 ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/85 p-6">
      <Skeleton variant="text" className="h-4 w-20 mb-3" />
      <Skeleton variant="text" className="h-8 w-32" />
    </div>
  )
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-t border-gray-800">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton variant="text" className="h-4" />
        </td>
      ))}
    </tr>
  )
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" className="h-16 w-full" />
      ))}
    </div>
  )
}