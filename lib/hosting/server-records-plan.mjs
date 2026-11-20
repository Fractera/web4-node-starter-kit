// THE RECORDS A SERVER NEEDS, PLANNED FROM WHAT THE ZONE HOLDS NOW (node step 760-8). The owner, 2026-11-16: «если ты определил что домен
// привязан к Cloud Flyer … тебе нужен Token и значит ты автоматически показываешь другой сценарий … её недостаток был в ручном выборе»;
// approved the same day («Да, подтверждаю, утверждаю 760 и начинай»). The node writes a server's records with its Cloudflare key only when
// the measurement says the key sees the zone; this is the plan it shows first and the person confirms.
// 🔒 WHAT THE SERVER NEEDS: A `<base>` and A `*.<base>` → the server's IPv4, DNS ONLY (grey cloud — the server issues its own certificates
// and the node's check reads the server's IP). Every other name of the node falls under the star, so a name the node uses that holds its
// OWN record elsewhere (a CNAME to Vercel on `www`, an A to another IP, an AAAA) is in the way: it beats the star and is removed — only after
// the person's confirm names it. An A to the server's IP that is proxied is switched to DNS only.
// 🔒 NEVER TOUCHED: names the node does not use (a `blog` CNAME stays), records of other types (MX, TXT — mail and checks; such a name
// the node uses gets its own A beside them, the star does not reach it), and a CNAME to
// a Cloudflare tunnel (`*.cfargotunnel.com`) — that is a computer's own road to this name: the plan names it as blocked and the write
// refuses until the person moves that name off the computer (one road per name, 760-3).
// Pure (no network, no `@/` imports): the core's door feeds it the zone's records (`lib/hosting/server-records-cf.ts`), the test feeds it fixtures.

const ROAD = new Set(['A', 'AAAA', 'CNAME'])
const TUNNEL = /\.cfargotunnel\.com\.?$/i
const clean = (n) => String(n ?? '').trim().toLowerCase().replace(/\.$/, '')

/**
 * @param {{ base: string, hosts?: string[], ip: string, records: Array<{ id: string, type: string, name: string, content: string, proxied?: boolean }> }} input
 * @returns {{ names: string[], add: Array<{ host: string }>, change: Array<{ host: string, id: string }>,
 *   remove: Array<{ id: string, host: string, type: string, content: string, proxied: boolean }>, blocked: Array<{ host: string, content: string }> }}
 */
export function planServerRecords({ base, hosts = [], ip, records }) {
  const b = clean(base)
  const star = `*.${b}`
  const names = [...new Set([b, star, ...hosts.map(clean).filter((h) => h === b || h.endsWith(`.${b}`))])]
  const on = (h) => (records ?? []).filter((r) => clean(r?.name) === h && ROAD.has(String(r?.type).toUpperCase()))
  const add = []
  const change = []
  const remove = []
  const blocked = []
  for (const h of names) {
    for (const r of on(h)) {
      const type = String(r.type).toUpperCase()
      const content = clean(r.content)
      if (type === 'CNAME' && TUNNEL.test(content)) blocked.push({ host: h, content })
      else if (type === 'A' && content === ip) { if (r.proxied) change.push({ host: h, id: String(r.id) }) }
      else remove.push({ id: String(r.id), host: h, type, content, proxied: Boolean(r.proxied) })
    }
  }
  for (const h of [b, star]) if (!on(h).some((r) => String(r.type).toUpperCase() === 'A' && clean(r.content) === ip)) add.push({ host: h })
  // ✗ 2026-11-20 (the owner, Telegram 309/312: «www.fractera.ai — нет записи», the card said «Записи уже верны»): a name the node uses that
  // holds ANY record of its own — a TXT of a site check — is not covered by the star (DNS answers the star only for a name with no records
  // at all), so it needs its own A. Its TXT stays.
  // A, AAAA and CNAME of the name are removed or kept above; what STAYS there (TXT, MX …) is what keeps the star away.
  const own = (h) => (records ?? []).some((r) => clean(r?.name) === h && !ROAD.has(String(r?.type).toUpperCase()))
  for (const h of names) {
    if (h === b || h === star || !own(h)) continue
    if (!on(h).some((r) => String(r.type).toUpperCase() === 'A' && clean(r.content) === ip) && !add.some((x) => x.host === h)) add.push({ host: h })
  }
  return { names, add, change, remove, blocked }
}

/** Whether the plan writes nothing: the zone already leads every name to the server, DNS only. */
export function planIsEmpty(plan) {
  return !plan || (plan.add.length === 0 && plan.change.length === 0 && plan.remove.length === 0)
}

/** Every removal of the fresh plan is among those the person confirmed — otherwise the zone changed since the dialog and the write stops. */
export function removalsConfirmed(plan, confirmed) {
  const ok = new Set((Array.isArray(confirmed) ? confirmed : []).map(String))
  return (plan?.remove ?? []).every((r) => ok.has(r.id))
}
