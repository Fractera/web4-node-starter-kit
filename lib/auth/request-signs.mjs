// THE SIGNS OF A REQUEST, AS PURE FUNCTIONS (node step 741-3; the owner approved 2026-11-14: «да, утверждаю 741 и D31–D37 -> go»).
// The core's request-level rules take the facts they need as arguments — the place of the node, the configured site address, the
// hostname predicates — so one rule is tested in plain `node` (`scripts/hosting.test.mjs`) and used by the core's wrappers
// (`lib/auth/temporary-address.ts`, `lib/showcase.server.ts`). No `fs`, no request object, no alias imports.
// ✗ What they close (measured 2026-11-14 on the test server, `development-steps/new-steps/741/probes`): a forged `Host: fractera.ai`
// gave the showcase session with every role, a forged `x.trycloudflare.com` or IP literal the architect read of a temporary address.
// nginx no longer passes a client's name (741-1); these rules are the core's own second wall, holding even if nginx were misconfigured.

/** The name the request was made for: what a proxy in front named first, then `Host`; lowercased, the port dropped. */
export function requestHostname(get) {
  const forwarded = String(get('x-forwarded-host') ?? '').trim().toLowerCase()
  const host = String(get('host') ?? '').trim().toLowerCase()
  return (forwarded || host).replace(/:\d+$/, '')
}

/**
 * The temporary address's read-only trade (243) — on a person's computer only. A server has no quick tunnel (741-4) and shows the core
 * by its bare IP only through `/api/health` (741-1): a tunnel name or an IP literal there is a forgery and gets no identity.
 */
export function temporaryFor(place, hostname, isTemporaryHostname) {
  return place !== 'server' && isTemporaryHostname(hostname)
}

/**
 * The showcase — a node CONFIGURED as fractera.ai (its own site address) AND reached by that name; never the name alone. A guest node is
 * never configured as fractera.ai, so no `Host` can switch the showcase on there.
 */
export function showcaseFor(configuredUrl, hostname, isShowcaseOrigin, isShowcaseHostname) {
  return isShowcaseOrigin(configuredUrl) && isShowcaseHostname(hostname)
}
