// 654-6: THE ELEMENT'S OWN KEY — the core's copy of the stores' function (data, storage, vectors, graph, memory keep it word for word in
// their `element-key.mjs`). The installer writes `ELEMENT_KEY=<id>.<mac>` into a custom element whose `.env.example` declares
// `# kind: element-key`; the mac is an HMAC-SHA256 of the node's DATA_SECRET over the element id. The same test vector in every copy
// (`scripts/check-element-key.mjs`): one fixed secret and id give one fixed key everywhere, or a store refuses every element.
// 🔒 THE LABEL IS VERSIONED (`v1`): a new derivation means a new label, never an old key read under new rules.
const { createHmac, timingSafeEqual } = require('crypto')

const LABEL = 'fractera-element-key:v1:'
// The registry's element id (`lib/web4-items/paths.cjs`, a DNS label): no dot, so `<id>.<mac>` splits at its first dot.
const ELEMENT_ID = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

const isElementId = (id) => typeof id === 'string' && ELEMENT_ID.test(id)
const macOf = (secret, id) => createHmac('sha256', secret).update(LABEL + id).digest('base64url')

/** The element's key, `<id>.<mac>`, or null for a bad id or an empty secret. */
function elementKeyOf(id, secret) {
  if (!secret || !isElementId(id)) return null
  return `${id}.${macOf(secret, id)}`
}

/** The element a presented key belongs to, or null. */
function elementOf(presented, secret) {
  if (!secret || typeof presented !== 'string') return null
  const dot = presented.indexOf('.')
  if (dot <= 0) return null
  const id = presented.slice(0, dot)
  if (!isElementId(id)) return null
  const given = Buffer.from(presented.slice(dot + 1))
  const expected = Buffer.from(macOf(secret, id))
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  return id
}

// 818-7d (817 H6): THE PAIR KEY — what an element presents at a NEIGHBOUR's door, the API two agents agreed over i2i. Only the core can
// mint it, because only the core can make the callee's own key: `<caller>.<HMAC(the callee's key, PAIR_LABEL + caller)>`. The callee
// checks it offline with its own key (SETTINGS_SECRET of a custom element, 818-7c) and learns who calls; neither side ever sees the
// other's key, and a pair key opens nothing else — not the core, not the stores, not a third element. The same label and test vector
// live in the templates' copy (`lib/node-key.ts` of the custom and root templates; `scripts/check-element-key.mjs`).
const PAIR_LABEL = 'fractera-pair-key:v1:'
const pairMacOf = (calleeKey, caller) => createHmac('sha256', calleeKey).update(PAIR_LABEL + caller).digest('base64url')

/** The pair key for `caller` at the doors of the element whose own key is `calleeKey`, or null. */
function pairKeyOf(caller, calleeKey) {
  if (!calleeKey || !isElementId(caller)) return null
  return `${caller}.${pairMacOf(calleeKey, caller)}`
}

/** The neighbour a presented pair key names, checked with the callee's own key; null for anything else. */
function pairCallerOf(presented, ownKey) {
  if (!ownKey || typeof presented !== 'string') return null
  const dot = presented.indexOf('.')
  if (dot <= 0) return null
  const id = presented.slice(0, dot)
  if (!isElementId(id)) return null
  const given = Buffer.from(presented.slice(dot + 1))
  const expected = Buffer.from(pairMacOf(ownKey, id))
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  return id
}

module.exports = { elementKeyOf, elementOf, isElementId, pairKeyOf, pairCallerOf }
