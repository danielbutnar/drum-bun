// Runs evals/questions.json against two systems and scores them with the
// same regexes:
//   agent    → the Drum Bun chat endpoint (planner + Knowledge Base + GROQ via Sanity Context)
//   baseline → keyword search: GROQ `match` over the same Sanity documents,
//              top 6 hits pasted into the prompt of the same model
// Usage (dev server running with the env from `vercel env pull web/.env.local`):
//   npx tsx evals/run.mts http://localhost:3000
// Writes evals/runs/<timestamp>.json and prints a table.

import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'

const require = createRequire(new URL('../web/package.json', import.meta.url))
const {generateText} = require('ai') as typeof import('ai')
const {createClient} = require('@sanity/client') as typeof import('@sanity/client')

type Q = {id: string; lang: string; q: string; must: string[]; mustNot: string[]; why: string}
const questions: Q[] = JSON.parse(readFileSync(new URL('./questions.json', import.meta.url), 'utf8'))
const base = process.argv[2] ?? 'http://localhost:3000'
const MODEL = process.env.AGENT_MODEL ?? 'anthropic/claude-sonnet-5.5'
const only = process.argv[3]?.split(',')

const sanity = createClient({projectId: 'pd5e7gez', dataset: 'production', apiVersion: '2026-09-01', useCdn: true})

async function askAgent(q: string): Promise<{text: string; tools: string[]}> {
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({messages: [{id: 'u1', role: 'user', parts: [{type: 'text', text: q}]}]}),
  })
  if (!res.ok) throw new Error(`agent HTTP ${res.status}: ${await res.text()}`)
  const body = await res.text()
  let text = ''
  const tools: string[] = []
  for (const line of body.split('\n')) {
    if (!line.startsWith('data: ')) continue
    const payload = line.slice(6)
    if (payload === '[DONE]') continue
    try {
      const ev = JSON.parse(payload)
      if (ev.type === 'text-delta') text += ev.delta ?? ''
      if (ev.type === 'tool-input-available') tools.push(ev.toolName)
    } catch {}
  }
  return {text, tools}
}

// Any-word keyword search, the way a site search box behaves: a document
// matches if any term appears in its text fields, ranked by how many do.
const FIELDS = '[name.en, title, statement, road, summary, requirement, condition, explanation, note, carTollSummary, area, howToComply]'
function keywordQuery(n: number) {
  const any = Array.from({length: n}, (_, i) => `${FIELDS} match $t${i}`)
  return `*[_type in ["tollProduct", "rule", "zone", "claim", "roadSection", "country"] && (${any.join(' || ')})]
  | score(${any.join(', ')}) | order(_score desc)[0...6]{_type, "title": coalesce(name.en, title, statement, road), summary,
    requirement, condition, explanation, note, carTollSummary, area, howToComply,
    "prices": prices[]{amount, currency, validFrom, validTo, "band": band.label}}`
}

async function askBaseline(q: string): Promise<{text: string; hits: number}> {
  // Keyword search the way a site search box would: the question's words.
  const terms = [...new Set(q.replace(/[^\p{L}\p{N}+\s-]/gu, ' ').split(/\s+/).filter((w) => w.length > 3))].slice(0, 12)
  const params = Object.fromEntries(terms.map((t, i) => [`t${i}`, t]))
  const hits = await sanity.fetch<unknown[]>(keywordQuery(terms.length), params)
  const {text} = await generateText({
    model: MODEL,
    instructions: `Answer the driver's question using only the documents below. Today is ${new Date().toISOString().slice(0, 10)}. Answer in the question's language, briefly.\n\n${JSON.stringify(hits, null, 1)}`,
    prompt: q,
    maxOutputTokens: 700,
  })
  return {text, hits: hits.length}
}

function score(q: Q, text: string) {
  const has = (re: string) => new RegExp(re, 'is').test(text)
  const missing = q.must.filter((re) => !has(re))
  const wrong = q.mustNot.filter((re) => has(re))
  return {pass: missing.length === 0 && wrong.length === 0, missing, wrong}
}

const results = []
for (const q of questions.filter((x) => !only || only.includes(x.id))) {
  const [agent, baseline] = await Promise.allSettled([askAgent(q.q), askBaseline(q.q)])
  const a = agent.status === 'fulfilled' ? agent.value : {text: `ERROR ${agent.reason}`, tools: []}
  const b = baseline.status === 'fulfilled' ? baseline.value : {text: `ERROR ${baseline.reason}`, hits: 0}
  const row = {id: q.id, lang: q.lang, why: q.why, agent: {...score(q, a.text), tools: a.tools, text: a.text}, baseline: {...score(q, b.text), hits: b.hits, text: b.text}}
  results.push(row)
  console.log(`${q.id.padEnd(18)} agent ${row.agent.pass ? 'PASS' : 'fail'}  baseline ${row.baseline.pass ? 'PASS' : 'fail'}  tools: ${a.tools.join(',')}`)
}

const agentPass = results.filter((r) => r.agent.pass).length
const basePass = results.filter((r) => r.baseline.pass).length
console.log(`\nagent ${agentPass}/${results.length}, keyword baseline ${basePass}/${results.length}`)
mkdirSync(new URL('./runs/', import.meta.url), {recursive: true})
const file = new URL(`./runs/${new Date().toISOString().replace(/[:.]/g, '-')}.json`, import.meta.url)
writeFileSync(file, JSON.stringify({model: MODEL, base, agentPass, basePass, total: results.length, results}, null, 2))
console.log(`written ${file.pathname}`)
