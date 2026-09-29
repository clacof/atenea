import { InputHTMLAttributes, forwardRef, useId } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', disabled, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className={`relative ${className}`}>
        <label
          htmlFor={inputId}
          className={`flex items-center gap-3 cursor-pointer select-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'group'
          }`}
        >
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`
                w-5 h-5 rounded border-2 transition-all duration-200
                bg-gray-800 border-gray-600
                peer-checked:bg-purple-600 peer-checked:border-purple-500
                peer-focus-visible:ring-2 peer-focus-visible:ring-purple-500/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-gray-900
                group-hover:border-purple-500/60
                ${disabled ? '' : 'group-hover:shadow-sm'}
              `}
            />
            <svg
              className={`
                absolute inset-0 w-5 h-5 m-auto
                text-white transition-all duration-200
                opacity-0 scale-75 peer-checked:opacity-100 peer-checked:scale-100
              `}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {label && (
            <span className="text-sm font-medium text-gray-200 peer-disabled:text-gray-500">
              {label}
            </span>
          )}
        </label>
        {error && (
          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  },
)

Checkbox.displayName = 'Checkbox'

export default Checkbox