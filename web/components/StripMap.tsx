import type {Plan} from '@/lib/planner'

// The route drawn from data: each country gets width in proportion to its
// kilometres, each road section inside it too. Sections you pay for are
// motorway red with a yellow core; free sections keep the red casing with a
// white core, like an atlas marks toll-free roads.

const W = 1000
const H = 168
const X0 = 28
const X1 = W - 28
const Y = 84
const MIN_COUNTRY = 110

export function StripMap({plan}: {plan: Plan}) {
  const countries = plan.countries
  const kms = countries.map((c) => Math.max(c.km ?? 100, 1))
  const total = kms.reduce((a, b) => a + b, 0)
  const available = X1 - X0 - MIN_COUNTRY * countries.length
  const widths = kms.map((km) => MIN_COUNTRY + (available * km) / total)

  const starts = widths.map((_, i) => X0 + widths.slice(0, i).reduce((a, b) => a + b, 0))
  const blocks = countries.map((c, i) => ({c, start: starts[i], end: starts[i] + widths[i]}))

  const label = `Route ${plan.route.origin} to ${plan.route.destination}, about ${plan.route.totalKm} km through ${countries
    .map((c) => `${c.name} (${c.km} km, ${c.tollFree ? 'no toll' : 'tolled'})`)
    .join(', ')}.`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full">
      {blocks.map(({c, start, end}, i) => {
        const segs = c.segments.length ? c.segments : [{road: '', from: '', to: '', km: c.km, charged: !c.tollFree}]
        const segTotal = segs.reduce((a, s) => a + (s.km ?? 1), 0)
        const segWidth = (s: {km: number | null}) => ((end - start) * (s.km ?? 1)) / segTotal
        const segStart = segs.map((_, j) => start + segs.slice(0, j).reduce((a, s) => a + segWidth(s), 0))
        return (
          <g key={c.code}>
            <text x={start + 10} y={40} className="type-expanded" fontSize="40" fontWeight="800" fill="#1d2a33" opacity="0.13">
              {c.code}
            </text>
            <text x={start + 10} y={132} className="type-condensed" fontSize="15" fill="#1d2a33">
              {c.name}
            </text>
            <text x={start + 10} y={151} className="type-condensed tabular" fontSize="13" fill="#4a5a66">
              {c.km} km · {c.tollFree ? 'no car toll' : c.exemptNotes.length && !c.purchases.length ? 'nothing due' : `${c.purchases.length} to buy`}
            </text>
            {segs.map((s, j) => {
              const x1 = segStart[j]
              const x2 = x1 + segWidth(s)
              return (
                <g key={j}>
                  <title>{s.road ? `${s.road}: ${s.from} to ${s.to}${s.charged ? '' : ' (no charge)'}` : c.name}</title>
                  <line x1={x1} y1={Y} x2={x2} y2={Y} stroke="#c8372d" strokeWidth="14" strokeLinecap={i === 0 && j === 0 ? 'round' : 'butt'} />
                  <line x1={x1} y1={Y} x2={x2} y2={Y} stroke={s.charged ? '#f2c230' : '#fbfcf9'} strokeWidth="5" />
                </g>
              )
            })}
            {i < blocks.length - 1 && (
              <g>
                <line x1={end} y1={18} x2={end} y2={118} stroke="#6e4a9e" strokeWidth="2" strokeDasharray="6 5" />
                <text x={end - 6} y={112} textAnchor="end" className="type-condensed" fontSize="12" fill="#6e4a9e">
                  {c.exitBorder}
                </text>
              </g>
            )}
          </g>
        )
      })}
      <circle cx={X0} cy={Y} r="9" fill="#1d2a33" />
      <circle cx={X1} cy={Y} r="9" fill="#fbfcf9" stroke="#1d2a33" strokeWidth="4" />
    </svg>
  )
}
