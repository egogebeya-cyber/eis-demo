export function SectionHeading({
  kicker,
  title,
  subtitle,
  light = false,
  compact = false,
}: {
  kicker: string
  title: string
  subtitle?: string
  light?: boolean
  compact?: boolean
}) {
  return (
    <div className={light ? 'text-white' : ''}>
      <p className={`text-xs font-bold uppercase tracking-[0.28em] ${light ? 'text-accent' : 'text-accent'}`}>{kicker}</p>
      <h2
        className={`font-display mt-2 font-semibold tracking-tight ${
          compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
        } ${light ? 'text-white' : 'text-foreground'}`}
      >
        {title}
      </h2>
      {subtitle ? <p className={`mt-3 max-w-2xl text-base ${light ? 'text-white/80' : 'text-muted'}`}>{subtitle}</p> : null}
    </div>
  )
}

export function PageBanner({ kicker, title, subtitle }: { kicker: string; title: string; subtitle?: string }) {
  return (
    <div className="border-b border-school/10 bg-school-light pt-24">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading kicker={kicker} title={title} subtitle={subtitle} />
      </div>
    </div>
  )
}
