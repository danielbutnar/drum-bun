import {createClient} from '@sanity/client'
import {classifyConversations} from '@sanity/context/insights'

export const maxDuration = 60

// Daily Vercel cron: scores saved conversations (success, sentiment, content
// gaps) so the Sanity Context dashboard shows where the content falls short.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({error: 'Not allowed.'}, {status: 401})
  }
  const token = process.env.SANITY_ORGANIZATION_TOKEN
  if (!token) return Response.json({error: 'Not configured.'}, {status: 503})
  const client = createClient({
    apiVersion: 'v2025-11-27',
    token,
    context: {organizationId: process.env.SANITY_ORGANIZATION_ID ?? 'ob2cyckj9'},
    useCdn: false,
    useProjectHostname: false,
  })
  const result = await classifyConversations({
    client,
    model: 'anthropic/claude-haiku-4.5',
    mcpEndpoint: 'drum-bun-kb',
    limit: 50,
    concurrency: 3,
  })
  return Response.json({classified: result.successCount, failed: result.errorCount, found: result.totalFound})
}
