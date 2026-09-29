// The trip planner. Pure functions over structured Sanity content: no model,
// no network. Every number it returns comes from a field in the dataset, and
// every decision it makes (which vignette, which price, which rule) can be
// traced back to the document and source that caused it.

import {addDays, addMonths, daysBetween, inRange, inSeason, type IsoDate, year} from './dates'
import type {
  Claim,
  DatedPrice,
  ExchangeRate,
  Fuel,
  Leg,
  PendingChange,
  PlannerData,
  PurchaseChannel,
  RoadSection,
  Rule,
  SourceRef,
  TollProduct,
  Vehicle,
  Zone,
} from './types'

export interface TripInput {
  origin: string
  destination: string
  outDate: IsoDate
  returnDate?: IsoDate | null
  vehicle: Vehicle
  fuel?: Fuel | null
  euroNorm?: number | null
  /** The drive takes two days each way (overnight stop). */
  twoDayDrive?: boolean
  /** Day the driver would buy online; defaults to today. */
  purchaseDate: IsoDate
}

export interface CarProfile {
  fuel?: Fuel | null
  euroNorm?: number | null
}

export interface PriceQuote {
  amount: number
  currency: string
  /** Emission band the price was picked from, when the issuer prices by Euro class. */
  band?: string | null
  bandNote?: string | null
  approxEur: number | null
  /** No published price covers this date; the latest known price is shown. */
  estimate: boolean
  status: 'official' | 'announced' | 'estimate'
  source?: SourceRef | null
}

export interface Purchase {
  productId: string
  name: string
  localName?: string | null
  kind: TollProduct['kind']
  localCategory?: string | null
  county?: string | null
  startDate: IsoDate
  endDate: IsoDate
  coversDates: IsoDate[]
  price: PriceQuote | null
  buyVia: PurchaseChannel[]
  /** Latest day an online purchase still becomes valid in time, if the issuer delays online sales. */
  buyOnlineBy?: IsoDate | null
  activationWarning?: string | null
  validityWording?: string | null
  pendingChanges: PendingChange[]
  sources: SourceRef[]
}

export interface Alternative {
  label: string
  totalEur: number | null
  purchases: {name: string; startDate: IsoDate; amount: number | null; currency: string | null}[]
  chosen: boolean
}

export interface RuleHit {
  ruleId: string
  title: string
  requirement: string
  severity: Rule['severity']
  why: string
  conditional: boolean
  condition?: string | null
  topicIsWinter: boolean
  penalty?: Rule['penalty']
  sources: SourceRef[]
}

export interface ZoneHit {
  zoneId: string
  title: string
  status: Zone['status']
  verdict: 'ok' | 'needsSticker' | 'banned' | 'unknown' | 'notInForce'
  message: string
  howToComply?: string | null
  penalty?: Zone['penalty']
  sources: SourceRef[]
}

export interface CountryPlan {
  code: string
  name: string
  km: number | null
  exitBorder: string | null
  travelDates: IsoDate[]
  tollFree: boolean
  /** The route's sections in this country, for drawing the strip map. */
  segments: {road: string; from: string; to: string; km: number | null; charged: boolean}[]
  /** Why nothing is due when the road is tolled for other vehicles. */
  exemptNotes: string[]
  tollSummary?: string | null
  purchases: Purchase[]
  alternatives: Alternative[]
  rules: RuleHit[]
  unpricedSections: string[]
}

export interface Warning {
  severity: 'critical' | 'important' | 'info'
  country?: string
  text: string
}

export interface ClaimHit {
  claimId: string
  statement: string
  quote?: string | null
  verdict: Claim['verdict']
  explanation: string
  seenOn: SourceRef
  about: string[]
}

export interface Plan {
  ok: true
  route: {
    id: string
    title: string
    totalKm: number | null
    origin: string
    destination: string
    note?: string | null
  }
  trip: TripInput & {returnDates: IsoDate[]; outDates: IsoDate[]}
  countries: CountryPlan[]
  zones: ZoneHit[]
  totals: {byCurrency: Record<string, number>; approxEur: number | null; includesEstimate: boolean}
  warnings: Warning[]
  claims: ClaimHit[]
  sources: SourceRef[]
}

export interface PlanError {
  ok: false
  error: string
}

// ---------------------------------------------------------------------------

export function validityEnd(product: TollProduct, start: IsoDate): IsoDate {
  const v = product.validity
  switch (v.unit) {
    case 'days':
      return addDays(start, (v.count ?? 1) - 1)
    case 'months':
      return addMonths(start, v.count ?? 1)
    case 'calendarYear': {
      const y = vignetteYear(product, start)
      return v.yearEndsNext ? `${y + 1}-${v.yearEndsNext}` : `${y}-12-31`
    }
    case 'passage':
      return start
  }
}

/** Which "vignette year" an annual product bought for `date` belongs to. */
export function vignetteYear(product: TollProduct, date: IsoDate): number {
  const y = year(date)
  const startsPrev = product.validity.yearStartsPrevious
  // A 2027 Austrian annual vignette is valid from 1 Dec 2026, so a date in
  // December can be covered by next year's product. Prefer next year's when
  // the date is inside its early window: it lasts longer for the same trip.
  if (startsPrev && date.slice(5) >= startsPrev) return y + 1
  return y
}

export function calendarYearStart(product: TollProduct, vYear: number): IsoDate {
  const startsPrev = product.validity.yearStartsPrevious
  return startsPrev ? `${vYear - 1}-${startsPrev}` : `${vYear}-01-01`
}

export function priceOn(
  prices: DatedPrice[],
  date: IsoDate,
  car: CarProfile = {},
): {price: DatedPrice; estimate: boolean; bandNote: string | null} | null {
  const exact = prices.filter((p) => inRange(date, p.validFrom, p.validTo))
  if (exact.length) return {...pickBand(exact, car), estimate: false}
  // No published price for that date (e.g. next year's tariff is not out yet):
  // fall back to the most recent known prices and say so.
  const earlier = prices.filter((p) => p.validFrom <= date)
  if (!earlier.length) return null
  const latest = earlier.reduce((a, b) => (a.validFrom > b.validFrom ? a : b)).validFrom
  return {...pickBand(earlier.filter((p) => p.validFrom === latest), car), estimate: true}
}

/** Among prices valid on the same day, pick the one for this car's emission band. */
function pickBand(prices: DatedPrice[], car: CarProfile): {price: DatedPrice; bandNote: string | null} {
  const banded = prices.filter((p) => p.band)
  if (!banded.length) return {price: prices[0], bandNote: null}
  if (car.fuel === 'electric') {
    const electric = banded.find((p) => p.band?.electric)
    if (electric) return {price: electric, bandNote: null}
  }
  if (car.euroNorm != null && car.fuel !== 'electric') {
    const e = car.euroNorm
    const match = banded.find((p) => !p.band?.electric && (p.band?.euroMin ?? 0) <= e && e <= (p.band?.euroMax ?? 6))
    if (match) return {price: match, bandNote: null}
  }
  // Unknown Euro class: use the band the issuer charges in that case, or the
  // most expensive one, and tell the driver how to pay less.
  const fallback =
    banded.find((p) => p.band?.appliesWhenUnknown) ?? banded.reduce((a, b) => (a.amount > b.amount ? a : b))
  return {
    price: fallback,
    bandNote: `Priced for ${fallback.band?.label ?? 'the highest band'}: the Euro class was not given. Enter it to see your price.`,
  }
}

function productPrice(product: TollProduct, start: IsoDate, rates: ExchangeRate[], car: CarProfile = {}): PriceQuote | null {
  // Annual products are priced by their vignette year, the others by the day they start.
  const lookupDate =
    product.validity.unit === 'calendarYear' ? `${vignetteYear(product, start)}-07-01` : start
  const hit = priceOn(product.prices ?? [], lookupDate, car)
  if (!hit) return null
  const {price, estimate, bandNote} = hit
  return {
    amount: price.amount,
    currency: price.currency,
    band: price.band?.label ?? null,
    bandNote,
    approxEur: toEur(price.amount, price.currency, rates),
    estimate,
    status: estimate ? 'estimate' : price.status === 'announced' ? 'announced' : 'official',
    source: price.source ?? null,
  }
}

export function toEur(amount: number, currency: string, rates: ExchangeRate[]): number | null {
  if (currency === 'EUR') return amount
  const rate = rates.find((r) => r.currency === currency)
  return rate ? Math.round((amount / rate.unitsPerEur) * 100) / 100 : null
}

// ---------------------------------------------------------------------------
// Covering a set of travel days with the cheapest purchases.

interface Candidate {
  product: TollProduct
  start: IsoDate
  end: IsoDate
  price: PriceQuote | null
}

function candidatesFor(product: TollProduct, date: IsoDate, rates: ExchangeRate[], car: CarProfile): Candidate[] {
  if (product.validity.unit === 'calendarYear') {
    // Two annual products can cover a date around New Year (Austria's 2026
    // vignette runs to 31 Jan 2027, the 2027 one starts 1 Dec 2026).
    return [year(date), year(date) + 1].flatMap((vYear) => {
      const start = calendarYearStart(product, vYear)
      const end = validityEnd(product, start)
      if (date < start || date > end) return []
      return [{product, start, end, price: productPrice(product, start, rates, car)}]
    })
  }
  return [{product, start: date, end: validityEnd(product, date), price: productPrice(product, date, rates, car)}]
}

function cost(c: Candidate): number {
  // Unknown prices sort last but still let the planner produce a plan.
  if (!c.price) return 1e9
  return c.price.approxEur ?? c.price.amount
}

/** Minimum-cost cover of sorted unique `dates` by products, via dynamic programming. */
export function cheapestCover(
  products: TollProduct[],
  dates: IsoDate[],
  rates: ExchangeRate[],
  car: CarProfile = {},
): Candidate[] {
  const n = dates.length
  const best: {cost: number; pick: Candidate[]}[] = Array(n + 1)
  best[n] = {cost: 0, pick: []}
  for (let i = n - 1; i >= 0; i--) {
    best[i] = {cost: Infinity, pick: []}
    for (const product of products) {
      for (const c of candidatesFor(product, dates[i], rates, car)) {
        let j = i
        while (j < n && dates[j] <= c.end && dates[j] >= c.start) j++
        if (j === i) continue
        const total = cost(c) + best[j].cost
        if (total < best[i].cost) best[i] = {cost: total, pick: [c, ...best[j].pick]}
      }
    }
  }
  return best[0].cost === Infinity ? [] : best[0].pick
}

function toPurchase(c: Candidate, dates: IsoDate[], purchaseDate: IsoDate): Purchase {
  const p = c.product
  const delay = p.activation?.onlineDelayDays ?? 0
  let buyOnlineBy: IsoDate | null = null
  let activationWarning: string | null = null
  if (delay > 0) {
    buyOnlineBy = addDays(c.start, -delay)
    if (buyOnlineBy < purchaseDate) {
      activationWarning = `Bought online on ${purchaseDate}, it would only be valid from ${addDays(purchaseDate, delay)} (${delay}-day rule). ${p.activation?.immediateOptions ?? 'Buy it at a sales point instead.'}`
    }
  }
  return {
    productId: p._id,
    name: p.name.en,
    localName: p.name.de ?? p.name.hu ?? p.name.ro ?? null,
    kind: p.kind,
    localCategory: p.localCategory,
    county: p.county,
    startDate: c.start,
    endDate: c.end,
    coversDates: dates.filter((d) => d >= c.start && d <= c.end),
    price: c.price,
    buyVia: p.purchase ?? [],
    buyOnlineBy,
    activationWarning,
    validityWording: p.validity.wording,
    pendingChanges: p.pendingChanges ?? [],
    sources: p.sources ?? [],
  }
}

function sumEur(cands: Candidate[]): number | null {
  let total = 0
  for (const c of cands) {
    if (c.price?.approxEur == null) return null
    total += c.price.approxEur
  }
  return Math.round(total * 100) / 100
}

function describe(cands: Candidate[]): string {
  const counts = new Map<string, number>()
  for (const c of cands) counts.set(c.product.name.en, (counts.get(c.product.name.en) ?? 0) + 1)
  return [...counts].map(([name, k]) => (k > 1 ? `${k} × ${name}` : name)).join(' + ')
}

// ---------------------------------------------------------------------------

function travelDates(start: IsoDate, twoDay: boolean): IsoDate[] {
  return twoDay ? [start, addDays(start, 1)] : [start]
}

function datesInCountry(legIndex: number, legCount: number, outDates: IsoDate[], backDates: IsoDate[]): IsoDate[] {
  // With a two-day drive we do not know where the driver sleeps, so every
  // country on the route may be crossed on either day. Covering both days is
  // the safe answer and usually costs nothing extra (10-day products).
  void legIndex
  void legCount
  return [...new Set([...outDates, ...backDates])].sort()
}

function planLeg(
  leg: Leg,
  index: number,
  data: PlannerData,
  trip: TripInput,
  outDates: IsoDate[],
  backDates: IsoDate[],
): CountryPlan {
  const dates = datesInCountry(index, data.route!.legs.length, outDates, backDates)
  const car: CarProfile = {fuel: trip.fuel, euroNorm: trip.euroNorm}
  const sections = leg.sections ?? []
  const exempt = sections.filter((s) => s.tolled && s.exemptVehicles?.includes(trip.vehicle))
  const tolled = sections.filter((s) => s.tolled && !exempt.includes(s))
  const vehicleOk = (p: TollProduct) => p.vehicles?.includes(trip.vehicle)

  const purchases: Purchase[] = []
  const alternatives: Alternative[] = []
  const unpricedSections: string[] = []

  // Sections that only a section toll covers (e.g. a tunnel) are paid per passage.
  const passageOnly = tolled.filter((s) => (s.coveredBy ?? []).filter(vehicleOk).every((p) => p.kind === 'sectionToll'))
  const needsVignette = tolled.filter((s) => !passageOnly.includes(s))

  if (needsVignette.length) {
    // Option A: products valid on every vignette section (the national vignette).
    const network = uniqueProducts(needsVignette.flatMap((s) => s.coveredBy ?? []))
      .filter(vehicleOk)
      .filter((p) => p.kind === 'vignette')
      .filter((p) => needsVignette.every((s) => (s.coveredBy ?? []).some((q) => q._id === p._id)))
    const planA = network.length ? cheapestCover(network, dates, data.rates, car) : []

    // Option B: territorial annual products (Hungary's county vignettes and
    // the M1 regional vignette). Pick the cheapest set that leaves no
    // section uncovered: an exact set cover, small enough to brute-force.
    const planB = cheapestTerritorialCover(needsVignette, vehicleOk, dates, data.rates, car)

    const options = [
      {label: describe(planA), plan: planA},
      {label: `Annual county vignettes: ${describe(planB)}`, plan: planB},
    ].filter((o) => o.plan.length)
    options.sort((a, b) => (sumEur(a.plan) ?? Infinity) - (sumEur(b.plan) ?? Infinity))

    // Show what else the planner considered, so "why this one?" has an answer.
    for (const product of network) {
      const single = cheapestCover([product], dates, data.rates, car)
      if (!single.length) continue
      const label = describe(single)
      if (options.some((o) => o.label === label)) continue
      options.push({label, plan: single})
    }

    const chosen = options[0]
    if (chosen) purchases.push(...chosen.plan.map((c) => toPurchase(c, dates, trip.purchaseDate)))
    for (const o of options) {
      alternatives.push({
        label: o.label,
        totalEur: sumEur(o.plan),
        purchases: o.plan.map((c) => ({
          name: c.product.name.en,
          startDate: c.start,
          amount: c.price?.amount ?? null,
          currency: c.price?.currency ?? null,
        })),
        chosen: o === chosen,
      })
    }
    if (!chosen) unpricedSections.push(...needsVignette.map((s) => `${s.road} ${s.from}–${s.to}`))
  }

  for (const s of passageOnly) {
    const product = (s.coveredBy ?? []).find(vehicleOk)
    if (!product) {
      unpricedSections.push(`${s.road} ${s.from}–${s.to}`)
      continue
    }
    for (const d of [outDates[0], backDates[0]].filter(Boolean)) {
      purchases.push(
        toPurchase({product, start: d, end: d, price: productPrice(product, d, data.rates, car)}, [d], trip.purchaseDate),
      )
    }
  }

  return {
    code: leg.country.code,
    name: leg.country.name.en,
    km: leg.km ?? null,
    exitBorder: leg.exitBorder?.name.en ?? null,
    travelDates: dates,
    tollFree: tolled.length === 0,
    segments: sections.map((s) => ({
      road: s.road,
      from: s.from,
      to: s.to,
      km: s.lengthKm ?? null,
      charged: tolled.includes(s),
    })),
    exemptNotes: exempt.map((s) => s.exemptNote ?? `No charge for this vehicle on ${s.road}.`),
    tollSummary: leg.country.carTollSummary,
    purchases,
    alternatives: alternatives.length > 1 ? alternatives : [],
    rules: rulesFor(leg.country._id, data.rules, trip.vehicle, dates),
    unpricedSections,
  }
}

function cheapestTerritorialCover(
  sections: RoadSection[],
  vehicleOk: (p: TollProduct) => boolean,
  dates: IsoDate[],
  rates: ExchangeRate[],
  car: CarProfile,
): Candidate[] {
  const territorial = uniqueProducts(sections.flatMap((s) => s.coveredBy ?? [])).filter(
    (p) => p.kind === 'countyVignette' && vehicleOk(p),
  )
  if (!territorial.length || territorial.length > 14) return []
  const plans = territorial.map((p) => cheapestCover([p], dates, rates, car))
  const covers = territorial.map((p) => sections.map((s) => (s.coveredBy ?? []).some((q) => q._id === p._id)))
  let best: {cost: number; pick: Candidate[]} | null = null
  for (let mask = 1; mask < 1 << territorial.length; mask++) {
    const chosen = territorial.map((_, i) => i).filter((i) => mask & (1 << i))
    if (chosen.some((i) => !plans[i].length)) continue
    if (!sections.every((_, si) => chosen.some((i) => covers[i][si]))) continue
    const pick = chosen.flatMap((i) => plans[i])
    const total = pick.reduce((sum, c) => sum + cost(c), 0)
    if (!best || total < best.cost) best = {cost: total, pick}
  }
  return best?.pick ?? []
}

function uniqueProducts(products: TollProduct[]): TollProduct[] {
  const seen = new Map<string, TollProduct>()
  for (const p of products) if (p && !seen.has(p._id)) seen.set(p._id, p)
  return [...seen.values()]
}

export function rulesFor(countryId: string, rules: Rule[], vehicle: Vehicle, dates: IsoDate[]): RuleHit[] {
  const order = {critical: 0, important: 1, info: 2}
  return rules
    .filter((r) => r.country === countryId && r.vehicles?.includes(vehicle))
    .flatMap((r) => {
      const effective = dates.filter((d) => inRange(d, r.effectiveFrom, r.effectiveTo))
      if (!effective.length) return []
      if (r.season) {
        const hits = effective.filter((d) => inSeason(d, r.season!.from, r.season!.to))
        if (!hits.length) return []
        return [hit(r, `Applies between ${r.season.from} and ${r.season.to} (MM-DD); your travel days ${hits.join(', ')} fall inside.`)]
      }
      if (r.conditional && r.condition) return [hit(r, r.condition)]
      return [hit(r, 'Applies all year.')]
    })
    .sort((a, b) => order[a.severity] - order[b.severity])
}

function hit(r: Rule, why: string): RuleHit {
  return {
    ruleId: r._id,
    title: r.title,
    requirement: r.requirement,
    severity: r.severity,
    why,
    conditional: Boolean(r.conditional),
    condition: r.condition,
    topicIsWinter: r.topic === 'winterTyres' || r.topic === 'snowChains',
    penalty: r.penalty,
    sources: r.sources ?? [],
  }
}

export function evaluateZone(zone: Zone, fuel: Fuel | null | undefined, euro: number | null | undefined, date: IsoDate): ZoneHit {
  const base = {
    zoneId: zone._id,
    title: zone.title,
    status: zone.status,
    howToComply: zone.howToComply,
    penalty: zone.penalty,
    sources: zone.sources ?? [],
  }
  if (zone.status !== 'active' || !inRange(date, zone.effectiveFrom, zone.effectiveTo)) {
    return {...base, verdict: 'notInForce', message: `Not in force on ${date} (status: ${zone.status}).`}
  }
  if (zone.kind === 'dieselBan') {
    if (fuel !== 'diesel') return {...base, verdict: 'ok', message: 'Only affects diesel cars.'}
    if (euro == null) return {...base, verdict: 'unknown', message: `Diesel cars below Euro ${zone.dieselMinEuro} may not enter. Check your registration papers.`}
    return (zone.dieselMinEuro ?? 0) > euro
      ? {...base, verdict: 'banned', message: `Your diesel is Euro ${euro}; this area requires at least Euro ${zone.dieselMinEuro}.`}
      : {...base, verdict: 'ok', message: `Euro ${euro} diesel is allowed (minimum Euro ${zone.dieselMinEuro}).`}
  }
  // Low-emission zone: a sticker is required for every car, domestic or foreign.
  const eligible = stickerFor(fuel, euro)
  if (eligible === 'unknown') {
    return {...base, verdict: 'unknown', message: `A ${zone.requiredSticker} sticker is required. Tell me your fuel and Euro norm to check your car qualifies.`}
  }
  if (eligible === 'none' || rank(eligible) < rank(zone.requiredSticker ?? 'green')) {
    return {...base, verdict: 'banned', message: `Your car does not qualify for the ${zone.requiredSticker} sticker, so it may not enter.`}
  }
  return {...base, verdict: 'needsSticker', message: `You need a ${zone.requiredSticker} sticker on the windscreen before you enter. Your car qualifies.`}
}

// German Kennzeichnungsverordnung, simplified to the common cases: diesel
// Euro 4+ and petrol Euro 1+ with a catalytic converter get green. Diesel
// Euro 3 only with a particle filter, which we cannot see, so we say "unknown".
function stickerFor(fuel: Fuel | null | undefined, euro: number | null | undefined): 'green' | 'yellow' | 'red' | 'none' | 'unknown' {
  if (fuel === 'electric') return 'green'
  if (fuel == null || euro == null) return 'unknown'
  if (fuel === 'diesel') return euro >= 4 ? 'green' : euro === 3 ? 'unknown' : euro === 2 ? 'red' : 'none'
  return euro >= 1 ? 'green' : 'none'
}

function rank(sticker: string): number {
  return {none: 0, red: 1, yellow: 2, green: 3}[sticker] ?? 0
}

// ---------------------------------------------------------------------------

export function planTrip(data: PlannerData, trip: TripInput): Plan | PlanError {
  const route = data.route
  if (!route) return {ok: false, error: `No route from ${trip.origin} to ${trip.destination} in the dataset yet.`}
  if (trip.returnDate && trip.returnDate < trip.outDate) {
    return {ok: false, error: 'The return date is before the departure date.'}
  }

  const outDates = travelDates(trip.outDate, Boolean(trip.twoDayDrive))
  const backDates = trip.returnDate ? travelDates(trip.returnDate, Boolean(trip.twoDayDrive)) : []
  const countries = route.legs.map((leg, i) => planLeg(leg, i, data, trip, outDates, backDates))

  const arrival = outDates[outDates.length - 1]
  const zones = data.zones.map((z) => evaluateZone(z, trip.fuel, trip.euroNorm, arrival))

  const byCurrency: Record<string, number> = {}
  let approxEur: number | null = 0
  let includesEstimate = false
  for (const p of countries.flatMap((c) => c.purchases)) {
    if (!p.price) {
      approxEur = null
      continue
    }
    byCurrency[p.price.currency] = round2((byCurrency[p.price.currency] ?? 0) + p.price.amount)
    if (approxEur != null) approxEur = p.price.approxEur == null ? null : round2(approxEur + p.price.approxEur)
    includesEstimate ||= p.price.estimate
  }

  const warnings: Warning[] = []
  for (const c of countries) {
    for (const p of c.purchases) {
      if (p.activationWarning) warnings.push({severity: 'critical', country: c.code, text: `${p.name}: ${p.activationWarning}`})
      if (p.price?.bandNote) warnings.push({severity: 'important', country: c.code, text: `${p.name}: ${p.price.bandNote}`})
      for (const change of p.pendingChanges) {
        warnings.push({severity: 'info', country: c.code, text: `${p.name}: pending, not law yet. ${change.summary}`})
      }
    }

    if (c.unpricedSections.length) {
      warnings.push({severity: 'important', country: c.code, text: `No product found for: ${c.unpricedSections.join(', ')}.`})
    }
    // Only rules that depend on the travel dates make the top list; the rest
    // stay in the country section. Winter rules without a calendar window
    // (Romania, Germany) count when the trip falls in the winter half-year.
    const wintry = c.travelDates.some((d) => inSeason(d, '11-01', '04-15'))
    for (const r of c.rules.filter((r) => r.severity === 'critical' && r.topicIsWinter)) {
      if (wintry) warnings.push({severity: 'critical', country: c.code, text: `${r.title}. Details under ${c.name}.`})
    }
  }
  // One line for every price that is not published yet, instead of one per country.
  const estimated = countries.filter((c) => c.purchases.some((p) => p.price?.estimate))
  if (estimated.length) {
    warnings.push({
      severity: 'important',
      text: `Not published yet: ${estimated
        .map((c) => `${c.name} for ${[...new Set(c.purchases.filter((p) => p.price?.estimate).map((p) => p.startDate))].join(' and ')}`)
        .join(', ')}. The latest official price is shown (*); check again before you buy.`,
    })
  }
  for (const z of zones) {
    if (z.verdict === 'banned' || z.verdict === 'needsSticker' || z.verdict === 'unknown') {
      warnings.push({severity: z.verdict === 'banned' ? 'critical' : 'important', text: `${z.title}: ${z.message}`})
    }
  }
  if (trip.returnDate && daysBetween(trip.outDate, trip.returnDate) > 365) {
    warnings.push({severity: 'info', text: 'Trips longer than a year are planned as two separate trips.'})
  }

  const usedIds = new Set<string>([
    ...countries.flatMap((c) => [...c.purchases.map((p) => p.productId), ...c.rules.map((r) => r.ruleId)]),
    ...zones.map((z) => z.zoneId),
    ...route.legs.flatMap((l) => (l.sections ?? []).map((s) => s._id)),
    // Claims about any product on the route matter, not only the one we
    // picked: a driver who read about the 10-day vignette should hear why
    // the planner chose something else.
    ...route.legs.flatMap((l) => (l.sections ?? []).flatMap((s) => (s.coveredBy ?? []).map((p) => p._id))),
  ])
  // Claims about what the driver actually buys or must follow come first,
  // then one country at a time, so the list is not all about one border.
  const chosen = new Set<string>([
    ...countries.flatMap((c) => [...c.purchases.map((p) => p.productId), ...c.rules.map((r) => r.ruleId)]),
    ...zones.map((z) => z.zoneId),
  ])
  const relevant = data.claims.filter((c) => c.verdict !== 'current' && c.correctedBy?.some((id) => usedIds.has(id)))
  const rank = (c: Claim) => (c.correctedBy.some((id) => chosen.has(id)) ? 0 : 1)
  const byCountry = new Map<string, Claim[]>()
  for (const c of [...relevant].sort((a, b) => rank(a) - rank(b))) {
    const k = c.correctedBy[0]?.split('-')[1] ?? ''
    byCountry.set(k, [...(byCountry.get(k) ?? []), c])
  }
  const interleaved: Claim[] = []
  for (let round = 0; interleaved.length < relevant.length; round++) {
    for (const list of byCountry.values()) if (list[round]) interleaved.push(list[round])
  }
  const claims: ClaimHit[] = interleaved
    .map((c) => ({
      claimId: c._id,
      statement: c.statement,
      quote: c.quote,
      verdict: c.verdict,
      explanation: c.explanation,
      seenOn: c.seenOn,
      about: c.correctedBy.filter((id) => usedIds.has(id)),
    }))

  const sources = dedupeSources([
    ...countries.flatMap((c) => [...c.purchases.flatMap((p) => p.sources), ...c.rules.flatMap((r) => r.sources)]),
    ...zones.flatMap((z) => z.sources),
  ])

  return {
    ok: true,
    route: {
      id: route._id,
      title: route.title,
      totalKm: route.totalKm ?? null,
      origin: route.origin.name.en,
      destination: route.destination.name.en,
      note: route.note,
    },
    trip: {...trip, outDates, returnDates: backDates},
    countries,
    zones,
    totals: {byCurrency, approxEur, includesEstimate},
    warnings: sortWarnings(warnings),
    claims,
    sources,
  }
}

function sortWarnings(ws: Warning[]): Warning[] {
  const order = {critical: 0, important: 1, info: 2}
  const seen = new Set<string>()
  return ws
    .filter((w) => (seen.has(w.text) ? false : (seen.add(w.text), true)))
    .sort((a, b) => order[a.severity] - order[b.severity])
}

function dedupeSources(sources: SourceRef[]): SourceRef[] {
  const map = new Map<string, SourceRef>()
  for (const s of sources) if (s && !map.has(s._id)) map.set(s._id, s)
  return [...map.values()]
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
