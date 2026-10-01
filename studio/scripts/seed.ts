// Seeds the dataset from studio/seed/*. Idempotent: every document has a
// fixed ID and is written with createOrReplace, so re-running after a fix
// updates in place. Run with: pnpm --filter studio seed
// Only some documents: sanity exec scripts/seed.ts --with-user-token -- --only id1,id2
//
// `sanity exec --with-user-token` supplies the logged-in CLI user's token;
// nothing secret lives in this repo.

import {getCliClient} from 'sanity/cli'

import * as at from '../seed/austria'
import * as de from '../seed/germany'
import {clean, type Doc} from '../seed/helpers'
import * as hu from '../seed/hungary'
import * as ro from '../seed/romania'
import {ecb, places, rates, routes} from '../seed/routes'

const docs: Doc[] = [
  ...ro.sources,
  ...hu.sources,
  ...at.sources,
  ...de.sources,
  ecb,
  ro.country,
  hu.country,
  at.country,
  de.country,
  ...places,
  ...ro.products,
  ...hu.products,
  ...hu.countyProducts,
  hu.m1Regional,
  ...at.products,
  ...ro.sections,
  ...hu.sections,
  ...at.sections,
  ...de.sections,
  ...routes,
  ...ro.rules,
  ...hu.rules,
  ...at.rules,
  ...de.rules,
  ...de.zones,
  ...ro.claims,
  ...hu.claims,
  ...at.claims,
  ...de.claims,
  ...rates,
]

function checkReferences(all: Doc[]) {
  const ids = new Set(all.map((d) => d._id))
  const missing = new Set<string>()
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk)
    else if (value && typeof value === 'object') {
      const v = value as Record<string, unknown>
      if (typeof v._ref === 'string' && !ids.has(v._ref)) missing.add(v._ref)
      Object.values(v).forEach(walk)
    }
  }
  all.forEach(walk)
  const dupes = all.map((d) => d._id).filter((id, i, arr) => arr.indexOf(id) !== i)
  if (missing.size || dupes.length) {
    throw new Error(`Broken seed. Missing refs: ${[...missing].join(', ') || 'none'}. Duplicate ids: ${dupes.join(', ') || 'none'}`)
  }
}

async function main() {
  checkReferences(docs)
  const client = getCliClient({apiVersion: '2026-09-01'})
  const dryRun = process.argv.includes('--dry-run')
  const onlyArg = process.argv[process.argv.indexOf('--only') + 1]
  const only = process.argv.includes('--only') ? new Set(onlyArg.split(',')) : null
  const selected = only ? docs.filter((d) => only.has(d._id)) : docs
  if (only && selected.length !== only.size) throw new Error(`Unknown ids: ${[...only].filter((id) => !docs.some((d) => d._id === id)).join(', ')}`)
  const counts = selected.reduce<Record<string, number>>((acc, d) => ((acc[d._type] = (acc[d._type] ?? 0) + 1), acc), {})
  console.log(`${selected.length} documents`, counts)
  if (dryRun) return
  // One transaction: countries and sources reference each other, and strong
  // references must resolve when the transaction commits.
  const tx = client.transaction()
  for (const doc of selected) tx.createOrReplace(clean(doc))
  const body = JSON.stringify(selected).length
  console.log(`committing ${selected.length} documents (${Math.round(body / 1024)} KB)`)
  await tx.commit({visibility: 'sync'})
  console.log('done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
