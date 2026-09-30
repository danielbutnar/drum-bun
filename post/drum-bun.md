---
title: Drum Bun: an agent that knows Romania rewrote its vignette this week
published: false
tags: devchallenge, sanitychallenge, sanity, ai
cover_image: https://raw.githubusercontent.com/danielbutnar/drum-bun/main/post/cover.png
---

*This is a submission for the [Sanity Challenge, Path One: Ship an Agent That Queries Real Content](https://dev.to/challenges/sanity-2026-09-16)*

## What I Built

Every December, hundreds of thousands of cars drive home between Germany or Austria and Romania. The questions before the drive are always the same: which vignettes, for which days, bought where, and what else gets you fined on the way? The answers are spread over four toll operators, four languages and a lot of outdated blog posts.

This year they changed under everyone's feet:

- **Romania** replaced its rovinietă on **1 October 2026**: new seller (TollRo), prices in lei **by Euro class**, and a car whose class cannot be shown pays the Euro 0 rate. A Senate bill could still postpone it.
- **Hungary** added an **M1 regional** vignette in 2026 that makes a yearly crossing less than half the price of the national one, if you know that the Pest and Komárom-Esztergom county vignettes leave a gap on the M1 that only Fejér covers.
- **Austria** sells only digital vignettes for validity from **1 December 2026**, raised the on-the-spot penalty to €200, and its 2027 prices are not published yet, so a Christmas trip cannot be priced exactly.

**Drum Bun** ("have a good road", what Romanians say before a journey) tells you what your car needs for *your* trip:

- the cheapest set of products per country for your dates and vehicle, with the price valid on each travel day (and a flag when it is not published yet);
- the rules that apply on those dates (winter tyres, emission zones at the destination, border checks);
- the outdated claims you probably read, each linked to the fact that corrects it;
- an agent you can ask in Romanian, German, Hungarian or English, which shows every Knowledge Base entry and query it used.

## Demo

**Live:** https://drum-bun-agent.vercel.app (no login; the planner works without the model, the chat is rate-limited)

{% embed https://youtu.be/X2qOuYowQro %}

![The Brașov to Munich plan: a strip map of the route through Romania, Hungary, Austria and Germany, the warnings before you go, and what to buy in each country with prices for each travel day](https://raw.githubusercontent.com/danielbutnar/drum-bun/main/post/img/plan.png)
*The route as a strip map drawn from the data: tolled sections red with a yellow core, free sections hollow, borders dashed.*

![The agent checks two claims from a blog; the expanded trace shows a Knowledge Base search and the two entries it opened](https://raw.githubusercontent.com/danielbutnar/drum-bun/main/post/img/agent-trace.png)
*Every answer shows its steps: planner run, Knowledge Base entries opened, GROQ queries.*

## Code

{% github danielbutnar/drum-bun %}

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

The Knowledge Base "Drum Bun road rules" is built from the dataset (a GROQ query that flattens each document into readable fields) plus 24 web pages: the toll operators, ministries and cities in Romanian, Hungarian, German and English, **and the blogs drivers actually read**. The first build filed 14 issues; after all fixes and a full rebuild the Knowledge Base has 22 entries from 103 dataset documents and 24 web pages, 21 decided issues and 9 standing instructions. I resolved them with `@sanity/client`'s `context` API instead of clicking through the Dashboard, so every decision is in the repo with its reason ([decisions.md](https://github.com/danielbutnar/drum-bun/blob/main/context/knowledge-bases/decisions.md)):

- Two of the four conflicts came from **my own vocabulary**: the build read my enum value `carTrailer` as "a trailer" and concluded trailers must carry warning triangles. One standing instruction fixed the vocabulary for every future build. Of the other two, one was true for different dates (Austria's substitute toll was €120 before 2026, €200 since), so an instruction now makes entries state the date; the other was a Hungarian motorcycle price that is right once you know motorcycles buy the car's annual vignette.
- It **invented** Hungarian purchase points (post offices, the automobile club) that no source names. An instruction limits entries to the channels the sources name.
- It **missed** one: an entry quoted the Romanian Interior Ministry page's winter-tyre fine, computed with an old penalty-point value. I wrote an instruction scoped to that page; the background contradiction check then filed an issue against the stale entry by itself, and applying it fixed the number. That loop, human instruction → automatic check → issue → rebuild, is the part I would not want to build myself.

![A Knowledge Base conflict on the How it knows page: the side that was not kept, the side that was kept, and why](https://raw.githubusercontent.com/danielbutnar/drum-bun/main/post/img/kb-decision.png)
*One of the conflicts the build filed, with the decision and the reason.*

The public [How it knows](https://drum-bun-agent.vercel.app/knowledge) page shows every issue with both sides, what was kept, the standing instructions and the outline, from a snapshot the script writes into the dataset.

### 3. Sanity Context MCP, two endpoints

One endpoint serves one mode, so there are two: `drum-bun-kb` (Knowledge Base mode: outline + `knowledge_base_read`/`knowledge_base_search`) and `drum-bun-rules` (GROQ mode over the dataset, embeddings enabled). The agent (AI SDK 7, AI Gateway) fetches both initial contexts once, inlines them, and gets the planner as a third tool. Conversations are saved with Sanity Context Insights; a daily cron classifies them.

### 4. Does structure beat search?

Sixteen questions in Romanian, German and English, each with facts an answer must contain and outdated facts it must not ([questions](https://github.com/danielbutnar/drum-bun/blob/main/evals/questions.json)). The baseline gets the **same Sanity documents and the same model**, but retrieves with an any-word keyword search (what a site search box does) instead of the planner, the Knowledge Base and GROQ.

| | correct |
| --- | --- |
| Drum Bun agent (planner + Knowledge Base + GROQ via Sanity Context) | **15 / 16** |
| Keyword search over the same content | 11 / 16 |

The one question the agent missed: someone typed the wrong plate on an Austrian 10-day digital vignette that has already started. The agent said the right thing, that it can no longer be changed and that a wrong plate counts as no vignette (€200 on the spot), but it left out that *annual* vignettes are the exception (re-registration for €18). The test requires that detail, so it counts as a miss. I kept the test as written instead of tuning the prompt until it passes; keyword search missed it too.

Search did fine on single facts: the dataset states them plainly, which is itself a point for structured content. It failed exactly where the answer has to be *computed*: it found the Munich zone rules but no vignette prices for the Christmas trip, found the rovinietă but could not pick the Euro-class price, named 2 of the 6 Hungarian counties and missed the M1 regional vignette, and found the surcharge rules but not the amount.

Honest notes: the first run scored the agent **6 / 16**. It asked "which city?" for general questions, answered an English question in Romanian, returned empty answers when reasoning tokens ate the output budget, and hit the free model tier's 5-requests-a-minute limit. The fixes were a tool for single-product prices, language detection in code, a bigger output budget and a paced runner. After the final run I widened two patterns that rejected correct answers ("1, 10, 30, 60 de zile", a non-breaking hyphen in "60‑minute") and re-scored **both** systems; every run is in [`evals/runs`](https://github.com/danielbutnar/drum-bun/tree/main/evals/runs).

### What did not go smoothly

- A dataset source query with `select()` made the ingest fail with a generic server error; plain projections work.
- A website source crawls everything under the URL's path: the Munich city page pulled in 306 pages of a 150-source budget. Single deep URLs import one page.
- GROQ mode needs a deployed Studio, not only a deployed schema.
- The AI Gateway's free tier does not include Claude models and allows 5 requests a minute, so the live agent runs on `gpt-5-mini`, the example questions replay recorded answers (labelled as such, with an "ask it live" button), and a busy model says so instead of failing silently. The planner makes the model choice matter less.
- The first eval run lost to keyword search (above). Measuring early is what made the agent good.

## Sanity Project Details

- Project ID: **`pd5e7gez`**, dataset **`production`** (public). Try [one product's stored prices](https://pd5e7gez.api.sanity.io/v2026-09-01/data/query/production?query=*%5B_id%3D%3D%22product-ro-12month%22%5D%5B0%5D%7Bname%2C%20prices%7D): `*[_id=="product-ro-12month"][0]{name, prices}`
- Organization `ob2cyckj9`, Knowledge Base `kbv1SRpT2A3t`, MCP endpoints `drum-bun-kb` and `drum-bun-rules`.
- Studio: https://drum-bun.sanity.studio (members only; the schema is in [`studio/schemaTypes`](https://github.com/danielbutnar/drum-bun/blob/main/studio/schemaTypes)).

## Agent Session

The whole build ran as one Claude Code session over two days: the research into four countries' toll rules, the schema, the planner and its tests, the Knowledge Base decisions, the eval run that lost to keyword search, and the video. Steps that touched my unrelated private notes are removed.

{% agent_session building-drum-bun-with-claude-code-dlb6i2 0..494 %}
