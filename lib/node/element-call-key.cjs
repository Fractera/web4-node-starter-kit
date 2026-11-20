// THE KEY THE CORE PRESENTS AT AN ELEMENT'S DOORS (node step 818-7b, the red team's H6). Since 818-7c a custom element (registry kind
// `user` — root among them) holds only its own key `<id>.<mac>` (lib/element-key.cjs) in its SETTINGS_SECRET, and its doors —
// `/api/settings/*`, the settings signal, its A2A card and task doors — compare with it; a native element holds the node key. The core
// holds both secrets and makes either: an element's key from DATA_SECRET, never stored.
// 🔒 THE NODE KEY NEVER GOES TO A CUSTOM ELEMENT — not even after a 401: a hostile element would answer 401 to be given it. An address
// that is not a registered element on this machine's loopback gets no key at all.
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const { elementKeyOf, isElementId, pairKeyOf } = require('../element-key.cjs')

function readEnv(file) {
  const out = {}
  try {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line)
      if (m) out[m[1]] = m[2].trim()
    }
  } catch { /* no file — no secrets from it */ }
  return out
}

/** The core's two secrets: from its environment, else from its `.env.local` — read by code, never printed. */
function secretsOf(root) {
  const file = readEnv(path.join(root, '.env.local'))
  return {
    SETTINGS_SECRET: String(process.env.SETTINGS_SECRET || file.SETTINGS_SECRET || '').trim(),
    DATA_SECRET: String(process.env.DATA_SECRET || file.DATA_SECRET || '').trim(),
  }
}

function services(root) {
  try {
    const reg = JSON.parse(fs.readFileSync(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8'))
    return Array.isArray(reg.services) ? reg.services : []
  } catch { return [] }
}

/** A custom element — the same test as the wall's (`lib/hosting/element-wall.cjs`: registry kind `user`). */
const isCustom = (entry) => entry?.kind === 'user'

/** The key for the doors of element `id`: its own key when custom, the node key when native; '' for an unknown id or a missing secret. */
function keyFor(id, { root = process.cwd(), env } = {}) {
  const entry = services(root).find((s) => s.id === id)
  if (!entry) return ''
  const sec = env ?? secretsOf(root)
  return isCustom(entry) ? (elementKeyOf(id, sec.DATA_SECRET) ?? '') : String(sec.SETTINGS_SECRET ?? '')
}

/** A door on this machine's loopback → the element listening on its port and that element's key; null for any other address. */
function keyForUrl(url, { root = process.cwd(), env } = {}) {
  let u
  try { u = new URL(url) } catch { return null }
  if (u.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(u.hostname) || !u.port) return null
  const entry = services(root).find((s) => Number(s.port) === Number(u.port))
  if (!entry) return null
  const key = keyFor(entry.id, { root, env })
  return key ? { id: entry.id, key } : null
}

/** The registry entry of element `id`, or null. */
const entryOf = (id, { root = process.cwd() } = {}) => services(root).find((s) => s.id === id) ?? null

// 818-7d: WHAT A CALLER PRESENTS AT A NEIGHBOUR'S DOORS — the answer of the core's door `/api/node/pair-key?to=<id>`, which every
// template's `lib/neighbour.mjs` asks before it calls a neighbour on the loopback. An element calling a custom element — the pair key
// (`<caller>.<HMAC(the callee's key, …)>`: it names the caller to that callee only); the node (the core, a native element) calling a
// custom element — that element's own key (a native holds DATA_SECRET and could make it itself); anyone calling a native — `key: null`,
// the caller presents its own key (a native's doors know the node key and, from native template v0.1.79, an element's own key). Never
// the node key, never a key for the caller itself. Scale: nothing is stored — 980 custom elements cost the core no table, only an HMAC
// per request (the owner, Telegram 291: «у нас может быть до 980 кастомных элементов»).
function keyToCall(caller, to, { root = process.cwd(), env } = {}) {
  const me = caller && typeof caller.element === 'string' ? caller.element : null
  if (!me && !(caller && caller.node === true)) return { status: 401, body: { ok: false, reason: 'send your own key in the X-Node-Key header' } }
  if (!isElementId(to) || to === me) return { status: 400, body: { ok: false, reason: 'to: the id of another element of this node' } }
  const entry = entryOf(to, { root })
  if (!entry || !Number.isInteger(entry.port)) return { status: 404, body: { ok: false, reason: `no element «${to}» on this node` } }
  if (!isCustom(entry)) return { status: 200, body: { ok: true, to, port: entry.port, key: null } }
  const own = keyFor(to, { root, env })
  const key = me ? pairKeyOf(me, own) : own
  if (!key) return { status: 503, body: { ok: false, reason: 'the node has no data secret to make the key' } }
  return { status: 200, body: { ok: true, to, port: entry.port, key } }
}

module.exports = { keyFor, keyForUrl, keyToCall, isCustom, secretsOf, entryOf }
