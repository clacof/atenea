'use client'

import React, { useEffect, useId, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}

// Pila de modales abiertos: solo el de arriba responde a Escape y Tab
const openStack: string[] = []

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
}: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    openStack.push(titleId)

    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    // Foco inicial: primer campo del formulario, o el panel
    const first = panel?.querySelector<HTMLElement>(
      'input:not([disabled]):not([type="hidden"]):not(.sr-only), select:not([disabled]), textarea:not([disabled])',
    )
    ;(first ?? panel)?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (openStack[openStack.length - 1] !== titleId) return
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !panel) return

      // Mantener el foco dentro del modal
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (focusables.length === 0) return
      const firstEl = focusables[0]
      const lastEl = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const index = openStack.lastIndexOf(titleId)
      if (index !== -1) openStack.splice(index, 1)
      previouslyFocused?.focus?.()
    }
  }, [isOpen, titleId])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-gray-800 rounded-t-2xl sm:rounded-xl max-w-lg w-full shadow-2xl border border-gray-700 flex flex-col max-h-[92dvh] sm:max-h-[90dvh] focus:outline-none"
      >
        <div className="border-b border-gray-700 px-5 py-4 flex justify-between items-center shrink-0">
          <h2 id={titleId} className="text-lg sm:text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
