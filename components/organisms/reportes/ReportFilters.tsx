import Button from '../../atoms/Button'
import Card from '../../atoms/Card'
import Input from '../../atoms/Input'
import FormField from '../../molecules/FormField'

const REPORT_TYPES = [
  { value: 'diario', label: 'Diario', icon: '📅' },
  { value: 'semanal', label: 'Semanal', icon: '📊' },
  { value: 'mensual', label: 'Mensual', icon: '🗓️' },
  { value: 'anual', label: 'Anual', icon: '📈' },
] as const

interface ReportFiltersProps {
  tipoReporte: 'diario' | 'semanal' | 'mensual' | 'anual'
  fechaSeleccionada: string
  semanaSeleccionada?: string
  mesSeleccionado: string
  anioSeleccionado: string
  periodoActual?: string
  onTipoReporteChange: (value: 'diario' | 'semanal' | 'mensual' | 'anual') => void
  onFechaChange: (value: string) => void
  onSemanaChange?: (value: string) => void
  onMesChange: (value: string) => void
  onAnioChange: (value: string) => void
  onApply: () => void
}

export default function ReportFilters({
  tipoReporte,
  fechaSeleccionada,
  semanaSeleccionada,
  mesSeleccionado,
  anioSeleccionado,
  periodoActual,
  onTipoReporteChange,
  onFechaChange,
  onSemanaChange,
  onMesChange,
  onAnioChange,
  onApply,
}: ReportFiltersProps) {
  return (
    <Card className="mb-6 overflow-hidden">
      {/* Segmented report type selector */}
      <div className="flex border-b border-gray-800">
        {REPORT_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onTipoReporteChange(type.value)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-all relative
              ${tipoReporte === type.value
                ? 'text-purple-300 bg-purple-500/10'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
          >
            <span className="text-base">{type.icon}</span>
            <span>{type.label}</span>
            {tipoReporte === type.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
        ))}
      </div>

      {/* Date selector + apply */}
      <div className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {tipoReporte === 'diario' && (
            <div className="flex-1 max-w-xs">
              <FormField label="Fecha del reporte">
                <Input type="date" value={fechaSeleccionada} onChange={(event) => onFechaChange(event.target.value)} />
              </FormField>
            </div>
          )}

          {tipoReporte === 'semanal' && (
            <div className="flex-1 max-w-xs">
              <FormField label="Seleccionar cualquier dia de la semana">
                <Input type="date" value={semanaSeleccionada || fechaSeleccionada} onChange={(event) => onSemanaChange?.(event.target.value)} />
              </FormField>
            </div>
          )}

          {tipoReporte === 'mensual' && (
            <div className="flex-1 max-w-xs">
              <FormField label="Mes del reporte">
                <Input type="month" value={mesSeleccionado} onChange={(event) => onMesChange(event.target.value)} />
              </FormField>
            </div>
          )}

          {tipoReporte === 'anual' && (
            <div className="flex-1 max-w-xs">
              <FormField label="Año del reporte">
                <Input type="number" min="2020" max="2100" value={anioSeleccionado} onChange={(event) => onAnioChange(event.target.value)} className="w-36" />
              </FormField>
            </div>
          )}

          <Button onClick={onApply} size="lg">
            Aplicar filtro
          </Button>
        </div>

        {/* Period indicator */}
        {periodoActual && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-800/60 px-4 py-2.5 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-gray-400">Periodo:</span>
            <span className="font-medium text-gray-200">{periodoActual}</span>
          </div>
        )}
      </div>
    </Card>
  )
}