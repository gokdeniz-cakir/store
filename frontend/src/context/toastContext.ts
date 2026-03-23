import { createContext } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastInput {
  durationMs?: number
  message: string
  tone?: ToastTone
  title?: string
}

export interface ToastContextValue {
  dismissToast: (id: number) => void
  showToast: (toast: ToastInput) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
