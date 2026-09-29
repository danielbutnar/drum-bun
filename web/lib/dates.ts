// Calendar-day arithmetic on ISO dates (YYYY-MM-DD). Toll validity is defined
// in calendar days in the issuer's time zone, so we never touch clock time:
// every date is a plain string and all maths happens in UTC.

export type IsoDate = string

const DAY_MS = 86_400_000

export function toUtc(date: IsoDate): number {
  const [y, m, d] = date.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function fromUtc(ms: number): IsoDate {
  return new Date(ms).toISOString().slice(0, 10)
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return fromUtc(toUtc(date) + days * DAY_MS)
}

export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS)
}

/** Same calendar day `months` later; clamps to the month end (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(date: IsoDate, months: number): IsoDate {
  const [y, m, d] = date.split('-').map(Number)
  const target = new Date(Date.UTC(y, m - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(d, lastDay))
  return fromUtc(target.getTime())
}

export function year(date: IsoDate): number {
  return Number(date.slice(0, 4))
}

/** True when MM-DD of `date` falls inside a yearly window that may wrap over New Year. */
export function inSeason(date: IsoDate, from: string, to: string): boolean {
  const md = date.slice(5)
  return from <= to ? md >= from && md <= to : md >= from || md <= to
}

export function inRange(date: IsoDate, from?: IsoDate | null, to?: IsoDate | null): boolean {
  if (from && date < from) return false
  if (to && date > to) return false
  return true
}

export function maxDate(a: IsoDate, b: IsoDate): IsoDate {
  return a > b ? a : b
}
