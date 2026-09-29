import {Chat} from '@/components/Chat'
import {PlanView} from '@/components/PlanView'
import {TripForm} from '@/components/TripForm'
import {runPlan, type TripArgs, tripSchema} from '@/lib/plan-tool'

// The example most drivers on this route care about: home for Christmas.
const EXAMPLE: TripArgs = {
  origin: 'brasov',
  destination: 'munich',
  outDate: '2026-12-20',
  returnDate: '2027-01-03',
  vehicle: 'car',
  fuel: 'diesel',
  euroNorm: 5,
  twoDayDrive: false,
}

function tripFrom(params: Record<string, string | string[] | undefined>): {trip: TripArgs; invalid: boolean} {
  const one = (k: string) => {
    const v = params[k]
    return (Array.isArray(v) ? v[0] : v) || null
  }
  if (!one('from')) return {trip: EXAMPLE, invalid: false}
  const parsed = tripSchema.safeParse({
    origin: one('from'),
    destination: one('to'),
    outDate: one('out'),
    returnDate: one('back'),
    vehicle: one('vehicle') ?? 'car',
    fuel: one('fuel'),
    euroNorm: one('euro') == null ? null : Number(one('euro')),
    twoDayDrive: one('twoDay') === '1',
  })
  return parsed.success ? {trip: parsed.data, invalid: false} : {trip: EXAMPLE, invalid: true}
}

export default async function Home(props: PageProps<'/'>) {
  const {trip, invalid} = tripFrom(await props.searchParams)
  const plan = await runPlan(trip)

  return (
    <>
      <section className="border-b border-land-2">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:pt-14">
          <h1 className="type-expanded text-5xl font-extrabold tracking-tight sm:text-7xl">Drum bun!</h1>
          <p className="mt-4 max-w-2xl text-lg sm:text-xl">
            What your car needs on the road between Romania and Germany or Austria: vignettes, tolls, winter tyres and emission
            zones, priced for your dates and traced to the official source.
          </p>
          <p className="mt-3 max-w-2xl text-ink-2">
            Romania replaced its rovinietă on 1 October 2026. Hungary added an M1 regional vignette this year, and Austria sells
            only digital vignettes from 1 December. Blogs have not caught up. This has.
          </p>
        </div>
      </section>

      <div id="plan" className="mx-auto max-w-6xl scroll-mt-4 space-y-8 px-4 py-8">
        <TripForm trip={trip} />
        {invalid && (
          <p role="alert" className="rounded-md bg-paper p-3 text-road-dark">
            Some trip details were not valid, so the example trip is shown. Check the dates (the return must be after the
            departure).
          </p>
        )}
        {plan.ok ? (
          <PlanView plan={plan} />
        ) : (
          <p role="alert" className="rounded-md bg-paper p-4">
            {plan.error}
          </p>
        )}
      </div>

      <section id="ask" aria-labelledby="ask-title" className="scroll-mt-4 border-t border-land-2 bg-paper/60">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <h2 id="ask-title" className="type-expanded text-3xl font-bold tracking-tight">
            Ask the agent
          </h2>
          <p className="mt-2 max-w-2xl text-ink-2">
            In Romanian, German, Hungarian or English. It plans with the same planner, reads the Sanity Knowledge Base built from
            official pages in four languages, and shows which entries and queries it used.
          </p>
          <Chat />
        </div>
      </section>
    </>
  )
}
