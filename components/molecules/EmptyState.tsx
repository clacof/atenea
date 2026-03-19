interface EmptyStateProps {
  title: string
  description?: string
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="py-10 text-center text-gray-400">
      <p className="font-medium text-gray-300">{title}</p>
      {description ? <p className="mt-1 text-sm">{description}</p> : null}
    </div>
  )
}