'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormValidator } from '../../lib/validations'
import FormError from '../../components/FormError'

export default function Login() {
  const [email, setEmail] = useState('admin@atenea.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const validateForm = (): boolean => {
    const validator = new FormValidator()
    validator.email(email, 'email').password(password, 'password', 6)

    const result = validator.getResult()
    const errors: Record<string, string> = {}

    result.errors.forEach((err) => {
      errors[err.field] = err.message
    })

    setFieldErrors(errors)
    return result.isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Error de autenticación')
        return
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Atenea Night Club</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.email) {
                  setFieldErrors({ ...fieldErrors, email: '' })
                }
              }}
              className={`w-full p-2 bg-gray-700 text-white rounded ${
                fieldErrors.email ? 'border-2 border-red-500' : ''
              }`}
            />
            <FormError message={fieldErrors.email} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) {
                  setFieldErrors({ ...fieldErrors, password: '' })
                }
              }}
              className={`w-full p-2 bg-gray-700 text-white rounded ${
                fieldErrors.password ? 'border-2 border-red-500' : ''
              }`}
            />
            <FormError message={fieldErrors.password} />
          </div>
          {error && <p className="bg-red-900 text-red-200 p-3 rounded mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}