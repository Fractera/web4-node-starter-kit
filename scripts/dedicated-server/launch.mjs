// THE LAUNCH RUNNER — ONE ACT ON ONE SERVER PER CALL (node step 738-4). The owner, 2026-11-14: «Никакого переезда нет есть просто запуск
// сервера … в данном локальном компьютере меняться ничего не должно … входит у неё заново обнаруживает пустой страницу и до того момента
// пока он не в ведёт информацию о IP-адресе и пароле странице будет оставаться пустой. А после этого ты получишь состояние установлено ли
// уже Fractera …, если установлена то какая версия … насколько она отстает. От этого строится стратегия.»
// `node scripts/dedicated-server/launch.mjs <verb> --host <IPv4|name> [--port 22] […]`, started by the door `app/api/node/launch` and
// awaited (seconds): every long act runs ON THE SERVER, detached; the computer only asks. The last line is `===LAUNCH=== <json>`.
//   connect [--trust <SHA256:…>]   the root password once from stdin (empty: the node's key is already there) → the server checked
//   state                           the server's own state (`state.sh`): its check, its launch, its domain, its node's names and certificates
//   probe                           the server checked again (`probe.sh`: system, memory, cores, disk, ports, an install and its version)
//   install --mode install|update   `launch.sh` started on the server as root, detached; the page follows it by `state`
//   domain --name <domain> · way --way dns|cloudflare|migrate|none · detect · dns
//                                   the domain chosen for the server, kept ON the server (`/root/.fractera/domain.json`); once the
//                                   server's node lives, the same acts go to its own domain door too
//   door                            one act of the server node's own domain door (stdin: its JSON body) — dns-check · certs · check ·
//                                   activate · upload · claim (739-5: the architect's one-time code, passed back once, kept nowhere here);
//                                   a certificate run is refused here past the Let's Encrypt weekly limits (738-5)
//   signin                          where sign-in leads, asked from the internet (738-6)
//   clear --confirm <host>          a server taken by another installation: freed (stopped and kept, never erased), then checked again
// 🔒 THE COMPUTER KEEPS NO STATE OF A SERVER (738): only the node's key and the map of pins (`lib/hosting/ssh.mjs`), and the ledger of
// certificates issued per domain (`data/node/server/le-ledger.json`) — Let's Encrypt counts per domain across every server and every
// reinstall, and nothing else on this machine could know it.
// 🔒 THE PASSWORD comes on stdin and nowhere else; it is used once to install the node's key (`installKey`) and dropped.
// `--dry`: the server scripts run with DRY_RUN=1 (every command printed, none run) — the test's «server» is this very machine.
import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { detectDomain } from '../../lib/hosting/domain-detect.mjs'
import { checkNames } from '../../lib/hosting/dns-check.mjs'
import { dnsRecords, isHostName } from '../../lib/hosting/hostnames.mjs'
import { judge } from '../../lib/hosting/judge.mjs'
import { q, startDetached } from '../../lib/hosting/remote.mjs'
import { cleanDomain } from '../../lib/hosting/server-domain.mjs'
import { connect, ensureKeyPair, exec, installKey, serverDir, upload } from '../../lib/hosting/ssh.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const verb = args[0]
const dry = args.includes('--dry')
const root = (dry && process.env.FRACTERA_LAUNCH_NODE_ROOT) || path.resolve(here, '..', '..')
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] ?? null : null }
const host = String(opt('host') ?? '').trim().toLowerCase()
const port = Number(opt('port') ?? 22)
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/
// The server's node lives in the node user's home under this node's own folder name (the fork's name).
export const REMOTE_USER = 'fractera'
const FOLDER = path.basename(root)
const DIR = (dry && process.env.FRACTERA_LAUNCH_ROOT_DIR) || '/root/.fractera'
const DRY = dry ? 'DRY_RUN=1 ' : ''
const WEEK = 7 * 24 * 3600_000
/** Let's Encrypt, letsencrypt.org/docs/rate-limits (read 2026-11-14): 50 certificates per registered domain per 7 days; 5 per exact set of names. */
export const LE_LIMITS = { domain: 50, name: 5 }

const done = (obj) => { console.log(`===LAUNCH=== ${JSON.stringify(obj)}`) }
const fail = (reason, extra = {}) => { done({ ok: false, reason, ...extra }); process.exitCode = 1 }

async function readStdin() {
  let text = ''
  for await (const chunk of process.stdin) text += chunk
  return text.replace(/\r?\n$/, '')
}

async function scripts(client, names) {
  await exec(client, `mkdir -p ${q(DIR)} && chmod 700 ${q(DIR)}`)
  for (const f of names) await upload(client, `${DIR}/${f}`, readFileSync(path.join(here, f)), 0o700)
}

/** The server's state, read there (`state.sh`); uploaded again when the server has none or an older one. */
async function readState(client) {
  await scripts(client, ['state.sh'])
  const r = await exec(client, `bash ${q(`${DIR}/state.sh`)} ${q(FOLDER)} ${q(DIR)}`, { timeoutMs: 40_000 })
  const line = r.stdout.trim().split('\n').pop() ?? ''
  const s = JSON.parse(line)
  s.verdict = s.probe ? judge(s.probe, { ramMb: null, copyBytes: null }, host) : null
  s.records = launchRecords(s.domain?.domain ?? null, ipOf(s), s.domain?.detect?.zone ?? null)
  if (s.core) {
    recordIssued(s)
    const zone = s.domain?.detect?.zone ?? s.core.zone
    s.week = zone ? weekCount(readLedger(), zone, s.core.rows ?? [], ipOf(s)).week : null
  }
  return s
}

/**
 * 738-6 — WHERE SIGN-IN LEADS, ASKED FROM THE INTERNET: the auth element answers on `auth.<zone>`, and the core's architect pages send a
 * stranger there (never to a loopback address — ✗ 2026-11-14: «http://127.0.0.1:24681/api/auth/error» on aifa.dev, the domain never
 * switched on). Kept on the server with the domain (`signin`).
 */
export async function signinCheck(zone, fetchImpl = fetch) {
  const auth = `https://auth.${zone}`
  let providers = null
  try { providers = (await fetchImpl(`${auth}/api/auth/providers`, { signal: AbortSignal.timeout(15_000), cache: 'no-store' })).status } catch (e) { providers = String(e?.cause?.code ?? e?.message ?? e).slice(0, 80) }
  let url = `https://architect.${zone}/architect`
  let location = null
  for (let i = 0; i < 6; i++) {
    try {
      const r = await fetchImpl(url, { redirect: 'manual', signal: AbortSignal.timeout(15_000), cache: 'no-store' })
      const loc = r.headers.get('location')
      if (!loc) { location = `${r.status} without a redirect`; break }
      const next = new URL(loc, url)
      if (next.host !== new URL(url).host) { location = next.href; break }
      url = next.href
    } catch (e) { location = String(e?.cause?.code ?? e?.message ?? e).slice(0, 80); break }
  }
  return { at: new Date().toISOString(), ok: providers === 200 && typeof location === 'string' && location.startsWith(`${auth}/`), providers, location }
}

async function probe(client) {
  await scripts(client, ['probe.sh', 'state.sh'])
  await exec(client, `${DRY}bash ${q(`${DIR}/probe.sh`)} ${q(FOLDER)} ${port} ${q(`${DIR}/probe.json`)}`, { timeoutMs: 90_000 })
}

/** The domain the page chose for this server, kept on the server; written whole and renamed. */
async function readDomain(client) {
  const r = await exec(client, `cat ${q(`${DIR}/domain.json`)} 2>/dev/null || true`)
  try { return JSON.parse(r.stdout) ?? {} } catch { return {} }
}
async function writeDomain(client, value) {
  await exec(client, `mkdir -p ${q(DIR)} && chmod 700 ${q(DIR)}`)
  await upload(client, `${DIR}/domain.json.tmp`, `${JSON.stringify({ ...value, at: new Date().toISOString() }, null, 2)}\n`, 0o600)
  await exec(client, `mv ${q(`${DIR}/domain.json.tmp`)} ${q(`${DIR}/domain.json`)}`)
}

/** One act of the server node's own domain door on its loopback (the owner at that machine's keyboard); its JSON answer, or null. */
async function serverDoor(client, body) {
  const node = `/home/${REMOTE_USER}/${FOLDER}`
  const cmd = `port=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["port"])' ${q(`${node}/logs/runtime.json`)} 2>/dev/null) && curl -s --max-time 170 -X POST -H 'content-type: application/json' --data-binary @- "http://localhost:$port/api/node/server/domain"`
  const r = await exec(client, cmd, { timeoutMs: 180_000, stdin: JSON.stringify(body) })
  try { return JSON.parse(r.stdout) } catch { return null }
}

/** The server's IPv4: the address typed, else what the server says its public address is. */
const ipOf = (s) => (IPV4.test(host) ? host : s?.probe?.publicIp ?? null)

/** The names of a fresh node before it is installed: the site, its panel and sign-in; every element's name is covered by `*`. */
export function freshTable(zone) {
  const row = (h, label, kind, optional = false) => ({ host: h, zone, label, kind, service: null, port: null, redirectTo: null, optional })
  return { zone, corePort: 24680, rows: [row(zone, '@', 'apex'), row(`www.${zone}`, 'www', 'www', true), row(`architect.${zone}`, 'architect', 'architect'), row(`auth.${zone}`, 'auth', 'auth')] }
}

// ── the ledger of certificates per registered domain (738-5) ──
const ledgerFile = () => path.join(serverDir(root), 'le-ledger.json')
function readLedger() { try { return JSON.parse(readFileSync(ledgerFile(), 'utf8')) ?? {} } catch { return {} } }
/** A finished certificate run of a server: every name it issued is counted once against its registered domain. */
function recordIssued(s) {
  const run = s.core?.certsRun
  const domain = s.domain?.detect?.zone ?? s.core?.zone
  if (!run || run.running || !domain || !Array.isArray(run.hosts)) return
  const ledger = readLedger()
  const list = ledger[domain] ?? []
  let added = 0
  for (const h of run.hosts) {
    if (h.state !== 'done' || list.some((e) => e.host === h.host && e.at === (run.endedAt ?? run.startedAt))) continue
    list.push({ host: h.host, at: run.endedAt ?? run.startedAt, ip: ipOf(s) })
    added += 1
  }
  if (!added) return
  ledger[domain] = list.filter((e) => Date.now() - Date.parse(e.at) < 30 * 24 * 3600_000)
  mkdirSync(serverDir(root), { recursive: true, mode: 0o700 })
  writeFileSync(ledgerFile(), `${JSON.stringify(ledger, null, 2)}\n`, { mode: 0o600 })
}
/** This week's count for a domain: the ledger, plus certificates the server holds younger than 7 days the ledger never saw. */
export function weekCount(ledger, domain, rows = [], ip = null, now = Date.now()) {
  const recent = (ledger[domain] ?? []).filter((e) => now - Date.parse(e.at) < WEEK)
  const unseen = rows.filter((r) => r.certSource === 'letsencrypt' && Number(r.daysLeft) >= 83 && !recent.some((e) => e.host === r.host && e.ip === ip))
  const perName = {}
  for (const e of recent) perName[e.host] = (perName[e.host] ?? 0) + 1
  return { week: recent.length + unseen.length, perName }
}

const verbs = {
  async connect() {
    const password = await readStdin()
    try {
      let fingerprint = null
      if (password) fingerprint = (await installKey({ root, host, port, password, expect: opt('trust') })).fingerprint
      const { client, fingerprint: seen } = await connect({ root, host, port })
      try {
        await probe(client)
        done({ ok: true, fingerprint: fingerprint ?? seen, state: await readState(client) })
      } finally { client.end() }
    } catch (e) {
      // No key on the server and no password typed: the password is needed once (a fresh or reinstalled server).
      fail(!password && e.reason === 'auth' ? 'need-password' : e.reason ?? 'unreachable', { seen: e.seen ?? null, pinned: e.pinned ?? null })
    }
  },

  async state() {
    const { client } = await connect({ root, host, port })
    try { done({ ok: true, state: await readState(client) }) } finally { client.end() }
  },

  async probe() {
    const { client } = await connect({ root, host, port })
    try { await probe(client); done({ ok: true, state: await readState(client) }) } finally { client.end() }
  },

  async install() {
    const mode = opt('mode') === 'update' ? 'update' : 'install'
    const { client } = await connect({ root, host, port })
    try {
      const s = await readState(client)
      if (s.launch?.state === 'running') return fail('running', { state: s })
      // (a dry run's «server» is this very machine: its numbers are not a server's, so only a real run is judged here)
      if (!dry && s.verdict?.level === 'fail') return fail('server-unfit', { state: s })
      const ip = ipOf(s)
      if (!ip) return fail('no-ip', { state: s })
      const fork = forkUrl()
      if (!fork) return fail('no-fork', { state: s })
      await scripts(client, ['launch.sh', 'prepare.sh', 'stages.sh', 'fractera-root.sh', 'state.sh'])
      await startDetached(client, `${DRY}bash ${q(`${DIR}/launch.sh`)} ${REMOTE_USER} ${q(FOLDER)} ${port} ${q(ensureKeyPair(root).publicLine)} ${q(fork)} ${mode} ${q(ip)}`, `${DIR}/launch.out`)
      await new Promise((r) => setTimeout(r, dry ? 300 : 1500))
      done({ ok: true, started: mode, state: await readState(client) })
    } finally { client.end() }
  },

  async domain() {
    const name = cleanDomain(opt('name'))
    if (!name) return fail('bad-domain')
    const { client } = await connect({ root, host, port })
    try {
      const before = await readDomain(client)
      // A new domain starts its ladder anew: what was learned and chosen about the old one does not carry over.
      await writeDomain(client, before.domain === name ? { ...before, domain: name } : { domain: name })
      const s = await readState(client)
      if (s.mark?.phase === 'live' && s.mark?.domainActive !== true) await serverDoor(client, { action: 'domain', name })
      done({ ok: true, state: await readState(client) })
    } finally { client.end() }
  },

  async way() {
    const way = ['dns', 'cloudflare', 'migrate', 'none'].find((w) => w === opt('way'))
    if (!way) return fail('bad-way')
    const { client } = await connect({ root, host, port })
    try {
      const d = await readDomain(client)
      if (!d.domain) return fail('no-domain')
      await writeDomain(client, { ...d, way })
      const s = await readState(client)
      if (s.mark?.phase === 'live') await serverDoor(client, { action: 'way', way })
      done({ ok: true, state: await readState(client) })
    } finally { client.end() }
  },

  async detect() {
    const { client } = await connect({ root, host, port })
    try {
      const d = await readDomain(client)
      if (!d.domain) return fail('no-domain')
      const s0 = await readState(client)
      await writeDomain(client, { ...d, detect: await detectDomain(d.domain, { ip: ipOf(s0) }) })
      if (s0.mark?.phase === 'live') await serverDoor(client, { action: 'detect' })
      done({ ok: true, state: await readState(client) })
    } finally { client.end() }
  },

  // The first check (738, step 3): asked from here, through public resolvers, for the names a fresh node will have.
  async dns() {
    const { client } = await connect({ root, host, port })
    try {
      const d = await readDomain(client)
      if (!d.domain) return fail('no-domain')
      const ip = ipOf(await readState(client))
      const results = (await checkNames(freshTable(d.domain), ip)).map((r) => ({ host: r.host, state: r.state }))
      await writeDomain(client, { ...d, check: { at: new Date().toISOString(), ip, results } })
      done({ ok: true, state: await readState(client) })
    } finally { client.end() }
  },

  async door() {
    const body = JSON.parse((await readStdin()) || '{}')
    if (!['dns-check', 'certs', 'check', 'activate', 'upload', 'claim'].includes(body?.action)) return fail('bad-action')
    const { client } = await connect({ root, host, port })
    try {
      const s = await readState(client)
      if (s.mark?.phase !== 'live' || !s.core) return fail('not-live', { state: s })
      if (body.action === 'certs') {
        // 738-5: one name per certificate keeps a failing name from blocking the others (D26) — and spends the weekly budget per name.
        const rows = s.core.rows ?? []
        const want = rows.filter((r) => r.dns === 'ok' && (r.cert === 'missing' || r.cert === 'expiring')).map((r) => r.host)
        const domain = s.domain?.detect?.zone ?? s.core.zone
        const count = weekCount(readLedger(), domain, rows, ipOf(s))
        const over = want.filter((h) => (count.perName[h] ?? 0) >= LE_LIMITS.name)
        if (count.week + want.length > LE_LIMITS.domain || over.length) return fail('le-limit', { week: count.week, want: want.length, over, state: s })
      }
      const answer = await serverDoor(client, body.action === 'upload' ? { action: 'upload', host: body.name, fullchain: body.fullchain, privkey: body.privkey } : { action: body.action })
      if (body.action === 'activate' && answer?.ok) {
        // The auth element restarts with its public address: a few seconds before it answers there.
        await new Promise((r) => setTimeout(r, dry ? 10 : 8000))
        const d = await readDomain(client)
        await writeDomain(client, { ...d, signin: await signinCheck(s.core.zone) })
      }
      done({ ok: answer?.ok !== false, answer, state: await readState(client) })
    } finally { client.end() }
  },

  async signin() {
    const { client } = await connect({ root, host, port })
    try {
      const s = await readState(client)
      const zone = s.core?.zone
      if (!zone || s.mark?.domainActive !== true) return fail('not-live', { state: s })
      const d = await readDomain(client)
      await writeDomain(client, { ...d, signin: await signinCheck(zone) })
      done({ ok: true, state: await readState(client) })
    } finally { client.end() }
  },

  async clear() {
    if (opt('confirm') !== host) return fail('not-confirmed')
    const { client } = await connect({ root, host, port })
    try {
      await scripts(client, ['clear.sh'])
      const r = await exec(client, `${DRY}bash ${q(`${DIR}/clear.sh`)}`, { timeoutMs: 180_000 })
      let cleared = null
      try { cleared = JSON.parse(r.stdout.trim().split('\n').pop()) } catch { /* the script said nothing readable */ }
      await probe(client)
      done({ ok: Boolean(cleared), cleared, state: await readState(client) })
    } finally { client.end() }
  },
}

/** This node's fork as a clean public address — never a credential that may sit in the remote's URL. */
function forkUrl() {
  if (dry && process.env.FRACTERA_LAUNCH_FORK) return process.env.FRACTERA_LAUNCH_FORK
  try {
    const raw = execSync('git remote get-url origin', { cwd: root, encoding: 'utf8' }).trim()
    const m = /github\.com[/:]([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/.exec(raw)
    return m ? `https://github.com/${m[1]}/${m[2]}.git` : null
  } catch { return null }
}

// The records of step 3 for the page: what to write at the registrar, the names of a fresh node (`*` covers the elements).
export function launchRecords(zone, ip, dnsZone = null) {
  return zone && ip ? dnsRecords(freshTable(zone), ip, dnsZone) : []
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (!verbs[verb]) {
    console.log('Запуск сервера: connect · state · probe · install --mode install|update · domain --name · way --way · detect · dns · door · signin · clear --confirm')
    process.exit(verb ? 2 : 0)
  }
  if (!(IPV4.test(host) || isHostName(host)) || !Number.isInteger(port) || port < 1 || port > 65535) {
    fail('bad-address')
  } else {
    try { await verbs[verb]() } catch (e) { fail(e.reason ?? 'unreachable', { detail: String(e.message ?? e).slice(0, 300), seen: e.seen ?? null, pinned: e.pinned ?? null }) }
  }
  // ssh2 may keep a socket half-open after `end()`: the runner ends with its answer.
  setTimeout(() => process.exit(), 50).unref?.()
}
