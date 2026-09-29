// Small builders so the seed data reads like the research files it comes
// from. IDs use hyphens only: a dot in a Sanity document ID makes it
// private, and this dataset is public on purpose.

export type Doc = {_id: string; _type: string; [key: string]: unknown}

export const CHECKED = '2026-09-29'

let keyCounter = 0
export const key = () => `k${(keyCounter++).toString(36).padStart(4, '0')}`

export const ref = (id: string) => ({_type: 'reference', _ref: id})
export const refs = (...ids: string[]) => ids.map((id) => ({_type: 'reference', _ref: id, _key: key()}))

export const withKeys = <T extends object>(items: T[]) => items.map((item) => ({_key: key(), ...item}))

export function source(
  id: string,
  s: {
    title: string
    url: string
    publisher?: string
    language: 'en' | 'ro' | 'de' | 'hu'
    trust: 'official' | 'club' | 'press' | 'blog' | 'forum'
    country?: string
    pageDate?: string
    notes?: string
  },
): Doc {
  return {
    _id: `source-${id}`,
    _type: 'source',
    title: s.title,
    url: s.url,
    publisher: s.publisher,
    language: s.language,
    trust: s.trust,
    pageDate: s.pageDate,
    checkedAt: CHECKED,
    country: s.country ? ref(`country-${s.country}`) : undefined,
    notes: s.notes,
  }
}

export const S = (id: string) => `source-${id}`

export function price(
  amount: number,
  currency: string,
  validFrom: string,
  validTo: string | null,
  sourceId: string,
  band?: {label: string; electric?: boolean; euroMin?: number; euroMax?: number; appliesWhenUnknown?: boolean},
) {
  return {
    _key: key(),
    _type: 'datedPrice',
    amount,
    currency,
    validFrom,
    validTo: validTo ?? undefined,
    status: 'official',
    source: ref(S(sourceId)),
    band,
  }
}

export function penalty(p: {min?: number; max?: number; currency: string; points?: number; note?: string; source?: string}) {
  return {
    _type: 'penalty',
    min: p.min,
    max: p.max,
    currency: p.currency,
    points: p.points,
    note: p.note,
    source: p.source ? ref(S(p.source)) : undefined,
  }
}

export function localized(en: string, other: {ro?: string; de?: string; hu?: string} = {}) {
  return {_type: 'localeString', en, ...other}
}

export function claim(
  id: string,
  c: {
    statement: string
    quote?: string
    seenOn: string
    country?: string
    verdict: 'outdated' | 'wrong' | 'misleading' | 'current'
    correctedBy: string[]
    explanation: string
  },
): Doc {
  return {
    _id: `claim-${id}`,
    _type: 'claim',
    statement: c.statement,
    quote: c.quote,
    seenOn: ref(S(c.seenOn)),
    country: c.country ? ref(`country-${c.country}`) : undefined,
    verdict: c.verdict,
    correctedBy: refs(...c.correctedBy),
    explanation: c.explanation,
    decidedAt: CHECKED,
  }
}

/** Drop undefined values so createOrReplace gets clean documents. */
export function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}
