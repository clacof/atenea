import type { ReactNode } from 'react'
import FormError from '../FormError'

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

export default function FormField({ label, error, hint, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-200">{label}</label>
      {children}
      {hint ? <p className="mt-2 text-xs text-gray-500">{hint}</p> : null}
      <FormError message={error} />
    </div>
  )
}