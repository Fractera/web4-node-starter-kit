// THE KEY THE CORE PRESENTS AT AN ELEMENT'S DOORS (node step 818-7b, the red team's H6). Since 818-7c a custom element (registry kind
// `user` — root among them) holds only its own key `<id>.<mac>` (lib/element-key.cjs) in its SETTINGS_SECRET, and its doors —
// `/api/settings/*`, the settings signal, its A2A card and task doors — compare with it; a native element holds the node key. The core
// holds both secrets and makes either: an element's key from DATA_SECRET, never stored.
// 🔒 THE NODE KEY NEVER GOES TO A CUSTOM ELEMENT — not even after a 401: a hostile element would answer 401 to be given it. An address
// that is not a registered element on this machine's loopback gets no key at all.
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const { elementKeyOf } = require('../element-key.cjs')

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

module.exports = { keyFor, keyForUrl, isCustom, secretsOf, entryOf }
