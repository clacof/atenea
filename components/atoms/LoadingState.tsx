interface LoadingStateProps {
  message?: string
}

export default function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  return <div className="py-10 text-center text-sm text-gray-400">{message}</div>
}