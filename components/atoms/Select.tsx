import { useState, useRef, useEffect, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'

interface Option {
  value: string | number
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: Option[]
  hasError?: boolean
  id?: string
  label?: string
  placeholder?: string
  error?: string
  onChange?: (value: string) => void
}

export default function Select({
  options,
  hasError = false,
  id,
  label,
  placeholder = 'Seleccionar...',
  error,
  onChange,
  value,
  className = '',
  ...props
}: SelectProps) {
  const generatedId = useId()
  const baseId = id ?? generatedId
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedOption = options.find((opt) => String(opt.value) === String(value))

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault()
      setIsOpen(true)
      return
    }

    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleSelect(options[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const handleSelect = (option: Option) => {
    if (option.disabled) return
    onChange?.(String(option.value))
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const baseClasses = `
    relative flex items-center justify-between gap-2
    w-full px-4 py-2.5 text-sm font-medium
    bg-gray-800/80 text-white
    border rounded-lg cursor-pointer
    transition-all duration-200 ease-out
    focus:outline-none
  `

  const stateClasses = hasError || error
    ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
    : isOpen
      ? 'border-purple-500/60 ring-2 ring-purple-500/20'
      : 'border-gray-700/60 hover:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label
          id={`${baseId}-label`}
          htmlFor={baseId}
          className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <button
        type="button"
        id={baseId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${baseId}-listbox`}
        aria-activedescendant={isOpen && highlightedIndex >= 0 ? `${baseId}-option-${highlightedIndex}` : undefined}
        aria-labelledby={label ? `${baseId}-label` : undefined}
        disabled={props.disabled}
        onClick={() => !props.disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`${baseClasses} ${stateClasses} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={`truncate ${selectedOption ? 'text-white' : 'text-gray-500'}`}>
          {selectedOption?.label || placeholder}
        </span>
        <span className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={`${baseId}-listbox`}
          role="listbox"
          className="absolute z-50 w-full mt-1.5 py-1.5
            bg-gray-800/95 backdrop-blur-sm
            border border-gray-700/50 rounded-lg shadow-2xl shadow-black/40
            overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {options.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-gray-500 italic">
              Sin opciones disponibles
            </li>
          ) : (
            options.map((option, index) => (
              <li
                key={option.value}
                id={`${baseId}-option-${index}`}
                role="option"
                aria-selected={String(option.value) === String(value)}
                aria-disabled={option.disabled}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`
                  relative px-4 py-2.5 text-sm cursor-pointer
                  transition-colors duration-100
                  ${option.disabled
                    ? 'text-gray-600 cursor-not-allowed'
                    : highlightedIndex === index
                      ? 'bg-purple-500/20 text-purple-100'
                      : 'text-gray-200 hover:bg-gray-700/50'
                  }
                  ${String(option.value) === String(value) ? 'font-medium text-white' : ''}
                `}
              >
                <span className="flex items-center gap-2">
                  {option.label}
                  {String(option.value) === String(value) && (
                    <svg className="w-4 h-4 text-purple-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </li>
            ))
          )}
        </ul>
      )}

      {(hasError || error) && error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}