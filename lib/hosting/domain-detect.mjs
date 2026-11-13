// WHERE A DOMAIN'S RECORDS LIVE — asked of the public internet, never guessed (node step 737-19a). The owner, 2026-11-13: «Запрос к
// домену проверка отвечает он какой ответ кто его возвращает регистратор или Cloud Flyer», and earlier «нужно какой-то пояснение что это
// за вкладка регистратора где её искать». One call answers, with no question to the person:
//   · the zone the name belongs to (its SOA) — so a subdomain base (node.example.org) gets record names relative to its real zone;
//   · who keeps its DNS (the name servers), asked of TWO resolvers — when they differ the name servers are changing right now;
//   · where the name leads now: this server, Cloudflare's proxy (its published ranges), elsewhere, nowhere;
//   · mail (MX) and other text records (TXT) that a move of DNS would have to carry, and DNSSEC (DS) that would break it;
//   · where the domain was bought and until when it is paid — the registry's own answer (RDAP, IANA's bootstrap), when the TLD has one;
//   · whether a site answers on it now — so a live site is never switched away by surprise.
// 🔒 EVERY ANSWER MAY BE MISSING: a resolver, a registry or the site may stay silent; the field is then `null`, never a guess.
// 🔒 PRIVACY: the name goes only where it is public anyway — the two public resolvers the node already asks (dns-check.mjs), IANA, the
// registry of its own TLD, and the name itself.

// Cloudflare's published IPv4 ranges — https://www.cloudflare.com/ips-v4/ , read 2026-11-13. A name answering inside them goes through
// Cloudflare's proxy (the orange cloud), whatever stands behind it.
export const CLOUDFLARE_IPV4 = [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20',
  '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13',
  '131.0.72.0/22',
]

const RESOLVERS = {
  cf: (name, type) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
  google: (name, type) => `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
}
const TYPE = { A: 1, NS: 2, SOA: 6, MX: 15, TXT: 16, DS: 43 }
const BOOTSTRAP = 'https://data.iana.org/rdap/dns.json'
const bare = (s) => String(s ?? '').trim().toLowerCase().replace(/\.$/, '')

function ipToInt(ip) {
  const p = String(ip).split('.').map(Number)
  return p.length === 4 && p.every((n) => Number.isInteger(n) && n >= 0 && n <= 255) ? ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3] : null
}
/** Is this IPv4 inside one of the CIDR ranges. */
export function inRanges(ip, ranges = CLOUDFLARE_IPV4) {
  const n = ipToInt(ip)
  if (n === null) return false
  return ranges.some((cidr) => {
    const [base, bits] = cidr.split('/')
    const b = ipToInt(base)
    const mask = Number(bits) === 0 ? 0 : (0xffffffff << (32 - Number(bits))) >>> 0
    return b !== null && ((n & mask) >>> 0) === ((b & mask) >>> 0)
  })
}

/** One DoH question; `null` when the resolver did not answer. */
async function ask(which, name, type, fetchImpl) {
  try {
    const r = await fetchImpl(RESOLVERS[which](name, type), { headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(6000), cache: 'no-store' })
    if (!r.ok) return null
    const j = await r.json()
    return { status: j.Status ?? null, answer: Array.isArray(j.Answer) ? j.Answer : [], authority: Array.isArray(j.Authority) ? j.Authority : [] }
  } catch {
    return null
  }
}
const ofType = (res, type) => (res?.answer ?? []).filter((a) => a.type === TYPE[type])

/** The zone a name belongs to: its own SOA, or the SOA of the authority above it. */
export async function zoneOf(name, fetchImpl = fetch) {
  const res = (await ask('cf', name, 'SOA', fetchImpl)) ?? (await ask('google', name, 'SOA', fetchImpl))
  if (!res) return null
  const own = ofType(res, 'SOA')[0]
  if (own) return bare(own.name)
  const up = res.authority.find((a) => a.type === TYPE.SOA)
  return up ? bare(up.name) : null
}

/** The registrar and the paid-until date from the TLD's own registry (RDAP); `null` fields when the TLD has none or it is silent. */
export async function registrarOf(zone, fetchImpl = fetch) {
  const out = { registrar: null, expires: null }
  try {
    const tld = zone.split('.').pop()
    const boot = await (await fetchImpl(BOOTSTRAP, { signal: AbortSignal.timeout(8000) })).json()
    const base = (boot.services ?? []).find(([tlds]) => tlds.includes(tld))?.[1]?.[0]
    if (!base) return out
    const r = await fetchImpl(`${base.replace(/\/?$/, '/')}domain/${encodeURIComponent(zone)}`, { headers: { accept: 'application/rdap+json' }, signal: AbortSignal.timeout(8000) })
    if (!r.ok) return out
    const d = await r.json()
    for (const e of d.entities ?? []) {
      if (!(e.roles ?? []).includes('registrar')) continue
      const fn = (e.vcardArray?.[1] ?? []).find((v) => v[0] === 'fn')
      if (fn && typeof fn[3] === 'string' && fn[3].trim()) out.registrar = fn[3].trim()
    }
    const exp = (d.events ?? []).find((ev) => ev.eventAction === 'expiration')
    if (exp && typeof exp.eventDate === 'string') out.expires = exp.eventDate
  } catch { /* the registry is silent: unknown, not guessed */ }
  return out
}

/** A site answering on the name now: its status and title; `null` when nothing answers. */
export async function siteOn(name, fetchImpl = fetch) {
  try {
    const r = await fetchImpl(`https://${name}/`, { redirect: 'follow', signal: AbortSignal.timeout(8000), cache: 'no-store' })
    const text = (await r.text()).slice(0, 65536)
    const title = text.match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1]?.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() ?? null
    return { status: r.status, title }
  } catch {
    return null
  }
}

/**
 * Everything the ladder's step «Где живут записи» shows.
 * @param {string} name — the domain the person typed (an apex or a subdomain)
 * @param {{ ip?: string | null, fetchImpl?: typeof fetch }} [opts] — `ip`: the server's IPv4
 */
export async function detectDomain(name, opts = {}) {
  const fetchImpl = opts.fetchImpl ?? fetch
  const ip = opts.ip ?? null
  const host = bare(name)
  const zone = (await zoneOf(host, fetchImpl)) ?? host
  const [nsCf, nsGoogle, a, mx, txt, ds] = await Promise.all([
    ask('cf', zone, 'NS', fetchImpl), ask('google', zone, 'NS', fetchImpl), ask('cf', host, 'A', fetchImpl),
    ask('cf', zone, 'MX', fetchImpl), ask('cf', zone, 'TXT', fetchImpl), ask('cf', zone, 'DS', fetchImpl),
  ])
  const nsList = (res) => (res ? ofType(res, 'NS').map((x) => bare(x.data)).sort() : null)
  const ns = nsList(nsCf) ?? nsList(nsGoogle) ?? []
  const other = nsList(nsGoogle)
  const nsTtl = nsCf ? (ofType(nsCf, 'NS')[0]?.TTL ?? null) : null
  const dnsHost = ns.length === 0 ? 'none' : ns.every((x) => x.endsWith('.ns.cloudflare.com')) ? 'cloudflare' : 'other'
  const changing = Boolean(other && nsList(nsCf) && other.join(' ') !== nsList(nsCf).join(' '))
  const addrs = a ? ofType(a, 'A').map((x) => String(x.data).trim()) : null
  const aKind = addrs === null ? 'unknown' : addrs.length === 0 ? 'none' : ip && addrs.every((x) => x === ip) ? 'server'
    : addrs.some((x) => inRanges(x)) ? 'cloudflare' : 'elsewhere'
  const [reg, site] = await Promise.all([
    dnsHost === 'none' ? Promise.resolve({ registrar: null, expires: null }) : registrarOf(zone, fetchImpl),
    addrs && addrs.length > 0 && aKind !== 'server' ? siteOn(host, fetchImpl) : Promise.resolve(null),
  ])
  return {
    name: host,
    zone,
    sub: host === zone ? '' : host.slice(0, host.length - zone.length - 1),
    ns,
    nsOther: other,
    nsTtl,
    dnsHost,
    changing,
    a: addrs ?? [],
    aKind,
    mx: mx ? ofType(mx, 'MX').map((x) => String(x.data).trim()) : [],
    txt: txt ? ofType(txt, 'TXT').map((x) => String(x.data).trim().slice(0, 160)) : [],
    ds: Boolean(ds && ofType(ds, 'DS').length > 0),
    registrar: reg.registrar,
    expires: reg.expires,
    site: site && site.status < 500 ? site : null,
    at: new Date().toISOString(),
  }
}
