// Re-scores a saved run with the current patterns in questions.json, for every
// system alike. Usage: npx tsx evals/score.mts evals/runs/<file>.json
// Runs before 1 Oct 2026 have one baseline, stored as `baseline` (keyword search).
import {readFileSync} from 'node:fs'

type Q = {id: string; must: string[]; mustNot: string[]}
const questions: Q[] = JSON.parse(readFileSync(new URL('./questions.json', import.meta.url), 'utf8'))
const run = JSON.parse(readFileSync(process.argv[2], 'utf8'))
// Models write non-breaking hyphens; patterns use a plain one (same as run.mts).
const normalize = (text: string) => text.replace(/[\u2010\u2011]/g, '-')
const check = (q: Q, raw: string) => {
  const text = normalize(raw)
  return q.must.every((re) => new RegExp(re, 'is').test(text)) && !q.mustNot.some((re) => new RegExp(re, 'is').test(text))
}

const LABELS: Record<string, string> = {agent: 'agent', semantic: 'semantic search', keyword: 'keyword search', none: 'no documents'}
const systems = ['agent', 'semantic', 'keyword', 'none'].filter((k) => run.results[0][k] ?? (k === 'keyword' && run.results[0].baseline))
const answer = (r: Record<string, {text: string}>, k: string) => (r[k] ?? (k === 'keyword' ? r.baseline : undefined))!.text

const totals: Record<string, number> = Object.fromEntries(systems.map((k) => [k, 0]))
const rows = []
for (const r of run.results) {
  const q = questions.find((x) => x.id === r.id)!
  const cells = systems.map((k) => {
    const pass = check(q, answer(r, k))
    totals[k] += pass ? 1 : 0
    return pass ? 'pass' : 'fail'
  })
  rows.push(`| ${r.id} | ${r.lang} | ${cells.join(' | ')} | ${r.agent.tools.join(', ') || '(none)'} |`)
}
console.log(`| question | lang | ${systems.map((k) => LABELS[k]).join(' | ')} | agent tools |`)
console.log(`| --- | --- | ${systems.map(() => '---').join(' | ')} | --- |`)
console.log(rows.join('\n'))
console.log(`\n${systems.map((k) => `${LABELS[k]} ${totals[k]}/${run.results.length}`).join(', ')}`)
