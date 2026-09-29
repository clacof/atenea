interface FormErrorProps {
  message?: string | null
  id?: string
}

export default function FormError({ message, id }: FormErrorProps) {
  if (!message) return null

  return (
    <p id={id} className="text-red-400 text-sm mt-1" role="alert">
      {message}
    </p>
  )
}
