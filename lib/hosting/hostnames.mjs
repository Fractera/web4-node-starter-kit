// THE NODE'S PUBLIC NAMES — ONE TABLE (node step 737-1). The owner, 2026-11-13: «получает сертификаты на каждый из существующих Суб
// доменов … Внизу появится требования прописать о записи ко всем существующим доменом на регистраторе».
// 🔒 ONE LIST FOR EVERY READER: the DNS records the person writes at the registrar, the nginx sites, the certificates and the
// end-to-end check all read THIS table. ✗ Paid in the old five-step wizard (core 197.1, 2026-07-11): the DNS check wanted 9 names while
// certbot issued 7 and nginx served 8 — activation deadlocked; the fix was one shared list. A reader that keeps its own copy drifts.
// 🔒 THE SAME LAYOUT AS THE TUNNEL ACTIVATION (`app/api/domain/activate/route.ts`, 280-3, 389, 324): the apex goes to the site `root`
// (no root — to the core, and no `architect.`), `architect.<zone>` to the core, `auth.<zone>` to sign-in, `<address>.<zone>` to every
// other element; an element's own domain (`data/services/<id>/domain.json`): the main address to the element, the second names to the
// core, which answers 301 by the host (`lib/domain/mirror-redirect.ts`). Moving the node changes the road (A records instead of the
// tunnel's CNAMEs), never a name — so APP-CONFIG, sign-in and every link stay true after the move.
// 🔒 `www.<zone>` is offered as an optional name answered by nginx with 301 to the apex (the tunnel never served it; the old wizard did).
// Bare `node` reads it (the server script, the tests) — hence `.mjs`, no TypeScript, no `@/` imports.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { addressOf } from '../web4-items/address-file.mjs'
import { isDnsLabel } from '../web4-items/dns-label.mjs'

export const CORE_ID = 'core'
const DEFAULT_CORE_PORT = 24680

function readJson(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null }
}

/** A host name by the rules of DNS: two labels at least, every label LDH, the last one not a number, ≤ 253 characters. */
export function isHostName(name) {
  if (typeof name !== 'string' || name.length > 253) return false
  const labels = name.split('.')
  return labels.length >= 2 && labels.every((l) => isDnsLabel(l)) && /[a-z]/.test(labels[labels.length - 1])
}

/** The core's port as the running server wrote it (`logs/runtime.json`), never remembered. */
export function corePort(root = process.cwd()) {
  const p = readJson(join(root, 'logs', 'runtime.json'))?.port
  return Number.isInteger(p) && p > 0 ? p : DEFAULT_CORE_PORT
}

/**
 * The node's primary domain: the one asked for (`domain`), else the server's choice (`data/node/server.json` → `domain`), else the
 * tunnel activation's zone (`logs/domain.json` → `zone`). `null` — the node has no domain yet (the IP stage).
 */
export function primaryZone(root = process.cwd(), domain = null) {
  const pick = (v) => (typeof v === 'string' && isHostName(v.trim().toLowerCase()) ? v.trim().toLowerCase().replace(/\.$/, '') : null)
  return pick(domain) ?? pick(readJson(join(root, 'data', 'node', 'server.json'))?.domain) ?? pick(readJson(join(root, 'logs', 'domain.json'))?.zone)
}

/** The registry's installed elements: id, port and kind, in the registry's order. */
export function installedElements(root = process.cwd()) {
  const reg = readJson(join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'))
  const list = Array.isArray(reg?.services) ? reg.services : []
  return list
    .filter((s) => s && typeof s.id === 'string' && Number.isInteger(s.port))
    .map((s) => ({ id: s.id, port: s.port, kind: s.kind ?? null }))
}

/** An element's own domain record (`domain`, `primary`) or `null`. */
function ownDomainOf(id, root) {
  const rec = readJson(join(root, 'data', 'services', id, 'domain.json'))
  const domain = typeof rec?.domain === 'string' ? rec.domain.trim().toLowerCase() : ''
  if (!isHostName(domain)) return null
  return { domain, primary: rec.primary === 'subdomain' ? 'subdomain' : 'domain' }
}

/**
 * Every public name of the node.
 * @param {{ root?: string, domain?: string | null }} [opts]
 * @returns {{ zone: string | null, corePort: number, rows: Array<{ host: string, zone: string, label: string, kind: string,
 *   service: string | null, port: number | null, redirectTo: string | null, optional: boolean }> }}
 */
export function nodeNames(opts = {}) {
  const root = opts.root ?? process.cwd()
  const zone = primaryZone(root, opts.domain ?? null)
  const core = corePort(root)
  if (!zone) return { zone: null, corePort: core, rows: [] }
  const elements = installedElements(root)
  const byId = new Map(elements.map((e) => [e.id, e]))
  const rows = []
  const seen = new Set()
  const add = (row) => {
    if (!isHostName(row.host) || seen.has(row.host)) return
    seen.add(row.host)
    rows.push(row)
  }
  const label = (host, z) => (host === z ? '@' : host.slice(0, host.length - z.length - 1))
  const toCore = { service: CORE_ID, port: core }

  const site = byId.get('root')
  // Own domains first: the address an element chose decides where its subdomain goes (to it, or to the core's 301).
  const own = new Map()
  for (const e of elements) {
    const d = ownDomainOf(e.id, root)
    if (d) own.set(e.id, d)
  }

  add({ host: zone, zone, label: '@', kind: 'apex', ...(site ? { service: 'root', port: site.port } : toCore), redirectTo: null, optional: false })
  add({ host: `www.${zone}`, zone, label: 'www', kind: 'www', service: null, port: null, redirectTo: zone, optional: true })
  if (site) add({ host: `architect.${zone}`, zone, label: 'architect', kind: 'architect', ...toCore, redirectTo: null, optional: false })
  const auth = byId.get('auth')
  if (auth) add({ host: `auth.${zone}`, zone, label: 'auth', kind: 'auth', service: 'auth', port: auth.port, redirectTo: null, optional: false })

  for (const e of elements) {
    if (e.id === 'root' || e.id === 'auth') continue
    const host = `${addressOf(e.id, root)}.${zone}`
    const d = own.get(e.id)
    const mirror = d && d.primary === 'domain'
    add({ host, zone, label: label(host, zone), kind: mirror ? 'element-mirror' : 'element', ...(mirror ? toCore : { service: e.id, port: e.port }), redirectTo: mirror ? d.domain : null, optional: false })
  }

  for (const [id, d] of own) {
    const e = byId.get(id)
    const sub = `${addressOf(id, root)}.${zone}`
    const main = d.primary === 'domain'
    add({ host: d.domain, zone: d.domain, label: '@', kind: main ? 'element-domain' : 'element-mirror', ...(main ? { service: id, port: e.port } : toCore), redirectTo: main ? null : sub, optional: false })
    add({ host: `www.${d.domain}`, zone: d.domain, label: 'www', kind: 'element-mirror', ...toCore, redirectTo: main ? d.domain : sub, optional: true })
  }
  return { zone, corePort: core, rows }
}

/**
 * The DNS records the person writes at the registrar: an A record per name to the server's IPv4, grouped by zone (a zone's records
 * live at that domain's own registrar). `wildcard` — the one-line shortcut `*` that covers every element name, present and future.
 */
export function dnsRecords(table, ip) {
  const zones = new Map()
  for (const r of table.rows) {
    if (!zones.has(r.zone)) zones.set(r.zone, [])
    zones.get(r.zone).push({ type: 'A', name: r.label, value: ip, host: r.host, kind: r.kind, optional: r.optional })
  }
  return [...zones].map(([zone, records]) => ({ zone, records, wildcard: zone === table.zone ? { type: 'A', name: '*', value: ip } : null }))
}
