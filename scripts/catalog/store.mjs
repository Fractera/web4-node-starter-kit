// FRACTERA'S STORE OF CHECKED SKILLS (node step 627-2). The owner, 2026-11-02: «хранить навыки мы можем только внутри объектного
// хранилища нашего проекта, только при условии что лицензии это позволяет»; 2026-11-03, where: «Репозиторий GitHub (Рекомендую)».
// One public repository of Fractera: the folder of every useful skill whose licence allows a copy, EXACTLY as its card saw it (the
// folder's fingerprint equals the card's `folderSha`), beside it the source repository's LICENSE / NOTICE and SOURCE.md, and one
// `manifest.json` with the git blob of every file. A node takes one skill by direct links and installs it only when every blob matches
// (627-3) — a skill gone from GitHub stays available, a substituted one is refused.
//   skills/<owner>__<repo>/LICENSE · NOTICE · SOURCE.md       the source's own licence text and where it came from
//   skills/<owner>__<repo>/<skill>/…                           the skill folder, file for file
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { blobShaOfBuffer, folderShaOf } from './lib.mjs'
import { readCards, usefulCards } from './build.mjs'

// Licences that let anyone copy and hand out the files unchanged with their notice — nothing copyleft, nothing «custom».
export const COPYABLE = ['MIT', 'MIT-0', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', '0BSD', 'Unlicense', 'CC0-1.0']
export const sourceDir = (source) => String(source).replace(/\//g, '__')
const git = (dir, ...args) => spawnSync('git', ['-C', dir, ...args], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 })

/** The root files of the source repository that carry its licence (the partial clone fetches their blobs on demand). */
export function licenceFiles(clone) {
  const ls = git(clone, 'ls-tree', '--name-only', 'HEAD')
  if (ls.status !== 0) return []
  return ls.stdout.toString('utf8').split('\n').filter((n) => /^(LICEN[CS]E|COPYING|NOTICE)(\.(md|txt|rst))?$/i.test(n))
}

export function buildStore({ cardsFile, dataDir, storeDir, log = console.log }) {
  const fetched = new Map(JSON.parse(readFileSync(join(dataDir, 'fetched.json'), 'utf8')).map((r) => [`${r.source}@${r.skill}`, r]))
  const chosen = usefulCards(readCards(cardsFile)).filter((c) => COPYABLE.includes(c.licence) && fetched.get(c.id)?.folder)
  const out = { skills: [], refused: [], sources: 0 }
  const sources = new Map()
  for (const c of chosen) {
    const r = fetched.get(c.id)
    const clone = join(dataDir, r.dir)
    const from = join(clone, r.folder)
    const files = (r.list ?? []).map((x) => x.slice(0, x.lastIndexOf(' ')))
    const pairs = []
    let missing = null
    for (const rel of files) {
      if (!existsSync(join(from, rel))) { missing = rel; break }
      pairs.push([rel, blobShaOfBuffer(readFileSync(join(from, rel)))])
    }
    if (missing) { out.refused.push(`${c.id}: ${missing} is not in the fetched folder`); continue }
    if (folderShaOf(pairs) !== c.folderSha) { out.refused.push(`${c.id}: the folder's fingerprint is not the card's`); continue }
    const to = join(storeDir, 'skills', sourceDir(c.source), c.skill)
    rmSync(to, { recursive: true, force: true })
    for (const rel of files) {
      mkdirSync(dirname(join(to, rel)), { recursive: true })
      copyFileSync(join(from, rel), join(to, rel))
    }
    if (!sources.has(c.source)) sources.set(c.source, { clone, licence: c.licence, commit: git(clone, 'rev-parse', 'HEAD').stdout.toString('utf8').trim(), skills: [] })
    sources.get(c.source).skills.push(c.skill)
    out.skills.push({ id: c.id, path: `skills/${sourceDir(c.source)}/${c.skill}`, licence: c.licence, folderSha: c.folderSha, files: pairs.map(([rel, blob]) => [rel, blob, readFileSync(join(to, rel)).length]), scripts: c.scripts ?? [] })
  }
  for (const [source, s] of sources) {
    const at = join(storeDir, 'skills', sourceDir(source))
    const texts = []
    for (const name of licenceFiles(s.clone)) {
      const blob = git(s.clone, 'show', `HEAD:${name}`)
      if (blob.status === 0 && blob.stdout.length) { writeFileSync(join(at, name), blob.stdout); texts.push(name) }
    }
    // The skill's licence may live in its own folder (the card says `licenceFrom: folder`) — then no root file is needed.
    if (!texts.length) log(`  ${source}: no licence file at the repository's root — the skills keep their own`)
    writeFileSync(join(at, 'SOURCE.md'), [
      `# ${source}`, '',
      `Copied unchanged from https://github.com/${source} at commit \`${s.commit}\` for the Fractera skills catalog (node step 627).`,
      `Licence: ${s.licence}${texts.length ? ` — the original text: ${texts.join(', ')}` : ''}.`,
      `Skills: ${s.skills.sort().join(', ')}.`, '',
      'Each folder is file for file the original; `manifest.json` at the root of this repository names the git blob of every file, and a',
      'node installs a skill only when every blob matches. The author wants a skill removed — open an issue in this repository.', '',
    ].join('\n'))
    out.sources += 1
  }
  writeFileSync(join(storeDir, 'manifest.json'), `${JSON.stringify({ about: 'Fractera\'s store of checked skills (node step 627): every folder is the original, file for file; a node checks each blob before it installs.', builtAt: new Date().toISOString(), count: out.skills.length, skills: out.skills.sort((a, b) => a.id.localeCompare(b.id)) })}\n`)
  return out
}
