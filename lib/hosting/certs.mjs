// THE CERTIFICATES OF THE SERVER — MEASURED, NEVER REMEMBERED (node step 737-8). The owner, 2026-11-13: «ты вызываешь кнопку проверки
// в наличии сертификатов если нет дополнение ших». The inventory comes from the root helper (`fractera-root cert-list`: Let's Encrypt
// lineages and the person's own uploaded certificates — the node's user cannot read /etc/letsencrypt), one JSON line per certificate.
// 🔒 A NAME IS COVERED by a certificate whose SANs hold it exactly or by one wildcard level (`*.example.org` covers `a.example.org`, not
// `example.org`, not `a.b.example.org` — RFC 6125 §6.4.3) and which stays valid for at least a day; an expired one covers nothing.
// 🔒 One lineage per name is what the node issues (`--cert-name <host>`); a person's multi-name or wildcard certificate is used for every
// name it covers. Let's Encrypt is preferred over an own certificate only when both cover the name and the own one expires sooner.
const DAY = 24 * 60 * 60 * 1000

/** Lines of `fractera-root cert-list` → certificates. Broken lines are skipped, never guessed. */
export function parseCertList(text) {
  const out = []
  for (const line of String(text ?? '').split('\n')) {
    if (!line.trim()) continue
    try {
      const c = JSON.parse(line)
      const notAfter = Date.parse(c.notAfter)
      if (typeof c.fullchain !== 'string' || typeof c.privkey !== 'string' || Number.isNaN(notAfter)) continue
      out.push({ name: String(c.name ?? ''), source: c.source === 'own' ? 'own' : 'letsencrypt', fullchain: c.fullchain, privkey: c.privkey,
        notAfter, sans: String(c.sans ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) })
    } catch { /* not a certificate line */ }
  }
  return out
}

/** Does this SAN cover the host (exact, or one wildcard level)? */
export function sanCovers(san, host) {
  if (san === host) return true
  if (!san.startsWith('*.')) return false
  const dot = host.indexOf('.')
  return dot > 0 && host.slice(dot + 1) === san.slice(2)
}

/** The certificate to serve `host` with, or `null`. */
export function certFor(host, list, now = Date.now()) {
  const usable = list.filter((c) => c.notAfter > now + DAY && c.sans.some((s) => sanCovers(s, host)))
  if (usable.length === 0) return null
  usable.sort((a, b) => (b.name === host) - (a.name === host) || b.notAfter - a.notAfter)
  const c = usable[0]
  return { fullchain: c.fullchain, privkey: c.privkey, notAfter: new Date(c.notAfter).toISOString(), source: c.source }
}

/** The table's names with their certificate state: `ok`, `expiring` (under 30 days), `missing`. */
export function coverage(table, list, now = Date.now()) {
  return table.rows.map((r) => {
    const c = certFor(r.host, list, now)
    const left = c ? Math.floor((Date.parse(c.notAfter) - now) / DAY) : null
    return { host: r.host, optional: r.optional, cert: c, daysLeft: left, state: !c ? 'missing' : left < 30 ? 'expiring' : 'ok' }
  })
}
