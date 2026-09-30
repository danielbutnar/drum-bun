import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type ToolSet,
  type UIMessage,
} from 'ai'

import {createClient} from '@sanity/client'
import {sanityInsightsIntegration} from '@sanity/context/ai-sdk'

import {connectMcp, fetchInitialContext, InitialContextError, type McpClient, mcpConfig, withoutInitialContext} from './mcp'
import {countryProductsTool, planTripTool, today} from './plan-tool'

// Claude models are not available on the AI Gateway free tier; see NOTES.md.
export const MODEL = process.env.AGENT_MODEL ?? 'openai/gpt-5-mini'

const LANGUAGE_NAMES = {ro: 'Romanian', de: 'German', hu: 'Hungarian', en: 'English'} as const

/** Cheap language detection for the reply: the model drifts into Romanian when a trip starts in Romania. */
export function detectLanguage(text: string): keyof typeof LANGUAGE_NAMES {
  // Place names carry diacritics in every language here (Brașov, München), so
  // they must not decide the language.
  const t = ` ${text.toLowerCase()} `.replace(/brașov|brasov|timișoara|bucurești|cluj-napoca|nădlac|borș|münchen|wien|győr|hegyeshalom/g, ' ')
  const score = (re: RegExp) => (t.match(re) ?? []).length
  const ro = score(/[ăâîșşțţ]|\s(și|să|pentru|cu|ce|care|este|mașin\w*|rovinieta|pot|trebuie|nu|cât|costă)(?=\s)/g)
  const de = score(/[äöüß]|\s(ich|und|der|die|das|nicht|mit|für|reichen|wie|ist|mein\w*|brauche|im)(?=\s)/g)
  const hu = score(/[őű]|\s(és|hogy|nem|kell|autópálya|mennyi|megyei|vagy|matrica)(?=\s)/g)
  const en = score(/\s(the|and|what|do|does|i|to|from|on|is|my|need|cost|can|which|are)(?=\s)/g)
  const best = Math.max(ro, de, hu, en)
  if (best === 0 || best === en) return 'en'
  return best === ro ? 'ro' : best === de ? 'de' : 'hu'
}

function instructions(date: string) {
  return `You are Drum Bun, a road-trip agent for people driving a private car, camper or motorcycle between Romania and Austria or Germany through Hungary. Today is ${date}.

Your job is an answer the driver can act on without being fined. Three sources of truth, each with its own tools:
1. plan_trip and country_products: the deterministic planner and price lookup over structured Sanity content. It returns what to buy in each country, the price valid on each travel date, the cheapest combination, date-dependent rules, emission zones, pending changes and outdated claims. For any question about what a trip needs or costs, call plan_trip first. For one product's price on a date (e.g. by Euro class) or a penalty, call country_products. Never compute prices, validity or coverage yourself.
2. The Knowledge Base (knowledge_base_read): distilled from official pages in Romanian, Hungarian, German and English plus the structured dataset, with citations. Use it to explain rules, answer "why" and "how", and back the planner with sources. Read the outline below and open only the entries you need.
3. GROQ (groq_query, schema_explorer): the live dataset. Use it for exact lookups the planner does not cover, such as a fine, which county vignette covers a road, or which claims exist about a topic.

Rules:
- Most questions are general (a rule, one product's price, a fine, a claim someone read). Answer those directly from the Knowledge Base or GROQ. Never ask for a start city, destination or dates unless the user wants a full trip plan.
- For a full trip plan, call plan_trip with what you have: assume a car if the vehicle is missing and say so. Unknown fuel or Euro class is fine: the planner prices the worst case and says so. Ask one short question only when the start city, the destination or the departure date is missing.
- A question about a price or rule "after" or "from" a date means that date: do not ask which date.
- Only state prices, fines, dates and rules that came from a tool result. If nothing covers the question, say so and name the official source to check.
- When the planner flags an estimate, a pending change or an outdated claim, say it plainly.
- Prefer official sources. When an official web page contradicts the law, the law wins; say so if it matters.
- Never say a source confirms something unless the retrieved text says so. When a claim document marks a page as outdated (even an official one), name that page as outdated, not as confirmation.
- Cite the original sources as short markdown links, like [ASFINAG](https://...), using the URLs in the retrieved entries and planner results. Put the language in brackets when it is not English, e.g. [CNAIR (RO)](https://...). Never cite a Knowledge Base path or a bare [n] as a source.
- Answer in the language of the user's latest message (Romanian, German, Hungarian or English), even if the trip is in Romania. Keep it under about 180 words unless asked for more: the planner card already lists every item, so lead with the 2–4 things that decide whether the driver gets fined, then anything they must do before leaving. End with the last fact or action: never close with "If you want", an offer or a question. In German address the driver with the formal "Sie"; in Romanian use the polite plural ("dumneavoastră" forms).
- Covered: start cities Brașov, Bucharest, Cluj-Napoca, Timișoara; destinations Vienna, Munich, Stuttgart, Frankfurt am Main, Berlin. For other places, say what is covered and answer only general questions from the Knowledge Base.
- No legal disclaimers, except one short line when official sources disagree.`
}

export type ChatError = {status: number; error: string}

// Sanity Context Insights: every conversation is saved to the organization's
// Context store, where a classifier scores it and lists content gaps. Saving
// needs Context Editor, so it uses its own token (SANITY_INSIGHTS_TOKEN) and
// the MCP token stays read-only. A failed save never breaks an answer.
function insights(threadId: string | undefined) {
  const token = process.env.SANITY_INSIGHTS_TOKEN
  if (!token || !threadId || process.env.SANITY_INSIGHTS === '0') return []
  const client = createClient({
    apiVersion: 'v2025-11-27',
    token,
    context: {organizationId: process.env.SANITY_ORGANIZATION_ID ?? 'ob2cyckj9'},
    useCdn: false,
    useProjectHostname: false,
  })
  return [sanityInsightsIntegration({client, threadId, metadata: {mcpEndpoints: ['drum-bun-kb', 'drum-bun-rules']}})]
}

export async function runAgent(messages: UIMessage[], threadId?: string, model = MODEL): Promise<Response | ChatError> {
  const {token, kb, groq} = mcpConfig()
  if (!token || (!kb && !groq)) {
    return {status: 503, error: 'The agent is not configured yet: the Sanity Context endpoints are missing.'}
  }

  let kbClient: McpClient | null = null
  let groqClient: McpClient | null = null
  const close = async () => {
    await Promise.allSettled([kbClient?.close(), groqClient?.close()])
  }

  try {
    const [kbSettled, groqSettled] = await Promise.allSettled([
      kb ? connectMcp(kb, token) : Promise.resolve(null),
      groq ? connectMcp(groq, token) : Promise.resolve(null),
    ])
    kbClient = kbSettled.status === 'fulfilled' ? kbSettled.value : null
    groqClient = groqSettled.status === 'fulfilled' ? groqSettled.value : null
    if (kbSettled.status === 'rejected') throw kbSettled.reason
    if (groqSettled.status === 'rejected') throw groqSettled.reason

    const [kbTools, groqTools, kbOutline, groqContext] = await Promise.all([
      kbClient ? kbClient.tools() : ({} as ToolSet),
      groqClient ? groqClient.tools() : ({} as ToolSet),
      kb ? fetchInitialContext(kb, token) : '',
      groq ? fetchInitialContext(groq, token) : '',
    ])

    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    const lang = detectLanguage(lastUser?.parts.map((p) => (p.type === 'text' ? p.text : '')).join(' ') ?? '')
    const system = [
      instructions(today()),
      `The user's latest message is in ${LANGUAGE_NAMES[lang]}. Write your whole answer in ${LANGUAGE_NAMES[lang]}.`,
      kbOutline && `## Knowledge Base outline\n${kbOutline}`,
      groqContext && `## GROQ initial context\n${groqContext}`,
    ]
      .filter(Boolean)
      .join('\n\n')

    const result = streamText({
      model,
      instructions: system,
      messages: await convertToModelMessages(messages.slice(-10)),
      tools: {
        plan_trip: planTripTool,
        country_products: countryProductsTool,
        ...withoutInitialContext(kbTools as ToolSet),
        ...withoutInitialContext(groqTools as ToolSet),
      },
      stopWhen: isStepCount(6),
      // The free AI Gateway tier allows 5 requests a minute; retrying three
      // times only makes the visitor wait. One retry, then a clear message.
      maxRetries: 1,
      // Reasoning tokens come out of the same budget: too low and the answer is empty.
      maxOutputTokens: 5000,
      providerOptions: {
        // Cache the long instructions (outline + schema) between steps and turns.
        anthropic: {cacheControl: {type: 'ephemeral'}},
        // Low reasoning effort: the planner does the thinking that must be exact.
        openai: {reasoningEffort: process.env.AGENT_REASONING ?? 'low'},
      },
      telemetry: {integrations: insights(threadId)},
      onFinish: close,
      onError: ({error}) => {
        console.error('[agent] stream error', error)
        void close()
      },
      onAbort: close,
    })
    // Keep consuming if the browser disconnects, so the MCP clients still close.
    result.consumeStream()
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: (error) => {
          console.error('[agent] ui stream error', error)
          const message = error instanceof Error ? error.message : String(error)
          if (/rate limit/i.test(message)) {
            return 'The live agent is busy right now: its free model plan allows only a few requests a minute. Try again in a minute. The trip planner above and the recorded answers work without limits.'
          }
          return process.env.NODE_ENV === 'development' ? message : 'The agent could not finish this answer. The trip planner above still works.'
        },
      }),
    })
  } catch (error) {
    await close()
    if (error instanceof InitialContextError) {
      return {status: 502, error: `Could not load the Sanity Context outline (HTTP ${error.status}).`}
    }
    return {status: 502, error: `Could not reach Sanity Context: ${error instanceof Error ? error.message : String(error)}`}
  }
}
