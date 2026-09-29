// Places and routes. A route is built from a Romanian approach, a Hungarian
// corridor, an Austrian corridor and a German leg, so 4 origins × 5
// destinations need no hand-written duplicates. Distances are approximate.

import {type Doc, localized, ref, refs, source} from './helpers'

type P = {id: string; en: string; ro?: string; de?: string; hu?: string; kind: 'city' | 'border'; country: string; after?: string; lat: number; lng: number}

const PLACES: P[] = [
  {id: 'brasov', en: 'Brașov', ro: 'Brașov', de: 'Kronstadt', hu: 'Brassó', kind: 'city', country: 'ro', lat: 45.6427, lng: 25.5887},
  {id: 'bucharest', en: 'Bucharest', ro: 'București', de: 'Bukarest', hu: 'Bukarest', kind: 'city', country: 'ro', lat: 44.4268, lng: 26.1025},
  {id: 'cluj-napoca', en: 'Cluj-Napoca', ro: 'Cluj-Napoca', de: 'Klausenburg', hu: 'Kolozsvár', kind: 'city', country: 'ro', lat: 46.7712, lng: 23.6236},
  {id: 'timisoara', en: 'Timișoara', ro: 'Timișoara', de: 'Temeswar', hu: 'Temesvár', kind: 'city', country: 'ro', lat: 45.7489, lng: 21.2087},
  {id: 'vienna', en: 'Vienna', ro: 'Viena', de: 'Wien', hu: 'Bécs', kind: 'city', country: 'at', lat: 48.2082, lng: 16.3738},
  {id: 'munich', en: 'Munich', ro: 'München', de: 'München', hu: 'München', kind: 'city', country: 'de', lat: 48.1351, lng: 11.582},
  {id: 'stuttgart', en: 'Stuttgart', ro: 'Stuttgart', de: 'Stuttgart', hu: 'Stuttgart', kind: 'city', country: 'de', lat: 48.7758, lng: 9.1829},
  {id: 'frankfurt', en: 'Frankfurt am Main', ro: 'Frankfurt pe Main', de: 'Frankfurt am Main', hu: 'Frankfurt am Main', kind: 'city', country: 'de', lat: 50.1109, lng: 8.6821},
  {id: 'berlin', en: 'Berlin', ro: 'Berlin', de: 'Berlin', hu: 'Berlin', kind: 'city', country: 'de', lat: 52.52, lng: 13.405},
  {id: 'nadlac-ii', en: 'Nădlac II / Csanádpalota', ro: 'Nădlac II', hu: 'Csanádpalota', kind: 'border', country: 'ro', after: 'hu', lat: 46.176, lng: 20.735},
  {id: 'bors', en: 'Borș / Ártánd', ro: 'Borș', hu: 'Ártánd', kind: 'border', country: 'ro', after: 'hu', lat: 47.117, lng: 21.807},
  {id: 'hegyeshalom', en: 'Hegyeshalom / Nickelsdorf', hu: 'Hegyeshalom', de: 'Nickelsdorf', kind: 'border', country: 'hu', after: 'at', lat: 47.93, lng: 17.16},
  {id: 'walserberg', en: 'Walserberg', de: 'Walserberg', kind: 'border', country: 'at', after: 'de', lat: 47.79, lng: 12.98},
  {id: 'suben', en: 'Suben / Passau', de: 'Suben', kind: 'border', country: 'at', after: 'de', lat: 48.43, lng: 13.43},
]

export const places: Doc[] = PLACES.map((p) => ({
  _id: `place-${p.id}`,
  _type: 'place',
  name: localized(p.en, {ro: p.ro, de: p.de, hu: p.hu}),
  slug: {_type: 'slug', current: p.id},
  kind: p.kind,
  country: ref(`country-${p.country}`),
  countryAfter: p.after ? ref(`country-${p.after}`) : undefined,
  location: {_type: 'geopoint', lat: p.lat, lng: p.lng},
}))

const ORIGINS: Record<string, {border: 'nadlac-ii' | 'bors'; km: number; via: string}> = {
  brasov: {border: 'nadlac-ii', km: 470, via: 'Sibiu, Deva, Arad'},
  bucharest: {border: 'nadlac-ii', km: 620, via: 'Pitești, Sibiu, Deva, Arad'},
  timisoara: {border: 'nadlac-ii', km: 110, via: 'Arad'},
  'cluj-napoca': {border: 'bors', km: 155, via: 'Oradea'},
}

const HU = {
  'nadlac-ii': {
    km: 420,
    sections: ['m43', 'm5-szeged-114', 'm5-114-67', 'm5-67-13', 'm0-m5-m1', 'm1-budapest-39', 'm1-39-48', 'm1-48-94', 'm1-94-border'],
    via: 'Szeged, Budapest',
  },
  bors: {
    km: 430,
    sections: ['road42-4-artand-kisujszallas', 'm4-kisujszallas-118', 'm4-118-99', 'm4-99-m0', 'm0-m5-m1', 'm1-budapest-39', 'm1-39-48', 'm1-48-94', 'm1-94-border'],
    via: 'Püspökladány, Szolnok, Budapest',
  },
}

const DEST: Record<string, {at: string[]; atKm: number; atExit?: string; de?: {sections: string[]; km: number}; via: string}> = {
  vienna: {at: ['a4-nickelsdorf-vienna'], atKm: 65, via: 'Győr'},
  munich: {
    at: ['a4-nickelsdorf-vienna', 'a1-vienna-salzburg-nord', 'a1-salzburg-walserberg'],
    atKm: 367,
    atExit: 'walserberg',
    de: {sections: ['a8-walserberg-munich'], km: 140},
    via: 'Vienna, Salzburg',
  },
  stuttgart: {
    at: ['a4-nickelsdorf-vienna', 'a1-vienna-salzburg-nord', 'a1-salzburg-walserberg'],
    atKm: 367,
    atExit: 'walserberg',
    de: {sections: ['a8-walserberg-munich', 'a8-munich-stuttgart'], km: 370},
    via: 'Vienna, Salzburg, Munich',
  },
  frankfurt: {
    at: ['a4-nickelsdorf-vienna', 'a1-a25-a8-vienna-suben'],
    atKm: 330,
    atExit: 'suben',
    de: {sections: ['a3-passau-frankfurt'], km: 460},
    via: 'Vienna, Linz, Passau, Nuremberg',
  },
  berlin: {
    at: ['a4-nickelsdorf-vienna', 'a1-a25-a8-vienna-suben'],
    atKm: 330,
    atExit: 'suben',
    de: {sections: ['a3-a9-passau-berlin'], km: 600},
    via: 'Vienna, Linz, Passau, Regensburg',
  },
}

const name = (id: string) => PLACES.find((p) => p.id === id)!.en

export const routes: Doc[] = Object.entries(ORIGINS).flatMap(([origin, o]) =>
  Object.entries(DEST).map(([dest, d]) => {
    const hu = HU[o.border]
    const legs = [
      {_key: 'ro', _type: 'leg', country: ref('country-ro'), sections: refs('section-ro-national-roads'), km: o.km, exitBorder: ref(`place-${o.border}`)},
      {_key: 'hu', _type: 'leg', country: ref('country-hu'), sections: refs(...hu.sections.map((s) => `section-hu-${s}`)), km: hu.km, exitBorder: ref('place-hegyeshalom')},
      {
        _key: 'at',
        _type: 'leg',
        country: ref('country-at'),
        sections: refs(...d.at.map((s) => `section-at-${s}`)),
        km: d.atKm,
        exitBorder: d.atExit ? ref(`place-${d.atExit}`) : undefined,
      },
      ...(d.de ? [{_key: 'de', _type: 'leg', country: ref('country-de'), sections: refs(...d.de.sections.map((s) => `section-de-${s}`)), km: d.de.km}] : []),
    ]
    const totalKm = legs.reduce((sum, l) => sum + (l.km ?? 0), 0)
    return {
      _id: `route-${origin}-${dest}`,
      _type: 'route',
      title: `${name(origin)} → ${name(dest)}`,
      origin: ref(`place-${origin}`),
      destination: ref(`place-${dest}`),
      legs,
      totalKm,
      note: `Via ${o.via}, ${name(o.border)}, ${hu.via}, ${d.via}. About ${totalKm} km; distances are approximate.`,
    }
  }),
)

export const ecb = source('ecb-rates', {
  title: 'ECB euro foreign exchange reference rates',
  url: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html',
  publisher: 'European Central Bank',
  language: 'en',
  trust: 'official',
  pageDate: '2026-09-29',
})

export const rates: Doc[] = [
  {_id: 'rate-huf', _type: 'exchangeRate', currency: 'HUF', unitsPerEur: 366.38, asOf: '2026-09-29', source: ref('source-ecb-rates')},
  {_id: 'rate-ron', _type: 'exchangeRate', currency: 'RON', unitsPerEur: 5.2786, asOf: '2026-09-29', source: ref('source-ecb-rates')},
]
