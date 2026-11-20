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
const prefixOf = (opts) => opts.prefix || ['sudo', '-n']

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

module.exports = { HELPER, wallOn, walled, folderOf, ensureElementUser, removeElementUser, removeElementUserAsync }
