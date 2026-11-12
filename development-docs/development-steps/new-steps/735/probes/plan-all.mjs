// Dry-plan taking every «any»-scope tool of the core into a receiver folder; nothing is written.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const ROOT = process.env.CORE ?? process.cwd() // the core's root
const { planTake } = await import(ROOT + '/lib/parts/take.mjs')
const m = require(ROOT + '/lib/parts/PARTS.json')
const receiver = process.argv[2]
const tools = (m.parts || m).filter((p) => p.kind === 'tool' && p.scope !== 'panel')
let ok = 0
for (const t of tools) {
  let p
  try { p = planTake({ source: ROOT, from: 'core', receiver, tool: t.id }) } catch (e) { console.log('✗', t.id.padEnd(26), 'THREW', String(e.message).slice(0, 140)); continue }
  if (p.ok) ok++
  const why = (p.refused || []).map((r) => r.replace(/^«[^»]+» /, '')).join(' | ')
  console.log(p.ok ? '✓' : '✗', t.id.padEnd(26), p.ok ? 'copies: ' + p.copies.map((c) => c.id).join(', ') + (p.skipped?.length ? ' · own stand in: ' + p.skipped.map((s) => s.split(' — ')[0]).join(', ') : '') : why.slice(0, 230))
}
console.log(`takeable: ${ok} of ${tools.length}`)
