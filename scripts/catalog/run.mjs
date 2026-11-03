// THE SKILLS CATALOG — Fractera's tool that marks skills.sh skills into cards (node step 627). It runs at Fractera, never on a person's
// node: a node only receives the result. Every command takes `--data <folder>` (default data/catalog, outside git) and `--cards <file>`
// (default lib/agent-kit/skills/catalog/cards.jsonl), so a large run keeps its own folder.
//   npm run catalog -- selftest                                 the helpers prove themselves
//   npm run catalog -- census --token-file <.env.local> [--rows 6000]
//                                                               the skills.sh leaderboard top-down → census.json, list.txt, well-known.json
//   npm run catalog -- fetch [--list <file>] [--limit N]        whole skill folders from GitHub (one shallow clone per repository)
//   npm run catalog -- audit                                    the partners' security audits of each fetched skill → audits.json
//   npm run catalog -- mark [--limit N] [--concurrency N] [--control]
//                                                               a card per unique skill by Claude Haiku
//   npm run catalog -- report                                   the numbers, the controls, 10 cards for the owner
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = join(HERE, '..', '..')

const [cmd, ...rest] = process.argv.slice(2)
const flag = (name) => {
  const i = rest.indexOf(`--${name}`)
  return i >= 0 ? rest[i + 1] : undefined
}
const DATA = flag('data') ? resolve(flag('data')) : join(ROOT, 'data', 'catalog')
const CARDS = flag('cards') ? resolve(flag('cards')) : join(ROOT, 'lib', 'agent-kit', 'skills', 'catalog', 'cards.jsonl')

if (cmd === 'selftest') {
  const r = spawnSync(process.execPath, [join(HERE, 'selftest.mjs')], { stdio: 'inherit' })
  process.exit(r.status ?? 1)
} else if (cmd === 'census') {
  const { pullCensus } = await import('./census.mjs')
  if (!flag('token-file')) { console.log('===CATALOG_FAIL=== census needs --token-file <the .env.local written by `vercel env pull`>'); process.exit(2) }
  const r = await pullCensus({ tokenFile: resolve(flag('token-file')), rows: Number(flag('rows')) || 6000, outDir: DATA })
  console.log(`===CATALOG_CENSUS=== rows ${r.rows} (GitHub ${r.github}, sites ${r.wellKnown}) · sources ${r.sources} · the last row has ${r.lastInstalls} installs · ${DATA}`)
} else if (cmd === 'fetch') {
  const { fetchList } = await import('./fetch.mjs')
  const rows = fetchList(flag('list') ? resolve(flag('list')) : join(HERE, 'pilot-100.txt'), DATA, Number(flag('limit')) || Infinity)
  const failed = rows.filter((r) => r.error)
  const gone = failed.filter((r) => /renamed or removed/.test(r.error)).length
  console.log(`===CATALOG_FETCHED=== ${rows.length - failed.length} of ${rows.length} · gone from their repositories ${gone} · other failures ${failed.length - gone}${failed.length - gone ? ' — run fetch again' : ''}`)
} else if (cmd === 'sites') {
  const { pullSites } = await import('./census.mjs')
  if (!flag('token-file')) { console.log('===CATALOG_FAIL=== sites needs --token-file <the .env.local written by `vercel env pull`>'); process.exit(2) }
  const r = await pullSites({ tokenFile: resolve(flag('token-file')), dataDir: DATA })
  console.log(`===CATALOG_SITES=== ${r.ok} of ${r.rows} skills of sites copied from skills.sh (text files only) · ${join(DATA, 'fetched-sites.json')}`)
} else if (cmd === 'audit') {
  const { attachAudits, pullAudits } = await import('./census.mjs')
  const r = await pullAudits({ dataDir: DATA })
  console.log(`===CATALOG_AUDITED=== ${r.audited} of ${r.skills} skills have a partners' audit · ${join(DATA, 'audits.json')}`)
  if (rest.includes('--attach')) {
    const a = attachAudits({ dataDir: DATA, cardsFile: CARDS })
    console.log(`  written into ${a.cards} cards, ${a.withAudit} with an audit`)
  }
} else if (cmd === 'mark') {
  const { markAll } = await import('./mark.mjs')
  const control = rest.includes('--control')
  const only = flag('only') ? flag('only').split(',').map((s) => s.trim()).filter(Boolean) : null
  const r = await markAll({ dataDir: DATA, cardsFile: CARDS, limit: Number(flag('limit')) || Infinity, concurrency: Number(flag('concurrency')) || 3, control, only })
  const tail = `marked ${r.marked} · failed ${r.failed.length} · already marked ${r.skipped} · duplicates ${r.duplicates.length}`
  if (r.stoppedByLimit) console.log(`===CATALOG_MARK_STOPPED=== the subscription's usage limit — run mark again later; ${tail}`)
  else console.log(`${r.failed.length ? '===CATALOG_MARK_PARTIAL===' : '===CATALOG_MARKED==='} ${control ? 'control · ' : ''}${tail}`)
  process.exit(r.failed.length ? 1 : 0)
} else if (cmd === 'report') {
  const { report } = await import('./report.mjs')
  console.log(report(DATA, CARDS))
} else {
  console.log('===CATALOG_FAIL=== commands: selftest, census, fetch, audit, mark, report')
  process.exit(2)
}
