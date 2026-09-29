import Button from '../../atoms/Button'
import Card from '../../atoms/Card'
import Input from '../../atoms/Input'
import FormField from '../../molecules/FormField'

const REPORT_TYPES = [
  { value: 'diario', label: 'Diario', icon: 'calendar' },
  { value: 'semanal', label: 'Semanal', icon: 'calendar-range' },
  { value: 'mensual', label: 'Mensual', icon: 'calendar-days' },
  { value: 'anual', label: 'Anual', icon: 'calendar-check' },
] as const

const reportIcons: Record<string, React.ReactNode> = {
  calendar: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>,
  'calendar-range': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5M12 9.75l-1.5 1.5M12 9.75l1.5 1.5M12 9.75V12" /></svg>,
  'calendar-days': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5M8 15m-1.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0ZM12 15m-1.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0ZM16 15m-1.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z" /></svg>,
  'calendar-check': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
}

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
      <div className="flex border-b border-gray-800" role="tablist" aria-label="Tipo de reporte">
        {REPORT_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onTipoReporteChange(type.value)}
            role="tab"
            aria-selected={tipoReporte === type.value}
            aria-controls={`panel-${type.value}`}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
              ${tipoReporte === type.value
                ? 'text-purple-300 bg-purple-500/10'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
          >
            <span className="w-4 h-4 flex items-center justify-center" aria-hidden="true">
              {reportIcons[type.icon]}
            </span>
            <span>{type.label}</span>
            {tipoReporte === type.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
        ))}
      </div>

      {/* Date selector + apply */}
      <div className="p-5" id={`panel-${tipoReporte}`} role="tabpanel" aria-labelledby={`tab-${tipoReporte}`}>
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
            <span className="inline-block h-2 w-2 rounded-full bg-purple-500 animate-pulse" aria-hidden="true" />
            <span className="text-gray-400">Periodo:</span>
            <span className="font-medium text-gray-200">{periodoActual}</span>
          </div>
        )}
      </div>
    </Card>
  )
}