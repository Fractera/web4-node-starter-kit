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
]

/** Is this path a door an element's key may reach? Exact, or a sub-path after «/». */
export const isElementDoor = (pathname) => ELEMENT_DOORS.some((p) => pathname === p || pathname.startsWith(p + '/'))

/** A request that came through Cloudflare or the dedicated server's edge — from the internet. No key of the node is honoured from there. */
export const fromInternet = (headers) =>
  Boolean(headers.get('cf-connecting-ip') || headers.get('cf-ray') || headers.get(EDGE_HEADER))
