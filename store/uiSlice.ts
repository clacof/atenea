import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (ok: boolean) => void
}

interface UIState {
  sidebarOpen: boolean
  toasts: Toast[]
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  confirmRequest: ConfirmRequest | null
  requestConfirm: (options: ConfirmOptions) => Promise<boolean>
  resolveConfirm: (ok: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      toasts: [],
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      addToast: (toast) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            { ...toast, id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}` },
          ],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
      confirmRequest: null,
      requestConfirm: (options) =>
        new Promise<boolean>((resolve) => {
          // Si habia otra confirmacion abierta, se cancela
          get().confirmRequest?.resolve(false)
          set({ confirmRequest: { ...options, resolve } })
        }),
      resolveConfirm: (ok) => {
        get().confirmRequest?.resolve(ok)
        set({ confirmRequest: null })
      },
    }),
    {
      name: 'atenea-ui-storage',
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    }
  )
)