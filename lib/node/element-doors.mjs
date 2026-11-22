// THE DOORS OF THE CORE AN ELEMENT REACHES BY ITS OWN KEY (node step 818-7a, the red team's H6). Crypto-free on purpose: the gate
// (`proxy/common.ts`) reads it before any route runs, and the gate does not judge a key — the door does (`lib/node/caller.ts`): it names
// the caller by the key it presents and lets an element only its own affairs. The gate only lets a keyed request from THIS machine reach
// these doors: a walled element on a dedicated server has no session and is never the owner at the machine (811-5g), and without this
// list its `tell-core`, `need` and «done» stopped at the gate (817 F2) — the reason every element was given the node's key before.
// 🔒 A door joins this list only when it names its caller with `callerOf`; the guard `scripts/node-key-split.test.mjs` holds both ways.
import { EDGE_HEADER } from '../hosting/edge.mjs'

// `server.js` stamps a connection an element's own Linux user opened (`lib/hosting/peer-uid.cjs`, 811-5g); removed from every request
// first, so no client sends it in.
export const PEER_HEADER = 'x-fractera-peer'

/** Every path an element's own key may reach (a door's sub-paths too). */
export const ELEMENT_DOORS = [
  '/api/agents/wake',
  '/api/agents/session',
  '/api/agents/done',
  '/api/agents/permission',
  '/api/node/needs',
  '/api/node/notice',
  '/api/node/person-asks',
  '/api/node/browser',
  '/api/node/first-task',
  '/api/node/review-inbox',
  '/api/node/a2a',
  '/api/node/a2a-log',
  '/api/node/elements',
  '/api/node/site-rules',
  '/api/node/helpful-links',
  '/api/node/pair-key',
  '/api/skills/catalog',
  '/api/skills/suggested',
  '/api/shell-kit',
  // 837-0c: the voice field of an element's own terminal (836) dictates through its server with ITS key, for itself only (`?item=<id>`)
  '/api/transcribe',
]

/** 837-0c: an element's four agent-kit doors in the core — what its agent pages inside the element (836) call on loopback with its OWN
 *  key; each route names the caller by the key and lets it only its own id (kit-access.ts). The element asks `<lang>/architect/<id>/…`,
 *  and next.config's redirect (`/:lang/architect/:path*` → `/:lang/:path*`, run BEFORE the proxy) brings it here as `<lang>/<id>/agent-api/<door>`
 *  — ✗ measured on the server 2026-11-22 15:0x (307, location /en/xeket/agent-api/claude-auth): the first rule knew only the first form. */
export const KIT_DOOR = /^\/[a-z]{2}\/(?:architect\/)?[a-z0-9][a-z0-9-]{0,62}\/agent-api\/(ticket|session|channel|claude-auth)$/
export const isKitDoor = (pathname) => KIT_DOOR.test(pathname)

/** Is this path a door an element's key may reach? Exact, or a sub-path after «/». */
export const isElementDoor = (pathname) => ELEMENT_DOORS.some((p) => pathname === p || pathname.startsWith(p + '/'))

/** A request that came through Cloudflare or the dedicated server's edge — from the internet. No key of the node is honoured from there. */
export const fromInternet = (headers) =>
  Boolean(headers.get('cf-connecting-ip') || headers.get('cf-ray') || headers.get(EDGE_HEADER))
