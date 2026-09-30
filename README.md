# Drum Bun

**What your car needs on the road between Romania and Germany or Austria**: vignettes and tolls for your dates (the cheapest combination), winter-tyre and emission-zone rules, and which claims you read online are out of date. Every answer is traced to an official source.

Live: https://drum-bun-agent.vercel.app · Demo video (2:52): https://youtu.be/X2qOuYowQro · Sanity project `pd5e7gez`, dataset `production` (public) · Built for the [DEV Sanity Challenge](https://dev.to/challenges/sanity-2026-09-16), Path One: [the post](https://dev.to/danielbutnar/drum-bun-an-agent-that-knows-romania-rewrote-its-vignette-this-week-2d0g).

> "Drum bun!" is what Romanians say before a journey, and what the sign says when you leave a town.

## Why this needs structure

"What does Brașov → Munich on 20 December, back 3 January, cost in a Euro 5 diesel?" has no page that answers it. The answer is computed from:

- the **route**: which road sections, in which Hungarian counties, which are tolled (the Salzburg Nord → Walserberg stretch is free, the M1 between Bicske and Szárliget is only covered by the Fejér county vignette);
- the **dates**: every price is dated (`validFrom`/`validTo`); Austria's vignette year starts on 1 December, so a Christmas trip needs 2027 products whose prices are not published yet;
- the **car**: from 1 October 2026 Romania prices the rovinietă by Euro class, and an unknown class pays the Euro 0 rate;
- the **cheapest cover**: two 1-day vignettes, one 10-day, a monthly, or annual county vignettes plus the new M1 regional one.

A keyword search finds documents about each of these. It cannot combine them.

## How it works

```
official pages, laws, blogs (RO, HU, DE, EN)
        │  research/ (sourced notes)  →  studio/seed/ (typed documents)
        ▼
Sanity dataset ── 20 routes · 22 road sections · 28 toll products with dated prices
        │         16 rules · 7 zones · 26 claims seen online · 85 sources
        ├──► GROQ ──► planner (web/lib/planner.ts): pure, unit-tested, no model
        │
        ├──► Knowledge Base "Drum Bun road rules" (dataset + 23 web pages)
        │      issues resolved and standing instructions written via @sanity/client context API
        ▼
Sanity Context MCP: drum-bun-kb (Knowledge Base mode) + drum-bun-rules (GROQ mode, embeddings)
        ▼
agent (web/lib/agent.ts, AI SDK 7 + AI Gateway): calls plan_trip, reads KB entries, runs GROQ;
the UI shows the plan as a strip map and every step the agent took
```

- **The planner decides, the model explains.** `plan_trip` is a tool the agent calls; prices, coverage and validity are never generated.
- **Contradictions are data.** Outdated statements drivers find online are `claim` documents linked to the facts that correct them. The planner surfaces the ones relevant to your trip.
- **The Knowledge Base is reconciled in code.** `studio/scripts/kb.ts` lists issues, resolves conflicts, writes standing instructions scoped to sources, rebuilds entries, and snapshots the result into the dataset for the public [How it knows](https://drum-bun-agent.vercel.app/knowledge) page. Decisions and reasons: [`context/knowledge-bases/decisions.md`](context/knowledge-bases/decisions.md).

## Layout

| Path | What |
| --- | --- |
| `research/` | Sourced facts per country (checked 29 Sep 2026), incl. outdated pages found online |
| `studio/` | Sanity Studio 6: schema (`schemaTypes/`), desk structure, seed data (`seed/`), scripts (`scripts/seed.ts`, `scripts/kb.ts`) |
| `context/` | Everything configured in Sanity Context: Knowledge Base purpose, dataset query, web sources, MCP endpoint instructions, decisions |
| `web/` | Next.js 16 app: planner + tests (`lib/`), agent and MCP client, pages, components |
| `evals/` | 16 questions in RO/DE/EN with checkable facts; agent vs any-word keyword baseline over the same content |

## Run it

```bash
pnpm install
pnpm --filter web test          # planner unit tests
pnpm --filter web dev           # http://localhost:3000 (planner works without any secret)
```

The chat needs a Sanity organization token with Context Viewer (`SANITY_ORGANIZATION_TOKEN`), the two MCP URLs (`SANITY_MCP_KB_URL`, `SANITY_MCP_GROQ_URL`) and AI Gateway access (on Vercel via OIDC; locally `vercel env pull web/.env.local`).

Re-seed and inspect the Knowledge Base (uses your Sanity CLI login):

```bash
pnpm --filter studio exec sanity exec scripts/seed.ts --with-user-token
pnpm --filter studio exec sanity exec scripts/kb.ts --with-user-token -- issues
```

## Limits

- Private cars, campers up to 3.5 t, cars with trailers and motorcycles; 4 Romanian start cities × 5 destinations via Hungary and Austria. No Czech/Slovak routes yet.
- Facts were checked on 29 September 2026. Prices not published yet are shown as estimates; pending laws (a Senate bill could postpone Romania's new system) are shown as pending, never applied.
- Distances are approximate. Not legal advice.
