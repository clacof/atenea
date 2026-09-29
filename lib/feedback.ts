import { useUIStore, type ConfirmOptions } from '@/store/uiSlice'

/** Notificaciones no bloqueantes (reemplazo de alert). */
export const notify = {
  success: (message: string) => useUIStore.getState().addToast({ type: 'success', message }),
  error: (message: string) => useUIStore.getState().addToast({ type: 'error', message, duration: 7000 }),
  info: (message: string) => useUIStore.getState().addToast({ type: 'info', message }),
  warning: (message: string) => useUIStore.getState().addToast({ type: 'warning', message }),
}

/** Dialogo de confirmacion propio (reemplazo de confirm). */
export function confirmar(options: ConfirmOptions): Promise<boolean> {
  return useUIStore.getState().requestConfirm(options)
}

/** Extrae el mensaje de error de una respuesta de la API. */
export async function apiError(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json()
    return typeof data?.error === 'string' ? data.error : fallback
  } catch {
    return fallback
  }
}
