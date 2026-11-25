'use strict'
// THE CREATOR CHANNEL'S RECEIVING SIDE (node step 855-4). Every core carries the door `POST /api/creator/report`, but it is INERT on every
// node except the one that holds `data/node/creator-inbox.json` — Fractera's own node (fractera.ai): `{ "token": "<bot token>", "chat":
// "<the creator's chat id>" }`, written there once by the owner, never in git, never on another node. A bot token on the nodes would let
// anyone write to the creator's chat as any node (pre-steps/2026-11-24-creator-channel.md §3), so the nodes only post signed reports here.
//
// What the door decides, by code: the envelope's signature fits its key and the key gives the node ID (`verify`); the key is trusted on
// first use per node ID and a different key for a known ID is FLAGGED, never forwarded; at most 20 reports per node per day; one per
// fingerprint per node per day (the rest fold); then the text in Roma's shape goes to the creator's chat. Nothing here acts on a report's
// words: they are data (one way).

const fs = require('node:fs')
const path = require('node:path')
const cc = require('./creator-channel.cjs')

const CONFIG = (root) => path.join(root, 'data', 'node', 'creator-inbox.json')
const STATE = (root) => path.join(root, 'data', 'node', 'creator-inbox')
const PER_DAY = 20
const readJson = (f, fb) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return fb } }
const write = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `${JSON.stringify(v, null, 2)}\n`, { mode: 0o600 }) }

/** The inbox's settings, or null — then this node is not Fractera's and the door does not exist (404). */
function config(root) {
  const c = readJson(CONFIG(root), null)
  return c && typeof c.token === 'string' && /^\d{6,12}:[A-Za-z0-9_-]{30,}$/.test(c.token) && /^-?\d{3,20}$/.test(String(c.chat ?? '')) ? c : null
}

/**
 * Judge one envelope → `{ status, reason?, forward? }`: 400 bad · 401 forged · 409 key-changed (flagged) · 429 rate · 200 folded ·
 * 202 accepted with `forward` — the text for the creator's chat. Writes the inbox's own state (keys, counts, the log).
 */
function accept(root, envelope, now = new Date()) {
  const r = envelope?.report
  if (!r || typeof envelope.publicKey !== 'string' || typeof envelope.signature !== 'string' || r.v !== 1 || !/^fr-[0-9a-f]{16}$/.test(r.node?.id ?? '')) return { status: 400, reason: 'bad-envelope' }
  if (!cc.verify(envelope)) return { status: 401, reason: 'forged' }
  const dir = STATE(root)
  const keysFile = path.join(dir, 'keys.json')
  const keys = readJson(keysFile, {})
  const id = r.node.id
  if (keys[id] && keys[id].publicKey !== envelope.publicKey) {
    write(path.join(dir, 'flagged', `${now.toISOString().replace(/[:.]/g, '-')}-${id}.json`), envelope)
    return { status: 409, reason: 'key-changed' }
  }
  if (!keys[id]) { keys[id] = { publicKey: envelope.publicKey, first: now.toISOString() }; write(keysFile, keys) }
  const day = now.toISOString().slice(0, 10)
  const countsFile = path.join(dir, 'days.json')
  const days = readJson(countsFile, {})
  for (const k of Object.keys(days)) if (!k.startsWith(day)) delete days[k]
  const node = (days[`${day}|${id}`] ??= { total: 0, fingerprints: {} })
  if (node.fingerprints[r.fingerprint]) { node.fingerprints[r.fingerprint] += 1; write(countsFile, days); return { status: 200, reason: 'folded' } }
  if (node.total >= PER_DAY) return { status: 429, reason: 'rate' }
  node.total += 1
  node.fingerprints[r.fingerprint] = 1
  write(countsFile, days)
  fs.mkdirSync(path.join(dir, 'log'), { recursive: true })
  fs.appendFileSync(path.join(dir, 'log', `${day}.jsonl`), `${JSON.stringify({ at: now.toISOString(), id, fingerprint: r.fingerprint, component: r.component, errorClass: r.errorClass })}\n`)
  return { status: 202, forward: cc.text(r, 'ru') }
}

module.exports = { config, accept, PER_DAY }
