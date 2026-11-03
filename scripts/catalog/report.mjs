// 627-1 — THE PILOT'S NUMBERS: what was fetched and why not, the duplicates, value / use / quality, scripts and licences, the controls,
// what one card costs (tokens, seconds, the API price the CLI reports) and what a full run would cost; 10 cards for the owner in
// data/catalog/pilot-sample.md.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { USES, VALUES } from './lib.mjs'

const readJson = (file, fallback) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback)
const readJsonl = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)) : [])
const pct = (xs, p) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(p * xs.length))] : 0)
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

export function report(dataDir, cardsFile) {
  const fetched = readJson(join(dataDir, 'fetched.json'), [])
  const duplicates = readJson(join(dataDir, 'duplicates.json'), [])
  const cards = readJsonl(cardsFile)
  const ids = new Set(cards.map((c) => c.id))
  const log = readJsonl(join(dataDir, 'mark-log.jsonl')).filter((l) => l.ok && ids.has(l.id))
  const controls = readJsonl(join(dataDir, 'controls.jsonl'))
  const lines = []
  const say = (s = '') => lines.push(s)
  const count = (key, values) => values.map((v) => `${v} ${cards.filter((c) => c[key] === v).length}`).join(', ')

  const missing = fetched.filter((r) => r.error)
  say(`Listed ${fetched.length} · fetched ${fetched.length - missing.length} · not fetched ${missing.length}`)
  for (const r of missing.filter((x) => !/renamed or removed/.test(x.error))) say(`  ${r.source}@${r.skill}: ${r.error}`)
  say(`  gone from their repositories: ${missing.filter((x) => /renamed or removed/.test(x.error)).length}`)
  say(`Duplicates by fingerprint ${duplicates.length}: ${duplicates.map((d) => `${d.id} → ${d.duplicateOf}`).join('; ') || 'none'}`)
  say(`Cards ${cards.length} · value: ${count('value', VALUES)} · use: ${count('use', USES)}`)
  say(`Quality: ${[5, 4, 3, 2, 1].map((q) => `${q}★ ${cards.filter((c) => c.quality === q).length}`).join(', ')}`)
  say(`With scripts ${cards.filter((c) => c.scripts.length).length} (files ${cards.reduce((n, c) => n + c.scripts.length, 0)}) · with risks ${cards.filter((c) => c.risks.length).length} · licence from the folder ${cards.filter((c) => c.licenceFrom === 'folder').length}, from the repository ${cards.filter((c) => c.licenceFrom === 'repository').length}, none ${cards.filter((c) => !c.licence).length}`)
  for (const c of controls) say(`Control ${c.id}: use ${c.use ?? c.error} · risks ${c.risks?.length ?? 0} — ${c.use === 'skip' && c.risks?.length ? 'caught' : 'MISSED'}`)

  const inT = log.map((l) => l.input)
  const outT = log.map((l) => l.output)
  const sec = log.map((l) => l.ms / 1000)
  const cost = log.map((l) => l.costUsd ?? 0)
  say(`Per card (${log.length} calls): input tokens mean ${Math.round(mean(inT))}, median ${pct(inT, 0.5)}, p90 ${pct(inT, 0.9)} · output mean ${Math.round(mean(outT))} · seconds median ${pct(sec, 0.5).toFixed(1)}, p90 ${pct(sec, 0.9).toFixed(1)}`)
  const per = mean(cost)
  say(`API price the CLI reports: $${cost.reduce((a, b) => a + b, 0).toFixed(4)} for ${log.length} cards, $${per.toFixed(5)} a card → 1,000 cards $${(per * 1000).toFixed(2)}, 5,000 $${(per * 5000).toFixed(2)}, 10,000 $${(per * 10000).toFixed(2)} (on the subscription: its limits, not money)`)
  say(`Failed calls in the log (retried or lost): ${readJsonl(join(dataDir, 'mark-log.jsonl')).filter((l) => !l.ok).length}`)

  const pick = []
  for (const [use, n] of [['install', 3], ['install-with-service', 3], ['ideas', 2], ['skip', 2]]) pick.push(...cards.filter((c) => c.use === use).slice(0, n))
  for (const c of cards) if (pick.length < 10 && !pick.includes(c)) pick.push(c)
  const sample = pick.slice(0, 10).map((c, i) => [
    `## ${i + 1}. ${c.skill} — ${c.source}`,
    `**Value:** ${c.value} · **use:** ${c.use}${c.needs.length ? ` (needs ${c.needs.join(', ')})` : ''} · **quality:** ${c.quality}/5 — ${c.qualityWhy}`,
    `**Why:** ${c.why}`,
    `**Installs:** ${c.installs} · **stars of the repository:** ${c.stars ?? '—'} · **licence:** ${c.licence ?? 'none'} (${c.licenceFrom ?? '—'}) · **files:** ${c.files}, scripts ${c.scripts.length} · ${c.url}`,
    '', c.summary, '',
    `**Tasks:** ${c.tasks.join('; ')}`, `**Tags:** ${c.tags.join(', ')}`, `**Tools:** ${c.tools.join(', ') || '—'}`,
    `**Risks:** ${c.risks.join('; ') || 'none'}`, '',
  ].join('\n'))
  writeFileSync(join(dataDir, 'pilot-sample.md'), `# Pilot 627-1 — 10 cards for the owner\n\n${sample.join('\n')}`)
  say(`10 cards for the owner: ${join(dataDir, 'pilot-sample.md')}`)
  return lines.join('\n')
}
