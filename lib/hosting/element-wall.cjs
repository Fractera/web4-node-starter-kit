// THE WALL BETWEEN ELEMENTS, FROM THE NODE'S SIDE (node step 811-3). On a dedicated server every custom element (registry kind `user` —
// root among them: an ordinary custom element, CLAUDE.md §3) has its own Linux user `fe-<id>`; the root helper
// `/usr/local/sbin/fractera-element` (scripts/dedicated-server/fractera-element.sh, 811-2) makes and removes it. Native elements (kind
// `core`) stay the node's: they serve the whole project and have no people of their own.
// 🔒 WHEN THE WALL IS ON: the helper is installed AND its /etc/fractera/node.env names THIS node's folder — a physical fact, never the
// address or a flag in data/ (prepare.sh installs it on a server only; a home computer has one person, the owner, Telegram 76).
// A server launched before 811 has no helper: nothing here acts there until its update runs prepare.sh again.
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync, execFile } = require('node:child_process')

const HELPER = '/usr/local/sbin/fractera-element'
const NODE_ENV = '/etc/fractera/node.env'

/** @param {string} root the node's folder */
function wallOn(root, opts = {}) {
  const { helper = HELPER, nodeEnv = NODE_ENV } = opts
  if (process.platform !== 'linux' && !opts.anyPlatform) return false
  if (!fs.existsSync(helper)) return false
  try {
    const dir = /^NODE_DIR=(.*)$/m.exec(fs.readFileSync(nodeEnv, 'utf8'))?.[1]?.trim()
    return !!dir && fs.realpathSync(dir) === fs.realpathSync(root)
  } catch { return false }
}

/** Does this registry entry get its own user? Custom elements only. */
const walled = (entry) => entry?.kind === 'user'

/** The element's folder as the helper wants it: WEB4-ITEMS/<kind>/<address>, relative to the node. */
function folderOf(root, dir) {
  const rel = path.relative(root, dir).split(path.sep).join('/')
  return /^WEB4-ITEMS\/[a-z0-9-]+\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(rel) ? rel : null
}

// `opts.prefix` — how the helper is called: `sudo -n` on a server; the test calls a fake helper directly (['env']).
const prefixOf = (opts) => opts.prefix || ['/usr/bin/sudo', '-n']

function helperRun(args, opts = {}) {
  const [cmd, ...pre] = prefixOf(opts)
  const r = spawnSync(cmd, [...pre, opts.helper || HELPER, ...args], { encoding: 'utf8', timeout: 600_000 })
  const out = `${r.stdout || ''}${r.stderr || ''}`.trim()
  return { ok: r.status === 0, out, status: r.status }
}

/**
 * The element's own user and its ACLs (idempotent: a second call only re-checks the two top folders).
 * @returns {{ ok: boolean, skipped?: string, out?: string }}
 */
function ensureElementUser(root, entry, dir, opts = {}) {
  if (!walled(entry)) return { ok: true, skipped: 'native' }
  if (!wallOn(root, opts)) return { ok: true, skipped: 'no-wall' }
  const folder = folderOf(root, dir)
  if (!folder) return { ok: false, out: `the element folder ${dir} is not WEB4-ITEMS/<kind>/<address>` }
  return helperRun(['add', entry.id, folder], opts)
}

/** The element's user goes (its processes killed, its files given back to the node) — before its folder is deleted. */
function removeElementUser(root, id, opts = {}) {
  if (!wallOn(root, opts)) return { ok: true, skipped: 'no-wall' }
  return helperRun(['remove', id], opts)
}

/** The same, without blocking — for a door inside the core's server (the delete door, 325-6: nothing blocking longer than a moment). */
function removeElementUserAsync(root, id, opts = {}) {
  if (!wallOn(root, opts)) return Promise.resolve({ ok: true, skipped: 'no-wall' })
  return new Promise((resolve) => {
    const [cmd, ...pre] = prefixOf(opts)
    execFile(cmd, [...pre, opts.helper || HELPER, 'remove', id], { encoding: 'utf8', timeout: 600_000 }, (err, stdout, stderr) =>
      resolve({ ok: !err, out: `${stdout || ''}${stderr || ''}`.trim() }))
  })
}

/** Does fe-<id> exist? /etc/passwd is readable by everyone; root's records (/etc/fractera/elements, 0700) are not. */
function userExists(id, { passwd = '/etc/passwd' } = {}) {
  try { return fs.readFileSync(passwd, 'utf8').split('\n').some((l) => l.startsWith(`fe-${id}:`)) } catch { return false }
}

const KEY_OK = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/
const KEY_REFUSED = /^(LD_.*|BASH_ENV|ENV|BASH_FUNC_.*|PATH|HOME|USER|LOGNAME|SHELL|NODE_OPTIONS)$/

/** The walled registry entry whose folder holds `cwd` (with that folder), or null. */
function walledEntryAt(root, cwd) {
  let registry
  try { registry = JSON.parse(fs.readFileSync(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8')) } catch { return null }
  const { itemDirAt } = require('../web4-items/paths.cjs')
  const here = path.resolve(cwd)
  for (const e of registry.services || []) {
    if (!walled(e)) continue
    const dir = path.resolve(itemDirAt(root, e.id, e.kind))
    if (here === dir || here.startsWith(dir + path.sep)) return { entry: e, dir }
  }
  return null
}

// 839-3 (the server's main agent, 2026-11-22 18:30, the core build failed: «reading dir …/data/services/etuf1/claude/projects — Permission
// denied»; the owner: «системно, а не файл за файлом»). `claude` makes its folders 0700 as fe-<id>, which sets the ACL mask to `---`: the node
// may no longer list its own element's journal folders, so the core's build (Turbopack walks data/services through every dynamic path) and
// the node's readers of a conversation («Продолжить разговор», the context meter) fail on every element after its first session. Before
// each core build (and wherever the node needs to read a journal) each walled element opens, AS ITSELF, its Claude folders to the node's
// group: every folder g+rwx (listing), and the journals' files under projects/ and sessions/ g+r. Its sign-in files (.credentials.json,
// .claude.json) stay closed — the node reads them by existence only. Idempotent; a missing folder is nothing to do.
const OPEN_DIRS = ['-type', 'd', '!', '-perm', '-g=rwx', '-exec', '/bin/chmod', 'g+rwx', '{}', '+']
function openClaudeFolders(root, opts = {}) {
  if (!wallOn(root, opts)) return { ok: true, skipped: 'no-wall', opened: [] }
  let registry
  try { registry = JSON.parse(fs.readFileSync(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8')) } catch { return { ok: true, opened: [] } }
  const opened = []
  const failed = []
  for (const e of registry.services || []) {
    if (!walled(e) || !userExists(e.id, opts)) continue
    const dir = path.join(root, 'data', 'services', e.id, 'claude')
    if (!fs.existsSync(dir)) continue
    const a = helperRun(['run', e.id, '--', '/usr/bin/find', dir, ...OPEN_DIRS], opts)
    const journals = ['projects', 'sessions'].map((x) => path.join(dir, x)).filter((x) => fs.existsSync(x))
    const b = journals.length ? helperRun(['run', e.id, '--', '/usr/bin/find', ...journals, '-type', 'f', '!', '-perm', '-g=r', '-exec', '/bin/chmod', 'g+r', '{}', '+'], opts) : { ok: true }
    if (a.ok && b.ok) opened.push(e.id)
    else failed.push(`${e.id}: ${(a.ok ? b.out : a.out) || 'helper refused'}`)
  }
  return { ok: failed.length === 0, opened, failed }
}

/** A program by its name, the way the element user's PATH of the helper finds it (it never sees the node user's own folders). */
function binOf(cmd) {
  if (cmd.includes('/')) return cmd
  for (const d of ['/usr/local/lib/fractera/bin', '/usr/local/bin', '/usr/bin', '/bin']) if (fs.existsSync(path.join(d, cmd))) return path.join(d, cmd)
  return cmd
}

/**
 * 811-4: the node runs the element's code — `npm ci` with its install scripts, its build, a warm-up or preview of its server: inside a
 * walled element's folder the command becomes the helper's `run` as fe-<id>, with ONLY the environment given here (never the node's
 * own: it holds keys). Elsewhere the command is returned as it was.
 * @returns {{ cmd: string, args: string[], wrapped?: string }}
 */
function asElement(root, cwd, cmd, args, env = {}, opts = {}) {
  if (!wallOn(root, opts)) return { cmd, args }
  const at = walledEntryAt(root, cwd)
  if (!at || !userExists(at.entry.id, opts)) return { cmd, args }
  const [sudo, ...pre] = prefixOf(opts)
  return { cmd: sudo, args: [...pre, opts.helper || HELPER, 'run', at.entry.id, ...inOf(at, cwd), ...kvOf(env), '--', binOf(cmd), ...args], wrapped: at.entry.id }
}

const kvOf = (env) => Object.entries(env).filter(([k, v]) => v != null && KEY_OK.test(k) && !KEY_REFUSED.test(k)).map(([k, v]) => `${k}=${v}`)
const inOf = (at, cwd) => { const rel = path.relative(at.dir, path.resolve(cwd)).split(path.sep).join('/'); return rel ? ['--in', rel] : [] }

/**
 * 811-4: how pm2 holds a walled element's server — the shim (scripts/dedicated-server/element-shim.sh, the node's own bash) starts it as
 * the unit fractera-el-<id>-serve through the helper, as fe-<id>, with the node's order (port, host, mode) as its only environment; null
 * where the element runs as the node's user (home, natives, a server before 811, a user not made yet).
 * @param {{ id: string, kind?: string }} entry @param {{ start: { args: string[], cwd?: string }, port: number }} stamp
 */
function serveApp(root, entry, stamp, opts = {}) {
  if (!walled(entry) || !wallOn(root, opts) || !userExists(entry.id, opts)) return null
  const at = walledEntryAt(root, stamp.start.cwd || path.join(root, 'WEB4-ITEMS'))
  const sub = at && at.entry.id === entry.id ? inOf(at, stamp.start.cwd) : []
  return {
    script: path.join(root, 'scripts', 'dedicated-server', 'element-shim.sh'),
    interpreter: '/bin/bash',
    args: [entry.id, ...sub, ...kvOf({ PORT: String(stamp.port), HOSTNAME: '127.0.0.1', NODE_ENV: 'production' }), '--', opts.node || process.execPath, ...stamp.start.args],
  }
}

/**
 * 811-4: a LONG program of the element started by the node (its preview, a warm-up) — a unit fractera-el-<id>-<tag> as fe-<id>; the
 * start returns at once, `stop` ends the whole group. null where the folder is no walled element's (the caller spawns as before).
 * @returns {{ id: string, start: { cmd: string, args: string[] }, stop: { cmd: string, args: string[] }, unit: string } | null}
 */
function unitOf(root, cwd, tag, cmd, args, env = {}, opts = {}) {
  if (!wallOn(root, opts)) return null
  const at = walledEntryAt(root, cwd)
  if (!at || !userExists(at.entry.id, opts)) return null
  const [sudo, ...pre] = prefixOf(opts)
  const helper = opts.helper || HELPER
  return {
    id: at.entry.id,
    unit: `fractera-el-${at.entry.id}-${tag}`,
    start: { cmd: sudo, args: [...pre, helper, 'unit-start', at.entry.id, '--unit', tag, ...inOf(at, cwd), ...kvOf(env), '--', binOf(cmd), ...args] },
    stop: { cmd: sudo, args: [...pre, helper, 'unit-stop', at.entry.id, '--unit', tag] },
  }
}

/** Is that unit running? `systemctl is-active` needs no privileges. */
const unitActive = (unit) => spawnSync('systemctl', ['is-active', '--quiet', unit]).status === 0

/** 811-4b: the folder of the node's git shim, to put first on the node's PATH — only where the wall is and the shim is installed. */
const NODE_BIN = '/usr/local/lib/fractera/node-bin'
function nodeBinPath(root, opts = {}) {
  const dir = opts.nodeBin || NODE_BIN
  return wallOn(root, opts) && fs.existsSync(path.join(dir, 'git')) ? dir : null
}

module.exports = { openClaudeFolders, nodeBinPath, asElement, walledEntryAt, unitOf, unitActive, HELPER, wallOn, walled, folderOf, ensureElementUser, removeElementUser, removeElementUserAsync, userExists, serveApp }
