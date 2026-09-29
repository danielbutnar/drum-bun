import {tool} from 'ai'
import {z} from 'zod'

import {planTrip} from './planner'
import {fetchPlannerData} from './queries'

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
