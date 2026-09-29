---
title: Drum Bun: an agent that knows Romania rewrote its vignette this week
published: false
tags: devchallenge, sanitychallenge, sanity, ai
cover_image: COVER_URL
---

*This is a submission for the [Sanity Challenge, Path One: Ship an Agent That Queries Real Content](https://dev.to/challenges/sanity-2026-09-16)*

## What I Built

Every December, hundreds of thousands of cars drive home between Germany or Austria and Romania. The questions before the drive are always the same: which vignettes, for which days, bought where, and what else gets you fined on the way? The answers are spread over four toll operators, four languages and a lot of outdated blog posts.

This year they changed under everyone's feet:

- **Romania** replaced its rovinietă on **1 October 2026**: new seller (TollRo), new durations, prices in lei **by Euro class**, and a car whose class cannot be shown pays the Euro 0 rate. A Senate bill could still postpone it.
- **Hungary** added an **M1 regional** vignette in 2026 that makes a yearly crossing less than half the price of the national one, if you know that the Pest and Komárom-Esztergom county vignettes leave a gap on the M1 that only Fejér covers.
- **Austria** sells only digital vignettes for validity from **1 December 2026**, raised the on-the-spot penalty to €200, and its 2027 prices are not published yet, so a Christmas trip cannot be priced exactly.

**Drum Bun** ("have a good road", what Romanians say before a journey) tells you what your car needs for *your* trip:

- the cheapest set of products per country for your dates and vehicle, with the price valid on each travel day (and a flag when it is not published yet);
- the rules that apply on those dates (winter tyres, emission zones at the destination, border checks);
- the outdated claims you probably read, each linked to the fact that corrects it;
- an agent you can ask in Romanian, German, Hungarian or English, which shows every Knowledge Base entry and query it used.

## Demo

**Live:** https://drum-bun-agent.vercel.app (no login; the planner works without the model, the chat is rate-limited)

VIDEO_EMBED

SCREENSHOT_PLAN
*The route as a strip map drawn from the data: tolled sections red with a yellow core, free sections hollow, borders dashed.*

SCREENSHOT_TRACE
*Every answer shows its steps: planner run, Knowledge Base entries opened, GROQ queries.*

## Code

GITHUB_EMBED

## How I Used Sanity

### 1. Structured content that computes

"Brașov to Munich, 20 December, back 3 January, Euro 5 diesel" has no page that answers it. So the content is modelled as the pieces the answer is computed from:

- `route` → ordered `legs` → `roadSection` references. A section has `tolled`, `coveredBy[]` (the products that make it legal, any one is enough), `counties[]` and `exemptVehicles[]`.
- `tollProduct` with `validity` (`days`, `months`, `calendarYear` with overlap windows) and dated `prices[]`: each price has `validFrom`/`validTo` and an optional emission `band` (`euroMin`, `euroMax`, `electric`, `appliesWhenUnknown`).
- `rule` with a yearly `season` window, `conditional` + `condition`, `effectiveFrom/To` and `severity`; `zone` with `dieselMinEuro` and `status`.
- `claim`: a statement found online, its `verdict` (`outdated`, `wrong`, `misleading`), the `source` it was seen on, and `correctedBy[]` references to the facts that are true now.
- `source` with `trust` (official, club, press, blog, forum), `language` and `checkedAt`. Every fact references at least one.

A pure, unit-tested planner walks that structure: it picks the price valid on each date, runs a small dynamic program for the cheapest cover (two 1-day vignettes beat one 2-month; a 2026 Austrian annual vignette still covers 3 January 2027), solves an exact set cover over Hungarian county vignettes and the M1 regional one, and applies Austria's 18-day rule for online purchases. The agent calls it as a tool. **The model never computes a price.**

### 2. A Knowledge Base from official pages in four languages

The Knowledge Base "Drum Bun road rules" is built from the dataset (a GROQ query that flattens each document into readable fields) plus 23 web pages: the toll operators, ministries and cities in Romanian, Hungarian, German and English, **and the blogs drivers actually read**. The first build filed 14 issues. I resolved them with `@sanity/client`'s `context` API instead of clicking through the Dashboard, so every decision is in the repo with its reason ([decisions.md](GITHUB/context/knowledge-bases/decisions.md)):

- Four "conflicts" came from **my own vocabulary**: the build read my enum value `carTrailer` as "a trailer" and concluded trailers must carry warning triangles. One standing instruction fixed the vocabulary for every future build.
- It **invented** Hungarian purchase points (post offices, the automobile club) that no source names. An instruction limits entries to the channels the sources name.
- It **missed** one: an entry quoted the Romanian Interior Ministry page's winter-tyre fine, computed with an old penalty-point value. I wrote an instruction scoped to that page; the background contradiction check then filed an issue against the stale entry by itself, and applying it fixed the number. That loop, human instruction → automatic check → issue → rebuild, is the part I would not want to build myself.

The public [How it knows](https://drum-bun-agent.vercel.app/knowledge) page shows every issue with both sides, what was kept, the standing instructions and the outline, from a snapshot the script writes into the dataset.

### 3. Sanity Context MCP, two endpoints

One endpoint serves one mode, so there are two: `drum-bun-kb` (Knowledge Base mode: outline + `knowledge_base_read`/`knowledge_base_search`) and `drum-bun-rules` (GROQ mode over the dataset, embeddings enabled). The agent (AI SDK 7, AI Gateway) fetches both initial contexts once, inlines them, and gets the planner as a third tool. Conversations are saved with Sanity Context Insights; a daily cron classifies them.

### 4. Does structure beat search?

EVAL_TABLE

### What did not go smoothly

- A dataset source query with `select()` made the ingest fail with a generic server error; plain projections work.
- A website source crawls everything under the URL's path: the Munich city page pulled in 306 pages of a 150-source budget. Single deep URLs import one page.
- GROQ mode needs a deployed Studio, not only a deployed schema.
- The AI Gateway's free tier does not include Claude models, so the live agent runs on `gpt-5-mini`; the planner makes the model choice matter less.

## Sanity Project Details

- Project ID: **`pd5e7gez`**, dataset **`production`** (public). Try: `https://pd5e7gez.api.sanity.io/v2026-09-01/data/query/production?query=*[_type=="tollProduct" && country->code=="RO"][0]{name, prices}`
- Organization `ob2cyckj9`, Knowledge Base `kbv1SRpT2A3t`, MCP endpoints `drum-bun-kb` and `drum-bun-rules`.
- Studio: https://drum-bun.sanity.studio (members only; the schema is in [`studio/schemaTypes`](GITHUB/studio/schemaTypes)).

## Agent Session

AGENT_SESSION
