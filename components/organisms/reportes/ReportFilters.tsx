import Button from '../../atoms/Button'
import Card from '../../atoms/Card'
import Input from '../../atoms/Input'
import Select from '../../atoms/Select'
import FormField from '../../molecules/FormField'

interface ReportFiltersProps {
  tipoReporte: 'diario' | 'mensual' | 'anual'
  fechaSeleccionada: string
  mesSeleccionado: string
  anioSeleccionado: string
  periodoActual?: string
  onTipoReporteChange: (value: 'diario' | 'mensual' | 'anual') => void
  onFechaChange: (value: string) => void
  onMesChange: (value: string) => void
  onAnioChange: (value: string) => void
  onApply: () => void
}

export default function ReportFilters({
  tipoReporte,
  fechaSeleccionada,
  mesSeleccionado,
  anioSeleccionado,
  periodoActual,
  onTipoReporteChange,
  onFechaChange,
  onMesChange,
  onAnioChange,
  onApply,
}: ReportFiltersProps) {
  return (
    <Card className="mb-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="min-w-48">
          <FormField label="Tipo de reporte">
            <Select value={tipoReporte} onChange={(event) => onTipoReporteChange(event.target.value as 'diario' | 'mensual' | 'anual')}>
              <option value="diario">Diario</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </Select>
          </FormField>
        </div>

        {tipoReporte === 'diario' ? (
          <div>
            <FormField label="Fecha">
              <Input type="date" value={fechaSeleccionada} onChange={(event) => onFechaChange(event.target.value)} />
            </FormField>
          </div>
        ) : null}

        {tipoReporte === 'mensual' ? (
          <div>
            <FormField label="Mes">
              <Input type="month" value={mesSeleccionado} onChange={(event) => onMesChange(event.target.value)} />
            </FormField>
          </div>
        ) : null}

        {tipoReporte === 'anual' ? (
          <div>
            <FormField label="Ano">
              <Input type="number" min="2020" max="2100" value={anioSeleccionado} onChange={(event) => onAnioChange(event.target.value)} className="w-32" />
            </FormField>
          </div>
        ) : null}

        <Button onClick={onApply}>Aplicar filtro</Button>
      </div>

      <p className="mt-4 text-sm text-gray-400">Periodo actual: {periodoActual || 'Sin datos'}</p>
    </Card>
  )
}