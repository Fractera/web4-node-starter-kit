import { timingSafeEqual } from "node:crypto"

import { elementOf } from "../element-key.cjs"
import { PEER_HEADER, fromInternet } from "./element-doors.mjs"

// WHO CALLS A DOOR OF THE CORE — named by the key it presents, never by a word of its body (node step 818-7a, the red team's H6).
// Before 818 the installer gave EVERY element the node key (`SETTINGS_SECRET`), so any element could wake any agent with any text, close
// another's session, speak in another's name, and open every neighbour's doors. Now the node key lives only in the core and the native
// elements; a custom element holds its own key `<id>.<mac>` (`lib/element-key.cjs`, an HMAC of DATA_SECRET over its id — the stores
// already verify it), and since 818-7c the installer writes the same value into its SETTINGS_SECRET, so the template's commands send it
// as `X-Node-Key` unchanged. Three layers, each refusing on its own:
//   - the internet: no key is honoured through Cloudflare or the server's edge (cf-*, the edge header) — the doors are the machine's;
//   - the kernel: on a walled server `server.js` stamps a connection an element's own user opened (811-5g) — such a connection is never
//     the node, and the key of ANOTHER element is refused there (a key stolen from a neighbour is useless from its thief's user);
//   - the key: the node key compared in constant time, an element key's mac recomputed from DATA_SECRET.

export type Caller = { node: true } | { element: string }
type HeaderBag = { get(name: string): string | null }
type Keys = { SETTINGS_SECRET?: string; DATA_SECRET?: string }

const same = (a: string, b: string): boolean => {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/** The caller of a door: the node, one element, or null. `header` — where the key is (`x-node-key`; the signal door: `x-settings-key`). */
export function callerOf(headers: HeaderBag, opts: { header?: string; env?: Keys } = {}): Caller | null {
  const env = opts.env ?? (process.env as Keys)
  const presented = (headers.get(opts.header ?? "x-node-key") ?? "").trim()
  if (!presented || fromInternet(headers)) return null
  const peer = headers.get(PEER_HEADER)
  const node = (env.SETTINGS_SECRET ?? "").trim()
  if (node && same(presented, node)) return peer ? null : { node: true }
  const id: string | null = elementOf(presented, (env.DATA_SECRET ?? "").trim())
  if (!id || (peer && peer !== id)) return null
  return { element: id }
}

export const isNode = (c: Caller | null): boolean => Boolean(c && "node" in c)

export const callerElement = (c: Caller | null): string | null => (c && "element" in c ? c.element : null)

/** May this caller act for `id`? The node — for anyone; an element — only for itself. */
export const actsFor = (c: Caller | null, id: unknown): boolean =>
  isNode(c) || (typeof id === "string" && id.trim() !== "" && callerElement(c) === id.trim())

/** The refusal of a caller that may not: no key → 401; an element outside its own affairs → 403. */
export function refusal(c: Caller | null, what = "its own affairs only"): { status: 401 | 403; reason: string } {
  return c
    ? { status: 403, reason: `an element's own key opens ${what}` }
    : { status: 401, reason: "the node key or the element's own key is required (X-Node-Key)" }
}

// The reasons of a wake that belong to the node alone: the core build's return (675), the lost main session (708), the main agent's own
// wakes (`main-agent-*`) — each skips the person's question, and only the node may skip it.
const NODE_REASONS = /^(core-back|session-lost|main-agent-)/

/** May this caller wake `body.service`? An element wakes only its own agent, or the main agent (`build`) in its own name. */
export function wakeAllowed(c: Caller | null, body: { service?: unknown; from?: unknown; reason?: unknown; supervised?: unknown }): boolean {
  if (isNode(c)) return true
  const me = callerElement(c)
  if (!me) return false
  if (NODE_REASONS.test(String(body.reason ?? "")) || body.supervised === true) return false
  if (body.service === me) return true
  return body.service === "build" && (body.from === undefined || body.from === me)
}

/**
 * An element's words for the main agent, marked with the caller the KEY named: its own «⟦…⟧» become «[…]», so it can never write a mark
 * of the node (`⟦node · permission …⟧`, `⟦node · context-reset …⟧`) — the main agent reads every «⟦node» line as the node's own.
 */
export function markedFrom(id: string, text: string): string {
  return `⟦node · from element ${id} — its own words⟧\n${text.replace(/⟦/g, "[").replace(/⟧/g, "]")}`
}
