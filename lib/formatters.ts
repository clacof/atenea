export function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-CO')}`
}

export function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString('es-ES')
}

export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString('es-ES')
}

export function formatPercentage(value: number) {
  return `${value.toFixed(2)}%`
}