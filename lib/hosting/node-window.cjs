// THE NODE'S PUBLIC WINDOW FOR WALLED ELEMENTS (node step 818-8). The owner, 2026-11-20 (Telegram 349): «я нажимаю выход и попадаю на
// 127.0.0.1:24681 логин … Разве я не должен попадать на адрес авторизации Fractera?» — measured: on the server every custom element's
// /login and /logout led visitors to the loopback, and its ask-core, tell-core, need and cron notices said «the address of the core is
// unknown». The cause is the wall itself (811): an element's own Linux user cannot read the node's `logs/` (0750), yet every template
// finds the node through `NODE_DOMAIN_FILE` = <node>/logs/domain.json and the core through the `logs/runtime.json` beside it.
// 🔒 THE WINDOW: two files the node writes into `data/node-window/logs/` — the same names and the same place relative to each other, so
// the templates' own derivation (dirname(dirname(file)) → logs/runtime.json) works unchanged and no template is released. Only the
// fields the templates read, never anything else of the originals (a tunnel's credentials or a future secret never pass by accident):
// the zone and the names of the domain, the core's port and host. The walls open exactly these two files (element-readable.txt); the
// node writes them, an element only reads them. On a computer without the wall nothing is written and nothing changes.
const fs = require('node:fs')
const path = require('node:path')
const wall = require('./element-wall.cjs')

const DOMAIN_FIELDS = ['zone', 'zoneStatus', 'hostname', 'service', 'architectHostname', 'authHostname', 'authRouted', 'siteUrlWritten', 'via', 'activatedAt', 'tunnelName', 'tunnelId']
const RUNTIME_FIELDS = ['port', 'hostname']
const CORE_PORT = 24680

const windowDir = (root) => path.join(root, 'data', 'node-window', 'logs')

/** The domain file a registry entry's `NODE_DOMAIN_FILE` names: the window for a walled custom element, else the node's own. */
function domainFileFor(root, entry, opts = {}) {
  return wall.walled(entry) && wall.wallOn(root, opts) ? path.join(windowDir(root), 'domain.json') : path.join(root, 'logs', 'domain.json')
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
}

/** Only the named fields, each a plain string, number or boolean. */
function pick(src, fields) {
  const out = {}
  for (const k of fields) {
    const v = src?.[k]
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') out[k] = v
  }
  return out
}

/** Write one file of the window: a new file renamed over the old, 0644 — never through a link. */
function put(dir, name, data) {
  const file = path.join(dir, name)
  const tmp = path.join(dir, `.${name}.${process.pid}.tmp`)
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', { mode: 0o644 })
  fs.chmodSync(tmp, 0o644)
  fs.renameSync(tmp, file)
  return file
}

/**
 * Write the window from the node's own records. Both files always exist after it (the walls refuse a listed file that is missing):
 * no domain → `{}` (the templates read «no domain» and stay on the loopback, the right answer); the core not started yet → its fixed
 * port. `opts.force` writes on a computer without the wall too (the test).
 * @returns {{ ok: boolean, skipped?: string, files?: string[], reason?: string }}
 */
function writeNodeWindow(root, opts = {}) {
  if (!opts.force && !wall.wallOn(root, opts)) return { ok: true, skipped: 'no-wall' }
  try {
    const dir = windowDir(root)
    for (const d of [path.join(root, 'data', 'node-window'), dir]) {
      const st = fs.lstatSync(d, { throwIfNoEntry: false })
      if (st && !st.isDirectory()) return { ok: false, reason: `${d} is not a folder` }
      if (!st) fs.mkdirSync(d, { mode: 0o755 })
      fs.chmodSync(d, 0o755)
    }
    const domain = pick(readJson(path.join(root, 'logs', 'domain.json')), DOMAIN_FIELDS)
    const runtime = pick(readJson(path.join(root, 'logs', 'runtime.json')), RUNTIME_FIELDS)
    if (!Number.isInteger(runtime.port)) runtime.port = CORE_PORT
    if (typeof runtime.hostname !== 'string' || !/^[a-z0-9.:[\]-]+$/i.test(runtime.hostname)) runtime.hostname = 'localhost'
    return { ok: true, files: [put(dir, 'domain.json', domain), put(dir, 'runtime.json', runtime)] }
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) }
  }
}

module.exports = { domainFileFor, writeNodeWindow, windowDir, DOMAIN_FIELDS, RUNTIME_FIELDS }
