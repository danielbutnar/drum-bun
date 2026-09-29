// Re-scores a saved run with the current patterns in questions.json, for both
// systems alike. Usage: npx tsx evals/score.mts evals/runs/<file>.json
import {readFileSync} from 'node:fs'

type Q = {id: string; must: string[]; mustNot: string[]}
const questions: Q[] = JSON.parse(readFileSync(new URL('./questions.json', import.meta.url), 'utf8'))
const run = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const check = (q: Q, text: string) =>
  q.must.every((re) => new RegExp(re, 'is').test(text)) && !q.mustNot.some((re) => new RegExp(re, 'is').test(text))

let agent = 0
let base = 0
const rows = []
for (const r of run.results) {
  const q = questions.find((x) => x.id === r.id)!
  const a = check(q, r.agent.text)
  const b = check(q, r.baseline.text)
  agent += a ? 1 : 0
  base += b ? 1 : 0
  rows.push(`| ${r.id} | ${r.lang} | ${a ? 'pass' : 'fail'} | ${b ? 'pass' : 'fail'} | ${r.agent.tools.join(', ') || '(none)'} |`)
}
console.log('| question | lang | agent | keyword search | agent tools |\n| --- | --- | --- | --- | --- |')
console.log(rows.join('\n'))
console.log(`\nagent ${agent}/${run.results.length}, keyword baseline ${base}/${run.results.length}`)
