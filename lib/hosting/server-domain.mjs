// THE DOMAIN OF A NODE ON ITS SERVER — ITS STATE, MEASURED (node step 737-8). The owner, 2026-11-13: «Позже если пользователь
// предоставит домен … получает сертификаты на каждый из существующих поддоменов … Внизу появится требования прописать записи ко всем
// существующим доменам на регистраторе. После этого ты вызываешь кнопку проверки наличия сертификатов, если нет — дополняешь, и после
// этого весь проект должен работать». And: «была вкладка домен которая имела пять шагов … Все было построено и все работало».
// 🔒 THE OLD FIVE STEPS, REBORN: 1 the domain → 2 the DNS records of every name, checked through public resolvers → 3 the certificates,
// checked and the missing ones added (or the person's own uploaded) → 4 HTTPS of every name from outside → 5 switched on, and back.
// 🔒 EVERY STEP IS MEASURED, NEVER REMEMBERED (the old wizard's law): the domain is the server's mark, the DNS answer and the HTTPS answer
// are kept WITH the zone and the IP they were asked for — a check of another zone or another address counts as «not checked»; the
// certificates are asked from the root helper at every read.
// 🔒 ONE TABLE OF NAMES (`hostnames.mjs`) for the records, the certificates, nginx and the check; the state names hosts, never ports.
// Bare `node` reads it (the CLI, the certificate runner, the tests) — `.mjs`, no TypeScript.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { coverage, parseCertList } from './certs.mjs'
import { checkNames } from './dns-check.mjs'
import { dnsRecords, isHostName, nodeNames } from './hostnames.mjs'

export const HELPER = '/usr/local/sbin/fractera-root'

export function readJson(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null }
}

/** The server's own mark (`data/node/server.json`), written by the move; `{}` off a server. */
export function serverMark(root) {
  return readJson(join(root, 'data', 'node', 'server.json')) ?? {}
}

export function writeServerMark(root, patch) {
  const next = { ...serverMark(root), ...patch }
  for (const [k, v] of Object.entries(next)) if (v === undefined) delete next[k]
  mkdirSync(join(root, 'data', 'node'), { recursive: true })
  writeFileSync(join(root, 'data', 'node', 'server.json'), `${JSON.stringify(next, null, 2)}\n`)
  return next
}

const sidePath = (root, name) => join(root, 'data', 'node', 'server-side', `${name}.json`)
export const readSide = (root, name) => readJson(sidePath(root, name))
export function writeSide(root, name, value) {
  mkdirSync(join(root, 'data', 'node', 'server-side'), { recursive: true })
  writeFileSync(sidePath(root, name), `${JSON.stringify(value, null, 2)}\n`)
}

/** What the person typed → a bare host name, or `null`: «https://Example.org/path» → «example.org». */
export function cleanDomain(input) {
  const s = String(input ?? '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/[/?#].*$/, '').replace(/:\d+$/, '').replace(/\.$/, '')
  return isHostName(s) ? s : null
}

/** The certificates the root helper sees; `null` — no helper here (not a server, or before prepare). */
export function certList() {
  if (!existsSync(HELPER)) return null
  const r = spawnSync('sudo', ['-n', HELPER, 'cert-list'], { encoding: 'utf8', timeout: 30_000 })
  return r.status === 0 ? parseCertList(r.stdout) : null
}

/** Is a process alive (a certificate run that died leaves `running: true` behind)? */
export function alive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try { process.kill(pid, 0); return true } catch { return false }
}

/**
 * The five steps, each measured.
 * @param {string} root
 * @param {{ certs?: ReturnType<typeof parseCertList> | null }} [opts] — the inventory; asked from the helper when not given
 */
export function domainState(root, opts = {}) {
  const server = serverMark(root)
  const table = nodeNames({ root })
  const ip = typeof server.ip === 'string' ? server.ip : null
  const certs = 'certs' in opts ? opts.certs : certList()
  const fresh = (rec) => rec && rec.zone === table.zone && rec.ip === ip && Array.isArray(rec.results)
  const dns = readSide(root, 'dns')
  const check = readSide(root, 'check')
  const run = readSide(root, 'certs')
  const cov = certs ? coverage(table, certs) : null
  const rows = table.rows.map((r) => {
    const c = cov?.find((x) => x.host === r.host)
    const d = fresh(dns) ? dns.results.find((x) => x.host === r.host) : null
    const h = fresh(check) ? check.results.find((x) => x.host === r.host) : null
    return {
      host: r.host, zone: r.zone, label: r.label, kind: r.kind, optional: r.optional,
      dns: d?.state ?? 'unchecked', seen: d?.a ?? null,
      cert: c?.state ?? 'unknown', daysLeft: c?.daysLeft ?? null, certSource: c?.cert?.source ?? null,
      https: h ? h.ok : null, status: h?.status ?? null,
    }
  })
  const need = rows.filter((r) => !r.optional)
  const all = (fn) => need.length > 0 && need.every(fn)
  return {
    zone: table.zone,
    ip,
    records: ip && table.zone ? dnsRecords(table, ip) : [],
    rows,
    steps: {
      domain: Boolean(table.zone),
      dns: all((r) => r.dns === 'ok'),
      certs: all((r) => r.cert === 'ok' || r.cert === 'expiring'),
      check: all((r) => r.https === true),
      active: server.domainActive === true,
    },
    dnsAt: fresh(dns) ? dns.at : null,
    checkAt: fresh(check) ? check.at : null,
    certsRun: run ? { ...run, running: Boolean(run.running) && alive(run.pid) } : null,
    helper: certs !== null,
  }
}

/** Step 2: ask public DNS for every name and keep the answer with its zone and IP. */
export async function runDnsCheck(root, fetchImpl = fetch) {
  const server = serverMark(root)
  const table = nodeNames({ root })
  const results = await checkNames(table, server.ip, server.ipv6 ?? null, fetchImpl)
  const rec = { at: new Date().toISOString(), zone: table.zone, ip: server.ip, results }
  writeSide(root, 'dns', rec)
  return rec
}

/**
 * Step 4: every name by HTTPS from outside — strict TLS (Node refuses a certificate that does not match), no redirect followed, any
 * answer under 500 counts (a 301 of `www`, a 307 to sign-in). nginx's own 503 «being connected» is a failure by that same rule.
 */
export async function runHttpsCheck(root, fetchImpl = fetch) {
  const server = serverMark(root)
  const table = nodeNames({ root })
  const results = await Promise.all(table.rows.map(async (r) => {
    try {
      const res = await fetchImpl(`https://${r.host}/`, { redirect: 'manual', signal: AbortSignal.timeout(15_000), cache: 'no-store' })
      return { host: r.host, ok: res.status < 500, status: res.status }
    } catch (e) {
      return { host: r.host, ok: false, status: null, error: String(e?.cause?.code ?? e?.message ?? e).slice(0, 120) }
    }
  }))
  const rec = { at: new Date().toISOString(), zone: table.zone, ip: server.ip, results }
  writeSide(root, 'check', rec)
  return rec
}

/** The names the certificate runner issues: DNS checked «ok» and no usable certificate (missing, or under 30 days left). */
export function namesToIssue(state) {
  return state.rows.filter((r) => r.dns === 'ok' && (r.cert === 'missing' || r.cert === 'expiring')).map((r) => r.host)
}

/**
 * The names before a move (737-15c): which point here, which have a certificate, which point here WITHOUT one (`waiting` — the move
 * refuses while it is not empty), which point elsewhere or nowhere yet.
 */
export function readiness(state) {
  const pointing = state.rows.filter((r) => r.dns === 'ok').map((r) => r.host)
  const certified = state.rows.filter((r) => r.cert === 'ok' || r.cert === 'expiring').map((r) => r.host)
  return {
    zone: state.zone,
    names: state.rows.length,
    pointing,
    certified,
    waiting: pointing.filter((h) => !certified.includes(h)),
    elsewhere: state.rows.filter((r) => r.dns === 'elsewhere' || r.dns === 'aaaa').map((r) => r.host),
    unknown: state.rows.filter((r) => r.dns === 'missing' || r.dns === 'unknown').map((r) => r.host),
  }
}
