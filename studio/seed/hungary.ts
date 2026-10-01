// Hungary, from research/hungary.md (checked 29 Sep 2026).
// The structure matters most here: a trip can be covered by national
// products (daily, 10-day, monthly, annual) or by annual county vignettes,
// and since 2026 by the "M1 regional" vignette for four counties. Which
// sections each county covers is data (decree 45/2020 Annex 1).

import {claim, type Doc, localized, penalty, price, ref, refs, S, source, withKeys} from './helpers'

const Y25 = ['2025-01-01', '2025-12-31'] as const
const Y26 = ['2026-01-01', '2026-12-31'] as const

export const sources: Doc[] = [
  source('hu-prices-2026-pdf', {
    title: 'e-matrica árak 2026 (official price list, e-signed)',
    url: 'https://nemzetiutdij.hu/api/uploads/e_matrica_arak_2026_pdf_611db0ecc1.pdf',
    publisher: 'Magyar Közút Nonprofit Zrt. (Útdíj)',
    language: 'hu',
    trust: 'official',
    country: 'hu',
    pageDate: '2026-01-01',
  }),
  source('hu-prices-2025-news', {
    title: 'e-matrica árak és díjak 2025. január 1-től',
    url: 'https://nemzetiutdij.hu/hu/hirek/e-matrica-arak-es-dijak-2025-01-01',
    publisher: 'Nemzeti Útdíjfizetési Szolgáltató',
    language: 'hu',
    trust: 'official',
    country: 'hu',
    pageDate: '2024-09-10',
  }),
  source('hu-rates-en', {
    title: 'e-vignette rates and categories',
    url: 'https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates',
    publisher: 'Magyar Közút Nonprofit Zrt. (Útdíj)',
    language: 'en',
    trust: 'official',
    country: 'hu',
  }),
  source('hu-decree-45-2020', {
    title: 'Decree 45/2020 (XI. 28.) ITM on the e-vignette (in force from 1 Jan 2026)',
    url: 'https://net.jogtar.hu/jogszabaly?docid=A2000045.ITM',
    publisher: 'Wolters Kluwer copy of the official text (njt.hu refused connections)',
    language: 'hu',
    trust: 'official',
    country: 'hu',
    pageDate: '2026-01-01',
  }),
  source('hu-faq-en', {
    title: 'e-vignette frequently asked questions',
    url: 'https://nemzetiutdij.hu/en/e-vignette/evignette-frequently-asked-questions',
    publisher: 'Magyar Közút Nonprofit Zrt. (Útdíj)',
    language: 'en',
    trust: 'official',
    country: 'hu',
  }),
  source('hu-toll-free-sections', {
    title: 'Toll-free road sections',
    url: 'https://nemzetiutdij.hu/en/e-vignette/tolls/toll-free-road-sections',
    publisher: 'Magyar Közút Nonprofit Zrt. (Útdíj)',
    language: 'en',
    trust: 'official',
    country: 'hu',
  }),
  source('hu-m1-regional', {
    title: 'Tisztázzuk a félreértéseket az M1 regionális matrica kapcsán',
    url: 'https://nemzetiutdij.hu/hu/hirek/tisztazzuk-a-felreerteseket-az-m1-regionalis-matrica-kapcsan',
    publisher: 'Magyar Közút Nonprofit Zrt. (Útdíj)',
    language: 'hu',
    trust: 'official',
    country: 'hu',
    pageDate: '2026-01-22',
  }),
  source('hu-surcharge', {
    title: 'Surcharge, differential surcharge',
    url: 'https://nemzetiutdij.hu/en/e-vignette/surcharges/surcharge-differential-surcharge',
    publisher: 'Magyar Közút Nonprofit Zrt. (Útdíj)',
    language: 'en',
    trust: 'official',
    country: 'hu',
  }),
  source('hu-corrections', {
    title: 'e-vignette services at customer service offices (corrections)',
    url: 'https://nemzetiutdij.hu/en/e-vignette/services-available-at-customer-service-offices/e-vignette-services',
    publisher: 'Magyar Közút Nonprofit Zrt. (Útdíj)',
    language: 'en',
    trust: 'official',
    country: 'hu',
  }),
  source('hu-collection-agencies', {
    title: 'Collection agencies for vehicles with foreign plates',
    url: 'https://nemzetiutdij.hu/en/e-vignette/additional-information/collection-agencies',
    publisher: 'Magyar Közút Nonprofit Zrt. (Útdíj)',
    language: 'en',
    trust: 'official',
    country: 'hu',
  }),
  source('hu-shop', {
    title: 'Official e-vignette shop',
    url: 'https://ematrica.nemzetiutdij.hu/',
    publisher: 'Magyar Közút Nonprofit Zrt. (Útdíj)',
    language: 'hu',
    trust: 'official',
    country: 'hu',
  }),
  source('hu-kresz', {
    title: 'KRESZ 1/1975 (Hungarian highway code, in force from 11 Apr 2026)',
    url: 'https://net.jogtar.hu/jogszabaly?docid=97500001.KPM',
    publisher: 'Wolters Kluwer copy of the official text',
    language: 'hu',
    trust: 'official',
    country: 'hu',
  }),
  source('hu-katasztrofavedelem-winter', {
    title: 'Téli gumi és hólánc kötelező használata a szomszédos országokban',
    url: 'https://www.katasztrofavedelem.hu/382/katasztrofatipusok-teli-veszelyek-a-teli-gumi-es-holanc-kotelezo-hasznalata-a-szomszedos-orszagokban',
    publisher: 'Országos Katasztrófavédelmi Főigazgatóság',
    language: 'hu',
    trust: 'official',
    country: 'hu',
    notes: 'Right about Hungary. About Romania it says winter tyres are compulsory from 1 November to 31 March; Romanian law ties the rule to road conditions, not dates.',
  }),
  source('hu-campers-2026', {
    title: 'Campers 2026: e-vignette guide',
    url: 'https://nemzetiutdij.hu/api/uploads/Lak%C3%B3aut%C3%B3k_2026_t%C3%A1j%C3%A9koztat%C3%B3_fin_EN_pdf_c6bd0fec9d.pdf',
    publisher: 'Magyar Közút Nonprofit Zrt. (Útdíj)',
    language: 'en',
    trust: 'official',
    country: 'hu',
    pageDate: '2026-01-01',
  }),
  // Pages drivers still find that say something else.
  source('hu-index-75-days', {
    title: 'Autópálya-matrica, pótdíj: drágulás 2027',
    url: 'https://index.hu/gazdasag/2026/09/08/autopalya-matrica-potdij-inflacio-dragulas-kozlekedes/',
    publisher: 'Index.hu',
    language: 'hu',
    trust: 'press',
    country: 'hu',
    pageDate: '2026-09-08',
  }),
  source('hu-vg-2027-official', {
    title: 'Hivatalos: ennyivel drágul 2027 januárjától az autópálya-matrica',
    url: 'https://www.vg.hu/vilaggazdasag-magyar-gazdasag/2026/09/autopalya-matrica-dragulas-aremeles-2027-magyarorszag',
    publisher: 'Világgazdaság',
    language: 'hu',
    trust: 'press',
    country: 'hu',
    pageDate: '2026-09-08',
  }),
  source('hu-autozeitung-m6', {
    title: 'Vignette Ungarn: Preise und mautfreie Strecken',
    url: 'https://www.autozeitung.de/vignette-ungarn-202979.html',
    publisher: 'autozeitung.de',
    language: 'de',
    trust: 'press',
    country: 'hu',
    pageDate: '2026-01-20',
  }),
  source('hu-carwow-camper', {
    title: 'Maut Ungarn (carwow)',
    url: 'https://www.carwow.de/automagazin/verkehrsregeln/fahren-im-ausland/maut-ungarn',
    publisher: 'carwow.de',
    language: 'de',
    trust: 'blog',
    country: 'hu',
    pageDate: '2024-06-12',
  }),
  source('hu-verivox-old', {
    title: 'Vignette Ungarn (verivox)',
    url: 'https://www.verivox.de/kfz-versicherung/themen/vignette-ungarn/',
    publisher: 'verivox.de',
    language: 'de',
    trust: 'blog',
    country: 'hu',
    pageDate: '2024-06-30',
  }),
  source('hu-roviniete-ro-no-daily', {
    title: 'Vigneta Ungaria: unde cumperi, ce trebuie să știi',
    url: 'https://www.roviniete.ro/ro/info/hu-vignette-unde-cumperi-ce-trebuie-sa-stii',
    publisher: 'roviniete.ro (reseller)',
    language: 'ro',
    trust: 'blog',
    country: 'hu',
  }),
  source('hu-oeamtc-2-years', {
    title: 'ÖAMTC Länderinfo: Maut und Vignette in Ungarn',
    url: 'https://www.oeamtc.at/laenderinfo/ungarn/maut-vignette-in-ungarn-81973170',
    publisher: 'ÖAMTC',
    language: 'de',
    trust: 'club',
    country: 'hu',
  }),
  source('hu-hungary-vignette-eu', {
    title: 'Hungary vignette info (reseller calling itself official)',
    url: 'https://www.hungary-vignette.eu/en/vignette-info',
    publisher: 'hungary-vignette.eu',
    language: 'en',
    trust: 'blog',
    country: 'hu',
  }),
]

const channels = withKeys([
  {channel: 'officialWeb', label: 'Official e-vignette shop (no fee)', url: 'https://ematrica.nemzetiutdij.hu/'},
  {channel: 'officialApp', label: 'Nemzeti Mobilfizetési (state mobile payments) apps and resellers'},
  {channel: 'retail', label: 'Fuel stations and shops near border crossings (contracted resellers)'},
])

const surcharge = penalty({
  min: 27790,
  max: 95730,
  currency: 'HUF',
  note: 'Surcharge 27,790 HUF if paid within 60 days, 95,730 HUF after that. Cameras everywhere; for Romanian plates a collection agency in Oradea chases unpaid cases. A wrong plate or country code counts as no vignette.',
  source: 'hu-prices-2026-pdf',
})

const WORD = {
  daily: 'One calendar day, 0:00–24:00. Bought for today, it starts at payment. A night drive across midnight needs two days or a 10-day vignette.',
  ten: 'The chosen start day plus 9 more days, until 24:00 on the 10th calendar day. Still called "weekly (heti)".',
  monthly: 'From the chosen start day until 24:00 on the same-numbered day of the next month (or the month’s last day).',
  annual: 'From purchase until 24:00 on 31 January of the following year. Bought in the December pre-sale, it starts on 1 January.',
}

type V = {unit: 'days' | 'months' | 'calendarYear'; count?: number; yearEndsNext?: string; wording: string}

function national(id: string, en: string, hu: string, vehicles: string[], cat: string, validity: V, p25: number, p26: number): Doc {
  return {
    _id: `product-hu-${id}`,
    _type: 'tollProduct',
    country: ref('country-hu'),
    name: localized(en, {hu}),
    kind: 'vignette',
    vehicles,
    localCategory: cat,
    validity,
    prices: [price(p25, 'HUF', Y25[0], Y25[1], 'hu-prices-2025-news'), price(p26, 'HUF', Y26[0], Y26[1], 'hu-prices-2026-pdf')],
    activation: {
      onlineDelayDays: 0,
      immediateOptions:
        'Valid from payment, or from 0:00 of a chosen start day. Buy before you drive onto the motorway; drivers who entered by mistake have 60 minutes to buy, but not if they refuse at a check.',
    },
    purchase: channels,
    plateBound: true,
    summary:
      'Needed on almost every road numbered M. Enter the plate without spaces and pick the right country code (RO): the check compares plate, country code and category.',
    penalty: surcharge,
    sources: refs(S('hu-prices-2026-pdf'), S('hu-rates-en'), S('hu-decree-45-2020')),
  }
}

const D1 = ['car', 'carTrailer', 'camper']
const D1_AND_MOTO = ['car', 'carTrailer', 'camper', 'motorcycle']
const MOTO = ['motorcycle']

export const products: Doc[] = [
  national('d1-daily', 'Hungarian daily e-vignette (D1)', 'Napi e-matrica (D1)', D1, 'D1', {unit: 'days', count: 1, wording: WORD.daily}, 5320, 5550),
  national('d1-10day', 'Hungarian 10-day e-vignette (D1)', 'Heti (10 napos) e-matrica (D1)', D1, 'D1', {unit: 'days', count: 10, wording: WORD.ten}, 6620, 6900),
  national('d1-monthly', 'Hungarian monthly e-vignette (D1)', 'Havi e-matrica (D1)', D1, 'D1', {unit: 'months', count: 1, wording: WORD.monthly}, 10710, 11170),
  national('d1-annual', 'Hungarian annual e-vignette (D1)', 'Éves országos e-matrica (D1)', D1_AND_MOTO, 'D1', {unit: 'calendarYear', yearEndsNext: '01-31', wording: WORD.annual}, 59210, 61760),
  national('d1m-daily', 'Hungarian daily e-vignette (motorcycle, D1M)', 'Napi e-matrica (D1M)', MOTO, 'D1M', {unit: 'days', count: 1, wording: WORD.daily}, 2660, 2770),
  national('d1m-10day', 'Hungarian 10-day e-vignette (motorcycle, D1M)', 'Heti (10 napos) e-matrica (D1M)', MOTO, 'D1M', {unit: 'days', count: 10, wording: WORD.ten}, 3310, 3450),
  national('d1m-monthly', 'Hungarian monthly e-vignette (motorcycle, D1M)', 'Havi e-matrica (D1M)', MOTO, 'D1M', {unit: 'months', count: 1, wording: WORD.monthly}, 5360, 5590),
]

const COUNTIES: {id: string; name: string; p25: number; p26: number}[] = [
  {id: 'csongrad-csanad', name: 'Csongrád-Csanád', p25: 6890, p26: 7190},
  {id: 'bacs-kiskun', name: 'Bács-Kiskun', p25: 6890, p26: 7190},
  {id: 'pest', name: 'Pest', p25: 6890, p26: 7190},
  {id: 'fejer', name: 'Fejér', p25: 6890, p26: 7190},
  {id: 'komarom-esztergom', name: 'Komárom-Esztergom', p25: 6890, p26: 7190},
  {id: 'gyor-moson-sopron', name: 'Győr-Moson-Sopron', p25: 6890, p26: 7190},
  {id: 'jasz-nagykun-szolnok', name: 'Jász-Nagykun-Szolnok', p25: 6890, p26: 7190},
]

export const countyProducts: Doc[] = COUNTIES.map((c) => ({
  _id: `product-hu-county-${c.id}`,
  _type: 'tollProduct',
  country: ref('country-hu'),
  name: localized(`Hungarian county e-vignette: ${c.name}`, {hu: `Megyei (vármegyei) e-matrica: ${c.name}`}),
  kind: 'countyVignette',
  vehicles: D1_AND_MOTO,
  localCategory: 'D1',
  county: c.name,
  validity: {
    unit: 'calendarYear',
    yearEndsNext: '01-31',
    wording: `Annual. All tolled expressways of ${c.name} county, up to the first junction in the next county, from purchase until 24:00 on 31 January of the following year. Anyone can buy it, foreigners too.`,
  },
  prices: [price(c.p25, 'HUF', Y25[0], Y25[1], 'hu-prices-2025-news'), price(c.p26, 'HUF', Y26[0], Y26[1], 'hu-prices-2026-pdf')],
  purchase: channels,
  plateBound: true,
  summary: `Annual county vignette for ${c.name}. From 1 Oct 2026 the law says "megyei" instead of "vármegyei"; it is the same product.`,
  penalty: surcharge,
  sources: refs(S('hu-prices-2026-pdf'), S('hu-decree-45-2020'), S('hu-faq-en')),
}))

export const m1Regional: Doc = {
  _id: 'product-hu-m1-regional',
  _type: 'tollProduct',
  country: ref('country-hu'),
  name: localized('Hungarian M1 regional e-vignette (Pest, Fejér, Komárom-Esztergom, Győr-Moson-Sopron)', {hu: 'M1 regionális e-matrica'}),
  kind: 'countyVignette',
  vehicles: D1_AND_MOTO,
  localCategory: 'D1',
  county: 'Pest + Fejér + Komárom-Esztergom + Győr-Moson-Sopron',
  validity: {
    unit: 'calendarYear',
    yearEndsNext: '01-31',
    wording: 'New in 2026. Annual. All tolled expressways of the four M1 counties (also the M0, the M7 to Balatonvilágos and the M5 to Lajosmizse), until 24:00 on 31 January of the following year.',
  },
  prices: [price(15000, 'HUF', Y26[0], Y26[1], 'hu-prices-2026-pdf')],
  purchase: channels,
  plateBound: true,
  summary: 'Covers the same roads as four county vignettes (4 × 7,190 HUF) for 15,000 HUF. The decree sets no end date (first sold for 2026, §22/A(4)); the 2027 price is not published yet.',
  penalty: surcharge,
  sources: refs(S('hu-m1-regional'), S('hu-prices-2026-pdf'), S('hu-decree-45-2020')),
}

const NATIONAL_IDS = products.map((p) => p._id)
const county = (id: string) => `product-hu-county-${id}`
const M1_COUNTIES = new Set(['pest', 'fejer', 'komarom-esztergom', 'gyor-moson-sopron'])

function tolled(id: string, road: string, from: string, to: string, lengthKm: number, countyId: string, note?: string): Doc {
  const name = COUNTIES.find((c) => c.id === countyId)!.name
  return {
    _id: `section-hu-${id}`,
    _type: 'roadSection',
    country: ref('country-hu'),
    road,
    from,
    to,
    lengthKm,
    tolled: true,
    coveredBy: refs(...NATIONAL_IDS, county(countyId), ...(M1_COUNTIES.has(countyId) ? [m1Regional._id] : [])),
    counties: [name],
    note,
    sources: refs(S('hu-decree-45-2020'), S('hu-faq-en')),
  }
}

function free(id: string, road: string, from: string, to: string, lengthKm: number, note: string): Doc {
  return {
    _id: `section-hu-${id}`,
    _type: 'roadSection',
    country: ref('country-hu'),
    road,
    from,
    to,
    lengthKm,
    tolled: false,
    note,
    sources: refs(S('hu-toll-free-sections'), S('hu-faq-en')),
  }
}

// Corridor (a): Nădlac II → M43 → M5 → M0 → M1 → Hegyeshalom.
// Corridor (b): Borș I / Ártánd → main roads 42 and 4 (free) → M4 → M0 → M1.
export const sections: Doc[] = [
  tolled('m43', 'M43', 'Csanádpalota (border with Nădlac II)', 'Szeged (M5)', 55, 'csongrad-csanad'),
  tolled('m5-szeged-114', 'M5', 'Szeged', 'Kiskunfélegyháza-dél (junction 114)', 60, 'csongrad-csanad'),
  tolled('m5-114-67', 'M5', 'Kiskunfélegyháza-dél (114)', 'Lajosmizse (67)', 50, 'bacs-kiskun'),
  tolled('m5-67-13', 'M5', 'Lajosmizse (67)', 'Budapest (13)', 55, 'pest'),
  tolled('m0-m5-m1', 'M0', 'M5 junction', 'M1 junction', 35, 'pest', 'The whole M0 ring is tolled and covered by the Pest county vignette.'),
  tolled('m1-budapest-39', 'M1', 'Budapest city limit', 'Bicske (39)', 31, 'pest'),
  tolled(
    'm1-39-48',
    'M1',
    'Bicske (39)',
    'Szárliget (48)',
    9,
    'fejer',
    'Only the Fejér county vignette covers this stretch. Pest + Komárom-Esztergom + Győr-Moson-Sopron leave a gap here.',
  ),
  tolled('m1-48-94', 'M1', 'Szárliget (48)', 'Bábolna (94)', 46, 'komarom-esztergom'),
  tolled('m1-94-border', 'M1', 'Bábolna (94)', 'Hegyeshalom (Austrian border)', 77, 'gyor-moson-sopron'),
  free('road42-4-artand-kisujszallas', 'Main roads 42 and 4', 'Ártánd (border with Borș)', 'Kisújszállás', 110, 'Main roads are free for cars. There is no motorway yet between Berettyóújfalu and Kisújszállás.'),
  free('m4-kisujszallas-118', 'M4', 'Kisújszállás', 'Törökszentmiklós-nyugat (118)', 20, 'Toll-free since 22 Dec 2025.'),
  tolled('m4-118-99', 'M4', 'Törökszentmiklós-nyugat (118)', 'Szolnok-észak (99)', 20, 'jasz-nagykun-szolnok'),
  tolled('m4-99-m0', 'M4', 'Szolnok-észak (99)', 'M0 (Budapest)', 80, 'pest'),
]

export const country: Doc = {
  _id: 'country-hu',
  _type: 'country',
  code: 'HU',
  name: localized('Hungary', {ro: 'Ungaria', de: 'Ungarn', hu: 'Magyarország'}),
  currency: 'HUF',
  carTollSummary:
    'An e-vignette (e-matrica) for almost every road numbered M: national daily, 10-day, monthly or annual, or annual county vignettes, and since 2026 an M1 regional vignette. Main roads are free.',
  sources: refs(S('hu-rates-en'), S('hu-decree-45-2020')),
}

export const rules: Doc[] = [
  {
    _id: 'rule-hu-buy-before',
    _type: 'rule',
    country: ref('country-hu'),
    topic: 'tollHandling',
    title: 'Buy the e-vignette before the motorway; plate and country code must match (Hungary)',
    requirement:
      'Hold the e-vignette before you drive onto a tolled section. Drivers who entered by mistake have 60 minutes to buy, but lose that option if they refuse to buy at a check. Enter the plate without spaces and choose country code RO; a wrong country code counts as no vignette. Wrong plates can be corrected (1,470 HUF), after a surcharge only within 60 days and only if at most 3 characters are wrong.',
    vehicles: ['car', 'carTrailer', 'camper', 'motorcycle'],
    severity: 'critical',
    penalty: surcharge,
    sources: refs(S('hu-rates-en'), S('hu-surcharge'), S('hu-corrections'), S('hu-decree-45-2020')),
  },
  {
    _id: 'rule-hu-no-winter-tyres',
    _type: 'rule',
    country: ref('country-hu'),
    topic: 'winterTyres',
    title: 'No winter-tyre obligation, but chains where signed (Hungary)',
    requirement:
      'Hungary has no general winter-tyre rule. Under a "snow chains mandatory" sign, chains go on at least one driven axle (max 50 km/h). If the sign stands at a border crossing, only vehicles carrying chains may enter. Studded tyres are banned.',
    vehicles: ['car', 'carTrailer', 'camper'],
    severity: 'info',
    sources: refs(S('hu-kresz'), S('hu-katasztrofavedelem-winter')),
  },
  {
    _id: 'rule-hu-lights',
    _type: 'rule',
    country: ref('country-hu'),
    topic: 'lights',
    title: 'Lights on outside towns, day and night (Hungary)',
    requirement: 'Outside built-up areas cars use daytime running lights or dipped headlights at all times. Motorcycles use dipped headlights everywhere, always.',
    vehicles: ['car', 'carTrailer', 'camper', 'motorcycle'],
    severity: 'important',
    sources: refs(S('hu-kresz')),
  },
  {
    _id: 'rule-hu-alcohol',
    _type: 'rule',
    country: ref('country-hu'),
    topic: 'alcohol',
    title: 'Zero alcohol (Hungary)',
    requirement: 'No alcohol at all in the driver’s body. The limit is 0.0.',
    vehicles: ['car', 'carTrailer', 'camper', 'motorcycle'],
    severity: 'critical',
    sources: refs(S('hu-kresz')),
  },
  {
    _id: 'rule-hu-trailer-speed',
    _type: 'rule',
    country: ref('country-hu'),
    topic: 'speed',
    title: 'Car with trailer: 80 km/h on the motorway (Hungary)',
    requirement: 'With a trailer or caravan: 80 km/h on motorways, 70 outside towns, 50 in towns. No separate vignette for the trailer behind a D1 car.',
    vehicles: ['carTrailer'],
    severity: 'important',
    sources: refs(S('hu-kresz'), S('hu-faq-en')),
  },
]

export const claims: Doc[] = [
  claim('hu-75-days', {
    statement: 'The reduced surcharge applies if you pay within 75 days; it is 28,150 HUF.',
    quote: 'Alap pótdíj (fizetés 75 napon belül): 28 150 Ft',
    seenOn: 'hu-index-75-days',
    country: 'hu',
    verdict: 'wrong',
    correctedBy: ['rule-hu-buy-before', 'product-hu-d1-10day'],
    explanation:
      'The base surcharge applies to payment within 60 days (decree §12). 75 days is the deadline for relief requests. The official 2026 amount is 27,790 HUF; 28,150 is a projection for 2027.',
  }),
  claim('hu-2027-official', {
    statement: 'Official: 2027 e-vignette prices (daily 5,622 HUF).',
    quote: 'Hivatalos: ennyivel drágul 2027 januárjától',
    seenOn: 'hu-vg-2027-official',
    country: 'hu',
    verdict: 'misleading',
    correctedBy: ['product-hu-d1-daily', 'product-hu-d1-10day', 'product-hu-d1-annual'],
    explanation:
      'Not official on 29 Sep 2026: the article itself says prices become official when the regulation is published. Prices are rounded to 10 HUF, so 5,622 cannot be final. Until then, the 2026 prices apply.',
  }),
  claim('hu-m6-free-old-prices', {
    statement: 'The M6 from the M60 to the Croatian border is free; the 10-day vignette costs 6,620 HUF.',
    quote: 'M6 zwischen M60 Autobahn und kroatischer Grenze',
    seenOn: 'hu-autozeitung-m6',
    country: 'hu',
    verdict: 'outdated',
    correctedBy: ['product-hu-d1-10day', 'product-hu-d1-daily', 'product-hu-d1-annual'],
    explanation: 'The M6 is tolled to the border since 1 Jan 2026. 2026 D1 prices: daily 5,550, 10-day 6,900, annual 61,760 HUF. The list also misses the free M4 Kisújszállás–Törökszentmiklós section.',
  }),
  claim('hu-camper-d2', {
    statement: 'A camper up to 3.5 t pays category D2.',
    quote: 'Wohnmobil (bis zu 3,5 Tonnen zGG) … Kategorie D2',
    seenOn: 'hu-carwow-camper',
    country: 'hu',
    verdict: 'wrong',
    correctedBy: ['product-hu-d1-10day'],
    explanation: 'A camper up to 3.5 t with M1 in field J and at most 7 seats is D1, like a car. Only more seats or an N1 entry make it D2.',
  }),
  claim('hu-verivox-old-prices', {
    statement: '10-day vignette 3,820 HUF, annual 46,850 HUF; there is a bus category B2; no daily vignette.',
    quote: '10-Tages-Vignette: 3.820 HUF',
    seenOn: 'hu-verivox-old',
    country: 'hu',
    verdict: 'outdated',
    correctedBy: ['product-hu-d1-10day', 'product-hu-d1-annual', 'product-hu-d1-daily'],
    explanation: '2026 D1: 10-day 6,900, annual 61,760 HUF. B2 was abolished on 1 Feb 2024, and a daily vignette exists since 1 Apr 2024.',
  }),
  claim('hu-no-daily', {
    statement: 'Hungary sells 10-day, monthly and annual vignettes (no daily).',
    quote: 'vignetta de 10 zile, lunar și anuale',
    seenOn: 'hu-roviniete-ro-no-daily',
    country: 'hu',
    verdict: 'outdated',
    correctedBy: ['product-hu-d1-daily', 'product-hu-m1-regional'],
    explanation: 'A daily vignette exists since 1 Apr 2024, and there are county vignettes and, in 2026, the M1 regional vignette.',
  }),
  claim('hu-keep-2-years', {
    statement: 'Keep the Hungarian vignette receipt for 2 years.',
    quote: 'aus Beweisgründen 2 Jahre aufzubewahren',
    seenOn: 'hu-oeamtc-2-years',
    country: 'hu',
    verdict: 'outdated',
    correctedBy: ['rule-hu-buy-before'],
    explanation: 'The operator says 3 years from the last day of validity (not needed when bought through a registered account on the official shop).',
  }),
  claim('hu-ends-at-midnight-start', {
    statement: 'The 10-day vignette is valid until 00:00 of the 10th day.',
    quote: 'until 00:00 of the 10th day',
    seenOn: 'hu-hungary-vignette-eu',
    country: 'hu',
    verdict: 'wrong',
    correctedBy: ['product-hu-d1-10day', 'product-hu-d1-annual'],
    explanation: 'The decree says until 24:00 of the 10th day, and until 24:00 on 31 January for annual products: a full day more than the reseller says.',
  }),
  claim('ro-winter-dates-from-hungary', {
    statement: 'In Romania winter tyres are compulsory from 1 November to 31 March.',
    quote: 'november 1. és március 31. között kötelező a téli gumik',
    seenOn: 'hu-katasztrofavedelem-winter',
    country: 'ro',
    verdict: 'wrong',
    correctedBy: ['rule-ro-winter-tyres'],
    explanation:
      'An official Hungarian agency page, but Romanian law (OUG 195/2002 art. 102) ties the duty to snow, ice or black ice on the road, on any date, not to a calendar window. Romania’s interior ministry says the same.',
  }),
]
