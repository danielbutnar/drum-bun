import {runPlan, tripSchema} from '@/lib/plan-tool'

// The planner needs no model, so this endpoint is free to call and cacheable.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams
  const num = (v: string | null) => (v === null || v === '' ? null : Number(v))
  const parsed = tripSchema.safeParse({
    origin: q.get('from'),
    destination: q.get('to'),
    outDate: q.get('out'),
    returnDate: q.get('back') || null,
    vehicle: q.get('vehicle') ?? 'car',
    fuel: q.get('fuel') || null,
    euroNorm: num(q.get('euro')),
    twoDayDrive: q.get('twoDay') === '1',
  })
  if (!parsed.success) {
    return Response.json({ok: false, error: 'Check the trip: start, destination, dates (YYYY-MM-DD) and vehicle.'}, {status: 400})
  }
  const plan = await runPlan(parsed.data)
  return Response.json(plan, {
    status: plan.ok ? 200 : 404,
    headers: {'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600'},
  })
}
