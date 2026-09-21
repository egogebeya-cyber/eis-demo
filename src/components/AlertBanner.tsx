type Banner = {
  titleEn: string
  titleAm: string
  titleOm: string
  bodyEn: string
  bodyAm: string
  bodyOm: string
}

type Settings = {
  alertEnabled: boolean
  alertEn: string
  alertAm: string
  alertOm: string
  banner?: Banner | null
} | null | undefined

export function AlertBanner({ site }: { site: Settings }) {
  if (!site) return null

  if (site.banner) {
    const title = site.banner.titleEn.trim()
    const body = site.banner.bodyEn.trim()
    const text = body && body !== title ? `${title} ${body}` : title
    if (!text) return null
    return <div className="bg-accent px-4 py-2 text-center text-sm font-semibold text-school-dark">{text}</div>
  }

  if (!site.alertEnabled) return null
  const text = site.alertEn.trim()
  if (!text) return null
  return <div className="bg-accent px-4 py-2 text-center text-sm font-semibold text-school-dark">{text}</div>
}
