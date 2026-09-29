import { InputHTMLAttributes, forwardRef, useId } from 'react'

interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  options: RadioOption[]
  onChange?: (value: string) => void
  error?: string
  className?: string
  label?: string
}

const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ options, onChange, error, className = '', disabled, label, ...props }, ref) => {
    const generatedId = useId()

    return (
      <div className={`flex flex-wrap gap-4 ${className}`}>
        {label && (
          <p className="block text-sm font-medium text-gray-200 w-full mb-1">{label}</p>
        )}
        {options.map((option, index) => {
          const inputId = `radio-${generatedId}-${option.value}-${index}`
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`
                flex items-center gap-3 cursor-pointer select-none
                ${disabled || option.disabled ? 'opacity-50 cursor-not-allowed' : 'group'}
              `}
            >
              <div className="relative">
                <input
                  ref={ref}
                  type="radio"
                  id={inputId}
                  disabled={disabled || option.disabled}
                  value={option.value}
                  onChange={() => onChange?.(option.value)}
                  className="peer sr-only"
                  {...props}
                />
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 transition-all duration-200
                    bg-gray-800 border-gray-600
                    peer-checked:bg-purple-600 peer-checked:border-purple-500
                    peer-focus-visible:ring-2 peer-focus-visible:ring-purple-500/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-gray-900
                    group-hover:border-purple-500/60
                  `}
                />
                <div
                  className={`
                    absolute inset-[5px] rounded-full bg-white
                    transition-all duration-200
                    opacity-0 scale-0 peer-checked:opacity-100 peer-checked:scale-100
                  `}
                />
              </div>
              <span className="text-sm font-medium text-gray-200 peer-disabled:text-gray-500">
                {option.label}
              </span>
            </label>
          )
        })}
        {error && (
          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 w-full">
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

RadioGroup.displayName = 'RadioGroup'

export default RadioGroup