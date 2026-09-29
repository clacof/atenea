import Link from 'next/link'
import Button from '@/components/atoms/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full mx-4 p-6 bg-gray-800 rounded-lg border border-gray-700">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Página No Encontrada
          </h2>
          <p className="text-gray-400 mb-6">
            La página que buscas no existe o ha sido movida.
          </p>
          <Link href="/dashboard">
            <Button>
              Volver al Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}