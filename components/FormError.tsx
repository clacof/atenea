interface FormErrorProps {
  message?: string | null
}

export default function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return <p className="text-red-400 text-sm mt-1">{message}</p>
}
