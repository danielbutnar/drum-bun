import {createClient} from '@sanity/client'

import type {PlannerData} from './types'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'pd5e7gez'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

// The dataset is public (free plan), so reads need no token. The CDN keeps
// the planner fast and free of API-request quota for repeat trips.
export const sanity = createClient({
  projectId,
  dataset,
  apiVersion: '2026-09-01',
  useCdn: true,
  perspective: 'published',
})

const SOURCE = `{_id, title, url, publisher, language, trust, pageDate, checkedAt}`

const PRODUCT = `{
  _id, name, kind, vehicles, localCategory, county, validity,
  prices[]{amount, currency, validFrom, validTo, status, band, "source": source->${SOURCE}},
  activation, purchase[]{channel, label, url}, plateBound, summary, penalty,
  pendingChanges[]{summary, wouldTakeEffect, checkAgainBy, "source": source->${SOURCE}},
  "sources": sources[]->${SOURCE}
}`

// One round trip: the route with every section and the products that cover
// it, plus the rules, zones and claims the planner may need.
export const PLANNER_QUERY = `{
  "route": *[_type == "route" && origin->slug.current == $origin && destination->slug.current == $destination][0]{
    _id, title, totalKm, note,
    "origin": origin->{_id, name, "slug": slug.current, kind},
    "destination": destination->{_id, name, "slug": slug.current, kind},
    legs[]{
      km,
      "country": country->{_id, code, name, currency, carTollSummary},
      "exitBorder": exitBorder->{_id, name, "slug": slug.current, kind},
      "sections": sections[]->{
        _id, road, from, to, lengthKm, tolled, counties, exemptVehicles, exemptNote, note,
        "coveredBy": coveredBy[]->${PRODUCT},
        "sources": sources[]->${SOURCE}
      }
    }
  },
  "rules": *[_type == "rule"]{
    _id, "country": country._ref, topic, title, requirement, vehicles, season, conditional, condition,
    effectiveFrom, effectiveTo, severity, penalty, "sources": sources[]->${SOURCE}
  },
  "zones": *[_type == "zone" && city->slug.current == $destination]{
    _id, title, "city": city->slug.current, kind, status, requiredSticker, dieselMinEuro, petrolMinEuro,
    area, effectiveFrom, effectiveTo, howToComply, penalty, "sources": sources[]->${SOURCE}
  },
  "claims": *[_type == "claim"]{
    _id, statement, quote, verdict, explanation, "seenOn": seenOn->${SOURCE}, "correctedBy": correctedBy[]._ref
  },
  "rates": *[_type == "exchangeRate"]{currency, unitsPerEur, asOf}
}`

export async function fetchPlannerData(origin: string, destination: string): Promise<PlannerData> {
  return sanity.fetch<PlannerData>(PLANNER_QUERY, {origin, destination})
}

export const PLACES_QUERY = `{
  "origins": *[_type == "place" && kind == "city" && _id in *[_type == "route"].origin._ref]{"slug": slug.current, name} | order(name.en asc),
  "destinations": *[_type == "place" && kind == "city" && _id in *[_type == "route"].destination._ref]{"slug": slug.current, name} | order(name.en asc),
  "routes": *[_type == "route"]{"origin": origin->slug.current, "destination": destination->slug.current}
}`
