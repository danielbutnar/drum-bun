# Drum Bun

An agent that tells a driver exactly what their car needs on the road between Romania and Germany or Austria: which vignettes and tolls to buy for their dates (and the cheapest combination), which winter-tyre and emission-zone rules apply, and which claims they read online are out of date. Every answer is traced to an official source.

Entry for the [DEV.to Sanity Challenge](https://dev.to/challenges/sanity-2026-09-16), **Path One: Ship an Agent That Queries Real Content**.

- Deadline: Sun 4 Oct 2026, 23:59 PDT = **Mon 5 Oct, 09:59 Brașov**. Target: publish Sunday evening.
- Prizes: 3 × $500 in Path One (2 more in Path Two). Judging: meaningful use of Sanity Context and structured content, technical implementation and code quality, use of Knowledge Bases, usability. Tiebreak: reactions.
- Rules that matter: built from scratch inside the entry period (started 29 Sep), English post, Sanity project ID in the post, test credentials if a login is needed (none planned).

## Why it wins (the bet)

About 71 Path One entries existed on 29 Sep; most are "an agent that refuses to answer without receipts" on docs or errata. Gaps nobody covers, which this entry aims at:

1. **Multilingual official sources** (RO, HU, DE, EN) whose language versions and dates disagree. No other entry uses Romanian content.
2. **A deterministic planner over structured content**: route × dates × vehicle → cheapest set of products, prices valid on the travel date, Austria's 18-day online rule, seasonal winter rules. A keyword search cannot compute this.
3. **Contradictions as data**: outdated claims drivers read online are `claim` documents linked to the facts that correct them; the Knowledge Base built from official sites plus those pages surfaces the same conflicts as Issues, and the decisions carry into the next build.
4. **Public, no-login demo** that works without the model (planner only) and with it (chat that reads the Knowledge Base through Context MCP).

## Layout

| Folder | What |
| --- | --- |
| `studio/` | Sanity Studio: schema, desk structure, seed script. Project `pd5e7gez`, dataset `production` (public), org `ob2cyckj9`. |
| `web/` | Next.js app on Vercel: planner (`lib/planner.ts`, pure and unit-tested), chat agent (AI SDK + Context MCP), pages. |
| `context/` | Everything pasted into the Sanity Context app: Knowledge Base purpose and sources, MCP instructions. |
| `research/` | Sourced facts per country, gathered 29 Sep 2026. The seed data is built from these files. |
| `evals/` | Question set and runner: agent vs keyword baseline. |

## Only the owner can do these

- [x] Sign in to Sanity (GitHub, 29 Sep).
- [ ] Enable Context Knowledge Bases in Manage → Labs.
- [ ] Create an organization token with Context Viewer and add it to Vercel as `SANITY_ORGANIZATION_TOKEN`.
- [ ] Resolve the Knowledge Base Issues in the Dashboard (Claude says which claim to keep and why).
- [ ] Publish the DEV post, upload the agent session and press Make Public.

## Schedule (Brașov time)

| Day | Build | Done when |
| --- | --- | --- |
| Tue 29 Sep | Research, Sanity project, schema, planner + tests | Planner tests green, schema deployed |
| Wed 30 Sep | Seed data from research, Knowledge Base build, two MCP endpoints, chat agent | Agent answers the Christmas-trip question locally with citations |
| Thu 1 Oct | UI (design direction picked by owner), Vercel deploy, rate limits, cached examples | Live URL works at 375 and 1440 px without a login |
| Fri 2 Oct | Resolve KB Issues, evals vs keyword baseline, Insights | Eval table ready for the post |
| Sat 3 Oct | Video, cover image, post draft, agent session curated | Draft complete |
| Sun 4 Oct | QA, owner publishes | Post live with the tag #sanitychallenge |

## Progress

- 2026-09-29: challenge researched (rules, 128 competing entries, Sanity Context/KB/App SDK/Workflows docs). Concept, Path One only and Vercel AI Gateway free credit picked by the owner. Sanity org and project created, schema deployed. Planner written with 15 unit tests passing. Country research running.
