import type {TripArgs} from '@/lib/plan-tool'

const ORIGINS = [
  ['brasov', 'Brașov'],
  ['bucharest', 'Bucharest'],
  ['cluj-napoca', 'Cluj-Napoca'],
  ['timisoara', 'Timișoara'],
]
const DESTINATIONS = [
  ['vienna', 'Vienna'],
  ['munich', 'Munich'],
  ['stuttgart', 'Stuttgart'],
  ['frankfurt', 'Frankfurt am Main'],
  ['berlin', 'Berlin'],
]

const field = 'mt-1 block w-full rounded-md border border-ink/25 bg-paper px-3 py-2 text-base'
const labelCls = 'type-condensed text-sm font-semibold'

// A plain GET form: the plan is rendered on the server from the URL, so it
// works without JavaScript and every plan has a shareable link.
export function TripForm({trip}: {trip: TripArgs}) {
  return (
    <form method="get" action="/#plan" className="grid gap-4 rounded-lg bg-paper p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className={labelCls}>
        From
        <select name="from" defaultValue={trip.origin} className={field}>
          {ORIGINS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className={labelCls}>
        To
        <select name="to" defaultValue={trip.destination} className={field}>
          {DESTINATIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className={labelCls}>
        Leaving
        <input type="date" name="out" required defaultValue={trip.outDate} className={field} />
      </label>
      <label className={labelCls}>
        Coming back <span className="font-normal text-ink-2">(optional)</span>
        <input type="date" name="back" defaultValue={trip.returnDate ?? ''} className={field} />
      </label>
      <label className={labelCls}>
        Vehicle
        <select name="vehicle" defaultValue={trip.vehicle} className={field}>
          <option value="car">Car</option>
          <option value="carTrailer">Car with trailer or caravan</option>
          <option value="camper">Camper up to 3.5 t</option>
          <option value="motorcycle">Motorcycle</option>
        </select>
      </label>
      <label className={labelCls}>
        Fuel
        <select name="fuel" defaultValue={trip.fuel ?? ''} className={field}>
          <option value="">Not sure</option>
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="hybrid">Hybrid</option>
          <option value="lpg">LPG</option>
          <option value="electric">Electric</option>
        </select>
      </label>
      <label className={labelCls}>
        Euro class <span className="font-normal text-ink-2">(registration, field V.9)</span>
        <select name="euro" defaultValue={trip.euroNorm ?? ''} className={field}>
          <option value="">Not sure</option>
          {[6, 5, 4, 3, 2, 1, 0].map((e) => (
            <option key={e} value={e}>
              Euro {e}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-col justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="twoDay" value="1" defaultChecked={trip.twoDayDrive} className="size-5 accent-road" />
          I stop overnight on the way
        </label>
        <button type="submit" className="rounded-md bg-road px-4 py-2.5 font-semibold text-paper hover:bg-road-dark">
          Plan my trip
        </button>
      </div>
    </form>
  )
}
