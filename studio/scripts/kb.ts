// Knowledge Base inspection and issue resolution through @sanity/client's
// context API (beta). Uses the logged-in CLI user's token.
//   sanity exec scripts/kb.ts --with-user-token -- issues [open|accepted|rejected]
//   sanity exec scripts/kb.ts --with-user-token -- entries
//   sanity exec scripts/kb.ts --with-user-token -- entry <path>
//   sanity exec scripts/kb.ts --with-user-token -- instructions
//   sanity exec scripts/kb.ts --with-user-token -- sources <text filter>
//   sanity exec scripts/kb.ts --with-user-token -- resolve <issueId> <sideIndex>
//   sanity exec scripts/kb.ts --with-user-token -- dismiss <issueId>
//   sanity exec scripts/kb.ts --with-user-token -- apply <issueId,issueId,...>
//   sanity exec scripts/kb.ts --with-user-token -- instruct <sourceId,sourceId> <rebuildPath,path|-> <statement>
//   sanity exec scripts/kb.ts --with-user-token -- refresh        (re-check sources, file change issues)
//   sanity exec scripts/kb.ts --with-user-token -- job <jobId>
import {getCliClient} from 'sanity/cli'

export const KB = 'kbv1SRpT2A3t'
export const ORG = 'ob2cyckj9'

export function kbClient() {
  return getCliClient({apiVersion: '2026-08-25'}).withConfig({
    resource: {type: 'knowledge-base', id: KB},
    context: {organizationId: ORG},
    useProjectHostname: false,
  } as never)
}

// Why each issue was decided the way it was (see context/knowledge-bases/decisions.md).
const WHY: Record<string, string> = {
  'issue.7X6T0B587FAMWDJRJ9M5QTY750':
    'The build read the dataset value carTrailer as "a trailer". A trailer carries nothing; drivers of cars and campers, also when towing, carry a triangle and a vest (§ 102(10) KFG). A standing instruction now fixes that vocabulary for every build.',
  'issue.BQKZKZ4XE127W2GCXMSBS9QKFC':
    'Same misreading of carTrailer. Romanian law (OUG 195/2002 art. 8) covers every motor vehicle except motorcycles; the trailer itself carries nothing. Fixed with the same instruction.',
  'issue.AEAZ0QM4VV9VWDN9K32MVY40CM':
    'Kept: motorcycles buy the annual Hungarian vignette as a D1 product at the car price (59,210 HUF in 2025).',
  'issue.M67EVP24NZQCBRYZHZA3MDTZAC':
    'Both were true, for different dates: 120 euros before 1 Jan 2026, 200 euros from then. An instruction makes entries always state the date.',
  'issue.RD5WCXPT972ETKRHV3FTYVJM1W': 'Dismissed: "Does Germany charge cars?" is a question of its own.',
  // Filed by the refresh of 1 Oct 2026, after the dataset update for Romania's switch.
  'issue.6N5JWNVJV2RZFRKBHXBNZDDYB0': 'Applied: CNAIR’s own TollRo announcement now backs the purchase entry.',
  'issue.GR1YEGYMHAWFGHZ34BCCHG53MG':
    'Applied: Verivox repeats three outdated claims (post offices and MAK as sellers, a 16,220 HUF surcharge, keeping the receipt 2 years); the operator says 27,790 HUF and 3 years.',
  'issue.MPGN24BZ8GRFG2HY5RARRVDS4M': 'Applied: two more pages still quote the pre-2026 substitute toll (120 euros); it is 200 euros since 1 Jan 2026.',
  'issue.T4MSJW8TQTEJTPQHF34T0V8TCC': 'Applied: the Romanian article about a German car vignette is cited as an example of the claim the EU Court of Justice ended in 2019.',
  'issue.PEJT0QM0H4HX1HFR4Y1AZT8GK8':
    'No source names post offices or an automobile club; the build had invented them. An instruction limits entries to the operator and its contracted resellers.',
}

async function snapshot(client: any) {
  const [entries, issues, instructions] = await Promise.all([
    client.context.entries.list(),
    client.context.issues.list(),
    client.context.instructions.list(),
  ])
  // Count what the build actually read: no skipped or failed sources (a source
  // being re-checked by a refresh still counts), and a page's sitemap.xml
  // import as the same page.
  const webPages = new Set<string>()
  let dataset = 0
  let cursor: string | undefined
  do {
    const page = await client.context.sources.list({limit: 100, cursor})
    for (const src of page.data) {
      if (src.status === 'skipped' || src.status === 'failed') continue
      if (src.kind === 'web') webPages.add(String(src.canonicalUrl).replace(/\/sitemap\.xml$/, ''))
      else if (src.kind === 'dataset') dataset++
    }
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  const web = webPages.size
  let k = 0
  const key = () => `k${k++}`
  const doc = {
    _id: 'kb-snapshot',
    _type: 'kbSnapshot',
    takenAt: new Date().toISOString(),
    knowledgeBaseId: KB,
    sourceCounts: {dataset, web},
    entries: entries.map((e: any) => ({
      _key: key(),
      path: e.path,
      title: e.title,
      tldr: typeof e.tldr === 'string' ? e.tldr : (e.tldr?.scope ?? ''),
    })),
    issues: issues.map((i: any) => ({
      _key: key(),
      issueId: i._id,
      kind: i.content.kind,
      severity: i.content.severity,
      scope: i.content.scopePath,
      text: i.content.issue,
      status: i.status,
      decision:
        WHY[i._id] ??
        (i.content.kind === 'gap' && i.status !== 'open' ? 'Applied: the entry now names it, so an agent can find it by name.' : ''),
      sides: (i.content.sides ?? []).map((sd: any, n: number) => ({
        _key: key(),
        claim: sd.claim,
        value: sd.value ?? '',
        authority: sd.authority ?? '',
        sourceCount: (sd.sourceIds ?? []).length,
        chosen: i.resolution === n,
      })),
    })),
    instructions: instructions.map((x: any) => ({_key: key(), statement: x.statement, origin: x.origin, status: x.status})),
  }
  await getCliClient({apiVersion: '2026-09-01'}).createOrReplace(doc)
  console.log(`snapshot: ${entries.length} entries, ${issues.length} issues, ${instructions.length} instructions, sources web ${web} dataset ${dataset}`)
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--')
  const [cmd = 'issues', arg] = args
  const client = kbClient() as any
  if (cmd === 'snapshot') {
    await snapshot(client)
  } else if (cmd === 'issues') {
    const issues = await client.context.issues.list(arg ? {status: arg} : undefined)
    console.log(`${issues.length} issues`)
    for (const i of issues) {
      const c = i.content
      console.log(`\n[${i.status}] ${c.severity} ${c.kind} ${i._id}\n  scope: ${c.scopePath}\n  ${c.issue}`)
      if (c.kind === 'conflict') {
        c.sides.forEach((s: any, n: number) =>
          console.log(`  side ${n}${c.suggested === n ? ' (suggested)' : ''} [${s.authority ?? '?'}]: ${s.claim}${s.value ? ` = ${s.value}` : ''}  sources=${(s.sourceIds ?? []).length}`),
        )
      } else console.log(`  fix: ${c.suggestedFix}`)
    }
  } else if (cmd === 'entries') {
    const entries = await client.context.entries.list()
    for (const e of entries) console.log(`${e.path} | ${e.title} | ${e.status}`)
    console.log(`${entries.length} entries`)
  } else if (cmd === 'entry') {
    console.log(JSON.stringify(await client.context.entries.get({path: arg}), null, 2).slice(0, 6000))
  } else if (cmd === 'sources') {
    let cursor: string | undefined
    do {
      const page = await client.context.sources.list({limit: 100, cursor})
      for (const src of page.data) {
        const line = `${src.id} ${src.kind} ${src.status} ${src.canonicalUrl ?? src.filename} | ${(src.tldr ?? '').slice(0, 90)}`
        if (!arg || line.toLowerCase().includes(arg.toLowerCase())) console.log(line)
      }
      cursor = page.nextCursor ?? undefined
    } while (cursor)
  } else if (cmd === 'resolve') {
    const res = await client.context.issues.resolve({issueId: arg, resolution: Number(args[2])})
    console.log('resolved', res.issue.id, res.issue.status, 'job', res.jobId)
  } else if (cmd === 'dismiss') {
    const res = await client.context.issues.dismiss({issueId: arg})
    console.log('dismissed', res.id, res.status)
  } else if (cmd === 'apply') {
    const res = await client.context.issues.apply({issueIds: arg.split(',')})
    console.log('apply job', res.jobId)
  } else if (cmd === 'instruct') {
    const rebuild = args[2] === '-' ? undefined : args[2].split(',')
    const res = await client.context.instructions.create({
      statement: args.slice(3).join(' '),
      scopeSourceIds: arg.split(','),
      rebuildPaths: rebuild,
    })
    console.log('instruction', JSON.stringify(res).slice(0, 400))
  } else if (cmd === 'rescope') {
    const res = await client.context.instructions.edit({instructionId: arg, scopeSourceIds: args[2].split(',')})
    console.log('rescoped', res.id, res.scopeSourceIds)
  } else if (cmd === 'rebuild') {
    for (const path of arg.split(',')) console.log(path, JSON.stringify(await client.context.entries.rebuild({path})))
  } else if (cmd === 'refresh') {
    console.log('refresh', JSON.stringify(await client.context.refresh()))
  } else if (cmd === 'job') {
    console.log(JSON.stringify(await client.context.jobs.get({jobId: arg}), null, 1).slice(0, 3000))
  } else if (cmd === 'endpoints') {
    for (const m of await client.context.mcpEndpoints.list()) console.log(m.name, "|", m.title, "|", JSON.stringify(m.sources))
  } else if (cmd === 'instructions') {
    for (const i of await client.context.instructions.list()) console.log(`${i._id} [${i.origin}/${i.status}] ${i.statement}`)
  }
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
