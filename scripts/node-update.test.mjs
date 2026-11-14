// THE TRANSITION IS TESTED, NOT ONLY THE DESTINATION (node step 743-6; runs in CI on three systems, D42 — not in the node's prebuild).
// ✗ 2026-11-14: a node ran its own old updater, so a fix in the target never ran (the test server rolled back at the merge); a transition
// hung on one entry point was missed; a collision was discovered minutes into an update. Fixtures are built from this commit's own files
// (`git archive` without eol conversion — Windows' autocrlf — so a shallow CI checkout is enough): a fork = this commit + one change; nodes = this commit + their own commit (as every
// install makes one), with no git identity they may use. A fake `npm` (a named seam) stops the update at its guards: the build stages are
// proven live, never here. Cases:
//   (a) stage 0 → the TARGET's updater runs (its canary printed, `updater` = the target), the merge is the machine's, the ledger written,
//       no worktree left;   (b) the node's own updater directly → no canary (negative control of the handoff);
//   (c) a node commit that collides with the fork → `--preflight` names the file, the real update is refused at «preflight», untouched;
//   (d) a target without `// @handoff v1` → the node's own updater runs, said in one line.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { appendFileSync, chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = realpathSync(mkdtempSync(join(tmpdir(), 'node-update-test-')))
const T = (...a) => ['-c', 'user.name=Test', '-c', 'user.email=test@test.invalid', ...a]
const git = (cwd, ...a) => {
  const r = spawnSync('git', a, { cwd, encoding: 'utf8', windowsHide: true, maxBuffer: 256 * 1024 * 1024 })
  if (r.status !== 0) throw new Error(`git ${a.join(' ')} in ${cwd}: ${r.stderr}`)
  return r.stdout.trim()
}
let passed = 0
const t = (name, fn) => { fn(); passed += 1; console.log(`  ✓ ${name}`) }

// a person with nobody's identity: an empty home, no global or system config
const home = join(base, 'home'); mkdirSync(home)
const bin = join(base, 'bin'); mkdirSync(bin)
writeFileSync(join(bin, 'npm'), '#!/bin/sh\necho "test: npm $* stopped by the test"\nexit 1\n'); chmodSync(join(bin, 'npm'), 0o755)
writeFileSync(join(bin, 'npm.cmd'), '@echo test: npm stopped by the test\r\n@exit /b 1\r\n')
writeFileSync(join(home, '.gitconfig-empty'), '')
const env = {}
for (const [k, v] of Object.entries(process.env)) if (!/^(GIT_|CLAUDECODE|NEXT_|__NEXT|FRACTERA_)/.test(k)) env[k] = v
Object.assign(env, { HOME: home, USERPROFILE: home, XDG_CONFIG_HOME: home, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: join(home, '.gitconfig-empty'), FRACTERA_NO_WAKE: '1', PATH: `${bin}${delimiter}${process.env.PATH}` })

try {
  // the fork: this commit's files as one commit (independent of the checkout's depth)
  const work = join(base, 'forkwork'); mkdirSync(work)
  const tar = spawnSync('git', ['-c', 'core.autocrlf=false', 'archive', '--format=tar', 'HEAD'], { cwd: REPO, maxBuffer: 512 * 1024 * 1024 })
  assert.equal(tar.status, 0, String(tar.stderr))
  assert.equal(spawnSync('tar', ['-xf', '-'], { cwd: work, input: tar.stdout }).status, 0)
  git(work, 'init', '-q', '-b', 'main'); git(work, 'add', '-A'); git(work, ...T('commit', '-q', '-m', 'base'))
  const BASE = git(work, 'rev-parse', 'HEAD')
  const bare = join(base, 'fork.git')
  git(base, 'clone', '-q', '--bare', work, bare)
  const target = (msg, change) => {
    git(work, 'reset', '-q', '--hard', BASE); change(work)
    git(work, ...T('commit', '-q', '-am', msg)); git(work, 'push', '-q', '-f', bare, 'HEAD:main')
    return git(work, 'rev-parse', '--short=8', 'HEAD')
  }
  const edit = (dir, file, from, to) => { const p = join(dir, file); const s = readFileSync(p, 'utf8'); assert.ok(s.includes(from), `${file} has «${from}»`); writeFileSync(p, s.replace(from, to)) }
  const node = (name, own) => {
    const dir = join(base, name)
    git(base, 'clone', '-q', bare, dir); git(dir, 'reset', '-q', '--hard', BASE); git(dir, 'config', 'user.useConfigOnly', 'true')
    mkdirSync(join(dir, 'logs'), { recursive: true }); writeFileSync(join(dir, 'logs', 'origin.json'), '{"verdict":"fork"}\n')
    if (own) own(dir); else appendFileSync(join(dir, 'development-docs', 'development-steps', 'current-steps.md'), '\nThe node itself, written at install.\n')
    git(dir, ...T('commit', '-q', '-am', 'the node own commit (as every install makes one)'))
    return dir
  }
  const run = (dir, script, ...args) => spawnSync(process.execPath, [join(dir, 'scripts', script), ...args], { cwd: dir, env, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 })
  const state = (dir) => JSON.parse(readFileSync(join(dir, 'data', 'node', 'node-update.json'), 'utf8'))
  const worktrees = (dir) => git(dir, 'worktree', 'list').split('\n').filter(Boolean).length
  const copies = () => new Set(readdirSync(realpathSync(tmpdir())).filter((f) => /^fractera-(update|dry)-/.test(f)))
  const before = copies()
  const ours = () => [...copies()].filter((f) => !before.has(f)).length

  const canary = target('canary', (w) => edit(w, 'scripts/node-update.mjs', "stage('check', 'проверка')", "stage('check', 'проверка'); say('CANARY-TARGET-UPDATER')"))
  t('(a) stage 0: the target\'s own updater runs, its merge is the machine\'s, the ledger is written, no worktree is left', () => {
    const dir = node('a')
    const r = run(dir, 'node-update-stage0.mjs')
    assert.match(r.stdout, new RegExp(`stage 0: the update is run by the target ${canary}`))
    assert.match(r.stdout, /CANARY-TARGET-UPDATER/)
    const s = state(dir)
    assert.equal(s.updater, canary); assert.equal(s.stage, 'guards', `stopped by the fake npm after the merge: ${s.reason}`)
    const merge = git(dir, 'reflog', '--format=%H %gs').split('\n').find((l) => / merge origin\/main/.test(l))?.split(' ')[0]
    assert.ok(merge, 'the merge happened')
    assert.equal(git(dir, 'log', '-1', '--format=%an <%ae> / %cn <%ce>', merge), 'Fractera node <node@fractera.invalid> / Fractera node <node@fractera.invalid>')
    const ledger = JSON.parse(readFileSync(join(dir, 'data', 'node', 'migrations.json'), 'utf8'))
    assert.ok(ledger.applied.some((m) => m.id === '741-2-place-record' && m.by === 'update' && m.result === 'done'))
    assert.equal(worktrees(dir), 1)
  })
  t('(b) negative: the node\'s own updater run directly prints no canary', () => {
    const dir = node('b')
    const r = run(dir, 'node-update.mjs')
    assert.doesNotMatch(r.stdout, /CANARY-TARGET-UPDATER/); assert.match(r.stdout, /обновляет: сам узел/)
  })

  target('the target changes a serve.mjs line', (w) => edit(w, 'scripts/serve.mjs', 'Собираю сайт заново', 'Собираю сайт заново (the target words)'))
  t('(c) a collision: --preflight names the file and writes nothing; the real update is refused at «preflight», the node untouched', () => {
    const dir = node('c', (d) => edit(d, 'scripts/serve.mjs', 'Собираю сайт заново', 'Собираю сайт заново (the node own words)'))
    const head = git(dir, 'rev-parse', 'HEAD')
    const pre = run(dir, 'node-update-stage0.mjs', '--preflight')
    const line = pre.stdout.split('\n').find((l) => l.startsWith('===NODE_UPDATE_PREFLIGHT=== '))
    assert.ok(line, pre.stdout + pre.stderr)
    const v = JSON.parse(line.slice('===NODE_UPDATE_PREFLIGHT=== '.length))
    assert.equal(v.ok, false); assert.deepEqual(v.conflicts, ['scripts/serve.mjs'])
    assert.equal(existsSync(join(dir, 'data', 'node', 'node-update.json')), false, 'the preflight writes no state')
    run(dir, 'node-update-stage0.mjs')
    const s = state(dir)
    assert.equal(s.state, 'refused'); assert.equal(s.stage, 'preflight'); assert.deepEqual(s.conflicts, ['scripts/serve.mjs'])
    assert.equal(existsSync(join(dir, 'logs', 'node-update')), false, 'no backup was made')
    assert.equal(git(dir, 'rev-parse', 'HEAD'), head); assert.equal(git(dir, 'status', '--porcelain'), '')
  })

  target('a target without the handoff mark', (w) => edit(w, 'scripts/node-update.mjs', '// @handoff v1', '// (the handoff mark removed)'))
  t('(d) a target without «// @handoff v1»: the node\'s own updater runs, said in one line', () => {
    const r = run(node('d'), 'node-update-stage0.mjs')
    assert.match(r.stdout, /this node's own updater \(the target has no @handoff v1\)/)
  })
  t('no temporary copy of this test run is left behind', () => assert.equal(ours(), 0))
} finally {
  rmSync(base, { recursive: true, force: true })
}
console.log(`${passed} passed`)
