// Runs evals/questions.json against two systems and scores them with the
// same regexes:
//   agent    → the Drum Bun chat endpoint (planner + Knowledge Base + GROQ via Sanity Context)
//   baseline → keyword search: GROQ `match` over the same Sanity documents,
//              top 6 hits pasted into the prompt of the same model
// Usage (dev server running with the env from `vercel env pull web/.env.local`):
//   npx tsx evals/run.mts http://localhost:3000
// Writes evals/runs/<timestamp>.json and prints a table.

import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'


type Q = {id: string; lang: string; q: string; must: string[]; mustNot: string[]; why: string}
const questions: Q[] = JSON.parse(readFileSync(new URL('./questions.json', import.meta.url), 'utf8'))
const base = process.argv[2] ?? 'http://localhost:3000'
const only = process.argv[3]?.split(',')
const PAUSE_MS = Number(process.env.EVAL_PAUSE_MS ?? 45_000)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function askAgent(q: string): Promise<{text: string; tools: string[]}> {
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: {'content-type': 'application/json', origin: base},
    body: JSON.stringify({id: `eval-${Date.now()}`, messages: [{id: 'u1', role: 'user', parts: [{type: 'text', text: q}]}]}),
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
      if (ev.type === 'error') text += `
[ERROR] ${ev.errorText}`
    } catch {}
  }
  return {text, tools}
}

async function askBaseline(q: string): Promise<{text: string; hits: number}> {
  const res = await fetch(`${base}/api/dev-baseline`, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({q})})
  if (!res.ok) throw new Error(`baseline HTTP ${res.status}`)
  return res.json()
}

function score(q: Q, text: string) {
  const has = (re: string) => new RegExp(re, 'is').test(text)
  const missing = q.must.filter((re) => !has(re))
  const wrong = q.mustNot.filter((re) => has(re))
  return {pass: missing.length === 0 && wrong.length === 0, missing, wrong}
}

const results = []
for (const q of questions.filter((x) => !only || only.includes(x.id))) {
  // The free AI Gateway tier allows 5 requests a minute: run one system at a
  // time and pause, so a rate limit never counts as a wrong answer.
  const [agent] = await Promise.allSettled([askAgent(q.q)])
  await sleep(PAUSE_MS)
  const [baseline] = await Promise.allSettled([askBaseline(q.q)])
  await sleep(PAUSE_MS / 3)
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
writeFileSync(file, JSON.stringify({base, agentPass, basePass, total: results.length, results}, null, 2))
console.log(`written ${file.pathname}`)
