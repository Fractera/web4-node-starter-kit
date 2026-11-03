// GUARD: THE CATALOG CARDS (node step 627-1) — every line of lib/agent-kit/skills/catalog/cards.jsonl is a card of the schema
// (`validateCard` of scripts/catalog/lib.mjs), and no two cards share an id or a SKILL.md fingerprint. A card is our own words about a
// foreign skill; nodes will receive these cards ready (627-3), so a broken card is stopped here, at Fractera.
//   node scripts/check-catalog-cards.mjs [file]
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { USES, VALUES, validateCard } from './catalog/lib.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const FILE = process.argv[2] ?? join(ROOT, 'lib', 'agent-kit', 'skills', 'catalog', 'cards.jsonl')

if (!existsSync(FILE)) {
  console.log('===CATALOG_CARDS_OK=== no cards yet')
  process.exit(0)
}

const findings = []
const ids = new Set()
const shas = new Set()
const count = Object.fromEntries([...VALUES.map((v) => [`value ${v}`, 0]), ...USES.map((u) => [`use ${u}`, 0])])
const lines = readFileSync(FILE, 'utf8').split(/\r?\n/).filter((l) => l.trim())
lines.forEach((line, i) => {
  let card
  try { card = JSON.parse(line) } catch { findings.push(`line ${i + 1}: not JSON`); return }
  const wrong = validateCard(card)
  if (wrong.length) findings.push(`line ${i + 1} (${card.id ?? '?'}): ${wrong.join(', ')}`)
  if (ids.has(card.id)) findings.push(`line ${i + 1}: the id ${card.id} again`)
  if (shas.has(card.sha)) findings.push(`line ${i + 1} (${card.id}): the SKILL.md fingerprint ${card.sha} again — a duplicate`)
  ids.add(card.id)
  shas.add(card.sha)
  if (`value ${card.value}` in count) count[`value ${card.value}`] += 1
  if (`use ${card.use}` in count) count[`use ${card.use}`] += 1
})

if (findings.length) {
  for (const f of findings) console.log(`  ${f}`)
  console.log(`===CATALOG_CARDS_FAILED=== ${findings.length}`)
  process.exit(1)
}
console.log(`===CATALOG_CARDS_OK=== ${lines.length} cards (${Object.entries(count).map(([k, n]) => `${k} ${n}`).join(', ')})`)
