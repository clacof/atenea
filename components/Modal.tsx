import React from 'react'

interface ModalProps {
  isOpen: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
}: ModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-gray-800 rounded-t-2xl sm:rounded-xl max-w-lg w-full shadow-2xl border border-gray-700 flex flex-col max-h-[92dvh] sm:max-h-[90dvh]">
        <div className="border-b border-gray-700 px-5 py-4 flex justify-between items-center shrink-0">
          <h2 id="modal-title" className="text-lg sm:text-xl font-bold">{title}</h2>
          <button
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
