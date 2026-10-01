// Romania, from research/romania.md (checked 29 Sep 2026).
// The rovinietă changes on 1 Oct 2026: prices move from euro amounts to lei
// by Euro class, the seller moves to TollRo, and fines change.

import {claim, type Doc, localized, penalty, price, ref, refs, S, source, withKeys} from './helpers'

const OLD_TO = '2026-09-30'
const NEW_FROM = '2026-10-01'
const NEW_TO = '2026-12-31' // lei amounts are updated every year by CPI (Order 888/2026 art. 2)

export const sources: Doc[] = [
  source('ro-legea-226-2023', {
    title: 'Legea 226/2023 privind tarifele de utilizare a rețelei de drumuri naționale (consolidated)',
    url: 'https://legislatie.just.ro/public/DetaliiDocument/272230',
    publisher: 'Ministerul Justiției (legislatie.just.ro)',
    language: 'ro',
    trust: 'official',
    country: 'ro',
    pageDate: '2026-08-08',
  }),
  source('ro-cnair-tollro-announcement', {
    title: 'CNAIR: from 1 October 2026 the rovinietă is sold only through TollRo',
    url: 'https://www.cnadnr.ro/en/node/15933',
    publisher: 'CNAIR',
    language: 'ro',
    trust: 'official',
    country: 'ro',
    pageDate: '2026-09-25',
  }),
  source('ro-order-888-2026', {
    title: 'Ordinul MTI 888/2026: rovinietă categories and prices from 1 Oct 2026',
    url: 'https://lege5.ro/Gratuit/ge4tqnzthazti/ordinul-nr-888-2026-pentru-aprobarea-categoriilor-de-vehicule-si-a-nivelului-rovinietei',
    publisher: 'Monitorul Oficial nr. 818 / 25 Sep 2026 (via lege5.ro)',
    language: 'ro',
    trust: 'official',
    country: 'ro',
    pageDate: '2026-09-25',
  }),
  source('ro-cnair-prices-sep-2026', {
    title: 'CNAIR rovinietă price list, September 2026',
    url: 'https://www.cnadnr.ro/sites/default/files/pagini-statice/Pret%20ROVINIETE%20Septembrie%202026.pdf',
    publisher: 'CNAIR',
    language: 'ro',
    trust: 'official',
    country: 'ro',
    pageDate: '2026-09-01',
  }),
  source('ro-cnair-increase-2025', {
    title: 'CNAIR: new rovinietă tariffs from 1 September 2025',
    url: 'https://cnadnr.ro/en/node/14591',
    publisher: 'CNAIR',
    language: 'ro',
    trust: 'official',
    country: 'ro',
    pageDate: '2025-08-29',
  }),
  source('ro-erovinieta', {
    title: 'erovinieta.ro (CNAIR portal, sales until 30 Sep 2026; now redirects to TollRo)',
    url: 'https://www.erovinieta.ro/',
    publisher: 'CNAIR',
    language: 'ro',
    trust: 'official',
    country: 'ro',
  }),
  source('ro-tollro-portal', {
    title: 'TollRo portal (CNAIR, sales from 1 Oct 2026)',
    url: 'https://portal.etoll.ro/',
    publisher: 'CNAIR',
    language: 'ro',
    trust: 'official',
    country: 'ro',
  }),
  source('ro-untrr-oct-2026', {
    title: 'UNTRR: 1 October 2026, rovinietă tariffs change',
    url: 'https://www.untrr.ro/ro/1-octombrie-2026-se-modifica-tarifele-de-rovinieta.html',
    publisher: 'UNTRR (hauliers’ association)',
    language: 'ro',
    trust: 'club',
    country: 'ro',
    pageDate: '2026-09-28',
  }),
  source('ro-senate-postpone-bill', {
    title: 'Rovinieta și TollRo ar putea fi amânate din nou: proiect la Senat',
    url: 'https://www.cotidianul.ro/rovinieta-si-tollro-ar-putea-fi-amanate-din-nou-proiect-la-senat-pentru-mutarea-termenului/',
    publisher: 'Cotidianul',
    language: 'ro',
    trust: 'press',
    country: 'ro',
    pageDate: '2026-09-23',
  }),
  source('ro-cnair-tollro-live', {
    title: 'CNAIR: the TollRo platform (etoll.ro) is operational from 00:00 on 1 October 2026',
    url: 'https://www.cnadnr.ro/ro/comunicare/comunicate-de-presa/interes-general/noua-platform%C4%83-oficial%C4%83-pentru-plata-toll-%C8%99i',
    publisher: 'CNAIR',
    language: 'ro',
    trust: 'official',
    country: 'ro',
    pageDate: '2026-09-30',
  }),
  source('ro-senate-b517-2026', {
    title: 'Senat: B517/2026, bill to postpone the Legea 226/2023 deadlines to 1 Apr 2027 (registered, not debated)',
    url: 'https://www.senat.ro/legis/lista.aspx?nr_cls=b517&an_cls=2026',
    publisher: 'Senatul României',
    language: 'ro',
    trust: 'official',
    country: 'ro',
    pageDate: '2026-10-01',
  }),
  source('ro-mai-winter-tyres', {
    title: 'MAI: precizări privind anvelopele de iarnă',
    url: 'https://www.mai.gov.ro/precizari-privind-anvelopele-de-iarna/',
    publisher: 'Ministerul Afacerilor Interne',
    language: 'ro',
    trust: 'official',
    country: 'ro',
  }),
  source('ro-oug-195-2002', {
    title: 'OUG 195/2002 privind circulația pe drumurile publice (consolidated)',
    url: 'https://legislatie.just.ro/public/detaliidocument/74028',
    publisher: 'Ministerul Justiției (legislatie.just.ro)',
    language: 'ro',
    trust: 'official',
    country: 'ro',
    pageDate: '2026-08-25',
  }),
  source('ro-digi24-fines-jul-2026', {
    title: 'Cresc amenzile rutiere de la 1 iulie 2026 (Poliția Română a confirmat)',
    url: 'https://www.digi24.ro/stiri/actualitate/social/cresc-amenzile-rutiere-de-la-1-iulie-2026-politia-romana-a-confirmat-cat-vor-plati-soferii-dupa-majorarea-salariului-minim-3838887',
    publisher: 'Digi24',
    language: 'ro',
    trust: 'press',
    country: 'ro',
    pageDate: '2026-06-30',
  }),
  source('ro-bridge-toll-abolished', {
    title: 'Eliminarea taxei de pod de la Fetești și Vadu Oii începând cu 1 octombrie',
    url: 'https://www.jurnaldeconstanta.ro/eliminarea-taxei-de-pod-de-la-fetesti-si-vadu-oii-incepand-cu-1-octombrie-comunicatul-ministrului-transporturilor/',
    publisher: 'Jurnal de Constanța',
    language: 'ro',
    trust: 'press',
    country: 'ro',
    pageDate: '2026-09-23',
  }),
  // Pages drivers still find that say something else.
  source('ro-capital-distance-toll', {
    title: 'Nouă taxă obligatorie pentru șoferi în România din 1 ianuarie 2026',
    url: 'https://www.capital.ro/noua-taxa-obligatorie-pentru-soferi-in-romania-din-1-ianuarie-2026-se-calculeaza-dupa-distanta-si-emisii.html',
    publisher: 'Capital',
    language: 'ro',
    trust: 'press',
    country: 'ro',
    pageDate: '2025-06-27',
  }),
  source('ro-digi24-july-2026', {
    title: 'Rovinieta se schimbă din iulie 2026 (tabel)',
    url: 'https://www.digi24.ro/digieconomic/consumer/tabel-rovinieta-se-schimba-din-iulie-2026-guvernul-propune-tarife-diferentiate-in-functie-de-gradul-de-poluare-noile-preturi-101527',
    publisher: 'Digi24',
    language: 'ro',
    trust: 'press',
    country: 'ro',
    pageDate: '2026-05-16',
  }),
  source('ro-roviniete-online-7-days', {
    title: 'Cât costă rovinieta: categorii auto și perioade de timp',
    url: 'https://roviniete.online/cat-costa-rovinieta-categorii-auto-perioade-timp/',
    publisher: 'roviniete.online',
    language: 'ro',
    trust: 'blog',
    country: 'ro',
  }),
  source('ro-afaceri-2023', {
    title: '2023: prețurile rovinietei pentru fiecare categorie de autoturism',
    url: 'https://www.afaceri.news/2023-preturile-rovinietei-pentru-fiecare-categorie-de-autoturism-in-parte/',
    publisher: 'afaceri.news',
    language: 'ro',
    trust: 'blog',
    country: 'ro',
    pageDate: '2023-02-01',
  }),
]

const channels = withKeys([
  {channel: 'officialWeb', label: 'TollRo portal (CNAIR), from 1 Oct 2026', url: 'https://portal.etoll.ro/'},
  {channel: 'officialApp', label: 'TollRo mobile app (iOS, Android)'},
  {channel: 'borderPoint', label: 'Border crossing points and CNAIR sales points'},
  {channel: 'retail', label: 'Authorised distributors (e.g. petrol stations), SMS'},
])

// Category A: passenger vehicle with at most 9 seats.
const BANDS = [
  {label: 'Electric', electric: true},
  {label: 'Euro VI', euroMin: 6, euroMax: 6},
  {label: 'Euro IV–V', euroMin: 4, euroMax: 5},
  {label: 'Euro 0–III or unknown', euroMin: 0, euroMax: 3, appliesWhenUnknown: true},
]

function rovinieta(
  id: string,
  name: {en: string; ro: string},
  validity: {unit: 'days' | 'months'; count: number},
  oldEur: number,
  olderEur: number,
  newLei: [number, number, number, number],
) {
  return {
    _id: `product-ro-${id}`,
    _type: 'tollProduct',
    country: ref('country-ro'),
    name: localized(name.en, {ro: name.ro}),
    kind: 'vignette',
    vehicles: ['car', 'carTrailer', 'camper'],
    localCategory: 'A',
    validity: {
      ...validity,
      wording:
        'Starts at 00:00 on the first day and ends at 24:00 on the last day. Bought for the same day, it starts at the moment of purchase, never earlier (Legea 226/2023 art. 6). Exception: cars registered in Romania may pay for the current day until 24:00 on the next day (art. 5(2^1)); foreign-registered cars must buy before driving.',
    },
    prices: [
      price(olderEur, 'EUR', '2025-01-01', '2025-08-31', 'ro-cnair-increase-2025'),
      price(oldEur, 'EUR', '2025-09-01', OLD_TO, 'ro-cnair-prices-sep-2026'),
      ...newLei.map((amount, i) => price(amount, 'RON', NEW_FROM, NEW_TO, 'ro-order-888-2026', BANDS[i])),
    ],
    purchase: channels,
    plateBound: true,
    summary:
      'Needed on every Romanian national road (from 1 Oct 2026 except national-road sections inside municipalities). From 1 Oct 2026 the price depends on the Euro class in the registration papers; a car whose Euro class cannot be shown pays the Euro 0 rate. The new system went live at 00:00 on 1 Oct 2026 as planned; a Senate bill to postpone it (B517/2026) had not been debated by then.',
    penalty: penalty({
      min: 456,
      max: 1320,
      currency: 'RON',
      note: 'From 1 Oct 2026: two to four times the 12-month rovinietă for the car (456–1,320 lei by band, our arithmetic from art. 18). Until 30 Sep 2026: 500–1,000 lei. Checked by cameras.',
      source: 'ro-legea-226-2023',
    }),
    sources: refs(S('ro-legea-226-2023'), S('ro-order-888-2026'), S('ro-cnair-tollro-announcement'), S('ro-cnair-tollro-live'), S('ro-senate-b517-2026'), S('ro-cnair-prices-sep-2026')),
  }
}

export const products: Doc[] = [
  rovinieta('1day', {en: 'Rovinietă, 1 day', ro: 'Rovinietă 1 zi'}, {unit: 'days', count: 1}, 3.5, 2.5, [20, 22, 26, 29]),
  rovinieta('10day', {en: 'Rovinietă, 10 days', ro: 'Rovinietă 10 zile'}, {unit: 'days', count: 10}, 6, 3.3, [27, 30, 35, 39]),
  rovinieta('30day', {en: 'Rovinietă, 30 days', ro: 'Rovinietă 30 de zile'}, {unit: 'days', count: 30}, 9.5, 5.3, [43, 48, 55, 62]),
  rovinieta('60day', {en: 'Rovinietă, 60 days', ro: 'Rovinietă 60 de zile'}, {unit: 'days', count: 60}, 15, 8.4, [68, 76, 87, 99]),
  rovinieta('12month', {en: 'Rovinietă, 12 months', ro: 'Rovinietă 12 luni'}, {unit: 'months', count: 12}, 50, 28, [228, 254, 292, 330]),
]

export const country: Doc = {
  _id: 'country-ro',
  _type: 'country',
  code: 'RO',
  name: localized('Romania', {ro: 'România', de: 'Rumänien', hu: 'Románia'}),
  currency: 'RON',
  carTollSummary:
    'A time-based rovinietă for every national road. From 1 Oct 2026 it is sold only through CNAIR’s TollRo system and priced in lei by Euro class.',
  sources: refs(S('ro-legea-226-2023'), S('ro-cnair-tollro-announcement')),
}

export const sections: Doc[] = [
  {
    _id: 'section-ro-national-roads',
    _type: 'roadSection',
    country: ref('country-ro'),
    road: 'National roads (DN, A1)',
    from: 'Your start',
    to: 'the Hungarian border',
    tolled: true,
    coveredBy: refs(...products.map((p) => p._id)),
    exemptVehicles: ['motorcycle'],
    exemptNote:
      'Order 888/2026 has no motorcycle category, and motorcycles are widely reported as exempt. No CNAIR text says so explicitly; check before you ride.',
    note: 'No other toll applies to cars on the A1 Sibiu–Deva–Arad–Nădlac. Extra tolls are only allowed for bridges, tunnels and mountain passes (Legea 226/2023 art. 3(2)).',
    sources: refs(S('ro-legea-226-2023')),
  },
]

export const rules: Doc[] = [
  {
    _id: 'rule-ro-winter-tyres',
    _type: 'rule',
    country: ref('country-ro'),
    topic: 'winterTyres',
    title: 'Winter tyres on snow, ice or black ice (Romania)',
    requirement:
      'On roads covered with snow, ice or black ice every car needs winter tyres. In Romania tyres marked M+S (M.S., MS, M&S) count; tyres marked only "all seasons" do not.',
    vehicles: ['car', 'carTrailer', 'camper'],
    conditional: true,
    condition: 'Applies whenever the road is covered with snow, ice or black ice, on any date. There is no calendar period.',
    severity: 'critical',
    penalty: penalty({
      min: 1946.25,
      max: 4325,
      currency: 'RON',
      note: 'Class IV fine (9–20 points of 216.25 lei since 1 Jul 2026), and the police keep the registration certificate.',
      source: 'ro-digi24-fines-jul-2026',
    }),
    sources: refs(S('ro-oug-195-2002'), S('ro-mai-winter-tyres')),
  },
  {
    _id: 'rule-ro-equipment',
    _type: 'rule',
    country: ref('country-ro'),
    topic: 'equipment',
    title: 'First-aid kit, two warning triangles and a fire extinguisher (Romania)',
    requirement: 'Cars must carry an approved first-aid kit, two reflective warning triangles and a fire extinguisher. Motorcycles are exempt.',
    vehicles: ['car', 'carTrailer', 'camper'],
    severity: 'important',
    sources: refs(S('ro-oug-195-2002')),
  },
]

export const claims: Doc[] = [
  claim('ro-distance-toll-for-cars', {
    statement: 'From 2026 Romanian drivers pay a new distance- and emissions-based toll.',
    quote: 'Se calculează după distanță și emisii',
    seenOn: 'ro-capital-distance-toll',
    country: 'ro',
    verdict: 'misleading',
    correctedBy: ['product-ro-12month', 'product-ro-10day'],
    explanation:
      'Distance-based TollRo charging applies only to goods vehicles over 3.5 t, and only from 1 Oct 2026. Cars keep a time-based rovinietă, now priced by Euro class (Legea 226/2023 art. 4; CNAIR, 25 Sep 2026).',
  }),
  claim('ro-change-in-july', {
    statement: 'The new rovinietă prices start in July 2026, and electric cars pay 254 lei a year like Euro VI.',
    quote: 'Rovinieta se schimbă din iulie 2026',
    seenOn: 'ro-digi24-july-2026',
    country: 'ro',
    verdict: 'outdated',
    correctedBy: ['product-ro-12month'],
    explanation: 'The start moved to 1 Oct 2026 (Legea 103/2026), and the final Order 888/2026 sets electric cars at 228 lei for 12 months, not 254.',
  }),
  claim('ro-7-and-90-days', {
    statement: 'You can buy a 7-day or a 90-day rovinietă; 12 months cost 28 euros.',
    quote: '7 zile: 3 euro … 90 zile: 13 euro … 12 luni: 28 euro',
    seenOn: 'ro-roviniete-online-7-days',
    country: 'ro',
    verdict: 'outdated',
    correctedBy: ['product-ro-1day', 'product-ro-10day', 'product-ro-30day', 'product-ro-60day', 'product-ro-12month'],
    explanation:
      'The durations are 1, 10, 30 and 60 days and 12 months; there is no 7- or 90-day product. 12 months cost 50 euros until 30 Sep 2026 and 228–330 lei from 1 Oct 2026.',
  }),
  claim('ro-no-one-day', {
    statement: 'The shortest rovinietă lasts 7 days.',
    quote: '3 euro pe 7 zile',
    seenOn: 'ro-afaceri-2023',
    country: 'ro',
    verdict: 'outdated',
    correctedBy: ['product-ro-1day'],
    explanation: 'A 1-day rovinietă exists (Legea 226/2023 art. 5(2); CNAIR 2026 price lists).',
  }),
]
