// THE CROSS-SITE WALL — no foreign web page acts through the node (node step 744-2).
//
// ✗ Measured 2026-11-14 (development-steps 744, probes/csrf.sh): a page of another site sent a «simple» POST (text/plain, no preflight)
// to http://localhost:24680/api/node/launch — 200, and the node opened SSH as root on the person's server with its key. The owner at the
// keyboard passes every gate without sign-in (owner-at-machine.ts), so any page open in the same browser could press the node's buttons:
// install, clear a server, write DNS records, update the node. The foreign page cannot read the answer — it does not need to.
//
// 🔒 THE RULE is the algorithm of Go's net/http CrossOriginProtection (Go 1.25) — the browser's own testimony, in this order:
//   1. GET, HEAD, OPTIONS pass: they change nothing (OPTIONS is the browser's own preflight).
//   2. `Sec-Fetch-Site` present → it alone decides: `same-origin` and `none` (the address bar, a bookmark) pass; `same-site`,
//      `cross-site` and any unknown value are refused. A page cannot write this header: it is the browser speaking.
//   3. No `Sec-Fetch-Site` (an old browser; plain http that is not localhost — fetch metadata goes only to trustworthy origins) →
//      `Origin` decides: its host must be the request's own (`x-forwarded-host` or `host`); `null` and garbage are refused.
//   4. Neither header → passes: not a browser (curl, the node's scripts and services, Telegram, an element's door with its key).
// 🛑 `same-site` IS REFUSED TOO: on an own domain every element is a subdomain of the same site, and an element's page that could press
// the core's buttons would cross the element boundary (CLAUDE.md §6). Measured 2026-11-14: no element page calls the core over HTTP —
// the section highlighter of an element's page speaks to the panel by `postMessage`, and the core answers CORS nowhere.
// 🛑 THE HOST IS COMPARED, NEVER THE SCHEME: TLS ends at nginx, the request reaches the core as http while the page's Origin is https.
// nginx sets `Host` and `X-Forwarded-Host` to the server's own name (lib/hosting/nginx.mjs); cloudflared keeps the visitor's `Host`.
// No imports: the proxy calls it and the test imports it as it is (scripts/cross-site-wall.test.mjs).

export type WallRequest = { method: string; headers: { get(name: string): string | null } }

const SAFE = new Set(["GET", "HEAD", "OPTIONS"])

/** `host[:port]` lowercased, the default port dropped — the same name however a client spells it. */
function hostKey(value: string): string {
  return value.trim().toLowerCase().replace(/:(80|443)$/, "")
}

/**
 * Why this request is refused — `cross-site`, `same-site`, an unknown fetch-site value, `foreign-origin`, `null-origin` — or `null`
 * when it passes. A refused request never reaches a door.
 */
export function crossSiteRefusal(req: WallRequest): string | null {
  if (SAFE.has(req.method.toUpperCase())) return null
  const site = (req.headers.get("sec-fetch-site") ?? "").trim().toLowerCase()
  if (site) return site === "same-origin" || site === "none" ? null : site
  const origin = (req.headers.get("origin") ?? "").trim()
  if (!origin) return null
  if (origin === "null") return "null-origin"
  let from = ""
  try {
    from = hostKey(new URL(origin).host)
  } catch {
    return "foreign-origin"
  }
  const own = [req.headers.get("x-forwarded-host") ?? "", req.headers.get("host") ?? ""]
    .flatMap((v) => v.split(","))
    .map(hostKey)
    .filter(Boolean)
  return from && own.includes(from) ? null : "foreign-origin"
}
