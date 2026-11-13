// DO THE NODE'S NAMES POINT AT ITS SERVER — asked of public DNS, not of this machine (node step 737-8).
// 🔒 PAST THIS MACHINE'S RESOLVER: right after a record is written the machine's own DNS still remembers «no such name» (a negative
// cache) — measured by the node's reach door (289-6). The old wizard's dns-check asked public resolvers for the same reason. Here:
// Cloudflare's DNS-over-HTTPS, Google's when it does not answer.
// 🔒 AAAA COUNTS: a name with an IPv6 record pointing elsewhere is a trap — Let's Encrypt validates over IPv6 first and fails while the
// A record is right. Such a name is named «remove the AAAA record» unless the AAAA is the server's own.
const ENDPOINTS = [
  (host, type) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${type}`,
  (host, type) => `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=${type}`,
]
const TYPE = { A: 1, AAAA: 28 }

/** The records of one type, or `null` when no public resolver answered. `fetchImpl` — the tests' fake resolver. */
export async function lookup(host, type = 'A', fetchImpl = fetch) {
  for (const url of ENDPOINTS) {
    try {
      const r = await fetchImpl(url(host, type), { headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(6000), cache: 'no-store' })
      if (!r.ok) continue
      const j = await r.json()
      return (j.Answer ?? []).filter((a) => a.type === TYPE[type]).map((a) => String(a.data).trim())
    } catch { /* the next resolver */ }
  }
  return null
}

/**
 * Every name of the table against the server's addresses.
 * @returns {Promise<Array<{ host: string, zone: string, label: string, optional: boolean, a: string[]|null, aaaa: string[]|null,
 *   state: 'ok'|'missing'|'elsewhere'|'aaaa'|'unknown' }>>}
 */
export async function checkNames(table, ip, ipv6 = null, fetchImpl = fetch) {
  return Promise.all(table.rows.map(async (r) => {
    const [a, aaaa] = await Promise.all([lookup(r.host, 'A', fetchImpl), lookup(r.host, 'AAAA', fetchImpl)])
    const state = a === null ? 'unknown'
      : a.length === 0 ? 'missing'
      : !a.includes(ip) ? 'elsewhere'
      : (aaaa ?? []).some((x) => x !== ipv6) ? 'aaaa'
      : 'ok'
    return { host: r.host, zone: r.zone, label: r.label, optional: r.optional, a, aaaa, state }
  }))
}
