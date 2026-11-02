// THE SKILLS CATALOG — Fractera's tool that marks skills.sh skills into cards (node step 627). It runs at Fractera, never on a person's
// node: a node only receives the result.
//   npm run catalog -- selftest                          the helpers prove themselves
//   npm run catalog -- fetch [--list <file>] [--limit N] SKILL.md, licence and stars through `gh` → data/catalog/ (outside git)
//   npm run catalog -- mark [--limit N] [--control]      a card per unique skill by Claude Haiku → lib/agent-kit/skills/catalog/cards.jsonl
//   npm run catalog -- report                            the numbers per skill, the controls, 10 cards for the owner
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = join(HERE, '..', '..')
export const DATA = join(ROOT, 'data', 'catalog')
export const CARDS = join(ROOT, 'lib', 'agent-kit', 'skills', 'catalog', 'cards.jsonl')

const [cmd, ...rest] = process.argv.slice(2)
const flag = (name) => {
  const i = rest.indexOf(`--${name}`)
  return i >= 0 ? rest[i + 1] : undefined
}

if (cmd === 'selftest') {
  const r = spawnSync(process.execPath, [join(HERE, 'selftest.mjs')], { stdio: 'inherit' })
  process.exit(r.status ?? 1)
} else if (cmd === 'fetch') {
  const { fetchList } = await import('./fetch.mjs')
  const rows = fetchList(flag('list') ?? join(HERE, 'pilot-100.txt'), DATA, Number(flag('limit')) || Infinity)
  const failed = rows.filter((r) => r.error)
  console.log(`===CATALOG_FETCHED=== ${rows.length - failed.length} of ${rows.length}${failed.length ? ` · not found: ${failed.map((r) => `${r.source}@${r.skill}`).join(', ')}` : ''}`)
} else if (cmd === 'mark') {
  const { markAll } = await import('./mark.mjs')
  const control = rest.includes('--control')
  const r = await markAll({ dataDir: DATA, cardsFile: CARDS, limit: Number(flag('limit')) || Infinity, concurrency: Number(flag('concurrency')) || 3, control })
  const tail = `marked ${r.marked} · failed ${r.failed.length} · already marked ${r.skipped} · duplicates ${r.duplicates.length}`
  if (r.stoppedByLimit) console.log(`===CATALOG_MARK_STOPPED=== the subscription's usage limit — run mark again later; ${tail}`)
  else console.log(`${r.failed.length ? '===CATALOG_MARK_PARTIAL===' : '===CATALOG_MARKED==='} ${control ? 'control · ' : ''}${tail}`)
  process.exit(r.failed.length ? 1 : 0)
} else if (cmd === 'report') {
  const { report } = await import('./report.mjs')
  console.log(report(DATA, CARDS))
} else {
  console.log('===CATALOG_FAIL=== commands: selftest, fetch, mark, report')
  process.exit(2)
}
