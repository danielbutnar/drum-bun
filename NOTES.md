# Drum Bun: build notes (internal)

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
- [x] Knowledge Bases usable (KB created by CLI on 29 Sep).
- [x] MCP endpoints `drum-bun-kb` and `drum-bun-rules` created in the Dashboard (29 Sep; GROQ mode needed a deployed Studio).
- [x] Org token `drum-bun-agent` (Context Viewer) → Vercel `SANITY_ORGANIZATION_TOKEN`; token `drum-bun-insights` (Context Editor) → `SANITY_INSIGHTS_TOKEN`.
- [x] Card on file at Vercel to unlock the AI Gateway free credit (no credits bought; owner chose to stay free, 29 Sep).
- [x] Public repo https://github.com/danielbutnar/drum-bun (29 Sep).
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

## Decisions

- 29 Sep: live model `openai/gpt-5-mini` (low reasoning effort) because the AI Gateway free tier blocks all Claude models and Gemini 2.5 Flash returned empty answers. Free tier limit: 5 requests per minute for the whole team, so example answers are recorded (`web/data/examples.json`) and a clear "busy" message replaces empty answers.
- 29 Sep: Knowledge Base issues resolved via the context API; reasons in `context/knowledge-bases/decisions.md`.

## Progress

- 2026-09-29: challenge researched (rules, 128 competing entries, Sanity Context/KB/App SDK/Workflows docs). Concept, Path One only and Vercel AI Gateway free credit picked by the owner. Sanity org and project created, schema deployed. Planner written with 15 unit tests passing. Country research running.
- 2026-09-29 evening: KB built (19 entries, 103 dataset + 23 web sources), 15 issues resolved, 9 standing instructions; site live at https://drum-bun-agent.vercel.app; Studio at https://drum-bun.sanity.studio; agent answers end to end locally (RO/DE/EN). First eval run: agent 6/16 vs keyword 9/16, caused by over-asking, wrong reply language, empty answers from the reasoning budget and the 5 req/min limit. Fixed: instructions, language detection in code, country_products tool, maxOutputTokens 5000, paced eval.
- 2026-09-29 late: final eval run agent 15/16 vs keyword baseline 11/16 (evals/RESULTS.md). Full KB rebuild: no new conflicts (decisions carried), 4 naming gaps applied, 22 entries; all stale phrases gone (checked by script). Live URL now https://drum-bun-agent.vercel.app (project domain). Example answers re-recorded after the rebuild. Demo video cut 1: video/drum-bun-demo.mp4 (2:41, 1080p, Kokoro voice am_michael, captions, synthesized pad), filmed headless from the live site with video/film.mjs; rebuild with build.mjs + mix.mjs (ffmpeg from imageio-ffmpeg via uv). Post draft post/drum-bun.md (1,400 words); placeholders left: cover URL, video embed, two screenshots, agent session.

## Next (Wed 30 Sep)

1. Owner watches the video; changes if any.
2. Screenshots for the post (plan + trace) into post/, referenced by raw GitHub URLs; cover from post/cover.png.
3. Owner uploads the video (YouTube, unlisted or public) → embed.
4. Curate the Claude Code agent session (exclude HQ/business content and anything personal), owner uploads at dev.to/agent_sessions/new and presses Make Public.
5. web-qa on the live site (375/1440, axe, links), README check.
6. Owner publishes the post with #sanitychallenge (target Sun 4 Oct evening at the latest; the deadline is Mon 5 Oct 09:59 Brașov).
