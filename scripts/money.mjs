// npm run money — where the node's money went, read from its ledger with no model (step 726-1).
//
//   npm run money                 today (UTC): by consumer and provider — calls, refusals with their reasons, tokens
//   npm run money -- --day 2026-11-12
//   npm run money -- --who i18n/translate      only one consumer, with its last lines
//   npm run money -- --days                    the days the ledger holds
//   npm run money -- --json                    the same as data, for a page or another script
//
// The ledger is `data/node/usage/<day>.jsonl` (`lib/usage-ledger.cjs`): one line per paid call, written at the call — never a key,
// a prompt or a person's words. A refusal keeps the provider's own reason and code, so «why did it stop» is read, not guessed.

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { readDay, days } = require('../lib/usage-ledger.cjs')

const args = process.argv.slice(2)
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined }
const json = args.includes('--json')

if (args.includes('--days')) {
  const list = days()
  console.log(json ? JSON.stringify(list) : list.length ? list.join('\n') : 'the ledger is empty — no paid call yet')
  process.exit(0)
}

const day = opt('--day') || new Date().toISOString().slice(0, 10)
const who = opt('--who')
const lines = readDay(day).filter((l) => !who || l.who === who)

const groups = new Map()
for (const l of lines) {
  const k = `${l.who ?? '?'}\u0000${l.provider ?? '?'}`
  const g = groups.get(k) ?? { who: l.who ?? '?', provider: l.provider ?? '?', calls: 0, ok: 0, refused: {}, tokensIn: 0, tokensOut: 0, models: new Set(), last: null }
  g.calls++
  if (l.ok) g.ok++
  else { const r = `${l.reason ?? 'unknown'}${l.code ? ` (${l.code})` : ''}`; g.refused[r] = (g.refused[r] ?? 0) + 1 }
  g.tokensIn += l.tokensIn ?? 0
  g.tokensOut += l.tokensOut ?? 0
  if (l.model) g.models.add(l.model)
  g.last = l
  groups.set(k, g)
}
const rows = [...groups.values()].sort((a, b) => b.calls - a.calls)

if (json) {
  console.log(JSON.stringify({ day, rows: rows.map((r) => ({ ...r, models: [...r.models] })) }))
  process.exit(0)
}

if (!rows.length) {
  console.log(`${day}: no paid call${who ? ` by ${who}` : ''} in the ledger`)
  process.exit(0)
}
console.log(`${day} (UTC) — ${lines.length} paid calls${who ? ` by ${who}` : ''}:`)
for (const r of rows) {
  const refused = Object.entries(r.refused).map(([k, n]) => `${n}× ${k}`).join(', ')
  const tokens = r.tokensIn || r.tokensOut ? ` · tokens ${r.tokensIn} in / ${r.tokensOut} out` : ''
  console.log(`  ${r.who} → ${r.provider}${r.models.size ? ` (${[...r.models].join(', ')})` : ''}: ${r.calls} calls, ${r.ok} answered${refused ? `, refused: ${refused}` : ''}${tokens}`)
  if (r.last && !r.last.ok && r.last.message) console.log(`      last refusal ${r.last.at}: ${r.last.message}`)
}
if (who) for (const l of lines.slice(-5)) console.log(`  ${l.at} ${l.ok ? 'ok' : `refused ${l.reason}${l.code ? ` ${l.code}` : ''}`}${l.tokensIn ? ` ${l.tokensIn}/${l.tokensOut ?? 0} tokens` : ''}${l.ms ? ` ${l.ms} ms` : ''}`)
