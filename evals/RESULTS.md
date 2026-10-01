# Eval results

Run `2026-10-01T12-33-39` on 18 questions in RO/DE/HU/EN (`evals/questions.json`). Agent: `openai/gpt-5-mini`, low reasoning, through the chat endpoint (planner + Knowledge Base + GROQ via Sanity Context). Three baselines, same model and reasoning effort, one shared prompt, the agent's output budget (5,000 tokens) and the fields the Knowledge Base ingests (`context/knowledge-bases/dataset-query.groq`); only retrieval differs (`web/app/api/dev-baseline/route.ts`):

- **semantic search**: `text::semanticSimilarity` over the dataset's embeddings, top 6 documents;
- **keyword search**: any-word GROQ `match`, top 6 documents (what a site search box does);
- **no documents**: the model on its own.

| question | lang | agent | semantic search | keyword search | no documents | agent tools |
| --- | --- | --- | --- | --- | --- | --- |
| christmas-munich | en | pass | fail | fail | fail | plan_trip |
| at-18-days | en | pass | pass | pass | fail | country_products |
| ro-12m-euro5 | ro | pass | pass | fail | fail | country_products |
| ro-unknown-euro | en | pass | pass | fail | fail | country_products |
| ro-7-day | ro | pass | pass | pass | fail | knowledge_base_read |
| at-walserberg | en | pass | pass | pass | pass | knowledge_base_read |
| hu-counties | en | pass | fail | pass | fail | country_products |
| de-ms-tyres | de | pass | pass | pass | fail | knowledge_base_read |
| euro5-cities | en | pass | pass | pass | pass | knowledge_base_read |
| berlin-fine | en | pass | pass | pass | fail | knowledge_base_read |
| de-toll | ro | pass | pass | pass | pass | knowledge_base_search, knowledge_base_read |
| hu-surcharge | en | pass | pass | pass | fail | knowledge_base_read |
| at-ersatzmaut | de | pass | pass | pass | fail | country_products |
| hu-buy-after | en | pass | pass | pass | fail | knowledge_base_read |
| ro-winter-dates | en | pass | pass | pass | pass | knowledge_base_read |
| at-typo | en | pass | pass | fail | fail | knowledge_base_search, knowledge_base_read |
| hu-ro-unknown-euro | hu | pass | pass | fail | fail | country_products |
| hu-yearly-counties | hu | pass | pass | pass | fail | country_products |

agent 18/18, semantic search 16/18, keyword search 13/18, no documents 4/18

Scoring: gpt-5-mini writes non-breaking hyphens ("1‑day", "Umwelt‑plakette", "Bács‑Kiskun"), which the patterns did not match. The scorer now reads U+2010/U+2011 as a plain hyphen for every system, and the sticker pattern of `christmas-munich` accepts "Umwelt-plakette". Before that fix the same answers scored agent 16, semantic 15, keyword 12, no documents 4. `hu-yearly-counties` turned out lenient: keyword search passes it by naming the counties without giving the cheapest combination; the pattern is kept as written.

Where search failed (answers in the run file):

- **Christmas trip** (4 countries): semantic search's six hits covered Romania and Munich, nothing on Hungary or Austria, and it answered the English question in Romanian; keyword search found no vignette prices.
- **Hungarian counties for Nădlac → Hegyeshalom**: semantic search named the four M1 counties and forgot Csongrád-Csanád and Bács-Kiskun on the M43/M5.
- **Romanian Euro-class prices** (`ro-12m-euro5`, `ro-unknown-euro`, `hu-ro-unknown-euro`): keyword search did not retrieve the product with the Euro-class prices (asked in Hungarian it found nothing and the model invented 7- and 90-day rovinietas); semantic search did.
- **No documents**: 4/18, only on facts that have not changed for years (Walserberg, Munich and Stuttgart diesel rules, no German car toll, Romania's situational winter-tyre rule).

## Earlier runs

Run `2026-09-29T18-59-38` (16 questions, keyword baseline only; that baseline's prompt asked for brief answers, had 1,400 output tokens and left out fields such as `penalty`): agent 15/16, keyword 11/16. The agent missed `at-typo` (it left out that annual vignettes can be re-registered for 18 euros), which it answered fully on 1 Oct. Patterns for `ro-7-day` and `hu-buy-after` were widened after that run and both systems re-scored. Run 1 on 29 Sep: agent 6/16 vs keyword 9/16 (over-asking, wrong reply language, empty answers from the reasoning budget, free-tier rate limit); run 2 on the failures only. All runs are in `evals/runs/`.
