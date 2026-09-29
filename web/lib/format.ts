export function money(amount: number, currency: string): string {
  const digits = currency === 'HUF' ? 0 : Number.isInteger(amount) ? 0 : 2
  const n = new Intl.NumberFormat('en-GB', {minimumFractionDigits: digits, maximumFractionDigits: digits}).format(amount)
  return currency === 'EUR' ? `€${n}` : `${n} ${currency === 'RON' ? 'lei' : currency}`
}

export function eur(amount: number | null | undefined): string {
  return amount == null ? '' : `≈ €${amount.toFixed(2)}`
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function day(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  return `${WEEKDAY[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH[d.getUTCMonth()]}`
}

export function span(from: string, to: string): string {
  if (from === to) return day(from)
  const y = (s: string) => s.slice(0, 4)
  return `${day(from)}${y(from) !== y(to) ? ` ${y(from)}` : ''} – ${day(to)} ${y(to)}`
}

export const LANG_LABEL: Record<string, string> = {en: 'EN', ro: 'RO', de: 'DE', hu: 'HU'}
export const TRUST_LABEL: Record<string, string> = {
  official: 'official',
  club: 'automobile club',
  press: 'press',
  blog: 'blog',
  forum: 'forum',
}
