// Records the agent's answers to the example questions shown on the home page
// and saves them as UI messages in data/examples.json. The page replays them
// instantly (labelled as recorded) and offers to ask again live, so visitors
// never wait on the free model tier's rate limit for the first impression.
// Usage (dev server running): npx tsx scripts/record-examples.mts http://localhost:3000
import {writeFileSync} from 'node:fs'

import {readUIMessageStream, type UIMessage, type UIMessageChunk} from 'ai'

import {EXAMPLES} from '../lib/examples'

const base = process.argv[2] ?? 'http://localhost:3000'
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function record(question: string): Promise<UIMessage[]> {
  const user: UIMessage = {id: 'user', role: 'user', parts: [{type: 'text', text: question}]}
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: {'content-type': 'application/json', origin: base},
    body: JSON.stringify({id: `record-${Date.now()}`, messages: [user]}),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const chunks: UIMessageChunk[] = []
  for (const line of (await res.text()).split('\n')) {
    if (!line.startsWith('data: ') || line.includes('[DONE]')) continue
    const chunk = JSON.parse(line.slice(6)) as UIMessageChunk
    if (chunk.type === 'error') throw new Error(chunk.errorText)
    chunks.push(chunk)
  }
  const stream = new ReadableStream<UIMessageChunk>({
    start(controller) {
      for (const c of chunks) controller.enqueue(c)
      controller.close()
    },
  })
  let assistant: UIMessage | undefined
  for await (const snapshot of readUIMessageStream({stream})) assistant = snapshot
  if (!assistant) throw new Error('no answer')
  // Keep tool inputs (the trace shows them) but drop bulky outputs.
  assistant.parts = assistant.parts
    .filter((p) => p.type !== 'reasoning' && p.type !== 'step-start')
    .map((p) => ('output' in p ? {...p, output: undefined} : p)) as UIMessage['parts']
  return [user, {...assistant, id: 'assistant'}]
}

const out: Record<string, {recordedAt: string; messages: UIMessage[]}> = {}
for (const [i, e] of EXAMPLES.entries()) {
  if (i > 0) await sleep(70_000)
  out[e.id] = {recordedAt: new Date().toISOString().slice(0, 10), messages: await record(e.text)}
  console.log('recorded', e.id)
}
writeFileSync(new URL('../data/examples.json', import.meta.url), JSON.stringify(out, null, 2))
console.log('written data/examples.json')
