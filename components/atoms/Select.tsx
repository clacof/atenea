import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
}

export default function Select({ hasError = false, className = '', ...props }: SelectProps) {
  return (
    <select
      className={`w-full rounded-lg border bg-gray-800 px-3 py-2.5 text-white outline-none transition focus:border-purple-500 ${hasError ? 'border-red-500' : 'border-gray-700'} ${className}`.trim()}
      {...props}
    />
  )
}