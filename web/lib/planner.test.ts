import {describe, expect, it} from 'vitest'

import {cheapestCover, evaluateZone, planTrip, priceOn, validityEnd} from './planner'
import type {PlannerData, RoadSection, SourceRef, TollProduct, Zone} from './types'

// Synthetic fixtures: prices here are made up and only exercise the maths.
const src: SourceRef = {
  _id: 'src-test',
  title: 'Test source',
  url: 'https://example.org',
  language: 'en',
  trust: 'official',
  checkedAt: '2026-09-29',
}

function product(id: string, over: Partial<TollProduct>): TollProduct {
  return {
    _id: id,
    name: {en: id},
    kind: 'vignette',
    vehicles: ['car'],
    validity: {unit: 'days', count: 10},
    prices: [],
    sources: [src],
    ...over,
  }
}

const at1 = product('at-1day', {
  validity: {unit: 'days', count: 1},
  prices: [
    {amount: 9, currency: 'EUR', validFrom: '2026-01-01', validTo: '2026-12-31'},
    {amount: 10, currency: 'EUR', validFrom: '2027-01-01', validTo: '2027-12-31'},
  ],
})
const at10 = product('at-10day', {
  prices: [
    {amount: 12, currency: 'EUR', validFrom: '2026-01-01', validTo: '2026-12-31'},
    {amount: 13, currency: 'EUR', validFrom: '2027-01-01', validTo: '2027-12-31'},
  ],
  activation: {onlineDelayDays: 18, immediateOptions: 'Buy at a sales point.'},
})
const at2m = product('at-2month', {
  validity: {unit: 'months', count: 2},
  prices: [{amount: 30, currency: 'EUR', validFrom: '2026-01-01', validTo: '2026-12-31'}],
})
const atYear = product('at-annual', {
  validity: {unit: 'calendarYear', yearStartsPrevious: '12-01', yearEndsNext: '01-31'},
  prices: [
    {amount: 100, currency: 'EUR', validFrom: '2026-01-01', validTo: '2026-12-31'},
    {amount: 104, currency: 'EUR', validFrom: '2027-01-01', validTo: '2027-12-31'},
  ],
})
const huCounty = product('hu-county-csongrad', {
  kind: 'countyVignette',
  county: 'Csongrád-Csanád',
  validity: {unit: 'calendarYear', yearEndsNext: '01-31'},
  prices: [{amount: 5000, currency: 'HUF', validFrom: '2026-01-01', validTo: '2026-12-31'}],
})
const hu10 = product('hu-10day', {
  prices: [{amount: 6000, currency: 'HUF', validFrom: '2026-01-01', validTo: '2026-12-31'}],
})

const rates = [{currency: 'HUF', unitsPerEur: 400, asOf: '2026-09-29'}]

describe('validity', () => {
  it('counts the start day for N-day products', () => {
    expect(validityEnd(at10, '2026-12-20')).toBe('2026-12-29')
  })
  it('runs month products to the same calendar day', () => {
    expect(validityEnd(at2m, '2026-01-31')).toBe('2026-03-31')
    expect(validityEnd(at2m, '2026-12-31')).toBe('2027-02-28')
  })
  it('lets December dates use next year’s annual vignette', () => {
    expect(validityEnd(atYear, '2026-12-20')).toBe('2028-01-31')
  })
})

describe('priceOn', () => {
  it('picks the period that contains the date', () => {
    expect(priceOn(at10.prices, '2027-01-03')?.price.amount).toBe(13)
  })
  it('falls back to the latest price and marks it as an estimate', () => {
    const hit = priceOn(at2m.prices, '2027-03-01')
    expect(hit?.price.amount).toBe(30)
    expect(hit?.estimate).toBe(true)
  })
})

describe('cheapestCover', () => {
  it('uses one 10-day vignette when out and back fall inside it', () => {
    const pick = cheapestCover([at1, at10, at2m], ['2026-10-01', '2026-10-08'], [])
    expect(pick.map((c) => c.product._id)).toEqual(['at-10day'])
  })
  it('uses two 1-day vignettes for a long stay with a one-day drive each way', () => {
    const pick = cheapestCover([at1, at10, at2m], ['2026-10-01', '2026-10-25'], [])
    expect(pick.map((c) => c.product._id)).toEqual(['at-1day', 'at-1day'])
  })
  it('prices each purchase in the year it starts (Christmas trip)', () => {
    const pick = cheapestCover([at10], ['2026-12-20', '2027-01-03'], [])
    expect(pick.map((c) => c.price?.amount)).toEqual([12, 13])
  })
})

describe('zones', () => {
  const lez: Zone = {
    _id: 'z',
    title: 'Munich low-emission zone',
    city: 'munich',
    kind: 'lowEmissionZone',
    status: 'active',
    requiredSticker: 'green',
    sources: [src],
  }
  it('asks for a green sticker from a Euro 5 diesel', () => {
    expect(evaluateZone(lez, 'diesel', 5, '2026-12-20').verdict).toBe('needsSticker')
  })
  it('refuses a Euro 2 diesel', () => {
    expect(evaluateZone(lez, 'diesel', 2, '2026-12-20').verdict).toBe('banned')
  })
  it('ignores suspended bans', () => {
    const ban: Zone = {...lez, kind: 'dieselBan', status: 'suspended', dieselMinEuro: 6}
    expect(evaluateZone(ban, 'diesel', 5, '2026-12-20').verdict).toBe('notInForce')
  })
})

describe('planTrip', () => {
  const huSection: RoadSection = {
    _id: 'm43',
    road: 'M43',
    from: 'Nagylak',
    to: 'Szeged',
    tolled: true,
    coveredBy: [hu10, huCounty],
    sources: [src],
  }
  const atSection: RoadSection = {
    _id: 'a4',
    road: 'A4',
    from: 'Nickelsdorf',
    to: 'Wien',
    tolled: true,
    coveredBy: [at1, at10, at2m, atYear],
    sources: [src],
  }
  const data: PlannerData = {
    route: {
      _id: 'r',
      title: 'Test route',
      origin: {_id: 'o', name: {en: 'Brașov'}, slug: 'brasov', kind: 'city'},
      destination: {_id: 'd', name: {en: 'Vienna'}, slug: 'vienna', kind: 'city'},
      legs: [
        {country: {_id: 'hu', code: 'HU', name: {en: 'Hungary'}, currency: 'HUF'}, sections: [huSection]},
        {country: {_id: 'at', code: 'AT', name: {en: 'Austria'}, currency: 'EUR'}, sections: [atSection]},
      ],
    },
    rules: [
      {
        _id: 'at-winter',
        country: 'at',
        topic: 'winterTyres',
        title: 'Winter tyres in winter conditions',
        requirement: 'Winter tyres when there is snow or ice.',
        vehicles: ['car'],
        season: {from: '11-01', to: '04-15'},
        conditional: true,
        severity: 'critical',
        sources: [src],
      },
    ],
    zones: [],
    claims: [
      {
        _id: 'c1',
        statement: 'The 10-day vignette costs 9.90 EUR.',
        verdict: 'outdated',
        explanation: 'That was the 2022 price.',
        seenOn: {...src, trust: 'blog'},
        correctedBy: ['at-10day'],
      },
    ],
    rates,
  }

  it('chooses the cheaper county vignette only when it beats the national one', () => {
    const plan = planTrip(data, {
      origin: 'brasov',
      destination: 'vienna',
      outDate: '2026-12-20',
      returnDate: '2026-12-27',
      vehicle: 'car',
      purchaseDate: '2026-09-29',
    })
    if (!plan.ok) throw new Error(plan.error)
    const hu = plan.countries[0]
    expect(hu.purchases.map((p) => p.productId)).toEqual(['hu-county-csongrad'])
    expect(hu.alternatives.find((a) => a.chosen)?.label).toContain('county')
  })

  it('warns about the online delay when the trip is too close', () => {
    const plan = planTrip(data, {
      origin: 'brasov',
      destination: 'vienna',
      outDate: '2026-10-05',
      returnDate: '2026-10-10',
      vehicle: 'car',
      purchaseDate: '2026-09-29',
    })
    if (!plan.ok) throw new Error(plan.error)
    const at = plan.countries[1]
    expect(at.purchases[0].productId).toBe('at-10day')
    expect(at.purchases[0].activationWarning).toContain('2026-10-17')
    expect(plan.warnings[0].severity).toBe('critical')
  })

  it('switches on the winter rule only inside its season and surfaces the outdated claim', () => {
    const winter = planTrip(data, {
      origin: 'brasov',
      destination: 'vienna',
      outDate: '2026-12-20',
      vehicle: 'car',
      purchaseDate: '2026-09-29',
    })
    const summer = planTrip(data, {
      origin: 'brasov',
      destination: 'vienna',
      outDate: '2026-07-20',
      vehicle: 'car',
      purchaseDate: '2026-06-01',
    })
    if (!winter.ok || !summer.ok) throw new Error('plan failed')
    expect(winter.countries[1].rules.map((r) => r.ruleId)).toEqual(['at-winter'])
    expect(summer.countries[1].rules).toEqual([])
    expect(winter.claims.map((c) => c.claimId)).toEqual(['c1'])
  })

  it('reports a missing route instead of guessing', () => {
    const plan = planTrip({...data, route: null}, {
      origin: 'x',
      destination: 'y',
      outDate: '2026-10-01',
      vehicle: 'car',
      purchaseDate: '2026-09-29',
    })
    expect(plan.ok).toBe(false)
  })
})

describe('emission bands (Romania from 1 Oct 2026)', () => {
  const bands = [
    {amount: 228, currency: 'RON', validFrom: '2026-10-01', validTo: '2026-12-31', band: {label: 'Electric', electric: true}},
    {amount: 254, currency: 'RON', validFrom: '2026-10-01', validTo: '2026-12-31', band: {label: 'Euro VI', euroMin: 6, euroMax: 6}},
    {amount: 292, currency: 'RON', validFrom: '2026-10-01', validTo: '2026-12-31', band: {label: 'Euro IV–V', euroMin: 4, euroMax: 5}},
    {
      amount: 330,
      currency: 'RON',
      validFrom: '2026-10-01',
      validTo: '2026-12-31',
      band: {label: 'Euro 0–III', euroMin: 0, euroMax: 3, appliesWhenUnknown: true},
    },
    {amount: 50, currency: 'EUR', validFrom: '2025-09-01', validTo: '2026-09-30'},
  ]
  it('uses the old flat price before the switch', () => {
    expect(priceOn(bands, '2026-09-30', {fuel: 'diesel', euroNorm: 5})?.price.amount).toBe(50)
  })
  it('picks the band for the car after the switch', () => {
    expect(priceOn(bands, '2026-10-01', {fuel: 'diesel', euroNorm: 5})?.price.amount).toBe(292)
    expect(priceOn(bands, '2026-10-01', {fuel: 'electric'})?.price.amount).toBe(228)
  })
  it('charges the Euro 0 band when the class is unknown, and says so', () => {
    const hit = priceOn(bands, '2026-11-01', {})
    expect(hit?.price.amount).toBe(330)
    expect(hit?.bandNote).toContain('Euro 0–III')
  })
  it('estimates next year from the latest band prices', () => {
    const hit = priceOn(bands, '2027-02-01', {fuel: 'petrol', euroNorm: 6})
    expect(hit?.price.amount).toBe(254)
    expect(hit?.estimate).toBe(true)
  })
})

describe('territorial set cover (Hungary M1 corridor)', () => {
  const county = (id: string, amount: number) =>
    product(`hu-county-${id}`, {
      kind: 'countyVignette',
      county: id,
      validity: {unit: 'calendarYear', yearEndsNext: '01-31'},
      prices: [{amount, currency: 'HUF', validFrom: '2026-01-01', validTo: '2026-12-31'}],
    })
  const pest = county('pest', 7190)
  const fejer = county('fejer', 7190)
  const ke = county('komarom', 7190)
  const m1 = product('hu-m1-regional', {
    kind: 'countyVignette',
    validity: {unit: 'calendarYear', yearEndsNext: '01-31'},
    prices: [{amount: 15000, currency: 'HUF', validFrom: '2026-01-01', validTo: '2026-12-31'}],
  })
  const monthly = product('hu-monthly', {
    validity: {unit: 'months', count: 1},
    prices: [{amount: 40000, currency: 'HUF', validFrom: '2026-01-01', validTo: '2026-12-31'}],
  })
  const sec = (id: string, cov: TollProduct[]): RoadSection => ({_id: id, road: 'M1', from: id, to: id, tolled: true, coveredBy: cov, sources: [src]})
  const data: PlannerData = {
    route: {
      _id: 'r',
      title: 'M1',
      origin: {_id: 'o', name: {en: 'A'}, slug: 'a', kind: 'city'},
      destination: {_id: 'd', name: {en: 'B'}, slug: 'b', kind: 'city'},
      legs: [
        {
          country: {_id: 'hu', code: 'HU', name: {en: 'Hungary'}, currency: 'HUF'},
          sections: [sec('pest', [monthly, pest, m1]), sec('fejer-only', [monthly, fejer, m1]), sec('ke', [monthly, ke, m1])],
        },
      ],
    },
    rules: [],
    zones: [],
    claims: [],
    rates,
  }
  it('never leaves the Fejér-only stretch uncovered and prefers the regional product when cheaper', () => {
    const plan = planTrip(data, {origin: 'a', destination: 'b', outDate: '2026-11-02', vehicle: 'car', purchaseDate: '2026-09-29'})
    if (!plan.ok) throw new Error(plan.error)
    // 3 counties = 21,570 HUF > M1 regional 15,000 HUF.
    expect(plan.countries[0].purchases.map((p) => p.productId)).toEqual(['hu-m1-regional'])
  })
  it('uses single counties when only one county is crossed', () => {
    const one = {...data, route: {...data.route!, legs: [{...data.route!.legs[0], sections: [sec('fejer-only', [monthly, fejer, m1])]}]}}
    const plan = planTrip(one, {origin: 'a', destination: 'b', outDate: '2026-11-02', vehicle: 'car', purchaseDate: '2026-09-29'})
    if (!plan.ok) throw new Error(plan.error)
    expect(plan.countries[0].purchases.map((p) => p.productId)).toEqual(['hu-county-fejer'])
  })
})
