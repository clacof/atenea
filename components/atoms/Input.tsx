import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  id?: string
}

export default function Input({ hasError = false, className = '', id, ...props }: InputProps) {
  return (
    <input
      id={id}
      className={`w-full rounded-lg border bg-gray-800 px-3 py-2.5 text-white outline-none transition focus:border-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${hasError ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-700'} ${className}`.trim()}
      aria-invalid={hasError}
      aria-describedby={hasError && id ? `${id}-error` : undefined}
      {...props}
    />
  )
}