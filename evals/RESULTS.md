# Eval results

Run `2026-09-29T18-59-38` (agent: `openai/gpt-5-mini`, low reasoning; baseline: same model, any-word keyword search over the same Sanity documents, top 6). Patterns for `ro-7-day` and `hu-buy-after` were widened after the run to accept equivalent phrasing ("1, 10, 30, 60 de zile", "60‑minute" with a non-breaking hyphen) and **both systems were re-scored** with `evals/score.mts`. `at-typo` stays strict: the agent's answer was correct for a 10-day vignette (cannot be changed after the start, a wrong plate counts as no vignette, 200 euros) but omitted that annual vignettes can be re-registered for 18 euros, which the test requires. Kept as a miss rather than tuning the prompt to the test.

| question | lang | agent | keyword search | agent tools |
| --- | --- | --- | --- | --- |
| christmas-munich | en | pass | fail | plan_trip |
| at-18-days | en | pass | pass | country_products |
| ro-12m-euro5 | ro | pass | fail | country_products |
| ro-unknown-euro | en | pass | pass | country_products |
| ro-7-day | ro | pass | pass | knowledge_base_read |
| at-walserberg | en | pass | pass | knowledge_base_read |
| hu-counties | en | pass | fail | knowledge_base_read |
| de-ms-tyres | de | pass | pass | knowledge_base_read |
| euro5-cities | en | pass | pass | knowledge_base_read |
| berlin-fine | en | pass | pass | knowledge_base_search, knowledge_base_read |
| de-toll | ro | pass | pass | knowledge_base_read |
| hu-surcharge | en | pass | fail | knowledge_base_read |
| at-ersatzmaut | de | pass | pass | country_products |
| hu-buy-after | en | pass | pass | knowledge_base_read |
| ro-winter-dates | en | pass | pass | knowledge_base_read |
| at-typo | en | fail | fail | knowledge_base_read |

agent 15/16, keyword baseline 11/16

Where keyword search failed: it found the Munich zone documents but no vignette prices for the Christmas trip; it found the rovinietă product but could not pick the Euro-class price; it named 2 of the 6 Hungarian counties and missed the M1 regional vignette; it found the surcharge rules but not the amount.

Earlier runs (kept in `evals/runs/`): run 1 agent 6/16 vs 9/16 (over-asking, wrong reply language, empty answers from the reasoning budget, free-tier rate limit); run 2 on the failures only.
