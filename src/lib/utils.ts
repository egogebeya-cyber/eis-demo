export function addisToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Addis_Ababa' }).format(new Date())
}

export function addisDateOffset(days: number) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000
  const addis = new Date(utc + 3 * 60 * 60_000)
  addis.setDate(addis.getDate() + days)
  const y = addis.getFullYear()
  const mo = String(addis.getMonth() + 1).padStart(2, '0')
  const d = String(addis.getDate()).padStart(2, '0')
  return `${y}-${mo}-${d}`
}

export function formatEtb(amount: number) {
  return `${amount.toLocaleString('en-ET')} ETB`
}

export function dateTimeLocale(locale: string) {
  return locale === 'am' ? 'am-ET' : locale === 'om' ? 'om-ET' : 'en-ET'
}

export function formatDate(iso: string, locale: string) {
  const date = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso)
  return new Intl.DateTimeFormat(dateTimeLocale(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const

export const TIMETABLE_PERIODS = [
  { period: 1, startTime: '08:00', endTime: '08:45' },
  { period: 2, startTime: '08:50', endTime: '09:35' },
  { period: 3, startTime: '09:40', endTime: '10:25' },
  { period: 4, startTime: '10:45', endTime: '11:30' },
  { period: 5, startTime: '11:35', endTime: '12:20' },
  { period: 6, startTime: '13:10', endTime: '13:55' },
] as const

export function addisWeekdayIndex() {
  const name = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Africa/Addis_Ababa' }).format(new Date())
  return (DAY_NAMES as readonly string[]).indexOf(name)
}

export function letterGrade(score: number, max: number) {
  const pct = max <= 0 ? 0 : (score / max) * 100
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
}

export const REPORT_TERMS = ['Term 1', 'Term 2', 'Term 3'] as const
export type ReportTerm = (typeof REPORT_TERMS)[number]
export type TermScore = { score: number; maxScore: number }

export function isReportTerm(value: string): value is ReportTerm {
  return (REPORT_TERMS as readonly string[]).includes(value)
}

export function yearFromTerms(cells: Array<TermScore | null | undefined>) {
  const filled = cells.filter((cell): cell is TermScore => Boolean(cell && cell.maxScore > 0))
  if (!filled.length) return null
  const percent = filled.reduce((sum, cell) => sum + (cell.score / cell.maxScore) * 100, 0) / filled.length
  return { percent: Math.round(percent), letter: letterGrade(percent, 100) }
}

export function formatTermScore(cell: TermScore | null | undefined) {
  if (!cell) return '—'
  return `${cell.score} · ${letterGrade(cell.score, cell.maxScore)}`
}

export function subjectTermReports(
  rows: Array<{ subject: string; term: string; score: number; maxScore: number; assignmentId?: string | null }>,
) {
  const names = [...new Set(rows.map((row) => row.subject))]
  return names.map((subject) => {
    const mine = rows.filter((row) => row.subject === subject)
    const terms = Object.fromEntries(
      REPORT_TERMS.map((term) => {
        const match = mine.filter((row) => row.term === term)
        const official = match.find((row) => !row.assignmentId) ?? match[0]
        return [term, official ? { score: official.score, maxScore: official.maxScore } : null]
      }),
    ) as Record<ReportTerm, TermScore | null>
    return { subject, terms, year: yearFromTerms(REPORT_TERMS.map((term) => terms[term])) }
  })
}

export function currentReportTerm(): ReportTerm {
  const month = Number(addisToday().slice(5, 7))
  if (month >= 8) return 'Term 1'
  if (month <= 3) return 'Term 2'
  return 'Term 3'
}

export const BEHAVIOUR_START = 100

export const BEHAVIOUR_GOOD = [
  { id: 'helpful', points: 5, label: 'behHelpful' },
  { id: 'kind', points: 5, label: 'behKind' },
  { id: 'honest', points: 5, label: 'behHonest' },
  { id: 'leadership', points: 10, label: 'behLeadership' },
  { id: 'effort', points: 5, label: 'behEffort' },
] as const

export const BEHAVIOUR_BAD = [
  { id: 'late', points: 5, label: 'behLate' },
  { id: 'uniform', points: 5, label: 'behUniform' },
  { id: 'disruption', points: 5, label: 'behDisruption' },
  { id: 'disrespect', points: 10, label: 'behDisrespect' },
  { id: 'homework', points: 5, label: 'behHomework' },
] as const

export type BehaviourKind = 'add' | 'deduct'

export function behaviourPreset(kind: BehaviourKind, category: string) {
  const list = kind === 'add' ? BEHAVIOUR_GOOD : BEHAVIOUR_BAD
  return list.find((item) => item.id === category) ?? null
}

export function clampBehaviourScore(adds: number, deducts: number) {
  return Math.max(0, Math.min(BEHAVIOUR_START, BEHAVIOUR_START + adds - deducts))
}

export const FEE_KINDS = ['term', 'uniform', 'books', 'lab', 'transport', 'other'] as const
export type FeeKind = (typeof FEE_KINDS)[number]

export const SCHOOL_PAYMENTS = [
  { id: 'cbe', account: '1000345678901', detail: 'Commercial Bank of Ethiopia · EIS Bole' },
  { id: 'telebirr', account: '0911 445 778', detail: 'Telebirr merchant' },
  { id: 'awash', account: '0132080011223', detail: 'Awash Bank · EIS Bole' },
] as const
export type SchoolPaymentId = (typeof SCHOOL_PAYMENTS)[number]['id']

export function kindFromTitle(title: string): FeeKind {
  const value = title.toLowerCase()
  if (value.includes('term') || value.includes('tuition')) return 'term'
  if (value.includes('uniform')) return 'uniform'
  if (value.includes('book')) return 'books'
  if (value.includes('lab')) return 'lab'
  if (value.includes('transport') || value.includes('bus')) return 'transport'
  return 'other'
}

export function fullName(first: string, last: string) {
  return `${first} ${last}`
}
