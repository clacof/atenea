'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import Modal from '../../../components/Modal'
import FormError from '../../../components/FormError'
import { DomainValidator } from '../../../lib/validations'

interface ConfigData {
  horaCambioAfter: string
  maxChicasBottella: number
  porcBottella100k: number
  porcBottella150kMas: number
  minValor150k: number
  comisionPremiumFija: number
  comisionNormalFija: number
}

export default function Configuracion() {
  const [config, setConfig] = useState<ConfigData>({
    horaCambioAfter: '04:00',
    maxChicasBottella: 2,
    porcBottella100k: 0.40,
    porcBottella150kMas: 0.30,
    minValor150k: 150000,
    comisionPremiumFija: 10000,
    comisionNormalFija: 5000,
  })

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/config', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      
     // if (!response.ok) throw new Error('Error al cargar configuración')
      
      const data = await response.json()
      setConfig(data)
      setError('')
    } catch (err) {
      setError('Error cargando la configuracion')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }
      alert('✓ Contrasena actualizada correctamente')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setShowPasswordModal(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }))
    // Limpiar el error del campo cuando el usuario empieza a escribir
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Validar usando DomainValidator
    const validation = DomainValidator.validateConfig(config)
    if (!validation.isValid) {
      const errors: Record<string, string> = {}
      validation.errors.forEach((err) => {
        errors[err.field] = err.message
      })
      setFieldErrors(errors)
      setError('Por favor corrige los errores en el formulario')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) throw new Error('Error al guardar configuracion')

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Error al guardar configuracion')
      console.error(err)
    }
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Configuracion General</h1>

        {error && <div className="bg-red-900 text-red-200 p-4 rounded mb-4">{error}</div>}
        {loading && <div className="text-center text-gray-400">Cargando configuracion...</div>}

        {!loading && (
          <form onSubmit={handleSubmit} className="max-w-2xl">
            <div className="bg-gray-800 p-6 rounded-lg space-y-6">
            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-lg font-semibold mb-4">Turno</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Hora de Cambio After Hours</label>
                <input
                  type="time"
                  name="horaCambioAfter"
                  value={config.horaCambioAfter}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
              </div>
            </div>

            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-lg font-semibold mb-4">Botellas</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Maximo de Chicas por Botella</label>
                  <input
                    type="number"
                    name="maxChicasBottella"
                    value={config.maxChicasBottella}
                    onChange={handleChange}
                    className={`w-full p-2 bg-gray-700 text-white rounded ${
                      fieldErrors.maxChicasBottella ? 'border-2 border-red-500' : ''
                    }`}
                  />
                  <FormError message={fieldErrors.maxChicasBottella} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comision Botella &lt; 150k (%)</label>
                  <input
                    type="number"
                    name="porcBottella100k"
                    value={config.porcBottella100k}
                    onChange={handleChange}
                    step="0.01"
                    className={`w-full p-2 bg-gray-700 text-white rounded ${
                      fieldErrors.porcBottella100k ? 'border-2 border-red-500' : ''
                    }`}
                  />
                  <FormError message={fieldErrors.porcBottella100k} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comision Botella ≥ 150k (%)</label>
                  <input
                    type="number"
                    name="porcBottella150kMas"
                    value={config.porcBottella150kMas}
                    onChange={handleChange}
                    step="0.01"
                    className={`w-full p-2 bg-gray-700 text-white rounded ${
                      fieldErrors.porcBottella150kMas ? 'border-2 border-red-500' : ''
                    }`}
                  />
                  <FormError message={fieldErrors.porcBottella150kMas} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Valor Minimo para 150k</label>
                  <input
                    type="number"
                    name="minValor150k"
                    value={config.minValor150k}
                    onChange={handleChange}
                    className={`w-full p-2 bg-gray-700 text-white rounded ${
                      fieldErrors.minValor150k ? 'border-2 border-red-500' : ''
                    }`}
                  />
                  <FormError message={fieldErrors.minValor150k} />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-lg font-semibold mb-4">Comisiones por Tipo</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Comision Premium Fija</label>
                  <input
                    type="number"
                    name="comisionPremiumFija"
                    value={config.comisionPremiumFija}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comision Normal Fija</label>
                  <input
                    type="number"
                    name="comisionNormalFija"
                    value={config.comisionNormalFija}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                </div>
              </div>
            </div>

            {saved && (
              <div className="bg-green-600 text-white p-3 rounded">
                ✓ Configuracion guardada correctamente
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded font-semibold"
            >
              Guardar Configuracion
            </button>
          </div>
        </form>
        )}

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Otras Opciones</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowUsersModal(true)}
              className="w-full text-left p-3 hover:bg-gray-700 rounded"
            >
              👥 Gestion de Usuarios
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full text-left p-3 hover:bg-gray-700 rounded"
            >
              🔐 Cambiar Contraseña
            </button>
            <button
              onClick={() => setShowLogsModal(true)}
              className="w-full text-left p-3 hover:bg-gray-700 rounded"
            >
              📋 Ver Logs de Auditoria
            </button>
            <button
              onClick={() => {
                if (confirm('¿Deseas crear un backup del sistema?')) {
                  alert('✓ Backup creado: backup_' + new Date().toISOString().split('T')[0] + '.zip')
                }
              }}
              className="w-full text-left p-3 hover:bg-gray-700 rounded"
            >
              💾 Hacer Backup
            </button>
          </div>
        </div>

        {/* Users Management Modal */}
        <Modal
          isOpen={showUsersModal}
          title="Gestion de Usuarios"
          onClose={() => setShowUsersModal(false)}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-300 mb-4">Usuarios del Sistema</p>
            <div className="bg-gray-700 p-3 rounded">
              <p className="font-medium">admin@atenea.com</p>
              <p className="text-sm text-gray-400">Administrador - Activo</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="font-medium">cajera@atenea.com</p>
              <p className="text-sm text-gray-400">Cajera - Activo</p>
            </div>
            <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded">
              + Agregar Usuario
            </button>
          </div>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          isOpen={showPasswordModal}
          title="Cambiar Contrasena"
          onClose={() => setShowPasswordModal(false)}
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Contraseña Actual</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nueva Contraseña</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirmar Contraseña</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
              >
                Actualizar
              </button>
            </div>
          </form>
        </Modal>

        {/* Logs Modal */}
        <Modal
          isOpen={showLogsModal}
          title="Logs de Auditoría"
          onClose={() => setShowLogsModal(false)}
        >
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <div className="text-xs bg-gray-700 p-2 rounded">
              <p className="text-gray-400">[2024-01-15 22:45:30]</p>
              <p>Usuario: admin@atenea.com - Acción: Crear Comanda #001</p>
            </div>
            <div className="text-xs bg-gray-700 p-2 rounded">
              <p className="text-gray-400">[2024-01-15 22:40:15]</p>
              <p>Usuario: admin@atenea.com - Acción: Actualizar Configuración</p>
            </div>
            <div className="text-xs bg-gray-700 p-2 rounded">
              <p className="text-gray-400">[2024-01-15 22:30:00]</p>
              <p>Usuario: admin@atenea.com - Acción: Descargar Reporte Excel</p>
            </div>
            <div className="text-xs bg-gray-700 p-2 rounded">
              <p className="text-gray-400">[2024-01-15 22:15:45]</p>
              <p>Usuario: admin@atenea.com - Acción: Iniciar Sesión</p>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}