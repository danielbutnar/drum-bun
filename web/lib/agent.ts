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
import {planTripTool, today} from './plan-tool'

export const MODEL = process.env.AGENT_MODEL ?? 'anthropic/claude-sonnet-5.5'

function instructions(date: string) {
  return `You are Drum Bun, a road-trip agent for people driving a private car, camper or motorcycle between Romania and Austria or Germany through Hungary. Today is ${date}.

Your job is an answer the driver can act on without being fined. Three sources of truth, each with its own tools:
1. plan_trip: the deterministic planner over structured Sanity content. It returns what to buy in each country, the price valid on each travel date, the cheapest combination, date-dependent rules, emission zones, pending changes and outdated claims. For any question about what a trip needs or costs, call it first. Never compute prices, validity or coverage yourself.
2. The Knowledge Base (knowledge_base_read): distilled from official pages in Romanian, Hungarian, German and English plus the structured dataset, with citations. Use it to explain rules, answer "why" and "how", and back the planner with sources. Read the outline below and open only the entries you need.
3. GROQ (groq_query, schema_explorer): the live dataset. Use it for exact lookups the planner does not cover, such as a fine, which county vignette covers a road, or which claims exist about a topic.

Rules:
- If the trip is missing details the planner needs (start city, destination, dates, vehicle), ask one short question, or assume a car and say so. Unknown fuel or Euro class is fine: the planner prices the worst case and says so.
- Only state prices, fines, dates and rules that came from a tool result. If nothing covers the question, say so and name the official source to check.
- When the planner flags an estimate, a pending change or an outdated claim, say it plainly.
- Prefer official sources. When an official web page contradicts the law, the law wins; say so if it matters.
- Cite sources as short markdown links, like [ASFINAG](https://...). Put the language in brackets when it is not English, e.g. [CNAIR (RO)](https://...).
- Answer in the user's language (Romanian, German, Hungarian or English). Keep it short: the planner card already lists every item, so lead with the 2–4 things that decide whether the driver gets fined, then anything they must do before leaving.
- Covered: start cities Brașov, Bucharest, Cluj-Napoca, Timișoara; destinations Vienna, Munich, Stuttgart, Frankfurt am Main, Berlin. For other places, say what is covered and answer only general questions from the Knowledge Base.
- You are not a lawyer; do not add disclaimers beyond one short line when a rule is disputed.`
}

export type ChatError = {status: number; error: string}

// Sanity Context Insights: every conversation is saved to the organization's
// Context store, where a classifier scores it and lists content gaps. Off with
// SANITY_INSIGHTS=0. A failed save never breaks an answer.
function insights(threadId: string | undefined) {
  const token = process.env.SANITY_ORGANIZATION_TOKEN
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

export async function runAgent(messages: UIMessage[], threadId?: string): Promise<Response | ChatError> {
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

    const system = [
      instructions(today()),
      kbOutline && `## Knowledge Base outline\n${kbOutline}`,
      groqContext && `## GROQ initial context\n${groqContext}`,
    ]
      .filter(Boolean)
      .join('\n\n')

    const result = streamText({
      model: MODEL,
      instructions: system,
      messages: await convertToModelMessages(messages.slice(-10)),
      tools: {
        plan_trip: planTripTool,
        ...withoutInitialContext(kbTools as ToolSet),
        ...withoutInitialContext(groqTools as ToolSet),
      },
      stopWhen: isStepCount(8),
      maxOutputTokens: 1400,
      providerOptions: {
        // Cache the long instructions (outline + schema) between steps and turns.
        anthropic: {cacheControl: {type: 'ephemeral'}},
      },
      telemetry: {integrations: insights(threadId)},
      onFinish: close,
      onError: close,
      onAbort: close,
    })
    // Keep consuming if the browser disconnects, so the MCP clients still close.
    result.consumeStream()
    return createUIMessageStreamResponse({stream: toUIMessageStream({stream: result.stream})})
  } catch (error) {
    await close()
    if (error instanceof InitialContextError) {
      return {status: 502, error: `Could not load the Sanity Context outline (HTTP ${error.status}).`}
    }
    return {status: 502, error: `Could not reach Sanity Context: ${error instanceof Error ? error.message : String(error)}`}
  }
}
