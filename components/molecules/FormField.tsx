import { Children, cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react'
import FormError from '../FormError'

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

type ControlProps = { id?: string; 'aria-describedby'?: string }

export default function FormField({ label, error, hint, children }: FormFieldProps) {
  const generatedId = useId()

  // Asocia el label y el error al control si el hijo es un unico elemento
  const only = Children.count(children) === 1 && isValidElement(children) ? (children as ReactElement<ControlProps>) : null
  const controlId = only?.props.id ?? generatedId
  const errorId = `${controlId}-error`
  const hintId = `${controlId}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  const control = only
    ? cloneElement(only, {
        id: controlId,
        'aria-describedby': [only.props['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined,
      })
    : children

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={only ? controlId : undefined} className="text-sm font-medium text-gray-200">
        {label}
      </label>
      {control}
      {hint ? <p id={hintId} className="mt-2 text-xs text-gray-500">{hint}</p> : null}
      <FormError id={errorId} message={error} />
    </div>
  )
}
