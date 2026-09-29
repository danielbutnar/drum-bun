import {createMCPClient} from '@ai-sdk/mcp'
import type {ToolSet} from 'ai'

// Two Context MCP endpoints, because one endpoint serves one mode: a dataset
// source would silently win over the Knowledge Base on a shared endpoint.
//   SANITY_MCP_KB_URL   → Knowledge Base mode (outline + knowledge_base_read)
//   SANITY_MCP_GROQ_URL → GROQ mode over the dataset (groq_query, schema_explorer, ...)
// Both are server-only, like the organization token that unlocks them.

export function mcpConfig() {
  return {
    token: process.env.SANITY_ORGANIZATION_TOKEN,
    kb: process.env.SANITY_MCP_KB_URL,
    groq: process.env.SANITY_MCP_GROQ_URL,
  }
}

export type McpClient = Awaited<ReturnType<typeof createMCPClient>>

export function connectMcp(url: string, token: string): Promise<McpClient> {
  return createMCPClient({
    transport: {type: 'http', url, headers: {Authorization: `Bearer ${token}`}},
  })
}

export class InitialContextError extends Error {
  constructor(
    public readonly url: string,
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(`Initial context request failed with HTTP ${status}`)
    this.name = 'InitialContextError'
  }
}

// The Knowledge Base outline is the agent's map: it reads it first, then
// opens the entries it needs. Fetching it once and inlining it in the
// instructions saves a tool round trip per question. A short TTL picks up a
// rebuild without a redeploy.
const TTL_MS = 5 * 60 * 1000
const cache = new Map<string, {value: string; expires: number}>()

export async function fetchInitialContext(url: string, token: string): Promise<string> {
  const hit = cache.get(url)
  if (hit && hit.expires > Date.now()) return hit.value
  const target = new URL(url)
  target.pathname = `${target.pathname.replace(/\/$/, '')}/initial-context`
  const res = await fetch(target, {headers: {Authorization: `Bearer ${token}`, Accept: 'text/plain'}})
  if (!res.ok) {
    throw new InitialContextError(url, res.status, (await res.text().catch(() => '')).slice(0, 300))
  }
  const value = (await res.text()).trim()
  if (!value) throw new InitialContextError(url, res.status, 'empty initial context')
  cache.set(url, {value, expires: Date.now() + TTL_MS})
  return value
}

/** Tools keep their names (the initial context refers to them); only initial_context is dropped. */
export function withoutInitialContext(tools: ToolSet): ToolSet {
  return Object.fromEntries(Object.entries(tools).filter(([name]) => name !== 'initial_context'))
}
