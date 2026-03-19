import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export default function Input({ hasError = false, className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-lg border bg-gray-800 px-3 py-2.5 text-white outline-none transition focus:border-purple-500 ${hasError ? 'border-red-500' : 'border-gray-700'} ${className}`.trim()}
      {...props}
    />
  )
}