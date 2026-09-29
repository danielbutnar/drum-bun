// Shapes returned by the GROQ queries in lib/queries.ts. They mirror the
// Studio schema (studio/schemaTypes) after references are expanded.

export type Vehicle = 'car' | 'carTrailer' | 'camper' | 'motorcycle'
export type Fuel = 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg'

export interface Localized {
  en: string
  ro?: string | null
  de?: string | null
  hu?: string | null
}

export interface SourceRef {
  _id: string
  title: string
  url: string
  publisher?: string | null
  language: 'en' | 'ro' | 'de' | 'hu'
  trust: 'official' | 'club' | 'press' | 'blog' | 'forum'
  pageDate?: string | null
  checkedAt: string
}

export interface DatedPrice {
  amount: number
  currency: string
  validFrom: string
  validTo?: string | null
  status?: 'official' | 'announced' | null
  band?: {
    label?: string | null
    electric?: boolean | null
    euroMin?: number | null
    euroMax?: number | null
    appliesWhenUnknown?: boolean | null
  } | null
  source?: SourceRef | null
}

export interface PendingChange {
  summary: string
  wouldTakeEffect?: string | null
  checkAgainBy?: string | null
  source?: SourceRef | null
}

export interface Penalty {
  min?: number | null
  max?: number | null
  currency?: string | null
  points?: number | null
  note?: string | null
}

export interface PurchaseChannel {
  channel: 'officialWeb' | 'officialApp' | 'retail' | 'borderPoint'
  label?: string | null
  url?: string | null
}

export interface TollProduct {
  _id: string
  name: Localized
  kind: 'vignette' | 'countyVignette' | 'sectionToll'
  vehicles: Vehicle[]
  localCategory?: string | null
  county?: string | null
  validity: {
    unit: 'days' | 'months' | 'calendarYear' | 'passage'
    count?: number | null
    yearStartsPrevious?: string | null
    yearEndsNext?: string | null
    wording?: string | null
  }
  prices: DatedPrice[]
  activation?: {
    onlineDelayDays?: number | null
    delayAppliesTo?: string | null
    immediateOptions?: string | null
  } | null
  purchase?: PurchaseChannel[] | null
  plateBound?: boolean | null
  summary?: string | null
  penalty?: Penalty | null
  pendingChanges?: PendingChange[] | null
  sources: SourceRef[]
}

export interface Country {
  _id: string
  code: string
  name: Localized
  currency: string
  carTollSummary?: string | null
}

export interface Place {
  _id: string
  name: Localized
  slug: string
  kind: 'city' | 'border'
}

export interface RoadSection {
  _id: string
  road: string
  from: string
  to: string
  lengthKm?: number | null
  tolled: boolean
  coveredBy?: TollProduct[] | null
  counties?: string[] | null
  exemptVehicles?: Vehicle[] | null
  exemptNote?: string | null
  note?: string | null
  sources: SourceRef[]
}

export interface Leg {
  country: Country
  km?: number | null
  exitBorder?: Place | null
  sections?: RoadSection[] | null
}

export interface RouteData {
  _id: string
  title: string
  totalKm?: number | null
  note?: string | null
  origin: Place
  destination: Place
  legs: Leg[]
}

export interface Rule {
  _id: string
  country: string
  topic: string
  title: string
  requirement: string
  vehicles: Vehicle[]
  season?: {from: string; to: string} | null
  conditional?: boolean | null
  condition?: string | null
  effectiveFrom?: string | null
  effectiveTo?: string | null
  severity: 'critical' | 'important' | 'info'
  penalty?: Penalty | null
  sources: SourceRef[]
}

export interface Zone {
  _id: string
  title: string
  city: string
  kind: 'lowEmissionZone' | 'dieselBan'
  status: 'active' | 'announced' | 'suspended' | 'abolished'
  requiredSticker?: 'green' | 'yellow' | 'red' | null
  dieselMinEuro?: number | null
  petrolMinEuro?: number | null
  area?: string | null
  effectiveFrom?: string | null
  effectiveTo?: string | null
  howToComply?: string | null
  penalty?: Penalty | null
  sources: SourceRef[]
}

export interface Claim {
  _id: string
  statement: string
  quote?: string | null
  verdict: 'outdated' | 'wrong' | 'misleading' | 'current'
  explanation: string
  seenOn: SourceRef
  correctedBy: string[]
}

export interface ExchangeRate {
  currency: string
  unitsPerEur: number
  asOf: string
}

export interface PlannerData {
  route: RouteData | null
  rules: Rule[]
  zones: Zone[]
  claims: Claim[]
  rates: ExchangeRate[]
}
