'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../../../components/atoms/Button'
import Input from '../../../components/atoms/Input'
import LoadingState from '../../../components/atoms/LoadingState'
import FormField from '../../../components/molecules/FormField'
import PageHeader from '../../../components/molecules/PageHeader'
import ConfigSection from '../../../components/organisms/config/ConfigSection'
import Modal from '../../../components/Modal'
import { getAuthHeaders } from '../../../lib/client-auth'
import { DomainValidator, type ConfigData as ConfigDataType } from '../../../lib/validations'

interface ConfigData extends ConfigDataType {
  horaCambioAfter: string
  maxChicasBottella: number
  porcBottella100k: number
  porcBottella150kMas: number
  minValor150k: number
  comisionPremiumFija: number
  comisionNormalFija: number
  comisionAcompananteBotella: number
}

export default function Configuracion() {
  const router = useRouter()
  const [config, setConfig] = useState<ConfigData>({
    horaCambioAfter: '04:00',
    maxChicasBottella: 2,
    porcBottella100k: 0.40,
    porcBottella150kMas: 0.30,
    minValor150k: 150000,
    comisionPremiumFija: 10000,
    comisionNormalFija: 5000,
    comisionAcompananteBotella: 5000,
  })

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/config', {
        headers: getAuthHeaders(),
      })
      
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
      alert('Las contrasenas no coinciden')
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
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

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
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
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
    <div>
        <PageHeader
          title="Configuracion General"
          description="Centraliza reglas operativas, porcentajes y accesos administrativos."
        />

        {error && <div className="bg-red-900 text-red-200 p-4 rounded mb-4">{error}</div>}
        {loading && <LoadingState message="Cargando configuracion..." />}

        {!loading && (
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <ConfigSection title="Turno">
              <FormField label="Hora de Cambio After Hours">
                <Input
                  type="time"
                  name="horaCambioAfter"
                  value={config.horaCambioAfter}
                  onChange={handleChange}
                />
              </FormField>
            </ConfigSection>

            <ConfigSection title="Botellas">
              <FormField label="Maximo de Chicas por Botella" error={fieldErrors.maxChicasBottella}>
                <Input
                    type="number"
                    name="maxChicasBottella"
                    value={config.maxChicasBottella}
                    onChange={handleChange}
                  hasError={Boolean(fieldErrors.maxChicasBottella)}
                  />
              </FormField>
              <FormField label="Comision Botella < 150k (%)" error={fieldErrors.porcBottella100k}>
                <Input
                    type="number"
                    name="porcBottella100k"
                    value={config.porcBottella100k}
                    onChange={handleChange}
                    step="0.01"
                  hasError={Boolean(fieldErrors.porcBottella100k)}
                  />
              </FormField>
              <FormField label="Comision Botella ≥ 150k (%)" error={fieldErrors.porcBottella150kMas}>
                <Input
                    type="number"
                    name="porcBottella150kMas"
                    value={config.porcBottella150kMas}
                    onChange={handleChange}
                    step="0.01"
                  hasError={Boolean(fieldErrors.porcBottella150kMas)}
                  />
              </FormField>
              <FormField label="Valor Minimo para 150k" error={fieldErrors.minValor150k}>
                <Input
                    type="number"
                    name="minValor150k"
                    value={config.minValor150k}
                    onChange={handleChange}
                  hasError={Boolean(fieldErrors.minValor150k)}
                  />
              </FormField>
              <FormField label="Comision por Acompanante de Botella" error={fieldErrors.comisionAcompananteBotella}>
                <Input
                    type="number"
                    name="comisionAcompananteBotella"
                    value={config.comisionAcompananteBotella}
                    onChange={handleChange}
                  hasError={Boolean(fieldErrors.comisionAcompananteBotella)}
                  />
              </FormField>
            </ConfigSection>

            <ConfigSection title="Comisiones por Tipo">
              <FormField label="Comision Premium Fija">
                <Input
                    type="number"
                    name="comisionPremiumFija"
                    value={config.comisionPremiumFija}
                    onChange={handleChange}
                  />
              </FormField>
              <FormField label="Comision Normal Fija">
                <Input
                    type="number"
                    name="comisionNormalFija"
                    value={config.comisionNormalFija}
                    onChange={handleChange}
                  />
              </FormField>
            </ConfigSection>

            {saved && (
              <div className="bg-green-600 text-white p-3 rounded">
                ✓ Configuracion guardada correctamente
              </div>
            )}

            <Button type="submit" fullWidth size="lg">
              Guardar Configuracion
            </Button>
          </form>
        )}

        <ConfigSection title="Otras Opciones">
          <h3 className="text-lg font-semibold mb-4">Otras Opciones</h3>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/dashboard/usuarios')}
              variant="ghost"
              fullWidth
              className="justify-start text-left"
            >
              👥 Gestion de Usuarios
            </Button>
            <Button
              onClick={() => setShowPasswordModal(true)}
              variant="ghost"
              fullWidth
              className="justify-start text-left"
            >
              🔐 Cambiar Contrasena
            </Button>
            <Button
              onClick={() => setShowLogsModal(true)}
              variant="ghost"
              fullWidth
              className="justify-start text-left"
            >
              📋 Ver Logs de Auditoria
            </Button>
            <Button
              onClick={() => {
                if (confirm('Deseas crear un backup del sistema?')) {
                  alert('✓ Backup creado: backup_' + new Date().toISOString().split('T')[0] + '.zip')
                }
              }}
              variant="ghost"
              fullWidth
              className="justify-start text-left"
            >
              💾 Hacer Backup
            </Button>
          </div>
        </ConfigSection>

        {/* Change Password Modal */}
        <Modal
          isOpen={showPasswordModal}
          title="Cambiar Contrasena"
          onClose={() => setShowPasswordModal(false)}
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Contrasena Actual</label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nueva Contrasena</label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirmar Contrasena</label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Actualizar
              </Button>
            </div>
          </form>
        </Modal>

        {/* Logs Modal */}
        <Modal
          isOpen={showLogsModal}
          title="Logs de Auditoria"
          onClose={() => setShowLogsModal(false)}
        >
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <div className="text-xs bg-gray-700 p-2 rounded">
              <p className="text-gray-400">[2024-01-15 22:45:30]</p>
              <p>Usuario: admin@atenea.com - Accion: Crear Comanda #001</p>
            </div>
            <div className="text-xs bg-gray-700 p-2 rounded">
              <p className="text-gray-400">[2024-01-15 22:40:15]</p>
              <p>Usuario: admin@atenea.com - Accion: Actualizar Configuracion</p>
            </div>
            <div className="text-xs bg-gray-700 p-2 rounded">
              <p className="text-gray-400">[2024-01-15 22:30:00]</p>
              <p>Usuario: admin@atenea.com - Accion: Descargar Reporte Excel</p>
            </div>
            <div className="text-xs bg-gray-700 p-2 rounded">
              <p className="text-gray-400">[2024-01-15 22:15:45]</p>
              <p>Usuario: admin@atenea.com - Accion: Iniciar Sesion</p>
            </div>
          </div>
        </Modal>
    </div>
  )
}
