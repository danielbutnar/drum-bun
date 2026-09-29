# Knowledge Base decisions (build 1, 29 Sep 2026)

The first build of "Drum Bun road rules" (122 sources: 103 dataset documents, 19 web pages in RO/HU/DE/EN) filed 14 issues. Resolved through `@sanity/client`'s `context.issues` API with `studio/scripts/kb.ts`, policy: official > club > press > blog; the law wins over a web page; the newer official source wins.

| Issue | Kind | Decision | Why |
| --- | --- | --- | --- |
| Austria equipment: "cars, campers and trailers" vs "cars only" | conflict | side 1 + instruction | The build read the dataset value `carTrailer` as "a trailer". A trailer carries nothing; drivers of cars and campers (multi-track vehicles, also when towing) carry triangle and vest (§ 102(10) KFG). The instruction fixes the vocabulary for every future build. |
| Romania equipment: same pattern | conflict | side 1 + instruction | OUG 195/2002 art. 8: every motor vehicle except motorcycles; the trailer itself carries nothing. |
| Hungarian D1M annual 2025 price | conflict | side 0 (keep) | Motorcycles buy the annual vignette as a D1 product at the car price (59,210 HUF in 2025, 61,760 in 2026). |
| Austrian substitute toll 120 vs 200 euros | conflict | side 1 + instruction | Both were true: 120 before 1 Jan 2026, 200 from then. The instruction makes entries always state the date. |
| "A 8", "A 9", "A 12", "A 25", "A 93", "KRESZ 1/1975", "EURO III-0", "Digitale Vignette" not named in any entry | gap (critical) | applied | An agent asked about "the A 8" must find it by name. |
| Hungarian purchase places: post offices, automobile club | gap | instruction + applied | No source names them; the build invented them. Only the operator and contracted resellers sell e-vignettes. |
| Merge "No car toll: status and ECJ ruling" | merge | dismissed | "Does Germany charge cars?" is its own question. |

Missed by the build, caught by reading entries: `winter_equipment/fact_checks` quoted the Romanian Interior Ministry page's fine (603–1,340 lei), computed with an old penalty-point value. Since 1 Jul 2026 the class IV fine is 1,946.25–4,325 lei. Fixed with a standing instruction scoped to that page and the dataset rule, and a rebuild of the two winter entries.
