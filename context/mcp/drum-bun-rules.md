# MCP endpoint: drum-bun-rules

Create in the Sanity Dashboard → Context → MCP endpoints → New.

| Field | Value |
| --- | --- |
| Title | Drum Bun structured rules (GROQ) |
| Name | `drum-bun-rules` (immutable) |
| Sources | Dataset `pd5e7gez.production` only |
| groqFilter | `_type in ["country", "place", "route", "roadSection", "tollProduct", "rule", "zone", "claim", "source", "exchangeRate"]` |

URL: `https://api.sanity.io/v1/context/organizations/ob2cyckj9/mcp/drum-bun-rules`

Embeddings are enabled on the dataset (`sanity datasets embeddings enable production`), so GROQ mode can rank with `text::semanticSimilarity()` inside `score()`. The free plan has 500 semantic queries a month: filter first, rank second.

## Instructions (paste)

Structured road rules for Romania (RO), Hungary (HU), Austria (AT) and Germany (DE).
- tollProduct.prices[] are dated: the price for a travel date is the one with validFrom <= date <= validTo. Several prices on the same dates differ by band (Romania from 2026-10-01 prices by Euro class; band.appliesWhenUnknown marks the rate charged when the class is unknown). If no price covers the date, say the price is not published yet and give the latest one as an estimate.
- tollProduct.validity.unit: "days" = N calendar days, start day included; "months" = to the same calendar day; "calendarYear" = annual with overlap windows (yearStartsPrevious, yearEndsNext).
- tollProduct.activation.onlineDelayDays > 0 means an online purchase by a private customer is only valid after that many days (Austria: 18 days for annual and 2-month vignettes).
- roadSection.coveredBy lists the products that make a section legal; any one is enough. tolled == false means free. exemptVehicles owe nothing on that section.
- rule.season is a yearly MM-DD window; rule.conditional means it only applies under rule.condition.
- zone.dieselMinEuro is the lowest Euro class a diesel may have; status other than "active" means not in force.
- claim documents are statements found online. verdict "outdated", "wrong" or "misleading" means they are not true now; correctedBy points at the facts that are.
- source.trust ranks sources: official > club > press > blog > forum.
- Never state a price, fine or date that is not in a retrieved document.
