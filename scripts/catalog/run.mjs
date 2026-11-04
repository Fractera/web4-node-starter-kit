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
import { readFileSync, writeFileSync } from 'node:fs'
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
  // --attach-only: write the audits already pulled into the cards (a long run pulls them once, while it marks).
  if (!rest.includes('--attach-only')) {
    const r = await pullAudits({ dataDir: DATA })
    console.log(`===CATALOG_AUDITED=== ${r.audited} of ${r.skills} skills have a partners' audit · ${join(DATA, 'audits.json')}`)
  }
  if (rest.includes('--attach') || rest.includes('--attach-only')) {
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
} else if (cmd === 'sections') {
  const { buildSections } = await import('./sections.mjs')
  const r = buildSections({ cardsFile: CARDS, dataDir: DATA })
  for (const s of r.sections) console.log(`  ${s.name} — ${s.skills}: ${s.subsections.map((x) => `${x.name} ${x.skills}`).join(', ')}`)
  console.log(`===CATALOG_SECTIONS=== ${r.sections.length} sections, two levels · ${r.model} · $${r.costUsd ?? '?'} at the API price · ${join(DATA, 'sections.json')}`)
} else if (cmd === 'build') {
  // 627-2: the useful cards' pieces counted by the embeddings of the node `--node <its root>` into a file of vectors; the skip list.
  const { buildIndex, writeSkipList, readCards } = await import('./build.mjs')
  if (!flag('node')) { console.log('===CATALOG_FAIL=== build needs --node <the root of the node whose embeddings count the vectors>'); process.exit(2) }
  const skip = writeSkipList(readCards(CARDS), join(dirname(CARDS), 'skip.json'))
  const r = await buildIndex({ nodeRoot: resolve(flag('node')), cardsFile: CARDS, outDir: join(DATA, 'index') })
  console.log(`===CATALOG_BUILT=== ${r.cards} cards · ${r.rows} pieces · ${r.model} ${r.dims} · ${r.seconds.toFixed(0)} s · skip list ${skip} · ${join(DATA, 'index')}`)
} else if (cmd === 'pack') {
  const { packIndex } = await import('./build.mjs')
  const r = packIndex({ indexDir: join(DATA, 'index'), outDir: flag('out') ? resolve(flag('out')) : join(DATA, 'release') })
  writeFileSync(`${r.file}.json`, `${JSON.stringify(r, null, 2)}\n`)
  console.log(`===CATALOG_PACKED=== ${r.file} · ${(r.size / 1e6).toFixed(1)} MB · sha256 ${r.sha256} · ${r.manifest.cards} cards, ${r.manifest.model} ${r.manifest.dims}`)
} else if (cmd === 'store') {
  // 627-2: Fractera's store of checked skills — a working tree of its repository (`--out`), pushed by hand after a look.
  const { buildStore } = await import('./store.mjs')
  if (!flag('out')) { console.log('===CATALOG_FAIL=== store needs --out <the working tree of the store repository>'); process.exit(2) }
  const r = buildStore({ cardsFile: CARDS, dataDir: DATA, storeDir: resolve(flag('out')) })
  for (const x of r.refused) console.log(`  refused ${x}`)
  console.log(`===CATALOG_STORE=== ${r.skills.length} skills from ${r.sources} sources · refused ${r.refused.length} · ${resolve(flag('out'))}`)
} else if (cmd === 'threshold') {
  const { measure } = await import('./threshold.mjs')
  if (!flag('node')) { console.log('===CATALOG_FAIL=== threshold needs --node <the root of the node that holds the space>'); process.exit(2) }
  const rows = await measure({ nodeRoot: resolve(flag('node')), cardsFile: CARDS, indexDir: join(DATA, 'index'), thresholds: flag('at') ? flag('at').split(',').map(Number) : undefined })
  writeFileSync(join(DATA, 'threshold.json'), `${JSON.stringify(rows, null, 2)}\n`)
  console.log(`===CATALOG_THRESHOLD=== ${rows.length} thresholds · ${join(DATA, 'threshold.json')}`)
} else if (cmd === 'release') {
  // 627-2: the packed space as a release asset of the core (gh's own login), then release.json beside the cards names it and the store.
  const packed = JSON.parse(readFileSync(`${resolve(flag('file') ?? '')}.json`, 'utf8'))
  const tag = flag('tag')
  const repo = flag('repo') ?? 'Fractera/web4-node-starter-kit'
  const store = flag('store') // <owner/repo>@<commit>
  if (!tag || !store) { console.log('===CATALOG_FAIL=== release needs --file <packed .tar.gz> --tag skills-catalog-YYYY-MM-DD --store <owner/repo>@<commit>'); process.exit(2) }
  const name = packed.file.split(/[\\/]/).pop()
  const gh = spawnSync('gh', ['release', 'create', tag, packed.file, '--repo', repo, '--title', `Skills catalog ${tag.slice(-10)}`, '--notes',
    `The skills catalog as a file of vectors (node step 627): ${packed.manifest.cards} skill cards marked once by Fractera, vectors by ${packed.manifest.model} (${packed.manifest.dims}). A node downloads it at install and update and counts nothing. sha256 ${packed.sha256}.`], { encoding: 'utf8' })
  if (gh.status !== 0) { console.log(`===CATALOG_FAIL=== gh release create: ${gh.stderr.trim()}`); process.exit(1) }
  const view = JSON.parse(spawnSync('gh', ['release', 'view', tag, '--repo', repo, '--json', 'assets'], { encoding: 'utf8' }).stdout)
  const asset = view.assets.find((a) => a.name === name)
  if (!asset || asset.size !== packed.size) { console.log(`===CATALOG_FAIL=== the asset on GitHub is not the packed file (${asset?.size} ≠ ${packed.size})`); process.exit(1) }
  const [storeRepo, storeCommit] = store.split('@')
  const release = { about: 'The graph space a node takes ready (node step 627-3) and the store of checked skills (627-2).', tag, asset: name, url: asset.url, size: packed.size, sha256: packed.sha256, ...packed.manifest, store: { repo: storeRepo, commit: storeCommit, manifest: `https://raw.githubusercontent.com/${storeRepo}/${storeCommit}/manifest.json` } }
  writeFileSync(join(dirname(CARDS), 'release.json'), `${JSON.stringify(release, null, 2)}\n`)
  console.log(`===CATALOG_RELEASED=== ${asset.url} · ${(packed.size / 1e6).toFixed(1)} MB · release.json written`)
} else if (cmd === 'report') {
  const { report } = await import('./report.mjs')
  console.log(report(DATA, CARDS))
} else {
  console.log('===CATALOG_FAIL=== commands: selftest, census, fetch, audit, mark, report')
  process.exit(2)
}
