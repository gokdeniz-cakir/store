import {
  CheckCircle,
  Info,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  ToastContext,
  type ToastInput,
  type ToastTone,
} from './toastContext'

interface ToastItem extends Required<Pick<ToastInput, 'message' | 'tone'>> {
  durationMs?: number
  id: number
  title?: string
}

const toneStyles: Record<
  ToastTone,
  { accentClassName: string; borderClassName: string; Icon: typeof CheckCircle }
> = {
  error: {
    accentClassName: 'bg-crimson-700/10 text-crimson-800',
    borderClassName: 'border-crimson-700/20',
    Icon: WarningCircle,
  },
  info: {
    accentClassName: 'bg-parchment-100 text-ink-800',
    borderClassName: 'border-parchment-200',
    Icon: Info,
  },
  success: {
    accentClassName: 'bg-gold-500/10 text-ink-900',
    borderClassName: 'border-gold-500/30',
    Icon: CheckCircle,
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextToastId = useRef(1)
  const timeoutHandles = useRef(new Map<number, number>())

  function dismissToast(id: number) {
    const handle = timeoutHandles.current.get(id)

    if (handle) {
      window.clearTimeout(handle)
      timeoutHandles.current.delete(id)
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }

  function showToast({
    durationMs = 4200,
    message,
    tone = 'info',
    title,
  }: ToastInput) {
    const id = nextToastId.current++

    setToasts((currentToasts) => [
      ...currentToasts,
      {
        durationMs,
        id,
        message,
        title,
        tone,
      },
    ])

    const timeoutHandle = window.setTimeout(() => {
      dismissToast(id)
    }, durationMs)

    timeoutHandles.current.set(id, timeoutHandle)
  }

  useEffect(() => {
    const activeTimeoutHandles = timeoutHandles.current

    return () => {
      activeTimeoutHandles.forEach((handle) => window.clearTimeout(handle))
      activeTimeoutHandles.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ dismissToast, showToast }}>
      {children}

      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col gap-3 sm:inset-x-auto sm:right-6 sm:top-6 sm:bottom-auto sm:w-[22rem]">
        {toasts.map((toast) => {
          const style = toneStyles[toast.tone]
          const Icon = style.Icon

          return (
            <div
              className={`pointer-events-auto border bg-white p-4 shadow-[12px_12px_32px_rgba(28,25,23,0.12)] ${style.borderClassName}`}
              key={toast.id}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center ${style.accentClassName}`}>
                  <Icon className="text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  {toast.title ? (
                    <p className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                      {toast.title}
                    </p>
                  ) : null}
                  <p className={`text-sm leading-7 ${toast.title ? 'mt-1 text-ink-800' : 'text-ink-900'}`}>
                    {toast.message}
                  </p>
                </div>
                <button
                  aria-label="Dismiss notification"
                  className="shrink-0 text-ink-500 transition-colors hover:text-ink-900"
                  onClick={() => dismissToast(toast.id)}
                  type="button"
                >
                  <X className="text-sm" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
