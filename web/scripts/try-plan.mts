// Prints a plan for a trip against the live dataset.
// Usage: npx tsx scripts/try-plan.ts brasov munich 2026-12-20 2027-01-03 car diesel 5
import {planTrip} from '../lib/planner'
import {fetchPlannerData} from '../lib/queries'

const [origin = 'brasov', destination = 'munich', outDate = '2026-12-20', returnDate, vehicle = 'car', fuel, euro] = process.argv.slice(2)

const data = await fetchPlannerData(origin, destination)
const plan = planTrip(data, {
  origin,
  destination,
  outDate,
  returnDate: returnDate || null,
  vehicle: vehicle as 'car',
  fuel: (fuel as 'diesel') || null,
  euroNorm: euro ? Number(euro) : null,
  purchaseDate: new Date().toISOString().slice(0, 10),
})
if (!plan.ok) {
  console.log(plan.error)
  process.exit(1)
}
console.log(plan.route.title, plan.route.totalKm, 'km')
for (const c of plan.countries) {
  console.log(`\n${c.code} ${c.km ?? '?'} km ${c.tollFree ? '(toll-free)' : ''} dates ${c.travelDates.join(',')}`)
  for (const p of c.purchases) {
    console.log(`  BUY ${p.name} ${p.startDate}→${p.endDate} ${p.price?.amount} ${p.price?.currency} (~${p.price?.approxEur} EUR)${p.price?.estimate ? ' ESTIMATE' : ''}${p.price?.band ? ` [${p.price.band}]` : ''}`)
    if (p.activationWarning) console.log(`    ! ${p.activationWarning}`)
  }
  for (const a of c.alternatives) console.log(`  alt ${a.chosen ? '*' : ' '} ${a.label}: ${a.totalEur} EUR`)
  for (const r of c.rules) console.log(`  rule [${r.severity}] ${r.title}`)
  for (const n of c.exemptNotes) console.log(`  exempt: ${n}`)
}
for (const z of plan.zones) console.log(`\nZONE ${z.title}: ${z.verdict} - ${z.message}`)
console.log('\nTOTAL', plan.totals)
console.log('\nWARNINGS')
for (const w of plan.warnings) console.log(`  [${w.severity}] ${w.country ?? ''} ${w.text}`)
console.log('\nCLAIMS', plan.claims.length)
for (const c of plan.claims.slice(0, 6)) console.log(`  ${c.verdict}: ${c.statement}`)
console.log('\nSOURCES', plan.sources.length)
