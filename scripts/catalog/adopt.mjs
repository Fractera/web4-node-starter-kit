// 628 — A SKILL THE PERSON SUGGESTS: find it, judge it, hand the checked copy to the element's own agent. The owner, 2026-11-03: «я
// услышал бы рекламе про навык, например replica-skill … должен уметь найти этот навык дать ему оценку и добавить в проект
// пользователя … с пометкой навык по предложению пользователя»; «видели ли ты рекламу этого навыка не можешь ли дать ссылку на этот
// ролик или пост? … можно найти навыки которых много с похожим названием»; who installs — «Агент элемента».
// The judging is the catalog's own (627): whole folders, scripts read, risks, value, use, quality, the partners' audits.
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { appendFileSync, cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, sep } from 'node:path'
import { pullAudits } from './census.mjs'
import { fetchList, gh, openRepo } from './fetch.mjs'
import { blobShaOfBuffer, folderShaOf } from './lib.mjs'
import { markAll } from './mark.mjs'
import { findInCatalog } from '../../lib/agent-kit/skills/catalog.mjs'
import { archivePathOf, idOf, repoDirOf, suggestedDir } from '../../lib/agent-kit/skills/suggested.mjs'
import { ownDir, readOwn, writeOwn } from '../../lib/agent-kit/skills/own.mjs'

const readJsonl = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)) : [])
const readJson = (file, fallback) => { try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return fallback } }
const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')

/** A link the person gave → { source, skill?, path? }: github.com/<owner>/<repo>[/tree|blob/<ref>/<path>] or skills.sh/<owner>/<repo>/<skill>. */
export function parseLink(text) {
  const s = String(text ?? '')
  const g = /github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:\/(?:tree|blob)\/[^/\s]+\/([^\s?#]+))?(?=[\s?#/]|$)/i.exec(s)
  // GitHub's names ignore case — one spelling for the node (✗ 2026-11-03: «Jakeschincariol» from a link and «jakeschincariol» from
  // skills.sh made two judgements, 22 cards for 11 skills).
  if (g) {
    const path = g[3]?.replace(/\/SKILL\.md$/i, '')
    return { source: `${g[1]}/${g[2]}`.toLowerCase(), ...(path ? { path, skill: path.split('/').pop() } : {}) }
  }
  const k = /skills\.sh\/([\w.-]+)\/([\w.-]+)\/([\w.-]+)/i.exec(s)
  return k ? { source: `${k[1]}/${k[2]}`.toLowerCase(), skill: k[3] } : null
}

/** A name → the candidate repositories, the most likely first: the node's catalog cards, the open catalog, GitHub's repository search. */
export async function findCandidates(query, root) {
  const link = parseLink(query)
  if (link) return [{ ...link, from: ['link'] }]
  const q = norm(query)
  const by = new Map()
  const add = (source, patch, from) => {
    const k = source.toLowerCase()
    const c = by.get(k) ?? { source, skills: new Set(), installs: 0, from: new Set() }
    for (const s of patch.skills ?? []) c.skills.add(s)
    c.installs = Math.max(c.installs, patch.installs ?? 0)
    if (patch.stars != null) c.stars = patch.stars
    if (patch.description) c.description = patch.description
    if (patch.pushed) c.pushed = patch.pushed
    c.from.add(from)
    by.set(k, c)
  }
  for (const c of readJsonl(join(root, 'lib', 'agent-kit', 'skills', 'catalog', 'cards.jsonl'))) {
    if (norm(c.skill).includes(q) || norm(c.source).includes(q)) add(c.source, { skills: [c.skill], installs: c.installs, stars: c.stars }, 'catalog')
  }
  const open = await findInCatalog(query, { limit: 10 })
  if (open.ok) for (const s of open.found) add(s.source, { skills: [s.skill], installs: s.installs }, 'skills.sh')
  // ✗ Measured 2026-11-03: sorted by stars, «replica-skill» lost its second repository of the very same name (ahmiilabs, ★4) below ten
  // look-alikes; GitHub's own relevance puts same-named repositories first. Both searches, merged.
  for (const sort of ['', '&sort=stars']) {
    const hub = gh(`search/repositories?q=${encodeURIComponent(`${query} in:name`)}${sort}&per_page=10`)
    for (const r of hub?.items ?? []) add(r.full_name, { stars: r.stargazers_count, description: r.description, pushed: r.pushed_at }, 'github')
  }
  const list = [...by.values()].map((c) => ({ ...c, source: c.source.toLowerCase(), skills: [...c.skills], from: [...c.from], exact: norm(c.source.split('/')[1]) === q }))
  return list.sort((a, b) => Number(b.exact) - Number(a.exact) || (b.stars ?? 0) - (a.stars ?? 0) || b.installs - a.installs).slice(0, 8)
}

/** What the repository's own history says, said aloud: age, last update, commits, how fast the stars came. */
export function trustOf(source) {
  const m = gh(`repos/${source}`)
  if (!m) return null
  const commits = gh(`repos/${source}/commits?per_page=100`) ?? []
  const day = 864e5
  const created = Date.parse(m.created_at)
  const pushed = Date.parse(m.pushed_at)
  const ageDays = Math.max(1, Math.round((Date.now() - created) / day))
  const sinceUpdate = Math.round((Date.now() - pushed) / day)
  const flags = []
  if (ageDays < 90) flags.push(`young — ${ageDays} days old`)
  if (pushed - created < 2 * day) flags.push('not updated since its first day')
  if (commits.length <= 2) flags.push(`${commits.length} commit${commits.length === 1 ? '' : 's'} in all`)
  if (ageDays < 180 && m.stargazers_count / (ageDays / 30) > 1500) flags.push(`fast stars — ${m.stargazers_count} in ${ageDays} days`)
  if (sinceUpdate > 365) flags.push(`not updated for ${Math.round(sinceUpdate / 30)} months`)
  if (m.archived) flags.push('archived by its author')
  return {
    created: m.created_at.slice(0, 10), pushed: m.pushed_at.slice(0, 10), ageDays, stars: m.stargazers_count, forks: m.forks_count,
    commits: commits.length >= 100 ? '100+' : commits.length, licence: m.license?.spdx_id ?? null, flags,
  }
}

const STOP = new Set('with that this from your into their them then than when what which while will would about after also each have more most only other over such these they very used uses using make makes made skill skills agent agents person people help helps work works step steps page pages node nodes product products build builds building'.split(' '))
const words = (text) => new Set(String(text).toLowerCase().match(/[a-z]{4,}/g)?.filter((w) => !STOP.has(w)) ?? [])

/** The node's own skills — its `.claude/skills/` and its skills base (REA lives there): name and description (multi-line YAML too). */
function nodeSkills(root) {
  const own = join(root, '.claude', 'skills')
  const base = join(root, 'lib', 'agent-kit', 'skills', 'base')
  const files = [
    ...(existsSync(own) ? readdirSync(own).map((name) => [name, join(own, name, 'SKILL.md')]) : []),
    ...(existsSync(base) ? readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory())
      .flatMap((d) => readdirSync(join(base, d.name)).map((s) => [`${s} (the skills base)`, join(base, d.name, s, 'SKILL.md')])) : []),
  ]
  return files.flatMap(([name, file]) => {
    if (!existsSync(file)) return []
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, 'utf8'))?.[1] ?? ''
    const lines = fm.split('\n')
    const i = lines.findIndex((l) => /^description:/.test(l))
    let d = i >= 0 ? lines[i].replace(/^description:\s*/, '') : ''
    if (i >= 0 && /^[>|]-?\+?$|^$/.test(d.trim())) d = lines.slice(i + 1).filter((l) => /^\s/.test(l)).join(' ')
    return [{ name, words: words(`${name.replace(/[-()]/g, ' ')} ${d}`) }]
  })
}

/** Each card against the node's own skills — the closest (overlap coefficient ≥ 0.25), so the answer can say «we already have …». */
export function overlapOf(cards, root) {
  const own = nodeSkills(root)
  return Object.fromEntries(cards.map((c) => {
    const w = words(`${c.skill.replace(/-/g, ' ')} ${c.tags.join(' ')} ${c.tasks.join(' ')} ${c.summary}`)
    const near = own.map((o) => {
      const shared = [...w].filter((x) => o.words.has(x)).length
      return { name: o.name, score: shared / Math.max(1, Math.min(w.size, o.words.size)) }
    }).filter((o) => o.score >= 0.25).sort((a, b) => b.score - a.score).slice(0, 2)
    return [c.id, near.map((o) => `${o.name} (${o.score.toFixed(2)})`)]
  }))
}

/** Judge a repository (or one of its skills) into data/node/skills/suggested/<owner>__<repo>/. Many skills → the list first, unless `all`. */
export async function judgeRepository(sourceAsGiven, { root, skill = null, all = false, installs = new Map(), said = '' }) {
  const source = String(sourceAsGiven).toLowerCase()
  const dir = repoDirOf(root, source)
  mkdirSync(dir, { recursive: true })
  const repo = openRepo(source, join(dir, 'repos'))
  if (repo.error) return { error: repo.error }
  const md = repo.entries.filter((e) => (e.path === 'SKILL.md' || e.path.endsWith('/SKILL.md')) && e.mode !== '120000').map((e) => e.path)
  let slugs = [...new Set(md.map((p) => (p.includes('/') ? p.split('/').at(-2) : source.split('/')[1])))]
  if (skill) slugs = slugs.filter((s) => s.toLowerCase() === skill.toLowerCase())
  if (!slugs.length) return { error: skill ? `no skill «${skill}» in ${source}` : `no SKILL.md in ${source}` }
  if (!skill && slugs.length > 20 && !all) return { tooMany: slugs }
  const listFile = join(dir, 'list.txt')
  writeFileSync(listFile, `# ${source} — suggested by the person\n${slugs.map((s, i) => `${i + 1} | ${source} | ${s} | ${installs.get(s) ?? 0}`).join('\n')}\n`)
  fetchList(listFile, dir)
  await pullAudits({ dataDir: dir })
  const marked = await markAll({ dataDir: dir, cardsFile: join(dir, 'cards.jsonl'), concurrency: 4 })
  const cards = readJsonl(join(dir, 'cards.jsonl'))
  const trust = trustOf(source)
  const overlaps = overlapOf(cards, root)
  const head = spawnSync('git', ['-C', repo.dir, 'log', '-1', '--format=%H %cI'], { encoding: 'utf8' }).stdout.trim().split(' ')
  writeFileSync(join(dir, 'judgement.json'), `${JSON.stringify({ source, at: new Date().toISOString(), said, trust, overlaps, commit: head[0], commitDate: head[1] }, null, 1)}\n`)
  appendFileSync(join(suggestedDir(root), 'ledger.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), source, said, event: 'judged', cards: cards.length })}\n`)
  return { dir, trust, cards, overlaps, marked }
}

/** Every file of a folder as [relative path, git blob id] — read as bytes, links never followed (core.symlinks=false wrote their target). */
function pairsOf(folder) {
  const out = []
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, e.name)
      if (e.isDirectory() && !lstatSync(full).isSymbolicLink()) walk(full)
      else if (e.isFile()) out.push([relative(folder, full).split(sep).join('/'), blobShaOfBuffer(readFileSync(full))])
    }
  }
  walk(folder)
  return out
}

/** The project's SOURCE.md of a foreign skill (as `.claude/skills/humanizer/SOURCE.md`), with the person's origin line. */
function sourceMd(card, row, judgement, said, keptAt = null) {
  const scripts = card.scripts.length ? `; scripts: ${card.scripts.map((s) => `\`${s}\``).join(', ')} — installed after the person's separate yes` : ''
  const audits = (card.audits ?? []).map((a) => `${a.provider} ${a.status}`).join(', ') || 'none published'
  return [
    '# SOURCE — vendored, do not edit by hand', '',
    `- **What:** \`${card.skill}\` by ${card.source.split('/')[0]}, ${card.licence ?? 'no licence named'}: ${card.summary.split(/(?<=\.)\s/)[0]}`,
    `- **From:** https://github.com/${card.source} — folder \`${row.folder || '.'}\`, commit \`${judgement.commit}\` (${String(judgement.commitDate).slice(0, 10)}), folder fingerprint \`${row.folderSha}\`.`,
    `- **Taken:** the whole folder — ${card.files} file${card.files === 1 ? '' : 's'}${scripts}.`,
    `- **Origin:** suggested by the person, ${new Date().toISOString().slice(0, 10)}${said ? `: «${said}»` : ''}${keptAt ? `; kept in the node's own skills ${keptAt.slice(0, 10)}` : ''}. Judged by the node: value ${card.value}, use ${card.use}${card.needs.length ? ` (needs ${card.needs.join(', ')})` : ''}, quality ${card.quality}/5, risks ${card.risks.length ? card.risks.join('; ') : 'none found'}; partners' audits: ${audits}.`,
    `- **Trust:** ${judgement.trust ? `${judgement.trust.stars} stars, created ${judgement.trust.created}, last update ${judgement.trust.pushed}, ${judgement.trust.commits} commits${judgement.trust.flags.length ? ` — ${judgement.trust.flags.join('; ')}` : ''}` : 'not read'}.`,
    `- **Why here:** ${card.why}`,
    '- **Update:** suggest it again (`npm run skills -- adopt <link>`) and hand the new checked copy; never edit by hand.', '',
  ].join('\n')
}

/** A judged skill's checked copy — only if its folder is still exactly the one the marker read. → { card, row, folder, judgement, source } */
function judgedCopy(id, root) {
  const [sourceAsGiven, skill] = String(id).split('@')
  const source = String(sourceAsGiven ?? '').toLowerCase()
  if (!source || !skill) return { error: 'the id is <owner/repo>@<skill>' }
  const dir = repoDirOf(root, source)
  const card = readJsonl(join(dir, 'cards.jsonl')).find((c) => c.id.toLowerCase() === String(id).toLowerCase())
  if (!card) return { error: `${id} is not judged — npm run skills -- adopt <link> first` }
  if (card.use === 'skip') return { error: `${id} is «skip»: ${card.why}${card.risks.length ? ` Risks: ${card.risks.join('; ')}` : ''}` }
  const row = readJson(join(dir, 'fetched.json'), []).find((r) => `${r.source}@${r.skill}`.toLowerCase() === String(id).toLowerCase())
  if (!row?.folderSha) return { error: `${id}: its fetched folder is missing — judge it again` }
  const folder = join(dir, row.dir, row.folder ?? '')
  const now = folderShaOf(pairsOf(folder))
  if (now !== row.folderSha) return { error: `the folder changed after the check (${now} ≠ ${row.folderSha}) — judge it again` }
  return { card, row, folder, source, judgement: readJson(join(dir, 'judgement.json'), {}) }
}

// ── 640-1: KEEP — the person liked a skill «for later»: it goes into the node's own skills, not into an element ─────────────────────
// The folder is kept exactly as checked (`own/<owner>__<repo>/<skill>/`), its SOURCE.md beside it (`<skill>.source.md`) — so the kept
// copy's fingerprint can be checked again at every hand-over; the card and its vectors join the own index (`lib/agent-kit/skills/own.mjs`).
const ownFolderOf = (root, source, skill) => join(ownDir(root), String(source).toLowerCase().replace('/', '__'), skill)

/** Keep a judged skill in the node's own skills. → { entry, rows, folder } | { error } */
export async function keepSkill(id, { root, said = '', scriptsYes = false, embed } = {}) {
  const c = judgedCopy(id, root)
  if (c.error) return c
  const { card, row, folder, source, judgement } = c
  if (card.scripts.length && !scriptsYes) return { error: `${id} holds scripts (${card.scripts.join(', ')}) — kept only after the person's separate yes to them: add --scripts-yes` }
  const words = said || judgement.said || ''
  const at = new Date().toISOString()
  const entry = { ...card, id: `${source}@${card.skill}`, own: true, keptAt: at, said: words, folderSha: row.folderSha, folder: row.folder || '.', commit: judgement.commit ?? null, trust: judgement.trust ?? null }
  const cards = [...readOwn(root).filter((k) => k.id.toLowerCase() !== entry.id.toLowerCase()), entry]
  // The vectors first: the embeddings element down — nothing is copied and the store stays as it was.
  const to = ownFolderOf(root, source, card.skill)
  const stage = `${to}.new-${process.pid}`
  rmSync(stage, { recursive: true, force: true })
  mkdirSync(dirname(to), { recursive: true })
  cpSync(folder, stage, { recursive: true, verbatimSymlinks: true })
  let r
  try {
    r = await writeOwn(root, cards, embed ? { embed } : {})
  } catch (e) {
    rmSync(stage, { recursive: true, force: true })
    return { error: `the node's embeddings did not count the skill (${e instanceof Error ? e.message : e}) — nothing kept; npm run power -- embeddings on` }
  }
  rmSync(to, { recursive: true, force: true })
  renameSync(stage, to)
  writeFileSync(`${to}.source.md`, sourceMd(card, row, judgement, words, at))
  appendFileSync(join(suggestedDir(root), 'ledger.jsonl'), `${JSON.stringify({ at, source, skill: card.skill, event: 'kept', folderSha: row.folderSha })}\n`)
  return { entry, rows: r.rows, folder: to }
}

/** Forget a kept skill: its folder, its SOURCE.md, its card and its rows. → { left } | { error } */
export async function forgetSkill(id, { root, embed } = {}) {
  const all = readOwn(root)
  const entry = all.find((k) => k.id.toLowerCase() === String(id).toLowerCase())
  if (!entry) return { error: `${id} is not among the node's own skills (npm run skills -- own)` }
  const left = all.filter((k) => k !== entry)
  await writeOwn(root, left, embed ? { embed } : {})
  const to = ownFolderOf(root, entry.source, entry.skill)
  rmSync(to, { recursive: true, force: true })
  rmSync(`${to}.source.md`, { force: true })
  appendFileSync(join(suggestedDir(root), 'ledger.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), source: entry.source, skill: entry.skill, event: 'forgotten' })}\n`)
  return { left: left.length }
}

// ── HAND — the checked copy to the element's own agent (628; 640-3 widens it to every skill skills_find can propose) ────────────────
/** Pack a staged folder with its SOURCE.md into the door's archive and write the element agent's task. */
function packForElement({ root, to, card, folderSha, stage, sourceText, origin }) {
  if (existsSync(join(stage, 'SOURCE.md'))) cpSync(join(stage, 'SOURCE.md'), join(stage, 'SOURCE.original.md'))
  writeFileSync(join(stage, 'SOURCE.md'), sourceText)
  const doorId = idOf(card.source.toLowerCase(), card.skill)
  const archive = archivePathOf(root, doorId)
  mkdirSync(dirname(archive), { recursive: true })
  const tar = spawnSync('tar', ['-czf', archive, '-C', dirname(stage), basename(stage)], { encoding: 'utf8' })
  rmSync(stage, { recursive: true, force: true })
  if (tar.status !== 0) return { error: `tar failed: ${tar.stderr}` }
  const sha256 = createHash('sha256').update(readFileSync(archive)).digest('hex')
  const port = readJson(join(root, 'logs', 'runtime.json'), {})?.port ?? 24680
  const scripts = card.scripts ?? []
  const task = [
    `Build process: install a skill — \`${card.skill}\` from ${card.source}, ${origin.what}. The node judged it`,
    `(value ${card.value}, use ${card.use}, quality ${card.quality}/5) and checked its folder (fingerprint ${folderSha}).`,
    `1. Download the checked copy from the core (your node key is SETTINGS_SECRET in your .env.local):`,
    `   curl -sf -H "X-Node-Key: <SETTINGS_SECRET>" "http://127.0.0.1:${port}/api/skills/suggested?id=${doorId}" -o ${card.skill}.tar.gz`,
    `2. Check it: its sha256 must be ${sha256} — any other value: stop and report it.`,
    `3. Unpack it into .claude/skills/ (tar -xzf ${card.skill}.tar.gz -C .claude/skills/): it makes .claude/skills/${card.skill}/ with`,
    `   SOURCE.md («Origin: ${origin.line}»). Change nothing in it; delete the archive.`,
    scripts.length ? `4. It holds scripts (${scripts.join(', ')}): the person said a separate yes to them; never run them while installing.` : '4. It holds no scripts.',
    `5. Commit: «Skill ${card.skill} from ${card.source} — ${origin.commit} (${folderSha})».`,
    `6. Report: npm run reply-core -- "installed ${card.skill}, commit <hash>".`,
  ].join('\n')
  appendFileSync(join(suggestedDir(root), 'ledger.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), source: card.source, skill: card.skill, event: 'handed', from: origin.from, to, sha256, folderSha })}\n`)
  return { archive, sha256, task, card }
}

/** Hand one skill to an element's own agent — only a copy whose folder is still exactly the checked one. Own skills first, then a
 * judged suggestion (628). → { archive, sha256, task, card, from } | { error } */
export async function handSkill(id, { root, to, said = '', scriptsYes = false } = {}) {
  const kept = readOwn(root).find((k) => k.id.toLowerCase() === String(id).toLowerCase())
  if (kept) {
    const folder = ownFolderOf(root, kept.source, kept.skill)
    if (!existsSync(folder)) return { error: `${id}: its kept folder is missing — keep it again (npm run skills -- adopt <link>, then keep)` }
    const now = folderShaOf(pairsOf(folder))
    if (now !== kept.folderSha) return { error: `the kept folder changed after the check (${now} ≠ ${kept.folderSha}) — forget it and keep it again` }
    if (kept.scripts?.length && !scriptsYes) return { error: `${id} holds scripts (${kept.scripts.join(', ')}) — installed only after the person's separate yes: add --scripts-yes` }
    const stage = join(dirname(archivePathOf(root, idOf(kept.source, kept.skill))), kept.skill)
    rmSync(stage, { recursive: true, force: true })
    mkdirSync(dirname(stage), { recursive: true })
    cpSync(folder, stage, { recursive: true, verbatimSymlinks: true })
    const r = packForElement({ root, to, card: kept, folderSha: kept.folderSha, stage, sourceText: readFileSync(`${folder}.source.md`, 'utf8'), origin: { from: 'own', what: 'one of the node\'s own skills (the person kept it)', line: 'suggested by the person, kept in the node\'s own skills', commit: 'kept by the person, checked by the node' } })
    return r.error ? r : { ...r, from: 'own' }
  }
  const c = judgedCopy(id, root)
  if (c.error) return c
  const { card, row, folder, source, judgement } = c
  if (card.scripts.length && !scriptsYes) return { error: `${id} holds scripts (${card.scripts.join(', ')}) — installed only after the person's separate yes: add --scripts-yes` }
  const stage = join(dirname(archivePathOf(root, idOf(source, card.skill))), card.skill)
  rmSync(stage, { recursive: true, force: true })
  mkdirSync(dirname(stage), { recursive: true })
  cpSync(folder, stage, { recursive: true, verbatimSymlinks: true })
  const r = packForElement({ root, to, card: { ...card, source }, folderSha: row.folderSha, stage, sourceText: sourceMd(card, row, judgement, said || judgement.said || ''), origin: { from: 'suggested', what: 'suggested by the person and approved', line: 'suggested by the person', commit: 'suggested by the person, checked by the node' } })
  return r.error ? r : { ...r, from: 'suggested' }
}
