import type {Metadata} from 'next'

import {sanity} from '@/lib/queries'

export const metadata: Metadata = {
  title: 'How Drum Bun knows: structured content, Knowledge Base, decisions',
  description: 'The Sanity dataset, the Knowledge Base built from official pages in four languages, and every contradiction it found with the decision taken.',
}

export const revalidate = 600

type Side = {claim: string; value?: string; authority?: string; sourceCount: number; chosen: boolean}
type Issue = {issueId: string; kind: string; severity: string; scope: string; text: string; status: string; decision?: string; sides?: Side[]}
type Snapshot = {
  takenAt: string
  sourceCounts: {dataset: number; web: number}
  entries: {path: string; title: string; tldr: string}[]
  issues: Issue[]
  instructions: {statement: string; origin: string; status: string}[]
}
type Data = {
  snapshot: Snapshot | null
  counts: Record<string, number>
  sources: {language: string; trust: string}[]
  example: {name: {en: string}; prices: {amount: number; currency: string; validFrom: string; validTo?: string; band?: {label?: string}}[]} | null
}

const QUERY = `{
  "snapshot": *[_id == "kb-snapshot"][0],
  "counts": {
    "routes": count(*[_type == "route"]),
    "roadSections": count(*[_type == "roadSection"]),
    "tollProducts": count(*[_type == "tollProduct"]),
    "rules": count(*[_type == "rule"]),
    "zones": count(*[_type == "zone"]),
    "claims": count(*[_type == "claim"]),
    "sources": count(*[_type == "source"])
  },
  "sources": *[_type == "source"]{language, trust},
  "example": *[_id == "product-ro-12month"][0]{name, prices}
}`

const STATUS: Record<string, string> = {accepted: 'decided', rejected: 'dismissed', open: 'open'}

export default async function Knowledge() {
  const data = await sanity.fetch<Data>(QUERY)
  const snap = data.snapshot
  const conflicts = snap?.issues.filter((i) => i.kind === 'conflict') ?? []
  const other = snap?.issues.filter((i) => i.kind !== 'conflict') ?? []
  const byLang = tally(data.sources.map((s) => s.language.toUpperCase()))
  const byTrust = tally(data.sources.map((s) => s.trust))

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-10">
      <header>
        <h1 className="type-expanded text-4xl font-extrabold tracking-tight sm:text-5xl">How it knows</h1>
        <p className="mt-4 text-lg">
          Drum Bun answers from three layers, all in Sanity. Structured documents decide prices and coverage. A Knowledge Base built
          from official pages in four languages explains them. The agent reads both through Sanity Context, and a deterministic
          planner does the arithmetic.
        </p>
      </header>

      <Pipeline counts={data.counts} snap={snap} />

      <section aria-labelledby="structure">
        <h2 id="structure" className="type-expanded text-2xl font-bold">
          Why structure, not search
        </h2>
        <p className="mt-2">
          “What does a Brașov to Munich trip on 20 December cost?” has no page that answers it. The answer depends on the route
          (which road sections, which counties), the dates (a price is only true for its period; Austria’s 2027 prices start on
          1 December and are not published yet), the car (Romania prices by Euro class from 1 October 2026) and the cheapest
          combination of products. Each of those is a field. Here is one product’s price list as stored:
        </p>
        {data.example && (
          <div className="mt-4 overflow-x-auto rounded-lg bg-paper p-4">
            <table className="tabular w-full text-sm">
              <caption className="type-condensed mb-2 text-left font-semibold">{data.example.name.en}: prices[]</caption>
              <thead>
                <tr className="text-left text-ink-2">
                  <th className="pr-3 font-medium">amount</th>
                  <th className="pr-3 font-medium">validFrom</th>
                  <th className="pr-3 font-medium">validTo</th>
                  <th className="font-medium">band</th>
                </tr>
              </thead>
              <tbody>
                {data.example.prices.map((p, i) => (
                  <tr key={i} className="border-t border-land-2">
                    <td className="py-1 pr-3">
                      {p.amount} {p.currency}
                    </td>
                    <td className="pr-3">{p.validFrom}</td>
                    <td className="pr-3">{p.validTo ?? '—'}</td>
                    <td>{p.band?.label ?? 'one price for all cars'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-ink-2">
          Outdated statements drivers read online are data too: {data.counts.claims} claim documents, each linked to the fact that
          corrects it, so the planner can warn about the one you probably read.
        </p>
      </section>

      {snap && (
        <section aria-labelledby="conflicts">
          <h2 id="conflicts" className="type-expanded text-2xl font-bold">
            What the Knowledge Base caught, and what was decided
          </h2>
          <p className="mt-2">
            The build compares every source with every other. It filed {snap.issues.length} issues. Conflicts are shown with both
            sides; the decision becomes a standing instruction for every later build.
          </p>
          <ul className="mt-4 space-y-4">
            {conflicts.map((i) => (
              <li key={i.issueId} className="rounded-lg bg-paper p-4">
                <p className="type-condensed text-sm text-ink-2">
                  conflict · {i.severity} · {i.scope} · {STATUS[i.status] ?? i.status}
                </p>
                <p className="mt-1">{i.text}</p>
                <ol className="mt-3 space-y-2">
                  {i.sides?.map((s, n) => (
                    <li key={n} className={`rounded-md border-l-4 p-2 ${s.chosen ? 'border-ok bg-land' : 'border-land-2'}`}>
                      <span className="type-condensed mr-2 text-sm font-semibold">{s.chosen ? 'kept' : 'not kept'}</span>
                      {s.claim}
                      {s.authority && <span className="text-sm text-ink-2"> ({s.authority})</span>}
                    </li>
                  ))}
                </ol>
                {i.decision && <p className="mt-3 text-sm">{i.decision}</p>}
              </li>
            ))}
          </ul>
          {other.length > 0 && (
            <details className="mt-4 rounded-lg bg-paper p-4">
              <summary className="cursor-pointer font-semibold">{other.length} gaps and structure suggestions</summary>
              <ul className="mt-3 space-y-3 text-sm">
                {other.map((i) => (
                  <li key={i.issueId}>
                    <span className="type-condensed text-ink-2">
                      {i.kind} · {i.severity} · {STATUS[i.status] ?? i.status}
                    </span>
                    <p>{i.text}</p>
                    {i.decision && <p className="text-ink-2">{i.decision}</p>}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      {snap && snap.instructions.length > 0 && (
        <section aria-labelledby="instructions">
          <h2 id="instructions" className="type-expanded text-2xl font-bold">
            Standing instructions
          </h2>
          <p className="mt-2">Rules every build follows, tied to the sources they are about.</p>
          <ul className="mt-3 space-y-2">
            {snap.instructions.map((x, n) => (
              <li key={n} className="rounded-md bg-paper p-3 text-sm">
                <span className="type-condensed mr-2 font-semibold text-ink-2">{x.origin === 'human' ? 'written by us' : 'from a conflict'}</span>
                {x.statement}
              </li>
            ))}
          </ul>
        </section>
      )}

      {snap && (
        <section aria-labelledby="outline">
          <h2 id="outline" className="type-expanded text-2xl font-bold">
            The Knowledge Base outline
          </h2>
          <p className="mt-2">
            {snap.entries.length} entries distilled from {snap.sourceCounts.dataset} dataset documents and {snap.sourceCounts.web} web
            pages. The agent reads this outline first, then opens the entries it needs.
          </p>
          <ul className="mt-3 divide-y divide-land-2 rounded-lg bg-paper">
            {snap.entries.map((e) => (
              <li key={e.path} className="p-3">
                <code className="text-sm text-road-dark">{e.path}</code>
                <p className="font-semibold">{e.title}</p>
                {typeof e.tldr === 'string' && e.tldr && <p className="text-sm text-ink-2">{e.tldr}</p>}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-ink-2">Snapshot taken {snap.takenAt.slice(0, 16).replace('T', ' ')} UTC.</p>
        </section>
      )}

      <section aria-labelledby="sources-mix">
        <h2 id="sources-mix" className="type-expanded text-2xl font-bold">
          Sources
        </h2>
        <p className="mt-2">
          {data.counts.sources} source documents. By language: {fmt(byLang)}. By trust: {fmt(byTrust)}. Blogs and forums are in the
          dataset on purpose: they are what drivers read, so the agent must recognise them and say why they are wrong.
        </p>
      </section>
    </div>
  )
}

function Pipeline({counts, snap}: {counts: Record<string, number>; snap: Snapshot | null}) {
  const steps = [
    {title: 'Official pages and laws', text: 'ASFINAG, CNAIR, the Hungarian toll operator, city and federal sites, in RO, HU, DE and EN, plus the blogs drivers read.'},
    {
      title: 'Sanity dataset',
      text: `${counts.routes} routes, ${counts.roadSections} road sections, ${counts.tollProducts} toll products with dated prices, ${counts.rules} rules, ${counts.zones} zones, ${counts.claims} claims.`,
    },
    {
      title: 'Knowledge Base',
      text: snap ? `${snap.entries.length} entries from the dataset and ${snap.sourceCounts.web} web pages; ${snap.issues.length} issues decided.` : 'Built from the dataset and web pages.',
    },
    {title: 'Sanity Context MCP', text: 'Two endpoints: the Knowledge Base, and GROQ over the dataset with embeddings.'},
    {title: 'Agent and planner', text: 'The planner computes; the agent explains, in the driver’s language, with sources.'},
  ]
  return (
    <ol className="grid gap-3 sm:grid-cols-5" aria-label="From sources to answer">
      {steps.map((s, i) => (
        <li key={s.title} className="rail pl-5">
          <p className="type-condensed text-sm text-ink-2">Step {i + 1}</p>
          <p className="font-bold leading-snug">{s.title}</p>
          <p className="mt-1 text-sm">{s.text}</p>
        </li>
      ))}
    </ol>
  )
}

function tally(values: string[]): [string, number][] {
  const m = new Map<string, number>()
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1)
  return [...m].sort((a, b) => b[1] - a[1])
}

function fmt(pairs: [string, number][]): string {
  return pairs.map(([k, v]) => `${k} ${v}`).join(', ')
}
