// AN ELEMENT TAKES ITS GITHUB COMMITS BY A BUTTON (node step 842). The owner, 2026-11-23 (Telegram 1154): «такой же баннер который
// существует на главной странице которая анализирует наличие доступных версий … не очень логично действует только через искусственный
// интеллект»; 1157: «чтобы не сломать то что уже работает … любое другое обновление не будет ломать эту стену».
//
// 🔒 THE WALL (skill server-wall, 811-6): on a dedicated server a custom element's folder is its own user's (`fe-<id>`). Asking GitHub
// writes only `.git` — done as the node's user, exactly like the push that already works behind the wall. Moving the working tree
// writes the element's files — done AS THE ELEMENT through the wall's helper (`asElement` → `fractera-element run`), never as the node.
// 🔒 `-c safe.directory=<dir>` on every call: the folder belongs to the node's user, the merge runs as fe-<id> (811-6 «dubious ownership»).
// 🔒 THE TOKEN ONLY AS A ONE-TIME URL, never in `git remote`; git's output never leaves this module — machine words only.
// 🔒 ITS OWN REF `refs/remotes/github/main`: an element born from a template keeps `origin` for the template; the two never mix.
// 🔒 SIGNED AS THE MACHINE (D38) though a fast-forward writes no commit of its own.
// 🔒 FAST-FORWARD ONLY: uncommitted work or a history of its own on the element — refused with the reason, nothing touched.
import { spawnSync } from 'node:child_process'
import wall from '../hosting/element-wall.cjs'
import { machineArgs } from '../deploy/git-identity.mjs'

export const REF = 'refs/remotes/github/main'

/** What the button may do: nothing new, take, or refuse — and why. Pure. */
export function pullVerdict({ behind, ahead, dirty }) {
  if (!(behind > 0)) return 'none'
  if (dirty > 0) return 'dirty'
  if (ahead > 0) return 'diverged'
  return 'ready'
}

function nodeGit(dir, args) {
  const r = spawnSync('git', ['-C', dir, '-c', 'credential.helper=', '-c', `safe.directory=${dir}`, ...args], {
    encoding: 'utf8', windowsHide: true, timeout: 120_000, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  })
  return { rc: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

/** Ask GitHub: its `main` into the element's own ref. `url` carries the token; the answer is a machine word. */
export function fetchRemote(dir, url, git = nodeGit) {
  const r = git(dir, ['fetch', '--quiet', '--no-tags', url, `+refs/heads/main:${REF}`])
  if (r.rc === 0) return { ok: true }
  const error = /Authentication failed|403|could not read Username/i.test(r.out) ? 'auth-failed'
    : /not found|couldn't find remote ref/i.test(r.out) ? 'repo-not-found' : 'fetch-failed'
  return { ok: false, error }
}

/** How far the element and GitHub are apart, by the last fetch; `fetched: false` — GitHub was never asked here. */
export function counts(dir, git = nodeGit) {
  const remoteHead = git(dir, ['rev-parse', '--short', '--verify', '--quiet', REF])
  const head = git(dir, ['rev-parse', '--short', 'HEAD']).out.trim() || null
  if (remoteHead.rc !== 0) return { fetched: false, ahead: 0, behind: 0, head, remoteHead: null }
  const lr = git(dir, ['rev-list', '--left-right', '--count', `HEAD...${REF}`]).out.trim().split(/\s+/).map(Number)
  return { fetched: true, ahead: lr[0] || 0, behind: lr[1] || 0, head, remoteHead: remoteHead.out.trim() }
}

/** The command that moves the working tree — wrapped as the element behind the wall, plain everywhere else. */
export function mergeCommand(root, dir, opts = {}) {
  return (opts.asElement || wall.asElement)(root, dir, 'git', ['-c', `safe.directory=${dir}`, ...machineArgs(), 'merge', '--ff-only', '--quiet', REF], {}, opts.wall || {})
}

/** Take GitHub's commits: fast-forward only, as the element. `run` — test hook. */
export function fastForward(root, dir, opts = {}) {
  const c = mergeCommand(root, dir, opts)
  const run = opts.run || ((cmd, args) => spawnSync(cmd, args, { cwd: dir, encoding: 'utf8', windowsHide: true, timeout: 180_000, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } }))
  const r = run(c.cmd, c.args)
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`
  if ((r.status ?? 1) !== 0) return { ok: false, error: /Not possible to fast-forward|diverg/i.test(out) ? 'diverged' : /would be overwritten|local changes/i.test(out) ? 'dirty' : 'pull-failed', wrapped: c.wrapped ?? null }
  return { ok: true, wrapped: c.wrapped ?? null }
}

