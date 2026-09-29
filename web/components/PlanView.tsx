import type {CountryPlan, Plan, Purchase, RuleHit, ZoneHit} from '@/lib/planner'
import {day, eur, LANG_LABEL, money, span, TRUST_LABEL} from '@/lib/format'
import type {SourceRef} from '@/lib/types'

import {StripMap} from './StripMap'

const VEHICLE: Record<string, string> = {
  car: 'car',
  carTrailer: 'car with trailer',
  camper: 'camper up to 3.5 t',
  motorcycle: 'motorcycle',
}

export function PlanView({plan}: {plan: Plan}) {
  const {trip} = plan
  const car = [VEHICLE[trip.vehicle], trip.fuel, trip.euroNorm != null ? `Euro ${trip.euroNorm}` : null].filter(Boolean).join(', ')
  const critical = plan.warnings.filter((w) => w.severity !== 'info')
  const info = plan.warnings.filter((w) => w.severity === 'info')

  return (
    <section aria-labelledby="plan-title" className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="plan-title" className="type-expanded text-2xl font-bold tracking-tight sm:text-3xl">
            {plan.route.origin} → {plan.route.destination}
          </h2>
          <p className="mt-1 text-ink-2">
            {day(trip.outDate)}
            {trip.returnDate ? ` out, ${day(trip.returnDate)} back` : ', one way'} · {car} · about {plan.route.totalKm} km
            {trip.twoDayDrive ? ' · two-day drive' : ''}
          </p>
        </div>
        <Total plan={plan} />
      </div>

      <div className="hidden rounded-lg bg-paper px-2 pt-2 md:block">
        <StripMap plan={plan} />
      </div>

      {critical.length > 0 && (
        <div className="rounded-lg border-l-4 border-road bg-paper p-4">
          <h3 className="font-bold">Before you go</h3>
          <ul className="mt-2 space-y-2">
            {critical.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className={w.severity === 'critical' ? 'text-road' : 'text-warn'}>
                  ●
                </span>
                <span>
                  {w.country && <span className="type-condensed mr-1 font-semibold">{w.country}</span>}
                  {w.text}
                </span>
              </li>
            ))}
          </ul>
          {info.map((w, i) => (
            <p key={i} className="mt-3 text-sm text-ink-2">
              <span className="type-condensed mr-1 font-semibold">{w.country}</span>
              {w.text}
            </p>
          ))}
        </div>
      )}

      <ol className="grid gap-6 md:grid-cols-2 xl:grid-cols-4" aria-label="Countries in driving order">
        {plan.countries.map((c) => (
          <CountryColumn key={c.code} c={c} />
        ))}
      </ol>

      {plan.zones.length > 0 && <Zones zones={plan.zones} city={plan.route.destination} />}

      {plan.claims.length > 0 && <Claims plan={plan} />}

      <Sources sources={plan.sources} />
    </section>
  )
}

function Total({plan}: {plan: Plan}) {
  const parts = Object.entries(plan.totals.byCurrency).map(([cur, amt]) => money(amt, cur))
  return (
    <div className="sm:text-right">
      <p className="type-condensed text-sm text-ink-2">Tolls for this trip</p>
      <p className="type-expanded tabular text-3xl font-bold">
        {plan.totals.approxEur != null ? `€${plan.totals.approxEur.toFixed(2)}` : '—'}
        {plan.totals.includesEstimate && <span className="align-super text-base text-warn">*</span>}
      </p>
      <p className="tabular text-sm text-ink-2">{parts.join(' + ') || 'nothing to buy'}</p>
      {plan.totals.includesEstimate && <p className="text-sm text-warn">* includes prices not published yet</p>}
    </div>
  )
}

function CountryColumn({c}: {c: CountryPlan}) {
  const free = c.purchases.length === 0
  return (
    <li className={`rail pl-6 ${free ? 'rail-free' : ''}`}>
      <div className="flex items-baseline gap-2">
        <span className="type-expanded text-3xl font-extrabold text-ink/20">{c.code}</span>
        <h3 className="text-lg font-bold">{c.name}</h3>
        <span className="type-condensed tabular ml-auto text-sm text-ink-2">{c.km} km</span>
      </div>

      {c.tollFree && <p className="mt-2 text-ink-2">{c.tollSummary ?? 'No toll for cars on this route.'}</p>}
      {c.exemptNotes.map((n, i) => (
        <p key={i} className="mt-2 text-ink-2">
          {n}
        </p>
      ))}

      {c.purchases.length > 0 && (
        <ul className="mt-3 space-y-3" aria-label={`Buy for ${c.name}`}>
          {c.purchases.map((p, i) => (
            <PurchaseCard key={i} p={p} />
          ))}
        </ul>
      )}

      {c.alternatives.length > 1 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-ink-2">Why this and not another product?</summary>
          <ul className="mt-2 space-y-1">
            {c.alternatives.map((a, i) => (
              <li key={i} className={`flex justify-between gap-3 ${a.chosen ? 'font-semibold' : 'text-ink-2'}`}>
                <span>
                  {a.chosen ? '✓ ' : ''}
                  {a.label}
                </span>
                <span className="tabular shrink-0">{a.totalEur != null ? `€${a.totalEur.toFixed(2)}` : '?'}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {c.rules.length > 0 && (
        <div className="mt-4">
          <h4 className="type-condensed text-sm font-semibold text-ink-2">Rules on your dates</h4>
          <ul className="mt-1 space-y-2">
            {c.rules.map((r) => (
              <RuleItem key={r.ruleId} r={r} />
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

function PurchaseCard({p}: {p: Purchase}) {
  const web = p.buyVia.find((b) => b.channel === 'officialWeb' && b.url)
  return (
    <li className="rounded-md bg-paper p-3 shadow-[0_1px_0_#e2e8dc]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold leading-snug">{p.name}</p>
          <p className="type-condensed text-sm text-ink-2">{span(p.startDate, p.endDate)}</p>
        </div>
        {p.price && (
          <div className="shrink-0 text-right">
            <p className="tabular font-semibold">
              {money(p.price.amount, p.price.currency)}
              {p.price.estimate && <span className="text-warn">*</span>}
            </p>
            {p.price.currency !== 'EUR' && <p className="tabular text-sm text-ink-2">{eur(p.price.approxEur)}</p>}
          </div>
        )}
      </div>
      {p.price?.band && <p className="mt-1 text-sm text-ink-2">Band: {p.price.band}</p>}
      {p.activationWarning && <p className="mt-2 text-sm font-medium text-road-dark">{p.activationWarning}</p>}
      {!p.activationWarning && p.buyOnlineBy && (
        <p className="mt-2 text-sm text-ink-2">Online: buy by {day(p.buyOnlineBy)}, or at a sales point any time.</p>
      )}
      {web?.url && (
        <p className="mt-2 text-sm">
          <a href={web.url} className="text-road-dark underline underline-offset-2" rel="noopener" target="_blank">
            {web.label}
          </a>
        </p>
      )}
    </li>
  )
}

function RuleItem({r}: {r: RuleHit}) {
  return (
    <li className="text-sm">
      <details>
        <summary className="cursor-pointer">
          <span className={r.severity === 'critical' ? 'font-semibold text-road-dark' : r.severity === 'important' ? 'font-medium' : 'text-ink-2'}>
            {r.title}
          </span>
        </summary>
        <p className="mt-1">{r.requirement}</p>
        {r.penalty?.note && <p className="mt-1 text-ink-2">Penalty: {r.penalty.note}</p>}
        <SourceLinks sources={r.sources} />
      </details>
    </li>
  )
}

function Zones({zones, city}: {zones: ZoneHit[]; city: string}) {
  return (
    <section aria-labelledby="zones-title" className="rounded-lg bg-paper p-4">
      <h3 id="zones-title" className="font-bold">
        Arriving in {city}
      </h3>
      <ul className="mt-2 space-y-3">
        {zones.map((z) => (
          <li key={z.zoneId}>
            <p>
              <span
                className={`type-condensed mr-2 inline-block rounded px-1.5 text-sm font-semibold ${
                  z.verdict === 'banned' ? 'bg-road text-paper' : z.verdict === 'ok' || z.verdict === 'notInForce' ? 'bg-land-2' : 'bg-lane'
                }`}
              >
                {{banned: 'not allowed', needsSticker: 'sticker needed', ok: 'allowed', unknown: 'check', notInForce: 'not in force'}[z.verdict]}
              </span>
              <span className="font-semibold">{z.title}.</span> {z.message}
            </p>
            {z.howToComply && z.verdict !== 'ok' && z.verdict !== 'notInForce' && <p className="mt-1 text-sm text-ink-2">{z.howToComply}</p>}
            <SourceLinks sources={z.sources} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function Claims({plan}: {plan: Plan}) {
  return (
    <section aria-labelledby="claims-title">
      <h3 id="claims-title" className="type-expanded text-xl font-bold">
        You may have read…
      </h3>
      <p className="mt-1 text-ink-2">Pages drivers find that say something else. Each one is linked to the fact that corrects it.</p>
      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {plan.claims.slice(0, 6).map((c) => (
          <li key={c.claimId} className="rounded-md bg-paper p-3">
            <p className="text-ink-2 line-through decoration-road/60">“{c.quote ?? c.statement}”</p>
            <p className="type-condensed mt-1 text-sm text-ink-2">
              {c.verdict} ·{' '}
              <a href={c.seenOn.url} rel="noopener nofollow" target="_blank" className="underline underline-offset-2">
                {c.seenOn.publisher ?? c.seenOn.title}
              </a>{' '}
              ({LANG_LABEL[c.seenOn.language]}, {TRUST_LABEL[c.seenOn.trust]}
              {c.seenOn.pageDate ? `, ${c.seenOn.pageDate.slice(0, 7)}` : ''})
            </p>
            <p className="mt-2 text-sm">{c.explanation}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SourceLinks({sources}: {sources: SourceRef[]}) {
  if (!sources?.length) return null
  return (
    <p className="mt-1 flex flex-wrap gap-x-3 text-sm">
      {sources.slice(0, 3).map((s) => (
        <a key={s._id} href={s.url} rel="noopener" target="_blank" className="text-ink-2 underline underline-offset-2">
          {s.publisher ?? s.title} ({LANG_LABEL[s.language]})
        </a>
      ))}
    </p>
  )
}

function Sources({sources}: {sources: SourceRef[]}) {
  return (
    <details className="rounded-lg bg-paper p-4">
      <summary className="cursor-pointer font-bold">All {sources.length} sources behind this plan</summary>
      <ul className="mt-3 grid gap-2 text-sm md:grid-cols-2">
        {sources.map((s) => (
          <li key={s._id}>
            <a href={s.url} rel="noopener" target="_blank" className="underline underline-offset-2">
              {s.title}
            </a>
            <span className="type-condensed text-ink-2">
              {' '}
              · {s.publisher} · {LANG_LABEL[s.language]} · {TRUST_LABEL[s.trust]} · checked {s.checkedAt}
            </span>
          </li>
        ))}
      </ul>
    </details>
  )
}
