// A DOMAIN NAME IS ASKED OF ITS REGISTRY BEFORE THE NODE TOUCHES CLOUDFLARE (node step 828).
// ✗ 2026-11-21 (the owner, Telegram 571–574): a typo — «througsongs.com», no «h» — was added, got its own zone in the node's Cloudflare
// and left the person waiting on name servers that could never change. The registry knew at once: Verisign's RDAP answered 404.
// 🔒 THE ANSWER BY THE STANDARD (RFC 7480 §5.3, read 2026-11-21): «an empty result set … returns a 404 (Not Found)»; a policy refusal is
// another 4xx. So 200 — registered (its registrar named), 404 — not registered, anything else, a network failure or no RDAP server for
// the zone in IANA's bootstrap (data.iana.org/rdap/dns.json, RFC 9224) — unknown. 🔒 UNKNOWN NEVER BLOCKS: a registry that is down or a
// zone without RDAP must not stop a real domain.
// 🔒 THE BOOTSTRAP IS KEPT ONLY WHEN IT ARRIVED: the earlier code kept a failed first fetch for the life of the process.
// Pure, no Node imports: the page imports `nsNothing` too. `fetchImpl` — the tests' fake network.

const BOOTSTRAP = 'https://data.iana.org/rdap/dns.json'
let services = null

async function rdapServices(fetchImpl) {
  if (services) return services
  try {
    const r = await fetchImpl(BOOTSTRAP, { signal: AbortSignal.timeout(8000) })
    if (!r.ok) return null
    const j = await r.json()
    if (Array.isArray(j?.services)) services = j.services
    return services
  } catch { return null }
}

/** The RDAP base of the longest suffix of `name` the bootstrap lists (RFC 9224 §4: the longest match), or `null`. */
export function rdapBase(name, list) {
  const labels = name.split('.')
  for (let i = 1; i < labels.length; i++) {
    const suffix = labels.slice(i).join('.')
    const hit = (list ?? []).find(([tlds]) => Array.isArray(tlds) && tlds.includes(suffix))
    const base = hit?.[1]?.[0]
    if (typeof base === 'string' && base) return base.endsWith('/') ? base : `${base}/`
  }
  return null
}

/**
 * What the registry of the zone says about `name`.
 * @returns {Promise<{ state: 'registered'|'unregistered'|'unknown', registrar: string|null }>}
 */
export async function registryOf(name, fetchImpl = fetch) {
  const base = rdapBase(name, await rdapServices(fetchImpl))
  if (!base) return { state: 'unknown', registrar: null }
  try {
    const r = await fetchImpl(`${base}domain/${encodeURIComponent(name)}`, { headers: { accept: 'application/rdap+json' }, signal: AbortSignal.timeout(8000) })
    if (r.status === 404) return { state: 'unregistered', registrar: null }
    if (!r.ok) return { state: 'unknown', registrar: null }
    const j = await r.json()
    const reg = (j?.entities ?? []).find((e) => Array.isArray(e?.roles) && e.roles.includes('registrar'))
    const fn = reg?.vcardArray?.[1]?.find((v) => v?.[0] === 'fn')?.[3]
    return { state: 'registered', registrar: typeof fn === 'string' && fn.trim() ? fn.trim() : null }
  } catch { return { state: 'unknown', registrar: null } }
}

/** Optimal string alignment distance: insert, delete, replace, swap two neighbours — one each. */
export function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  }
  return d[a.length][b.length]
}

/**
 * The candidate a typo most likely meant: distance ≤ 1 for a name under 8 characters, ≤ 2 otherwise (a short name two edits away
 * is another name, not a typo); the same name is never «closest»; a tie — the first in alphabetical order. `null` — nothing close.
 */
export function closestName(name, candidates) {
  const limit = name.length < 8 ? 1 : 2
  let best = null
  for (const c of [...new Set(candidates)].sort()) {
    if (typeof c !== 'string' || !c || c === name) continue
    const k = distance(name, c)
    if (k <= limit && (!best || k < best.k)) best = { name: c, k }
  }
  return best ? best.name : null
}

/**
 * 828-3 — what the empty «now the internet sees» column says, by what was measured (the owner's screenshot 2026-11-21 read «ничего
 * (ещё не замерено)» after a measure had found no such domain):
 * `not-yet` — never checked · `no-domain` — the registry has no such name · `ask-failed` — public DNS did not answer · `none` — the
 * name has no name servers.
 */
export function nsNothing(d) {
  if (!d?.checkedAt) return 'not-yet'
  if (d.registry === 'unregistered') return 'no-domain'
  if (!Array.isArray(d.registrarNs)) return 'ask-failed'
  return 'none'
}
