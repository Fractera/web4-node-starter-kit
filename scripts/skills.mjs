// THE NODE'S SKILLS MEMORY (node step 595-3).
//   npm run skills -- add <folder> --source <name> --license <spdx> [--url <address>] [--name <skill>]
//       a skill of another project into the graph element as a ready graph (no language model; the graph counts vectors by the node's
//       OpenAI key). The folder holds SKILL.md and references/*.md; SOURCE.md and LICENSE beside them say where it came from.
//   npm run skills -- find "<question>" [--themes "<a, b>"] [--terms "<c, d>"]
//       what other projects did: at most three fragments, 3 KB, each with its skill, source and licence.
//   npm run skills -- market "<English words>" [--limit 10]
//       the open catalog skills.sh (owner 2026-11-02): the most installed skills for these words, no key needed; nothing is installed.
//   npm run skills -- base-sync <folder> --source <name> --license <spdx> [--url <address>] [--version <v>]
//       a licensed skill into the base shipped with every clone (node step 598): lib/agent-kit/skills/base/ + manifest.json
//   npm run skills -- base-check   — every skill of the base may be handed out (its LICENSE, a licence from the list, only its text)
//   npm run skills -- base-load    — the base into this node's graph, once: a ledger (data/node/skills-base.json) keeps what is loaded
//   npm run skills -- adopt "<name or link>" [--pick <owner/repo>] [--skill <name>] [--all] [--said "<the person's words>"]
//       a skill the person heard of (node step 628): candidates by name — several answer to it → ask the person for the link where they
//       saw it; a link or --pick → the repository's trust signals and every skill judged by the catalog's marker, into
//       data/node/skills/suggested/ (outside git). Skill `adopt-suggested-skill`.
//   npm run skills -- adopt-hand <owner/repo@skill> --to <element> [--send] [--said "<words>"]
//       the approved, still unchanged checked copy packed with its SOURCE.md («suggested by the person») for the element's own agent;
//       --send gives it the task (npm run task); the agent takes it from GET /api/skills/suggested and commits it.
//   npm run skills -- catalog-install — the skills catalog (node step 627-3): the release named in lib/agent-kit/skills/catalog/release.json
//       downloaded, sha256 and model checked, into data/node/skills-catalog/; nothing is counted. The same vectors in place — no download.
// Nothing runs by itself: a person or an agent calls it (the node's installer calls base-load and catalog-install at the end of a full
// installation, the node's update calls both after the core's rebuild).
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { markOf, skillGraph } from '../lib/agent-kit/skills/to-graph.mjs'
import { findSkills, graphCall, graphStatus } from '../lib/agent-kit/skills/find.mjs'
import { catalogText, findInCatalog } from '../lib/agent-kit/skills/catalog.mjs'
import { BASE, checkBase, ledgerFile, readLedger, readManifest, shaOf, syncSkill } from '../lib/agent-kit/skills/base.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const [cmd, ...rest] = process.argv.slice(2)
const flag = (name) => {
  const i = rest.indexOf(`--${name}`)
  return i >= 0 ? rest[i + 1] : undefined
}
const positional = rest.filter((a, i) => !a.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--')))

if (cmd === 'add') {
  const dir = resolve(positional[0] ?? '')
  const source = flag('source')
  if (!positional[0] || !source) {
    console.log('===SKILLS_FAIL=== usage: npm run skills -- add <folder> --source <name> --license <spdx> [--url <address>]')
    process.exit(2)
  }
  const { mark, skill, graph } = skillGraph(dir, { source, name: flag('name'), license: flag('license'), url: flag('url') })
  const { status, body } = await graphCall(ROOT, 'graph-insert', graph, 300_000)
  if (status !== 200 || !body?.ok) {
    console.log(`===SKILLS_FAIL=== graph-insert ${status} ${JSON.stringify(body).slice(0, 300)}`)
    process.exit(1)
  }
  console.log(`===SKILLS_ADDED=== ${skill} as ${mark}: ${graph.chunks.length} chunks, ${graph.entities.length} entities, ${graph.relationships.length} relationships; vectors ${body.embedCalls ?? '?'} calls, language model ${body.llmCalls ?? '?'}`)
} else if (cmd === 'find') {
  const query = positional.join(' ')
  if (!query) {
    console.log('===SKILLS_FAIL=== usage: npm run skills -- find "<question>" [--themes "<a, b>"] [--terms "<c, d>"]')
    process.exit(2)
  }
  const r = await findSkills(ROOT, { query, themes: flag('themes'), terms: flag('terms') })
  if (r.error) { console.log(`===SKILLS_FAIL=== ${r.error}`); process.exit(1) }
  console.log(r.found ? r.text : 'No skill of another project is close enough to this question.')
  if (r.notice) console.log(`\n${r.notice}`)
  console.log(`===SKILLS_FOUND=== ${r.fragments.length} ${r.fragments.map((f) => `${f.source}:${f.skill}`).join(' ')}`)
} else if (cmd === 'market') {
  const r = await findInCatalog(positional.join(' '), { limit: Number(flag('limit')) || 10 })
  console.log(catalogText(r))
  console.log(r.ok ? `===SKILLS_MARKET=== ${r.found.length} ${r.found.map((s) => `${s.source}@${s.skill}`).join(' ')}` : `===SKILLS_FAIL=== ${r.error}`)
  process.exit(r.ok ? 0 : 1)
} else if (cmd === 'adopt') {
  const { findCandidates, judgeRepository, parseLink } = await import('./catalog/adopt.mjs')
  const query = positional[0]
  if (!query) {
    console.log('===SKILLS_FAIL=== usage: npm run skills -- adopt "<name or link>" [--pick <owner/repo>] [--skill <name>] [--all] [--said "<words>"]')
    process.exit(2)
  }
  const link = parseLink(query)
  let source = flag('pick') ?? link?.source
  const skill = flag('skill') ?? link?.skill ?? null
  const installs = new Map()
  if (!source) {
    const found = await findCandidates(query, ROOT)
    if (!found.length) {
      console.log(`===SKILLS_ADOPT_NONE=== nothing answers to «${query}» in the node's catalog, skills.sh or GitHub — ask the person for the link where they saw it`)
      process.exit(0)
    }
    const exact = found.filter((c) => c.exact)
    const clear = exact.length === 1 && found.every((c) => c === exact[0] || (c.stars ?? 0) * 20 < (exact[0].stars ?? 0))
    if (!clear) {
      for (const c of found) console.log(`  ${c.source} · ★${c.stars ?? '—'} · installs ${c.installs || '—'} · last update ${c.pushed?.slice(0, 10) ?? '—'} · ${c.skills.length ? `skills: ${c.skills.slice(0, 6).join(', ')}` : ''} ${c.description ? `— ${String(c.description).slice(0, 90)}` : ''} [${c.from.join(', ')}]`)
      console.log(`===SKILLS_ADOPT_CANDIDATES=== ${found.length} repositories answer to «${query}» — ask the person where they heard of it (a link to the ad, the post or the repository), then: npm run skills -- adopt "${query}" --pick <owner/repo>`)
      process.exit(0)
    }
    source = exact[0].source
    const others = found.filter((c) => c !== exact[0])
    if (others.length) console.log(`Also answering to «${query}» (far fewer stars — say so to the person): ${others.map((c) => `${c.source} ★${c.stars ?? '—'}`).join(', ')}`)
  }
  const r = await judgeRepository(source, { root: ROOT, skill, all: rest.includes('--all'), installs, said: flag('said') ?? '' })
  if (r.error) { console.log(`===SKILLS_ADOPT_FAIL=== ${r.error}`); process.exit(1) }
  if (r.tooMany) {
    console.log(`  ${r.tooMany.join(', ')}`)
    console.log(`===SKILLS_ADOPT_MANY=== ${source} holds ${r.tooMany.length} skills — ask the person which (--skill <name>) or judge them all (--all)`)
    process.exit(0)
  }
  const t = r.trust
  console.log(t ? `Trust: ★${t.stars}, created ${t.created}, last update ${t.pushed}, ${t.commits} commit${t.commits === 1 ? '' : 's'}, licence ${t.licence ?? 'none'}${t.flags.length ? ` — ${t.flags.join('; ')}` : ''}` : 'Trust: the repository facts did not load')
  for (const c of r.cards) {
    const near = r.overlaps[c.id] ?? []
    console.log(`  ${c.skill} · value ${c.value} · use ${c.use}${c.needs.length ? ` (needs ${c.needs.join(', ')})` : ''} · quality ${c.quality}/5${c.scripts.length ? ` · scripts ${c.scripts.length}` : ''}${c.risks.length ? ` · RISKS: ${c.risks.join('; ')}` : ''}${near.length ? ` · the node already has: ${near.join(', ')}` : ''}`)
    console.log(`      ${c.summary.split(/(?<=\.)\s/)[0]} — ${c.why}`)
  }
  console.log(`===SKILLS_ADOPT_JUDGED=== ${source}: ${r.cards.length} skills · ${r.dir} · hand one after the person's yes: npm run skills -- adopt-hand ${source}@<skill> --to <element> --send`)
} else if (cmd === 'adopt-hand') {
  const { handSkill } = await import('./catalog/adopt.mjs')
  const id = positional[0]
  const to = flag('to')
  if (!id || !to) {
    console.log('===SKILLS_FAIL=== usage: npm run skills -- adopt-hand <owner/repo@skill> --to <element> [--send] [--said "<words>"]')
    process.exit(2)
  }
  const r = handSkill(id, { root: ROOT, to, said: flag('said') ?? '' })
  if (r.error) { console.log(`===SKILLS_ADOPT_HAND_FAIL=== ${r.error}`); process.exit(1) }
  console.log(r.task)
  const send = rest.includes('--send')
  if (send) spawnSync(process.execPath, [join(ROOT, 'scripts', 'main-agent-cli.mjs'), 'task', to, r.task], { stdio: 'inherit' })
  console.log(`===SKILLS_ADOPT_HANDED=== ${id} → ${to} · ${r.archive} · sha256 ${r.sha256}${send ? ' · the task was given' : ' · not given yet: add --send'}`)
} else if (cmd === 'base-sync') {
  try {
    const e = syncSkill(resolve(positional[0] ?? ''), { source: flag('source'), license: flag('license'), url: flag('url') ?? '', version: flag('version') ?? '' })
    console.log(`===SKILLS_BASE_SYNCED=== ${e.source}:${e.skill} (${e.license}) — ${e.files.length} files: ${e.files.join(', ')}`)
  } catch (err) {
    console.log(`===SKILLS_FAIL=== ${err.message}`)
    process.exit(1)
  }
} else if (cmd === 'base-check') {
  const problems = checkBase(positional[0] ? resolve(positional[0]) : BASE)
  if (problems.length) { console.log(`===SKILLS_BASE_FAIL===\n  ${problems.join('\n  ')}`); process.exit(1) }
  const skills = readManifest()
  console.log(`===SKILLS_BASE_OK=== ${skills.length} skills, each with its licence: ${skills.map((s) => `${s.source}:${s.skill} (${s.license})`).join(', ')}`)
} else if (cmd === 'base-load') {
  // 598-2: what is loaded is kept in a ledger by the fingerprint of SKILL.md — a repeated insert of the same skill would merge its
  // descriptions into the old ones in LightRAG, so a loaded skill is never inserted again. A skill changed since loading is named
  // and not inserted again: the graph cannot forget the old version yet, and two versions side by side answer twice.
  // --wait: the installer has just restarted the graph — wait for it to answer (up to a minute) before calling it absent.
  const LEDGER = ledgerFile(ROOT)
  const wait = rest.includes('--wait')
  let st = await graphStatus(ROOT)
  for (let left = wait ? 12 : 0; st.status !== 200 && left > 0; left -= 1) {
    await new Promise((ok) => setTimeout(ok, 5000))
    st = await graphStatus(ROOT)
  }
  if (st.status !== 200 || !st.body?.ok) {
    console.log(`===SKILLS_BASE_LOAD_FAIL=== the graph element does not answer (${st.status || st.error}) — it is not running or not installed; load later: npm run skills -- base-load`)
    process.exit(1)
  }
  // 626-7: the graph counts its vectors through the node's `embeddings` element (graph v1.2.0 names it in `embeddings`), not an OpenAI key.
  if (st.body.installed === false || st.body.embeddings?.ready === false) {
    console.log(`===SKILLS_BASE_LOAD_FAIL=== ${st.body.installed === false ? 'the Python part of the graph is not installed (npm run graph:python in the graph element)' : 'the node\'s embeddings element does not count vectors now (npm run power -- embeddings on)'}; then: npm run skills -- base-load`)
    process.exit(1)
  }
  let ledger = readLedger(ROOT)
  // A graph emptied after loading (its data removed) holds nothing the ledger names — load the base again.
  if (Object.keys(ledger).length && !st.body.chunks) {
    console.log('  the graph holds no chunks — the ledger belongs to an emptied graph, loading the base again')
    ledger = {}
  }
  const at = new Date().toISOString()
  const done = { inserted: [], adopted: [], already: 0, changed: [], failed: [] }
  for (const s of readManifest()) {
    const mark = markOf(s.source, s.skill)
    if (ledger[mark]?.sha === s.sha) { done.already += 1; continue }
    if (ledger[mark]) { done.changed.push(mark); continue }
    // 595-3 inserted this very copy by hand (data/node/skills/) — adopt it into the ledger without inserting it twice.
    const own = join(ROOT, 'data', 'node', 'skills', s.source, s.skill, 'SKILL.md')
    if (!ledger[mark] && existsSync(own) && shaOf(own) === s.sha) {
      ledger[mark] = { sha: s.sha, at, how: 'adopted — inserted by step 595-3' }
      done.adopted.push(mark)
      continue
    }
    try {
      const { graph } = skillGraph(join(BASE, s.source, s.skill), { source: s.source, name: s.skill, license: s.license, url: s.url })
      const { status, body } = await graphCall(ROOT, 'graph-insert', graph, 300_000)
      if (status !== 200 || !body?.ok) { done.failed.push(`${mark}: graph-insert ${status} ${JSON.stringify(body).slice(0, 160)}`); continue }
      ledger[mark] = { sha: s.sha, at, how: 'inserted', chunks: graph.chunks.length, entities: graph.entities.length, embedCalls: body.embedCalls ?? null }
      done.inserted.push(mark)
    } catch (err) {
      done.failed.push(`${mark}: ${err instanceof Error ? err.message : err}`)
    }
  }
  mkdirSync(dirname(LEDGER), { recursive: true })
  writeFileSync(LEDGER, `${JSON.stringify(ledger, null, 2)}\n`)
  console.log(`${done.failed.length ? '===SKILLS_BASE_LOAD_FAIL===' : '===SKILLS_BASE_LOADED==='} inserted ${done.inserted.length}${done.inserted.length ? ` (${done.inserted.join(', ')})` : ''} · adopted ${done.adopted.length} · already ${done.already} · changed ${done.changed.length} · failed ${done.failed.length}`)
  for (const c of done.changed) console.log(`  ${c}: changed since it was loaded — not inserted again (the graph keeps the old version; it cannot forget yet)`)
  for (const f of done.failed) console.log(`  ${f}`)
  process.exit(done.failed.length ? 1 : 0)
} else if (cmd === 'catalog-install') {
  const { installCatalog } = await import('../lib/agent-kit/skills/catalog-index.mjs')
  const r = await installCatalog(ROOT)
  if (!r.ok) { console.log(`===SKILLS_CATALOG_FAIL=== ${r.reason}; again later: npm run skills-catalog`); process.exit(1) }
  console.log(`===SKILLS_CATALOG_OK=== ${r.already ? 'already in place' : 'taken'}: ${r.cards} cards, ${r.rows} pieces · data/node/skills-catalog`)
} else {
  console.log('===SKILLS_FAIL=== commands: add, find, market, adopt, adopt-hand, base-sync, base-check, base-load, catalog-install')
  process.exit(2)
}
