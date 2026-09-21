import { cn } from '~/lib/utils'

export function SlotCard({
  kicker,
  title,
  hint,
  on,
  onClick,
  tone,
  disabled,
}: {
  kicker: string
  title: string
  hint?: string
  on: boolean
  onClick: () => void
  tone?: 'good' | 'bad'
  disabled?: boolean
}) {
  const active =
    tone === 'good'
      ? 'border-transparent bg-emerald-700 text-white'
      : tone === 'bad'
        ? 'border-transparent bg-red-700 text-white'
        : 'border-transparent bg-school text-white'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn('slot-card min-w-0 border text-left disabled:opacity-60', on ? active : 'border-school/10 bg-surface text-foreground')}
    >
      <p className={cn('slot-kicker', on ? (tone ? 'text-white/80' : 'text-accent') : 'text-muted')}>{kicker}</p>
      <p className="slot-title font-display font-medium italic">{title}</p>
      {hint ? <p className={cn('slot-hint', on ? 'text-white/70' : 'text-muted')}>{hint}</p> : null}
    </button>
  )
}
