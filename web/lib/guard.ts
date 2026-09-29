// Cheap abuse protection for a public demo without accounts. Limits are per
// server instance (no shared store), which is enough to stop a loop or a
// scraper from spending the model budget; the AI Gateway's free monthly
// credit is the hard ceiling behind it.

const WINDOW_MS = 60 * 60 * 1000
const PER_IP_PER_HOUR = Number(process.env.CHAT_PER_IP_PER_HOUR ?? 15)
const PER_INSTANCE_PER_DAY = Number(process.env.CHAT_PER_DAY ?? 200)

const hits = new Map<string, number[]>()
let day = ''
let dayCount = 0

export function clientIp(req: Request): string {
  return req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

/** Browsers send Origin on POST; refuse other sites calling the endpoint from their pages. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === new URL(req.url).host
  } catch {
    return false
  }
}

export function takeChatToken(ip: string): {ok: true} | {ok: false; reason: string} {
  if (process.env.NODE_ENV === 'development') return {ok: true}
  const now = Date.now()
  const today = new Date(now).toISOString().slice(0, 10)
  if (today !== day) {
    day = today
    dayCount = 0
  }
  if (dayCount >= PER_INSTANCE_PER_DAY) {
    return {ok: false, reason: 'The live agent has answered its daily quota. The trip planner above still works, and the recorded example answers are below.'}
  }
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= PER_IP_PER_HOUR) {
    return {ok: false, reason: 'You have asked a lot in the last hour. Try again later; the trip planner above works without limits.'}
  }
  recent.push(now)
  hits.set(ip, recent)
  dayCount++
  return {ok: true}
}
