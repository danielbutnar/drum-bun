'use client'

import {useChat} from '@ai-sdk/react'
import {DefaultChatTransport, type UIMessage} from 'ai'
import {useState} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import recorded from '@/data/examples.json'
import {EXAMPLES} from '@/lib/examples'

type Recording = {recordedAt: string; messages: UIMessage[]}
const RECORDINGS = recorded as Record<string, Recording>

function errorText(error: Error): string {
  try {
    const parsed = JSON.parse(error.message) as {error?: string}
    if (parsed.error) return parsed.error
  } catch {}
  return 'The agent could not answer just now. The trip planner above still works.'
}

export function Chat() {
  const {messages, sendMessage, setMessages, status, error, stop} = useChat({
    transport: new DefaultChatTransport({api: '/api/chat'}),
  })
  const [input, setInput] = useState('')
  // A recorded answer being shown: example questions replay instantly, and the
  // visitor can ask the same question live.
  const [replay, setReplay] = useState<{text: string; recordedAt: string} | null>(null)
  const busy = status === 'submitted' || status === 'streaming'

  const send = (text: string) => {
    if (!text.trim() || busy) return
    if (replay) {
      setMessages([])
      setReplay(null)
    }
    sendMessage({text})
    setInput('')
  }

  const showExample = (id: string, text: string) => {
    const rec = RECORDINGS[id]
    if (!rec?.messages?.length) return send(text)
    setMessages(rec.messages)
    setReplay({text, recordedAt: rec.recordedAt})
  }

  return (
    <div className="mt-6">
      {messages.length === 0 && (
        <ul className="grid gap-2 sm:grid-cols-2" aria-label="Example questions">
          {EXAMPLES.map((e) => (
            <li key={e.text}>
              <button
                type="button"
                lang={e.lang}
                onClick={() => showExample(e.id, e.text)}
                className="h-full w-full rounded-md border border-ink/15 bg-paper p-3 text-left hover:border-road"
              >
                {e.text}
              </button>
            </li>
          ))}
        </ul>
      )}

      {replay && (
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md bg-land px-3 py-2 text-sm">
          <span>Recorded answer from {replay.recordedAt}, shown instantly.</span>
          <button type="button" onClick={() => send(replay.text)} className="font-semibold text-road-dark underline underline-offset-2">
            Ask it live
          </button>
          <button
            type="button"
            onClick={() => {
              setMessages([])
              setReplay(null)
            }}
            className="text-ink-2 underline underline-offset-2"
          >
            Back to examples
          </button>
        </p>
      )}

      <div className="mt-4 space-y-5" aria-live="polite">
        {messages.map((m) => (
          <Message key={m.id} m={m} />
        ))}
        {status === 'submitted' && <p className="text-ink-2">Reading the planner and the Knowledge Base…</p>}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-paper p-3 text-road-dark">
          {errorText(error)}
        </p>
      )}

      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <label htmlFor="ask-input" className="sr-only">
          Your question
        </label>
        <input
          id="ask-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
          placeholder="Brașov to Stuttgart on 23 Dec, diesel Euro 5: what do I need?"
          className="min-w-0 flex-1 rounded-md border border-ink/25 bg-paper px-3 py-2.5"
        />
        {busy ? (
          <button type="button" onClick={() => stop()} className="rounded-md border border-ink/25 px-4 py-2.5 font-semibold">
            Stop
          </button>
        ) : (
          <button type="submit" className="rounded-md bg-road px-4 py-2.5 font-semibold text-paper hover:bg-road-dark">
            Ask
          </button>
        )}
      </form>
      <p className="mt-2 text-sm text-ink-2">
        Questions are stored in Sanity Context Insights to find gaps in the content. Do not enter personal data.
      </p>
    </div>
  )
}

type Part = UIMessage['parts'][number]

function Message({m}: {m: UIMessage}) {
  if (m.role === 'user') {
    const text = m.parts.map((p) => (p.type === 'text' ? p.text : '')).join('')
    return <p className="ml-auto max-w-[85%] rounded-lg bg-ink px-4 py-2.5 text-paper">{text}</p>
  }
  const trace = m.parts.filter((p) => p.type === 'dynamic-tool' || p.type.startsWith('tool-'))
  return (
    <div className="space-y-3">
      {trace.length > 0 && <Trace parts={trace} />}
      {m.parts.map((p, i) =>
        p.type === 'text' ? (
          <div key={i} className="prose-agent">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{a: ({href, children}) => <a href={href} target="_blank" rel="noopener">{children}</a>}}
            >
              {p.text}
            </ReactMarkdown>
          </div>
        ) : null,
      )}
    </div>
  )
}

// What the agent did, in order: planner runs, Knowledge Base entries opened,
// GROQ queries. Judges and drivers can check the answer against its inputs.
function Trace({parts}: {parts: Part[]}) {
  return (
    <details className="rounded-md border border-ink/10 bg-paper p-3 text-sm">
      <summary className="cursor-pointer text-ink-2">
        {parts.length} step{parts.length > 1 ? 's' : ''}: {summarize(parts)}
      </summary>
      <ol className="mt-2 space-y-2">
        {parts.map((p, i) => (
          <li key={i}>
            <TraceStep p={p} />
          </li>
        ))}
      </ol>
    </details>
  )
}

function toolName(p: Part): string {
  if (p.type === 'dynamic-tool') return (p as {toolName: string}).toolName
  return p.type.replace(/^tool-/, '')
}

function summarize(parts: Part[]): string {
  const names = parts.map(toolName)
  const count = (n: string) => names.filter((x) => x === n).length
  const bits = [
    count('plan_trip') && 'ran the planner',
    count('knowledge_base_read') && `opened Knowledge Base entries`,
    count('groq_query') && `${count('groq_query')} GROQ quer${count('groq_query') > 1 ? 'ies' : 'y'}`,
    count('schema_explorer') && 'read the schema',
  ].filter(Boolean)
  return bits.join(', ') || names.join(', ')
}

function TraceStep({p}: {p: Part}) {
  const name = toolName(p)
  const input = (p as {input?: Record<string, unknown>}).input
  if (name === 'knowledge_base_read') {
    const paths = (input?.paths as string[] | undefined) ?? []
    return (
      <span>
        <b>Knowledge Base</b>: {paths.map((x) => <code key={x} className="mr-1 rounded bg-land px-1">{x}</code>)}
      </span>
    )
  }
  if (name === 'groq_query') {
    return (
      <span>
        <b>GROQ</b>: <code className="break-all rounded bg-land px-1">{String(input?.query ?? '')}</code>
      </span>
    )
  }
  if (name === 'plan_trip' && input) {
    const q = new URLSearchParams({
      from: String(input.origin),
      to: String(input.destination),
      out: String(input.outDate),
      back: input.returnDate ? String(input.returnDate) : '',
      vehicle: String(input.vehicle),
      fuel: input.fuel ? String(input.fuel) : '',
      euro: input.euroNorm != null ? String(input.euroNorm) : '',
      twoDay: input.twoDayDrive ? '1' : '',
    })
    return (
      <span>
        <b>Planner</b>: {String(input.origin)} → {String(input.destination)}, {String(input.outDate)}
        {input.returnDate ? ` / ${String(input.returnDate)}` : ''}.{' '}
        <a href={`/?${q.toString()}#plan`} className="underline underline-offset-2">
          Open the full plan
        </a>
      </span>
    )
  }
  return <span>{name}</span>
}
