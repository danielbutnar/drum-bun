import {readFileSync} from 'node:fs'
import {join} from 'node:path'

import {generateText} from 'ai'

import {MODEL} from '@/lib/agent'
import {sanity} from '@/lib/queries'

// Development only: the baselines for evals/run.mts. Same model, same output
// budget as the agent, the same prompt for every baseline, and the same fields
// the Knowledge Base ingests (context/knowledge-bases/dataset-query.groq). Only
// retrieval differs:
//   none     → no documents: what the model knows on its own
//   keyword  → any-word keyword search (what a site search box does), top 6
//   semantic → embeddings search over the same documents (text::semanticSimilarity), top 6
// The agent instead gets the planner, the Knowledge Base and GROQ via Sanity Context.
type Mode = 'none' | 'keyword' | 'semantic'

const TYPES = '_type in ["tollProduct", "rule", "zone", "claim", "roadSection", "country"]'
const FIELDS = '[name.en, title, statement, road, summary, requirement, condition, explanation, note, carTollSummary, area, howToComply]'
const TOP = 6

function projection() {
  const groq = readFileSync(join(process.cwd(), '../context/knowledge-bases/dataset-query.groq'), 'utf8')
  return groq.slice(groq.indexOf(']{') + 1)
}

async function retrieve(mode: Mode, q: string): Promise<unknown[]> {
  if (mode === 'none') return []
  if (mode === 'semantic') {
    return sanity
      .withConfig({apiVersion: 'vX', useCdn: false})
      .fetch(`*[${TYPES}] | score(text::semanticSimilarity($q)) | order(_score desc)[0...${TOP}]${projection()}`, {q})
  }
  const terms = [...new Set(q.replace(/[^\p{L}\p{N}+\s-]/gu, ' ').split(/\s+/).filter((w) => w.length > 3))].slice(0, 12)
  if (!terms.length) return []
  const any = terms.map((_, i) => `${FIELDS} match $t${i}`)
  return sanity.fetch(
    `*[${TYPES} && (${any.join(' || ')})] | score(${any.join(', ')}) | order(_score desc)[0...${TOP}]${projection()}`,
    Object.fromEntries(terms.map((t, i) => [`t${i}`, t])),
  )
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') return new Response('Not found', {status: 404})
  const {q, mode = 'keyword'} = (await req.json()) as {q: string; mode?: Mode}
  const hits = await retrieve(mode, q)
  const today = new Date().toISOString().slice(0, 10)
  const {text} = await generateText({
    model: MODEL,
    instructions:
      mode === 'none'
        ? `Answer the driver's question from what you know. Today is ${today}. Answer in the question's language.`
        : `Answer the driver's question using the documents below. Today is ${today}. Answer in the question's language.\n\n${JSON.stringify(hits, null, 1)}`,
    prompt: q,
    maxOutputTokens: 5000,
    providerOptions: {openai: {reasoningEffort: 'low'}},
  })
  return Response.json({text, hits: hits.length})
}
