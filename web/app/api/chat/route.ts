import type {UIMessage} from 'ai'

import {runAgent} from '@/lib/agent'
import {clientIp, sameOrigin, takeChatToken} from '@/lib/guard'

export const maxDuration = 60

const MAX_CHARS = 2000

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({error: 'Cross-site requests are not allowed.'}, {status: 403})

  let messages: UIMessage[]
  let id: string | undefined
  try {
    ;({messages, id} = (await req.json()) as {messages: UIMessage[]; id?: string})
  } catch {
    return Response.json({error: 'The request body is not valid JSON.'}, {status: 400})
  }
  const last = messages?.at(-1)
  const text = last?.parts?.map((p) => (p.type === 'text' ? p.text : '')).join('') ?? ''
  if (!last || last.role !== 'user' || !text.trim()) {
    return Response.json({error: 'Send a question as the last message.'}, {status: 400})
  }
  if (text.length > MAX_CHARS) {
    return Response.json({error: `Keep questions under ${MAX_CHARS} characters.`}, {status: 413})
  }

  const allowed = takeChatToken(clientIp(req))
  if (!allowed.ok) return Response.json({error: allowed.reason}, {status: 429})

  const result = await runAgent(messages, typeof id === 'string' ? id.slice(0, 64) : undefined)
  if (result instanceof Response) return result
  return Response.json({error: result.error}, {status: result.status})
}
