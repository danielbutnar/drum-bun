import {generateText} from 'ai'

import {MODEL} from '@/lib/agent'
import {sanity} from '@/lib/queries'

// Development only: the keyword-search baseline for evals/run.mts. Same
// Sanity documents, same model, but retrieval is an any-word keyword search
// (what a site search box does) instead of the planner, the Knowledge Base
// and GROQ via Sanity Context.
const FIELDS = '[name.en, title, statement, road, summary, requirement, condition, explanation, note, carTollSummary, area, howToComply]'

function keywordQuery(n: number) {
  const any = Array.from({length: n}, (_, i) => `${FIELDS} match $t${i}`)
  return `*[_type in ["tollProduct", "rule", "zone", "claim", "roadSection", "country"] && (${any.join(' || ')})]
  | score(${any.join(', ')}) | order(_score desc)[0...6]{_type, "title": coalesce(name.en, title, statement, road), summary,
    requirement, condition, explanation, note, carTollSummary, area, howToComply,
    "prices": prices[]{amount, currency, validFrom, validTo, "band": band.label}}`
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') return new Response('Not found', {status: 404})
  const {q} = (await req.json()) as {q: string}
  const terms = [...new Set(q.replace(/[^\p{L}\p{N}+\s-]/gu, ' ').split(/\s+/).filter((w) => w.length > 3))].slice(0, 12)
  const hits = terms.length ? await sanity.fetch<unknown[]>(keywordQuery(terms.length), Object.fromEntries(terms.map((t, i) => [`t${i}`, t]))) : []
  const {text} = await generateText({
    model: MODEL,
    instructions: `Answer the driver's question using only the documents below. Today is ${new Date().toISOString().slice(0, 10)}. Answer in the question's language, briefly.\n\n${JSON.stringify(hits, null, 1)}`,
    prompt: q,
    maxOutputTokens: 1400,
    providerOptions: {openai: {reasoningEffort: 'low'}},
  })
  return Response.json({text, hits: hits.length})
}
