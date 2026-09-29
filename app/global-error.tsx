'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[Global Error]:', error)
  }, [error])

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="max-w-md w-full mx-4 p-6 bg-gray-800 rounded-lg border border-red-500/30">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-white mb-2">
                Error Crítico
              </h2>
              <p className="text-gray-400 mb-6 text-sm">
                {error.message || 'Ocurrió un error inesperado. Por favor recarga la página.'}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => reset()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}