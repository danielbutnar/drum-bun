// Prints the Knowledge Base import table: node context/list-imports.mjs < json
let s = ''
process.stdin.on('data', (d) => (s += d)).on('end', () => {
  let total = 0
  for (const i of JSON.parse(s)) {
    total += i.sourceCount || 0
    console.log(
      i.status.padEnd(9),
      String(i.sourceCount).padStart(4),
      String(i.distilledCount).padStart(4),
      i.sourceKind.padEnd(8),
      (i.name || '').slice(0, 90),
      i.statusDetail ? '| ' + i.statusDetail.slice(0, 80) : '',
    )
  }
  console.log('total sources', total)
})
