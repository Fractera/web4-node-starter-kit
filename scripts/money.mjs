// npm run money — where the node's money went, read from its ledger with no model (step 726-1).
//
//   npm run money                 today (UTC): by consumer and provider — calls, refusals with their reasons, tokens
//   npm run money -- --day 2026-11-12
//   npm run money -- --who i18n/translate      only one consumer, with its last lines
//   npm run money -- --days                    the days the ledger holds
//   npm run money -- --json                    the same as data, for a page or another script
//   npm run money -- --balances                726-4: today's burn against the daily budget, and what each provider tells about
//                                              money (a few HTTP calls, no model, free; only when asked)
//
// The ledger is `data/node/usage/<day>.jsonl` (`lib/usage-ledger.cjs`): one line per paid call, written at the call — never a key,
// a prompt or a person's words. A refusal keeps the provider's own reason and code, so «why did it stop» is read, not guessed.
// 735 B1b: every element's ledger too (`data/services/<id>/usage/`, written by the element's own process) — each line named by its
// element; before it no element's spending was ever seen here.

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { readDayAt, daysAt, ledgers } = require('../lib/usage-ledger.cjs')

// The node's every ledger — the core's and each element's; an element's line says whose it is.
const all = ledgers()
const readAll = (day) => all.flatMap((l) => readDayAt(day, l.dir).map((x) => (l.id ? { ...x, element: l.id } : x)))

const args = process.argv.slice(2)
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined }
const json = args.includes('--json')

if (args.includes('--balances')) {
  // 726-4, 735 B1b: today's burn over every ledger of the node — the core's and the elements'.
  const { PROBES, dayBurn, probe, readBudgets, envLocalReader } = require('../lib/money-day.cjs')
  const today = readAll()
  const budgets = readBudgets()
  const services = [...new Set([...today.map((l) => l.provider).filter(Boolean), ...Object.keys(PROBES)])]
  const keyOf = envLocalReader()
  const out = []
  for (const s of services) {
    const burn = dayBurn(today.filter((l) => l.provider === s), { budget: budgets[s]?.calls ?? null })
    out.push({ service: s, burn, money: await probe(s, keyOf) })
  }
  if (json) { console.log(JSON.stringify(out)); process.exit(0) }
  const usd = (n) => `${n} USD`
  for (const { service, burn, money } of out) {
    const b = burn.state === 'no-spend' ? 'no calls today'
      : `${burn.calls} calls today${burn.budget ? ` of ${burn.budget}` : ''} → ${burn.state}${burn.at ? ` at ${burn.at}` : ''} (pace: about ${burn.projected} a day)`
    const m = money.state === 'balance' ? `balance ${usd(money.usd)}`
      : money.state === 'spent-today' ? `spent today ${usd(money.usd)}, no balance told`
        : money.state === 'needs-key' || money.state === 'not-told' ? `no balance told without ${money.key}`
          : money.state === 'failed' ? `the provider did not answer${money.status ? ` ${money.status}` : ''}`
            : 'how this provider tells money is not known'
    console.log(`  ${service}: ${b}; ${m}`)
  }
  process.exit(0)
}

if (args.includes('--days')) {
  const list = [...new Set(all.flatMap((l) => daysAt(l.dir)))].sort().reverse()
  console.log(json ? JSON.stringify(list) : list.length ? list.join('\n') : 'the ledger is empty — no paid call yet')
  process.exit(0)
}

const day = opt('--day') || new Date().toISOString().slice(0, 10)
const who = opt('--who')
const lines = readAll(day).filter((l) => !who || l.who === who)

const groups = new Map()
for (const l of lines) {
  const k = `${l.element ?? ''}\u0000${l.who ?? '?'}\u0000${l.provider ?? '?'}`
  const g = groups.get(k) ?? { element: l.element ?? null, who: l.who ?? '?', provider: l.provider ?? '?', calls: 0, ok: 0, refused: {}, tokensIn: 0, tokensOut: 0, models: new Set(), last: null }
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
  console.log(`  ${r.element ? `element ${r.element} · ` : ''}${r.who} → ${r.provider}${r.models.size ? ` (${[...r.models].join(', ')})` : ''}: ${r.calls} calls, ${r.ok} answered${refused ? `, refused: ${refused}` : ''}${tokens}`)
  if (r.last && !r.last.ok && r.last.message) console.log(`      last refusal ${r.last.at}: ${r.last.message}`)
}
if (who) for (const l of lines.slice(-5)) console.log(`  ${l.at} ${l.ok ? 'ok' : `refused ${l.reason}${l.code ? ` ${l.code}` : ''}`}${l.tokensIn ? ` ${l.tokensIn}/${l.tokensOut ?? 0} tokens` : ''}${l.ms ? ` ${l.ms} ms` : ''}`)
