// 720-2/720-3: the person's part survives a node update. Run: node scripts/node-records.test.mjs
// A scratch release and a node cloned from it. The node changes, without saving: the site settings (the domain's `url`, as «Activate
// domain» does), a section 9 entry of CLAUDE.md, its own steps; it has its own untracked skill and its block in `data/` (outside git).
// The release then changes the same files. The update's order — `take`, `git merge`, `put` — must bring Fractera's new text AND keep every
// record of the node. Negative control: the same merge without `take` is refused by git (the node's unsaved work stands in the way).
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const records = createRequire(import.meta.url)('../lib/deploy/node-records.cjs')
const base = mkdtempSync(join(tmpdir(), 'node-records-'))
const rel = join(base, 'release')
const nodeDir = join(base, 'node')
const sh = (cwd, ...a) => execFileSync('git', a, { cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' })
const gitOf = (cwd) => (args) => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' })
  return { ok: r.status === 0, out: (r.stdout ?? '').replace(/\s+$/, ''), err: (r.stderr ?? '').trim() }
}
const put = (dir, p, t) => { mkdirSync(join(dir, p, '..'), { recursive: true }); writeFileSync(join(dir, p), t) }
const read = (dir, p) => readFileSync(join(dir, p), 'utf8')
const json = (o) => JSON.stringify(o, null, 2) + '\n'
const CLAUDE = (rules) => `# Core\n\n## 1. Role\n\n${rules}\n\n## 9. Evolution\n\nRules.\n\nEntries:\n`

mkdirSync(rel, { recursive: true })
sh(rel, 'init', '-q', '-b', 'main'); sh(rel, 'config', 'user.email', 't@t'); sh(rel, 'config', 'user.name', 't')
put(rel, '.gitignore', 'data/*\nlogs/\n')
put(rel, 'CLAUDE.md', CLAUDE('rules v1'))
put(rel, 'APP-CONFIG/app-config.json', json({ name: 'Fractera', url: '', seo: { title: 'old' } }))
put(rel, 'development-docs/development-steps/current-steps.md', 'starter steps\n')
put(rel, '.claude/skills/create-element/SKILL.md', 'release skill v1\n')
sh(rel, 'add', '-A'); sh(rel, 'commit', '-q', '-m', 'release 1')
execFileSync('git', ['clone', '-q', rel, nodeDir])
sh(nodeDir, 'config', 'user.email', 't@t'); sh(nodeDir, 'config', 'user.name', 't')

// The node's own part, unsaved.
put(nodeDir, 'APP-CONFIG/app-config.json', json({ name: 'Fractera', url: 'https://my.domain', seo: { title: 'old' } }))
put(nodeDir, 'CLAUDE.md', CLAUDE('rules v1') + '- If the person asks for tea — offer green.\n')
put(nodeDir, 'development-docs/development-steps/current-steps.md', 'the node\'s own letter\n')
put(nodeDir, '.claude/skills/my-own-skill/SKILL.md', 'the person\'s skill\n')
put(nodeDir, 'data/main-agent/CLAUDE.user.md', 'Speak to me in short sentences.\n')
put(nodeDir, 'data/node/domains.json', json([{ name: 'my.domain' }]))

// The release moves on: the same files.
put(rel, 'CLAUDE.md', CLAUDE('rules v2'))
put(rel, 'APP-CONFIG/app-config.json', json({ name: 'Fractera', url: '', seo: { title: 'new' }, pwa: true }))
put(rel, 'development-docs/development-steps/current-steps.md', 'starter steps v2\n')
put(rel, '.claude/skills/create-element/SKILL.md', 'release skill v2\n')
sh(rel, 'add', '-A'); sh(rel, 'commit', '-q', '-m', 'release 2')
sh(nodeDir, 'fetch', '-q', 'origin')

let bad = 0
const ok = (cond, what) => { console.log(`${cond ? '✓' : '✗'} ${what}`); if (!cond) bad++ }
const git = gitOf(nodeDir)

const plain = git(['merge', '--no-edit', 'origin/main'])
ok(!plain.ok, 'negative control: without the node records a merge is refused by git (the unsaved work stands in the way)')
git(['merge', '--abort'])

const kept = records.take(nodeDir, git)
ok(kept.length === 3, `the node's changed records are put aside: ${kept.map((k) => k.p).join(', ')}`)
const m = git(['merge', '--no-edit', 'origin/main'])
ok(m.ok, 'the merge of the release goes through')
records.put(nodeDir, kept)

const app = JSON.parse(read(nodeDir, 'APP-CONFIG/app-config.json'))
ok(app.url === 'https://my.domain', 'the site settings: the node\'s own domain address stays')
ok(app.seo.title === 'new' && app.pwa === true, 'the site settings: Fractera\'s new values and keys arrive')
const claude = read(nodeDir, 'CLAUDE.md')
ok(claude.includes('rules v2') && !claude.includes('rules v1'), 'CLAUDE.md: the system part is the release\'s')
ok(claude.endsWith('Entries:\n- If the person asks for tea — offer green.\n'), 'CLAUDE.md: the node\'s section 9 entry stays')
ok(read(nodeDir, 'development-docs/development-steps/current-steps.md') === 'the node\'s own letter\n', 'the node\'s own steps stay')
ok(read(nodeDir, '.claude/skills/create-element/SKILL.md') === 'release skill v2\n', 'a release skill is the release\'s')
ok(existsSync(join(nodeDir, '.claude/skills/my-own-skill/SKILL.md')), 'the person\'s own skill stays')
ok(read(nodeDir, 'data/main-agent/CLAUDE.user.md') === 'Speak to me in short sentences.\n', 'the person\'s block (data/) stays')
ok(JSON.parse(read(nodeDir, 'data/node/domains.json'))[0].name === 'my.domain', 'the list of domains (data/) stays')
ok(records.merge3({ a: 1 }, { a: 2 }, { a: 3 }).a === 2 && records.merge3({ a: 1 }, { a: 1 }, {}).a === undefined, 'merge3: the node\'s change wins, a key the fork removed goes')

rmSync(base, { recursive: true, force: true })
console.log(bad ? `===NODE_RECORDS_FAILED=== ${bad}` : '===NODE_RECORDS_OK=== the person\'s part survives the update, Fractera\'s new text arrives')
process.exit(bad ? 1 : 0)
