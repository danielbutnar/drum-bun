// Austria, from research/austria.md (checked 29 Sep 2026).
// Vignette years run 1 Dec–30 Nov. 2027 prices were not published on
// 29 Sep 2026, so trips starting from 1 Dec 2026 get an estimate flag.

import {claim, type Doc, localized, penalty, price, ref, refs, S, source, withKeys} from './helpers'

const Y25 = ['2024-12-01', '2025-11-30'] as const
const Y26 = ['2025-12-01', '2026-11-30'] as const

export const sources: Doc[] = [
  source('at-mautordnung-v87-de', {
    title: 'ASFINAG Mautordnung v87 (gültig ab 1.1.2026)',
    url: 'https://media.asfinag.at/media/citlddtb/00_mo_v87.pdf',
    publisher: 'ASFINAG',
    language: 'de',
    trust: 'official',
    country: 'at',
    pageDate: '2026-01-01',
  }),
  source('at-mautordnung-v87-en', {
    title: 'ASFINAG Tolling Regulations v87 (English translation, valid from 1 Jan 2026)',
    url: 'https://media.asfinag.at/media/00sbusiu/00_mo_v87_tolling-regulations_en.pdf',
    publisher: 'ASFINAG',
    language: 'en',
    trust: 'official',
    country: 'at',
    pageDate: '2026-01-01',
    notes: 'Part A II 1.2 of the translation reads as if motorcycles were exempt from section tolls; the binding German text only exempts sidecars.',
  }),
  source('at-vignette-folder-2026', {
    title: 'ASFINAG vignette leaflet 2026',
    url: 'https://media.asfinag.at/media/xq0lud1b/asf_vignettenfolder_2026_en.pdf',
    publisher: 'ASFINAG',
    language: 'en',
    trust: 'official',
    country: 'at',
    pageDate: '2025-10-01',
  }),
  source('at-vignette-page-de', {
    title: 'ASFINAG: Vignette (Preise, 18-Tage-Frist)',
    url: 'https://www.asfinag.at/maut-vignette/vignette/',
    publisher: 'ASFINAG',
    language: 'de',
    trust: 'official',
    country: 'at',
  }),
  source('at-vignette-faq-en', {
    title: 'ASFINAG: FAQ vignette',
    url: 'https://www.asfinag.at/en/toll/vignette/faq-vignette/',
    publisher: 'ASFINAG',
    language: 'en',
    trust: 'official',
    country: 'at',
  }),
  source('at-price-ordinance-2026', {
    title: 'Vignettenpreisverordnung 2025 (BGBl II Nr. 225/2025): prices from 1 Dec 2025',
    url: 'https://www.ris.bka.gv.at/Dokumente/BgblAuth/BGBLA_2025_II_225/BGBLA_2025_II_225.html',
    publisher: 'RIS (Bundeskanzleramt)',
    language: 'de',
    trust: 'official',
    country: 'at',
    pageDate: '2025-10-22',
  }),
  source('at-price-ordinance-2025', {
    title: 'Vignettenpreisverordnung 2024 (BGBl II Nr. 307/2024): prices from 1 Dec 2024',
    url: 'https://www.ris.bka.gv.at/Dokumente/BgblAuth/BGBLA_2024_II_307/BGBLA_2024_II_307.html',
    publisher: 'RIS (Bundeskanzleramt)',
    language: 'de',
    trust: 'official',
    country: 'at',
    pageDate: '2024-11-11',
  }),
  source('at-bstmg-11', {
    title: '§ 11 BStMG (Bundesstraßen-Mautgesetz): digital only from 1 Dec 2026',
    url: 'https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=20002090&Paragraf=11',
    publisher: 'RIS (Bundeskanzleramt)',
    language: 'de',
    trust: 'official',
    country: 'at',
  }),
  source('at-exemptions-oesterreich-gv', {
    title: 'oesterreich.gv.at: route-related exemptions from the vignette',
    url: 'https://www.oesterreich.gv.at/en/themen/mobilitaet/kfz/10/Vignette-und-Maut/streckenbezogene_Ausnahmen-von-der-Vignettenpflicht',
    publisher: 'oesterreich.gv.at',
    language: 'en',
    trust: 'official',
    country: 'at',
    pageDate: '2026-01-01',
  }),
  source('at-service-controls', {
    title: 'ASFINAG: service and controls (substitute toll)',
    url: 'https://www.asfinag.at/en/toll/service-and-controls/',
    publisher: 'ASFINAG',
    language: 'en',
    trust: 'official',
    country: 'at',
  }),
  source('at-plate-correction', {
    title: 'ASFINAG toll shop: licence plate changes',
    url: 'https://shop.asfinag.at/en/info-pages/license-plate/',
    publisher: 'ASFINAG',
    language: 'en',
    trust: 'official',
    country: 'at',
  }),
  source('at-kfg-102', {
    title: '§ 102 KFG (winter equipment, mandatory equipment)',
    url: 'https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10011384&Paragraf=102',
    publisher: 'RIS (Bundeskanzleramt)',
    language: 'de',
    trust: 'official',
    country: 'at',
  }),
  source('at-kfg-134', {
    title: '§ 134 KFG (fines up to 10,000 euros)',
    url: 'https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10011384&Paragraf=134',
    publisher: 'RIS (Bundeskanzleramt)',
    language: 'de',
    trust: 'official',
    country: 'at',
  }),
  source('at-bmimi-winter-tyres', {
    title: 'BMIMI: Winterreifen',
    url: 'https://www.bmimi.gv.at/verkehrssicherheit/massnahmen/winterreifen.html',
    publisher: 'Bundesministerium für Innovation, Mobilität und Infrastruktur',
    language: 'de',
    trust: 'official',
    country: 'at',
    notes: 'Says fines reach 5,000 euros when others are endangered; § 134 KFG allows up to 10,000 euros.',
  }),
  source('at-oesterreich-gv-winter-tyres', {
    title: 'oesterreich.gv.at: winter tyres',
    url: 'https://www.oesterreich.gv.at/en/themen/mobilitaet/kfz/10/2/Seite.063100',
    publisher: 'oesterreich.gv.at',
    language: 'en',
    trust: 'official',
    country: 'at',
    pageDate: '2026-01-12',
  }),
  source('at-emergency-corridor', {
    title: 'oesterreich.gv.at: emergency corridor (Rettungsgasse)',
    url: 'https://www.oesterreich.gv.at/en/themen/mobilitaet/kfz/10/Seite.063130/Seite.065000',
    publisher: 'oesterreich.gv.at',
    language: 'en',
    trust: 'official',
    country: 'at',
    pageDate: '2026-01-12',
  }),
  source('eu-border-controls', {
    title: 'European Commission: temporary reintroduction of border control',
    url: 'https://home-affairs.ec.europa.eu/policies/schengen/schengen-area/temporary-reintroduction-border-control_en',
    publisher: 'European Commission',
    language: 'en',
    trust: 'official',
  }),
  source('at-austria-info-lez', {
    title: 'Austrian National Tourist Office: toll, vignette and GO-Box',
    url: 'https://www.austria.info/en-gb/planning/toll-vignette-and-go-box/',
    publisher: 'Österreich Werbung',
    language: 'en',
    trust: 'official',
    country: 'at',
  }),
  // Pages drivers still find that say something else.
  source('at-infocontact-2026', {
    title: 'Vigneta Austria 2026: preț, unde se cumpără',
    url: 'https://www.infocontact.ro/vigneta-taxa-drum-austria-2026/',
    publisher: 'infocontact.ro',
    language: 'ro',
    trust: 'blog',
    country: 'at',
    pageDate: '2025-06-07',
  }),
  source('at-autozeitung-ersatzmaut', {
    title: 'Digitale Vignette Österreich: Maut, Preise, Strafen',
    url: 'https://www.autozeitung.de/maut-digitale-vignette-oesterreich-181238.html',
    publisher: 'autozeitung.de',
    language: 'de',
    trust: 'press',
    country: 'at',
    pageDate: '2025-12-15',
  }),
  source('at-chaletsplus-a1', {
    title: 'Everything you need to know about the vignette in Austria',
    url: 'https://www.chaletsplus.com/en/blog/everything-you-need-to-know-about-the-vignette-in-austria',
    publisher: 'chaletsplus.com',
    language: 'en',
    trust: 'blog',
    country: 'at',
    pageDate: '2025-01-15',
  }),
  source('at-kfz-teile-18-days', {
    title: 'Jahresvignette Österreich 2027',
    url: 'https://kfz-teile.at/blog/jahresvignette-oesterreich-2027/',
    publisher: 'kfz-teile.at',
    language: 'de',
    trust: 'blog',
    country: 'at',
  }),
  source('at-cargotrack-10-day', {
    title: 'Vinieta Austria: tot ce trebuie să știi',
    url: 'https://cargotrack.ro/blog/vinieta-austria-tot-ce-trebuie-sa-stii/',
    publisher: 'cargotrack.ro',
    language: 'ro',
    trust: 'blog',
    country: 'at',
  }),
  source('at-j2ski-kufstein', {
    title: 'Austrian toll vignette (forum thread)',
    url: 'https://www.j2ski.com/ski-chat-forum/posts/list/0/17869/austrian-toll-vignette.page',
    publisher: 'j2ski forum',
    language: 'en',
    trust: 'forum',
    country: 'at',
    pageDate: '2017-12-01',
  }),
  source('at-orf-plate-typo', {
    title: 'Tippfehler bei digitaler Vignette kostet Ersatzmaut',
    url: 'https://help.orf.at/stories/3225148/',
    publisher: 'ORF help',
    language: 'de',
    trust: 'press',
    country: 'at',
    pageDate: '2024-05-25',
  }),
]

const channels = withKeys([
  {channel: 'officialWeb', label: 'ASFINAG toll shop', url: 'https://shop.asfinag.at/en'},
  {channel: 'officialApp', label: 'ASFINAG app'},
  {channel: 'retail', label: 'About 6,000 points of sale (petrol stations, tobacconists, ÖAMTC, ARBÖ, ADAC)', url: 'https://www.asfinag.at/vertriebsstellen'},
  {channel: 'borderPoint', label: 'ASFINAG toll stations and vending machines'},
])

const ONLINE_18 = {
  onlineDelayDays: 18,
  delayAppliesTo:
    'Annual and 2-month digital vignettes bought online (toll shop or app) by a private customer: valid from the 18th day after purchase, because of the 14-day right of withdrawal plus 3 days.',
  immediateOptions:
    'Buy it at a point of sale, an ASFINAG toll station or a vending machine, where it is valid at once. Or buy 1-day or 10-day vignettes, which are valid immediately online.',
}

// min/max describe one penalty: the substitute toll you pay on the spot.
// The court fine for not paying it is a different penalty, so it lives in the note.
const carPenalty = penalty({
  min: 200,
  max: 200,
  currency: 'EUR',
  note: 'Substitute toll (Ersatzmaut) 200 euros for a car from 1 Jan 2026 (was 120). If it is not paid: fine of 300–3,000 euros. A wrong plate on a digital vignette counts as no vignette.',
  source: 'at-mautordnung-v87-en',
})
const motoPenalty = penalty({
  min: 100,
  max: 100,
  currency: 'EUR',
  note: 'Substitute toll 100 euros for a motorcycle from 1 Jan 2026 (was 65). If it is not paid: fine of 300–3,000 euros.',
  source: 'at-mautordnung-v87-en',
})

type Validity = {unit: 'days' | 'months' | 'calendarYear'; count?: number; yearStartsPrevious?: string; yearEndsNext?: string; wording: string}

function vignette(
  id: string,
  name: {en: string; de: string},
  vehicles: string[],
  category: 'A' | 'B',
  validity: Validity,
  p25: number,
  p26: number,
  online18: boolean,
): Doc {
  return {
    _id: `product-at-${id}`,
    _type: 'tollProduct',
    country: ref('country-at'),
    name: localized(name.en, {de: name.de}),
    kind: 'vignette',
    vehicles,
    localCategory: category,
    validity,
    prices: [
      price(p25, 'EUR', Y25[0], Y25[1], 'at-price-ordinance-2025'),
      price(p26, 'EUR', Y26[0], Y26[1], 'at-price-ordinance-2026'),
    ],
    activation: online18
      ? ONLINE_18
      : {
          onlineDelayDays: 0,
          immediateOptions: 'Valid immediately, online too (you confirm early start of the contract when buying).',
        },
    purchase: channels,
    plateBound: true,
    summary:
      'Needed on every Austrian motorway and expressway. A digital vignette is tied to the plate and country code you enter; for validity from 1 Dec 2026 only digital vignettes exist.',
    penalty: category === 'B' ? carPenalty : motoPenalty,
    sources: refs(S('at-mautordnung-v87-en'), S('at-vignette-folder-2026'), S('at-price-ordinance-2026')),
  }
}

const CAR = ['car', 'carTrailer', 'camper']
const MOTO = ['motorcycle']

const W = {
  day: 'One calendar day: from the time of purchase to 23:59 if bought for today, otherwise 00:00–23:59 of the chosen day. Digital only.',
  ten: 'Ten consecutive calendar days, the start day included (20 Jan → 29 Jan, 23:59:59). The last possible start of a vignette year is 30 November.',
  two: 'Two months: ends at midnight on the day of the second month with the same number as the start (10 Jan → 10 Mar). The last possible start of a vignette year is 30 November.',
  year: 'Valid for its vignette year from 1 December of the previous year to 31 January of the following year (2026: 1 Dec 2025 – 31 Jan 2027).',
}

export const products: Doc[] = [
  vignette('car-1day', {en: 'Austrian 1-day vignette (car)', de: '1-Tages-Vignette'}, CAR, 'B', {unit: 'days', count: 1, wording: W.day}, 9.3, 9.6, false),
  vignette('car-10day', {en: 'Austrian 10-day vignette (car)', de: '10-Tages-Vignette'}, CAR, 'B', {unit: 'days', count: 10, wording: W.ten}, 12.4, 12.8, false),
  vignette('car-2month', {en: 'Austrian 2-month vignette (car)', de: '2-Monats-Vignette'}, CAR, 'B', {unit: 'months', count: 2, wording: W.two}, 31.1, 32, true),
  vignette(
    'car-annual',
    {en: 'Austrian annual vignette (car)', de: 'Jahresvignette'},
    CAR,
    'B',
    {unit: 'calendarYear', yearStartsPrevious: '12-01', yearEndsNext: '01-31', wording: W.year},
    103.8,
    106.8,
    true,
  ),
  vignette('moto-1day', {en: 'Austrian 1-day vignette (motorcycle)', de: '1-Tages-Vignette Motorrad'}, MOTO, 'A', {unit: 'days', count: 1, wording: W.day}, 3.7, 3.8, false),
  vignette('moto-10day', {en: 'Austrian 10-day vignette (motorcycle)', de: '10-Tages-Vignette Motorrad'}, MOTO, 'A', {unit: 'days', count: 10, wording: W.ten}, 4.9, 5.1, false),
  vignette('moto-2month', {en: 'Austrian 2-month vignette (motorcycle)', de: '2-Monats-Vignette Motorrad'}, MOTO, 'A', {unit: 'months', count: 2, wording: W.two}, 12.4, 12.8, true),
  vignette(
    'moto-annual',
    {en: 'Austrian annual vignette (motorcycle)', de: 'Jahresvignette Motorrad'},
    MOTO,
    'A',
    {unit: 'calendarYear', yearStartsPrevious: '12-01', yearEndsNext: '01-31', wording: W.year},
    41.5,
    42.7,
    true,
  ),
]

const allVignettes = products.map((p) => p._id)

export const country: Doc = {
  _id: 'country-at',
  _type: 'country',
  code: 'AT',
  name: localized('Austria', {ro: 'Austria', de: 'Österreich', hu: 'Ausztria'}),
  currency: 'EUR',
  carTollSummary:
    'A vignette for every motorway and expressway. On the routes from Hungary to Munich, Passau or Vienna nothing else is due: the section tolls (A 9, A 10, A 11, A 13, S 16) are elsewhere.',
  sources: refs(S('at-mautordnung-v87-en'), S('at-vignette-folder-2026')),
}

export const sections: Doc[] = [
  {
    _id: 'section-at-a4-nickelsdorf-vienna',
    _type: 'roadSection',
    country: ref('country-at'),
    road: 'A 4',
    from: 'Nickelsdorf (Hungarian border)',
    to: 'Vienna',
    lengthKm: 65,
    tolled: true,
    coveredBy: refs(...allVignettes),
    note: 'No vignette-free stretch at the Hungarian border: toll checks at Nickelsdorf, Gols, Zurndorf and Bruck/Leitha.',
    sources: refs(S('at-mautordnung-v87-en')),
  },
  {
    _id: 'section-at-a1-vienna-salzburg-nord',
    _type: 'roadSection',
    country: ref('country-at'),
    road: 'A 1',
    from: 'Vienna',
    to: 'Salzburg Nord',
    lengthKm: 290,
    tolled: true,
    coveredBy: refs(...allVignettes),
    note: 'Near Linz (about km 155–168) an air-quality (IG-L) 100 km/h limit switches on with the overhead signs.',
    sources: refs(S('at-mautordnung-v87-en')),
  },
  {
    _id: 'section-at-a1-salzburg-walserberg',
    _type: 'roadSection',
    country: ref('country-at'),
    road: 'A 1',
    from: 'Salzburg Nord',
    to: 'Walserberg (German border)',
    lengthKm: 12,
    tolled: false,
    note: 'Vignette-free since 15 Dec 2019 (§ 13(1a) BStMG). Only this stretch: the rest of the A 1 needs a vignette.',
    sources: refs(S('at-exemptions-oesterreich-gv'), S('at-mautordnung-v87-de')),
  },
  {
    _id: 'section-at-a1-a25-a8-vienna-suben',
    _type: 'roadSection',
    country: ref('country-at'),
    road: 'A 1 / A 25 / A 8',
    from: 'Vienna',
    to: 'Suben (German border near Passau)',
    lengthKm: 265,
    tolled: true,
    coveredBy: refs(...allVignettes),
    note: 'No vignette-free stretch at Suben (checks at Suben and Kematen).',
    sources: refs(S('at-mautordnung-v87-en')),
  },
]

export const rules: Doc[] = [
  {
    _id: 'rule-at-winter-tyres',
    _type: 'rule',
    country: ref('country-at'),
    topic: 'winterTyres',
    title: 'Winter tyres in wintry conditions, 1 November – 15 April (Austria)',
    requirement:
      'From 1 November to 15 April, on snow, slush or ice, cars may only be driven with winter tyres on all wheels (marked M+S, M.S., M&S or with the snowflake symbol, at least 4 mm tread), or with snow chains on two drive wheels when the road is fully covered with snow or ice. Applies to foreign cars too.',
    vehicles: ['car', 'carTrailer', 'camper'],
    season: {_type: 'seasonWindow', from: '11-01', to: '04-15'},
    conditional: true,
    condition: 'Only in wintry road conditions (snow, slush, ice) inside the season.',
    severity: 'critical',
    penalty: penalty({
      min: 35,
      max: 10000,
      currency: 'EUR',
      note: 'The ministry names 35 euros on the spot and up to 5,000 euros if others are endangered; the law (§ 134 KFG) allows up to 10,000 euros.',
      source: 'at-kfg-134',
    }),
    sources: refs(S('at-kfg-102'), S('at-oesterreich-gv-winter-tyres'), S('at-bmimi-winter-tyres')),
  },
  {
    _id: 'rule-at-plate-registration',
    _type: 'rule',
    country: ref('country-at'),
    topic: 'tollHandling',
    title: 'Enter the plate exactly: a typo counts as no vignette (Austria)',
    requirement:
      'A digital vignette only counts for the plate and country registered. Correct typos for free before validity starts. After the start, only annual vignettes can be changed, for 18 euros; 1-day, 10-day and 2-month vignettes cannot.',
    vehicles: ['car', 'carTrailer', 'camper', 'motorcycle'],
    severity: 'critical',
    penalty: carPenalty,
    sources: refs(S('at-mautordnung-v87-en'), S('at-plate-correction')),
  },
  {
    _id: 'rule-at-equipment',
    _type: 'rule',
    country: ref('country-at'),
    topic: 'equipment',
    title: 'First-aid kit, warning triangle and high-visibility vest (Austria)',
    requirement:
      'Every driver carries a first-aid kit, motorcyclists too. Cars also carry a warning triangle and a high-visibility vest, worn when setting up the triangle or standing outside the car on a motorway.',
    vehicles: ['car', 'carTrailer', 'camper', 'motorcycle'],
    severity: 'important',
    sources: refs(S('at-kfg-102')),
  },
  {
    _id: 'rule-at-emergency-corridor',
    _type: 'rule',
    country: ref('country-at'),
    topic: 'emergencyCorridor',
    title: 'Form an emergency corridor as soon as traffic slows (Austria)',
    requirement:
      'On motorways, as soon as traffic starts to come to a halt: the leftmost lane moves left, all other lanes move right, whether or not an emergency vehicle is near.',
    vehicles: ['car', 'carTrailer', 'camper', 'motorcycle'],
    severity: 'important',
    penalty: penalty({
      max: 2180,
      currency: 'EUR',
      note: 'Up to 726 euros; 72–2,180 euros if emergency vehicles are held up.',
      source: 'at-emergency-corridor',
    }),
    sources: refs(S('at-emergency-corridor')),
  },
  {
    _id: 'rule-at-border-checks',
    _type: 'rule',
    country: ref('country-at'),
    topic: 'border',
    title: 'Border checks at the Hungarian border until 15 March 2027 (Austria)',
    requirement: 'Austria checks its land borders with Hungary, Slovenia, Czechia and Slovakia. Carry an ID card or passport for everyone in the car.',
    vehicles: ['car', 'carTrailer', 'camper', 'motorcycle'],
    effectiveFrom: '2026-09-16',
    effectiveTo: '2027-03-15',
    severity: 'important',
    sources: refs(S('eu-border-controls')),
  },
  {
    _id: 'rule-at-no-sticker',
    _type: 'rule',
    country: ref('country-at'),
    topic: 'other',
    title: 'No environmental sticker needed for cars in Austria',
    requirement: 'Austrian environmental zones only affect goods vehicles (N1–N3). Private cars need no sticker.',
    vehicles: ['car', 'carTrailer', 'camper', 'motorcycle'],
    severity: 'info',
    sources: refs(S('at-austria-info-lez')),
  },
]

export const claims: Doc[] = [
  claim('at-old-prices-2026-title', {
    statement: 'Austrian vignette 2026: 1 day 8.60, 10 days 11.50, 2 months 28.90, 1 year 96.40 euros; substitute toll 120 euros.',
    quote: '1 An 96,40 EUR',
    seenOn: 'at-infocontact-2026',
    country: 'at',
    verdict: 'outdated',
    correctedBy: ['product-at-car-1day', 'product-at-car-10day', 'product-at-car-2month', 'product-at-car-annual', 'rule-at-plate-registration'],
    explanation:
      'The page is titled 2026 but lists 2024 prices. 2026 car prices are 9.60 / 12.80 / 32.00 / 106.80 euros (BGBl II 225/2025), and the substitute toll is 200 euros for offences from 1 Jan 2026.',
  }),
  claim('at-ersatzmaut-120', {
    statement: 'The Austrian substitute toll is at least 120 euros for cars and 65 for motorcycles.',
    quote: 'mindestens 120 Euro bei Pkw und 65 Euro bei Motorrädern',
    seenOn: 'at-autozeitung-ersatzmaut',
    country: 'at',
    verdict: 'outdated',
    correctedBy: ['product-at-car-10day', 'product-at-moto-10day'],
    explanation: 'For offences from 1 Jan 2026 it is 200 euros for cars and 100 for motorcycles (Mautordnung v87 A I 1.9.3.2).',
  }),
  claim('at-a1-exempt', {
    statement: 'The Westautobahn A1 is exempt from the vignette.',
    quote: 'Westautobahn A1, Linzer Autobahn A26 ... are exempt',
    seenOn: 'at-chaletsplus-a1',
    country: 'at',
    verdict: 'wrong',
    correctedBy: ['section-at-a1-salzburg-walserberg', 'section-at-a1-vienna-salzburg-nord'],
    explanation: 'Only the 12 km from the German border at Walserberg to Salzburg Nord are vignette-free. The rest of the A 1 needs a vignette.',
  }),
  claim('at-18-days-all', {
    statement: 'A digital vignette is only valid 18 days after booking, so buy a sticker for spontaneous trips.',
    quote: 'Die digitale Vignette gilt erst 18 Tage nach der Buchung.',
    seenOn: 'at-kfz-teile-18-days',
    country: 'at',
    verdict: 'misleading',
    correctedBy: ['product-at-car-1day', 'product-at-car-10day', 'product-at-car-2month', 'product-at-car-annual'],
    explanation:
      'The 18-day wait only applies to annual and 2-month vignettes bought online by private customers. 1-day and 10-day vignettes are valid at once, and anything bought at a point of sale, toll station or vending machine is valid at once. For validity from 1 Dec 2026 there is no sticker at all.',
  }),
  claim('at-10day-11-50', {
    statement: 'The 10-day vignette went up from 11.50 to 12.80 euros.',
    quote: 'a crescut de la 11,50 la 12,80 euro',
    seenOn: 'at-cargotrack-10-day',
    country: 'at',
    verdict: 'misleading',
    correctedBy: ['product-at-car-10day'],
    explanation: 'The 2025 price was 12.40 euros, so the 2026 rise was 12.40 → 12.80.',
  }),
  claim('at-kufstein-needs-vignette', {
    statement: 'You need a vignette from the German border to Kufstein-Süd.',
    quote: 'used to be Kufstein Sud, but is now a stop further north',
    seenOn: 'at-j2ski-kufstein',
    country: 'at',
    verdict: 'outdated',
    correctedBy: ['section-at-a1-salzburg-walserberg'],
    explanation: 'Since 15 Dec 2019 the A 12 from the border to Kufstein-Süd is vignette-free again, like the A 1 from Walserberg to Salzburg Nord.',
  }),
  claim('at-typo-120', {
    statement: 'A typo in the plate of a digital vignette costs 120 euros.',
    quote: 'Ersatzmaut ... 120 Euro',
    seenOn: 'at-orf-plate-typo',
    country: 'at',
    verdict: 'outdated',
    correctedBy: ['rule-at-plate-registration'],
    explanation: 'A typo still counts as no vignette, but the amount is now 200 euros. Fix typos for free before validity starts.',
  }),
  claim('at-winter-fine-5000', {
    statement: 'Driving without winter tyres when others are endangered costs up to 5,000 euros.',
    quote: 'drohen bis zu 5.000 Euro Strafe',
    seenOn: 'at-bmimi-winter-tyres',
    country: 'at',
    verdict: 'outdated',
    correctedBy: ['rule-at-winter-tyres'],
    explanation: 'An official ministry page, but § 134(1) KFG allows fines up to 10,000 euros. The law wins over the page.',
  }),
]
