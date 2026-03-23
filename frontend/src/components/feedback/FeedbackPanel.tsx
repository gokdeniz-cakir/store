import type { ReactNode } from 'react'

interface FeedbackPanelProps {
  actions?: ReactNode
  description: string
  eyebrow?: string
  icon?: ReactNode
  title: string
  tone?: 'default' | 'error'
}

export default function FeedbackPanel({
  actions,
  description,
  eyebrow,
  icon,
  title,
  tone = 'default',
}: FeedbackPanelProps) {
  const borderClassName =
    tone === 'error' ? 'border-crimson-700/20' : 'border-parchment-200'
  const backgroundClassName =
    tone === 'error' ? 'bg-white' : 'bg-white'

  return (
    <div className={`${borderClassName} ${backgroundClassName} border px-8 py-16 text-center`}>
      {icon ? <div className="mx-auto flex w-fit items-center justify-center text-5xl text-ink-500">{icon}</div> : null}
      {eyebrow ? (
        <p className={`${icon ? 'mt-6' : ''} text-[10px] uppercase tracking-eyebrow text-crimson-700`}>
          {eyebrow}
        </p>
      ) : null}
      <p className="mt-4 font-serif text-3xl text-ink-900">{title}</p>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-500">{description}</p>
      {actions ? <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </div>
  )
}
