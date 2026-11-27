// THE NODE-SIGNED CALL TO THE FRACTERA STORE (core step 862-2; the standard: skill `marketplace`, references/store-contract-v1.md §0).
// Every call to the store is made by the core and signed with the node's identity of step 855 — the private key never leaves the core
// (`lib/node/creator-channel.cjs`). The envelope: { v: 2, body: { ...fields, node, at, nonce }, publicKey, signature }, where
// signature = Ed25519 over canonical(body). The store answers 401 bad-signature / node-key-mismatch / stale / replay, or 503
// replay-check-unavailable (v1.1). One caller per project: the client element «Маркетплейс» reaches the store only through the core.

import { createRequire } from 'node:module'
import { randomBytes } from 'node:crypto'

const require = createRequire(import.meta.url)
const channel = require('../node/creator-channel.cjs')

export const STORE_BASE = 'https://f2f-marketplace.fractera.ai'

/** A signed envelope for the store: the node's id and public key, the time, a one-time nonce, the fields of the door. */
export function storeEnvelope(root, fields, { now = new Date(), nonce = randomBytes(8).toString('hex') } = {}) {
  const { id, publicKey } = channel.identity(root)
  const body = { ...fields, node: id, at: now.toISOString(), nonce }
  return { v: 2, body, publicKey, signature: channel.sign(root, body) }
}

/** POST one door of the store with a fresh signed envelope → { status, body } (body null when it is not JSON). Never throws. */
export async function storeCall(root, door, fields, { base = process.env.FRACTERA_MARKET_URL || STORE_BASE, timeoutMs = 15000, envelope } = {}) {
  const sent = envelope ?? storeEnvelope(root, fields)
  try {
    const r = await fetch(`${base.replace(/\/+$/, '')}/api/marketplace/${door}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(sent),
      signal: AbortSignal.timeout(timeoutMs),
    })
    const body = await r.json().catch(() => null)
    return { status: r.status, body, envelope: sent }
  } catch (e) {
    return { status: 0, body: { error: String(e?.message ?? e).slice(0, 160) }, envelope: sent }
  }
}
