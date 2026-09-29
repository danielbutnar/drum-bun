import {tool} from 'ai'
import {z} from 'zod'

import {planTrip, priceOn} from './planner'
import {fetchPlannerData, sanity} from './queries'
import type {TollProduct} from './types'

export const ORIGINS = ['brasov', 'bucharest', 'cluj-napoca', 'timisoara'] as const
export const DESTINATIONS = ['vienna', 'munich', 'stuttgart', 'frankfurt', 'berlin'] as const

export const tripSchema = z.object({
  origin: z.enum(ORIGINS).describe('Romanian start city slug.'),
  destination: z.enum(DESTINATIONS).describe('Destination city slug.'),
  outDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Departure date, YYYY-MM-DD.'),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .describe('Return date, YYYY-MM-DD, or null for one way.'),
  vehicle: z.enum(['car', 'carTrailer', 'camper', 'motorcycle']),
  fuel: z.enum(['petrol', 'diesel', 'hybrid', 'electric', 'lpg']).nullable().describe('Null if the driver did not say.'),
  euroNorm: z.number().int().min(0).max(6).nullable().describe('Euro emission class 0–6, or null if unknown.'),
  twoDayDrive: z.boolean().describe('True if the driver stops overnight on the way.'),
})

export type TripArgs = z.infer<typeof tripSchema>

export function today(): string {
  // Toll validity is counted in local calendar days on this route (UTC+2/+3).
  return new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10)
}

export async function runPlan(args: TripArgs) {
  const data = await fetchPlannerData(args.origin, args.destination)
  return planTrip(data, {...args, purchaseDate: today()})
}

// The planner is a tool like the MCP ones, but it never guesses: it walks the
// route document and returns exactly what the structured content says.
export const planTripTool = tool({
  description:
    'Plan a drive between Romania and Austria/Germany: returns every toll product to buy per country with the price valid on the travel dates (cheapest combination), date-dependent road rules, low-emission-zone checks at the destination, pending law changes and outdated claims drivers may have read. Use it for any question about what a trip needs or costs. The result is shown to the user as a card, so do not repeat every line: explain the decisions and caveats.',
  inputSchema: tripSchema,
  execute: runPlan,
})

export const COUNTRIES = ['RO', 'HU', 'AT', 'DE'] as const

const PRODUCTS_QUERY = `*[_type == "tollProduct" && country->code == $country && $vehicle in vehicles] | order(kind asc, name.en asc){
  _id, name, kind, vehicles, localCategory, county, validity, prices[]{amount, currency, validFrom, validTo, status, band},
  activation, purchase[]{channel, label, url}, summary, penalty,
  pendingChanges[]{summary, wouldTakeEffect, checkAgainBy, "source": source->{title, url}},
  "sources": sources[]->{title, url, publisher, language, trust}
}`

// One country's products with the price valid on a date, for questions about
// a single product ("what does X cost after 1 October?"). Deterministic, one
// round trip, no trip details needed.
export const countryProductsTool = tool({
  description:
    'List every toll product of one country (RO, HU, AT) for a vehicle, with the official price valid on a given date, validity rule, online-purchase delay, penalty and sources. Use it for questions about one product, a price on a date, a Euro-class price, or a penalty, when no full trip is involved.',
  inputSchema: z.object({
    country: z.enum(COUNTRIES),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('The date the price should be valid on. Use today if the user gave none.'),
    vehicle: z.enum(['car', 'carTrailer', 'camper', 'motorcycle']),
    fuel: z.enum(['petrol', 'diesel', 'hybrid', 'electric', 'lpg']).nullable(),
    euroNorm: z.number().int().min(0).max(6).nullable(),
  }),
  execute: async ({country, date, vehicle, fuel, euroNorm}) => {
    const products = await sanity.fetch<TollProduct[]>(PRODUCTS_QUERY, {country, vehicle})
    return products.map((p) => {
      const hit = priceOn(p.prices ?? [], p.validity.unit === 'calendarYear' ? `${date.slice(0, 4)}-07-01` : date, {fuel, euroNorm})
      return {
        name: p.name.en,
        localName: p.name.ro ?? p.name.hu ?? p.name.de ?? null,
        kind: p.kind,
        county: p.county ?? null,
        validity: p.validity.wording,
        priceOnDate: hit
          ? {amount: hit.price.amount, currency: hit.price.currency, band: hit.price.band?.label ?? null, estimate: hit.estimate, bandNote: hit.bandNote}
          : null,
        onlineDelayDays: p.activation?.onlineDelayDays ?? 0,
        immediateOptions: p.activation?.immediateOptions ?? null,
        penalty: p.penalty?.note ?? null,
        buy: (p.purchase ?? []).filter((c) => c.url).map((c) => ({label: c.label, url: c.url})),
        pendingChanges: p.pendingChanges ?? [],
        sources: p.sources,
      }
    })
  },
})
