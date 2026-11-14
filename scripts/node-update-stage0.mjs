// STAGE 0 OF THE NODE UPDATE — FROZEN (node step 743-2, D43: changed only by the owner's word; seal: node-update-stage0.seal).
// The update is done by the version it updates to: this file only fetches the fork and hands the whole update to the TARGET's own
// `scripts/node-update.mjs`, run from a throwaway worktree OUTSIDE the project (ANTI-PATTERNS: code inside it is the core build's).
// ✗ 2026-11-14: a node ran its own old updater, so the 741-8 fix sat in the target and never ran; the test server rolled back.
// Contract v1: `node scripts/node-update-stage0.mjs [--root <node>] [--preflight]`; a target marked `// @handoff v1` gets
// `--root <node> [--preflight]`; a target without it (older than 743) — the node's own updater runs, said in one line.
import { spawnSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const at = args.indexOf('--root')
const ROOT = resolve(at >= 0 && args[at + 1] ? args[at + 1] : join(dirname(fileURLToPath(import.meta.url)), '..'))
const extra = args.filter((a, i) => a !== '--root' && i !== at + 1)
if (extra.some((a) => a !== '--preflight')) {
  console.error(`===NODE_UPDATE_REFUSED=== неизвестные аргументы: ${extra.join(' ')} — ничего не тронуто`)
  process.exit(2)
}
if (process.env.CLAUDECODE && !process.env.FRACTERA_BUILD_LOG) {
  console.error('===NODE_UPDATE_REFUSED=== запуск из сессии агента: сборка ядра остановит ядро, а с ним агента и это обновление. Запускать вне своего дерева: node scripts/spawn-free.mjs scripts/node-update-run.mjs; ничего не тронуто')
  process.exit(2)
}
const git = (...a) => spawnSync('git', ['-C', ROOT, ...a], { encoding: 'utf8', windowsHide: true })
const PREFIX = join(tmpdir(), 'fractera-update-')
// A worktree left by a killed run is removed first (only this node's, only ours).
for (const line of git('worktree', 'list', '--porcelain').stdout.split('\n')) {
  const p = line.startsWith('worktree ') ? line.slice(9).trim() : ''
  if (p && resolve(p).startsWith(PREFIX)) { git('worktree', 'remove', '--force', p); rmSync(p, { recursive: true, force: true }) }
}
git('worktree', 'prune')

let updater = join(ROOT, 'scripts', 'node-update.mjs')
let pass = extra // the node's own updater finds its root itself; an older one knows no --root
let wt = null
const target = git('fetch', '--quiet', 'origin').status === 0 ? git('rev-parse', 'origin/main').stdout.trim() : ''
if (target && /^\/\/ @handoff v1$/m.test(git('show', `${target}:scripts/node-update.mjs`).stdout)) {
  wt = `${PREFIX}${target.slice(0, 8)}`
  rmSync(wt, { recursive: true, force: true })
  if (git('worktree', 'add', '--quiet', '--detach', wt, target).status === 0) { updater = join(wt, 'scripts', 'node-update.mjs'); pass = ['--root', ROOT, ...extra] } else wt = null
}
console.log(`stage 0: the update is run by ${wt ? `the target ${target.slice(0, 8)}` : `this node's own updater${target ? ' (the target has no @handoff v1)' : ' (the fork was not fetched)'}`}`)
let code = 1
try {
  code = spawnSync(process.execPath, [updater, ...pass], { cwd: ROOT, stdio: 'inherit', env: process.env, windowsHide: true }).status ?? 1
} finally {
  if (wt) { git('worktree', 'remove', '--force', wt); rmSync(wt, { recursive: true, force: true }); git('worktree', 'prune') }
}
process.exit(code)
