// THE LAUNCH RUNNER — ONE ACT ON ONE SERVER PER CALL (node step 738-4). The owner, 2026-11-14: «Никакого переезда нет есть просто запуск
// сервера … в данном локальном компьютере меняться ничего не должно … входит у неё заново обнаруживает пустой страницу и до того момента
// пока он не в ведёт информацию о IP-адресе и пароле странице будет оставаться пустой. А после этого ты получишь состояние установлено ли
// уже Fractera …, если установлена то какая версия … насколько она отстает. От этого строится стратегия.»
// `node scripts/dedicated-server/launch.mjs <verb> --host <IPv4|name> [--port 22] […]`, started by the door `app/api/node/launch` and
// awaited (seconds): every long act runs ON THE SERVER, detached; the computer only asks. The last line is `===LAUNCH=== <json>`.
//   connect [--trust <SHA256:…>] [--minutes <n>]   the root password → a visit for a day (744-3; `--minutes` shortens it, for a test),
//                                   or this browser's visit key → the server checked; the answer carries the visit key for the door ONLY
//   close                           the visit closed now: its line leaves the server
//   state                           the server's own state (`state.sh`): its check, its launch, its domain, its node's names and certificates
//   probe                           the server checked again (`probe.sh`: system, memory, cores, disk, ports, an install and its version)
//   install --mode install|update   `launch.sh` started on the server as root, detached; the page follows it by `state`; refused
//                                   (`domain-not-ready`, 744-5) until step 3 is done — `domainSteps`, the page's own reading
//   domain --name <domain> · way --way dns|none · detect · dns
//                                   the domain chosen for the server, kept ON the server (`/root/.fractera/domain.json`); once the
//                                   server's node lives, the same acts go to its own domain door too
//   door                            one act of the server node's own domain door (stdin: its JSON body) — dns-check · certs · check ·
//                                   activate · upload · claim (739-5: the architect's one-time code, passed back once, kept nowhere here);
//                                   a certificate run is refused here past the Let's Encrypt weekly limits (738-5)
//   signin                          where sign-in leads, asked from the internet (738-6)
//   telegram                        758, step 5: the server's own bot (stdin `body`: { action: token|skip|link|messages, token?, lines? }) — a token before the
//                                   server's node lives waits in `/root/.fractera/telegram.json` (0600) and is handed to that node's channel
//                                   door at its first answer (`readState`); the page sees only the tail, the bot's name and the invite link
//                                   744-6: `door activate` is refused (`not-ready`, the names missing) until every required name has a
//                                   certificate and HTTPS; this computer's «launched» mark is written only when the final check passed
//                                   (`lib/hosting/final-check.mjs`) — the answer carries `ready: { ok, missing }`
//   repo                            808, step 4: the server's own GitHub repository (stdin `body`: { op: same|own|account|fork|url, url? })
//                                   — kept in `/root/.fractera/repo.json`; `url` only with GitHub's yes (a DIRECT fork, law 368); none — this
//                                   node's fork; `install` clones what is kept and is refused (`repo-not-chosen`) while «own» has no fork
//   clear --confirm <host>          a server taken by another installation: freed (stopped and kept, never erased), then checked again;
//                                   744-4: a node not related to this one is set aside whole (`clear.sh --node`)
// 🔒 THE COMPUTER KEEPS NO STATE OF A SERVER (738) AND NO KEY TO IT (744-3): only the map of pins (`lib/hosting/ssh.mjs`) and the ledger
// of certificates issued per domain (`data/node/server/le-ledger.json`) — Let's Encrypt counts per domain across every server and every
// reinstall, and nothing else on this machine could know it.
// 🔒 STDIN IS ONE JSON OBJECT `{ password?, key?, body? }` and nothing else carries a secret: the root password (used once by
// `openVisit`, dropped), the browser's visit key (the door reads it from an HttpOnly cookie), the body of a door act. Not argv (the
// process list shows it), not the environment, not a file.
// `--dry`: the server scripts run with DRY_RUN=1 (every command printed, none run) — the test's «server» is this very machine.
import { execSync } from 'node:child_process'
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { detectDomain } from '../../lib/hosting/domain-detect.mjs'
import { checkNames } from '../../lib/hosting/dns-check.mjs'
import { dnsRecords, isHostName } from '../../lib/hosting/hostnames.mjs'
import { judge } from '../../lib/hosting/judge.mjs'
import { finalCheck, namesReady } from '../../lib/hosting/final-check.mjs'
import { domainMissing } from '../../lib/hosting/launch-domain.mjs'
import { relationOf } from '../../lib/hosting/relation.mjs'
import { q, startDetached } from '../../lib/hosting/remote.mjs'
import { cleanDomain } from '../../lib/hosting/server-domain.mjs'
import { forkCheck, nextRepo, readRepo } from '../../lib/hosting/server-repo.mjs'
import { checkToken, cleanLines, greetText, readWaiting, tailOf, telegramView, TOKEN_SHAPE, tokenFrom } from '../../lib/hosting/server-telegram.mjs'
import { markLaunched } from '../../lib/hosting/launched.mjs'
import { closeVisit, connect, exec, openVisit, serverDir, upload } from '../../lib/hosting/ssh.mjs'

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

let inputRead = null
/** The caller's JSON on stdin, read once: `{ password?, key?, body? }`. */
function input() {
  inputRead ??= (async () => {
    let text = ''
    for await (const chunk of process.stdin) text += chunk
    try {
      const v = JSON.parse(text || '{}')
      return v && typeof v === 'object' ? v : {}
    } catch { return {} }
  })()
  return inputRead
}

/** A connection by this browser's visit key; none, expired or closed — `need-password` (the person types the root password again). */
async function byKey() {
  const { key } = await input()
  const given = typeof key === 'string' && key ? key : null
  try {
    const c = await connect({ root, host, port, privateKey: given })
    trace({ verb, key: given ? 'given' : 'none', result: 'connected' })
    return c
  } catch (e) {
    trace({ verb, key: given ? 'given' : 'none', result: e?.reason ?? 'error' })
    throw e?.reason === 'auth' ? Object.assign(new Error('need-password'), { reason: 'need-password' }) : e
  }
}

// 784 (2026-11-18, the owner: «я ввожу пароль … доступ открыт … тут же … need-password»): which side loses the visit — the browser's cookie
// never reaching the door (key «none») or the server refusing the key («auth»). No secret is written: only whether a key came.
function trace(row) {
  try { appendFileSync(path.join(root, 'logs', 'launch-trace.jsonl'), JSON.stringify({ at: new Date().toISOString(), host, ...row }) + '\n') } catch { /* a trace never stops a launch */ }
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
  // 744-5: ONE DOMAIN RECORD. The server's node holds a domain (its mark) and the page has no record of it — written once, from the mark,
  // so the page and every act read the same domain and way. ✗ Measured 2026-11-14: the page read only domain.json (absent on the test
  // server) while the mark held aifa.dev and its way.
  if (!s.domain?.domain && typeof s.mark?.domain === 'string' && s.mark.domain) {
    const record = { domain: s.mark.domain, ...(s.mark.domainWay ? { way: s.mark.domainWay } : {}), from: 'server', since: s.mark.at ?? null }
    await writeDomain(client, record)
    s.domain = { ...(s.domain ?? {}), ...record }
  }
  s.verdict = s.probe ? judge(s.probe, { ramMb: null, copyBytes: null }, host) : null
  // 808: the server's own repository — this node's fork by default, or the person's own fork once GitHub confirmed it
  s.repo = readRepo((await exec(client, `cat ${q(REPO_FILE())} 2>/dev/null || true`)).stdout, forkUrl())
  // 744-4 (D49): what the server IS to this node — clean · related · unrelated with its reasons — before anything is offered.
  // 808: measured by the SERVER's own fork: a server the person put on their own fork is related to this launch, never «a stranger».
  s.relation = s.probe ? relationOf(s.probe, s.repo.url ?? forkUrl()) : null
  if (s.relation?.nodeUnrelated) s.relation.nodes = [...(s.probe?.fractera ? [FOLDER] : []), ...(s.probe?.otherNodes ?? [])]
  s.records = launchRecords(s.domain?.domain ?? null, ipOf(s), s.domain?.detect?.zone ?? null)
  s.telegram = await readTelegram(client, Boolean(s.core), { zone: s.core?.zone ?? s.domain?.domain ?? null, ip: ipOf(s) })
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
  // 744-9: the panel's own sign-in door. ✗ Measured 2026-11-14 on aifa.dev: /architect → /en/architect → /en answers 200 with the lock
  // window (AccessGate) and no redirect — by design, so a check that started there could never pass; /login → https://auth.<zone>/login.
  let url = `https://architect.${zone}/login`
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
  if (!dry) await preflight(client)
}

/**
 * 743-4: a node there that is behind — will its update pass? This computer's stage 0 runs on the server as the node's user with
 * `--preflight`: the TARGET's updater merges in a throwaway copy and answers, nothing on the server is touched. The verdict is kept in
 * `preflight.json` beside the probe (state.sh shows it); not behind or launching — the old verdict is removed.
 */
async function preflight(client) {
  let f = null
  try { f = JSON.parse((await exec(client, `cat ${q(`${DIR}/probe.json`)} 2>/dev/null || true`)).stdout)?.fractera ?? null } catch { /* no probe yet */ }
  if (!f?.head || !(f.behind > 0) || f.launching) { await exec(client, `rm -f ${q(`${DIR}/preflight.json`)}`); return }
  await upload(client, `${DIR}/node-update-stage0.mjs`, readFileSync(path.join(here, '..', 'node-update-stage0.mjs')), 0o700)
  // the node's user cannot read /root/.fractera: a readable copy for this one run, removed after it
  const tmp = `/tmp/fractera-stage0-${process.pid}-${Date.now()}.mjs`
  const run = `node ${tmp} --root /home/${REMOTE_USER}/${FOLDER} --preflight`
  const r = await exec(client, `install -m 644 ${q(`${DIR}/node-update-stage0.mjs`)} ${q(tmp)} && runuser -l ${REMOTE_USER} -c ${q(run)}; rm -f ${q(tmp)}`, { timeoutMs: 180_000 })
  const line = String(r.stdout ?? '').split('\n').reverse().find((l) => l.startsWith('===NODE_UPDATE_PREFLIGHT=== '))
  let verdict = null
  try { verdict = line ? JSON.parse(line.slice('===NODE_UPDATE_PREFLIGHT=== '.length)) : null } catch { /* unreadable — no verdict */ }
  const kept = { at: new Date().toISOString(), verdict, detail: verdict ? null : `${r.stdout ?? ''}${r.stderr ?? ''}`.slice(-300) }
  await upload(client, `${DIR}/preflight.json`, `${JSON.stringify(kept)}\n`, 0o600)
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
  // the node's folder as state.sh reads it: STATE_NODE_DIR (the tests' planted node) or the server node's own folder
  const cmd = `node_dir="\${STATE_NODE_DIR:-${node}}"; port=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["port"])' "$node_dir/logs/runtime.json" 2>/dev/null) && curl -s --max-time 170 -X POST -H 'content-type: application/json' --data-binary @- "http://localhost:$port/api/node/server/domain"`
  const r = await exec(client, cmd, { timeoutMs: 180_000, stdin: JSON.stringify(body) })
  try { return JSON.parse(r.stdout) } catch { return null }
}

// 808: the server's own repository
const REPO_FILE = () => `${DIR}/repo.json`

// ── 758: the server's own bot ──
const TELEGRAM_FILE = () => `${DIR}/telegram.json`

/** The server node's own channel door of its main agent on its loopback (the owner at that machine — `isOwnerAtMachine`); its JSON or null.
 * 🔒 THE TOKEN NEVER ENTERS AN ARGV: the body goes by the SSH channel's stdin to `curl --data-binary @-` (737-11a, `e6961403`). */
async function channel(client, body = null, door = 'channel') {
  const node = `/home/${REMOTE_USER}/${FOLDER}`
  // ✗ 2026-11-16 on 109.199.105.213: the node answers `/en/architect/build/…` with a redirect to `/en/build/…` (the panel's addresses drop
  // «architect»); curl without -L read the redirect as silence and the token waited forever. The page's own address now, and the redirect
  // followed with its method and body.
  const send = body ? `-X POST -H 'content-type: application/json' --data-binary @- --post301 --post302 --post303` : ''
  const cmd = `node_dir="\${STATE_NODE_DIR:-${node}}"; port=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["port"])' "$node_dir/logs/runtime.json" 2>/dev/null) && curl -s -L --max-redirs 3 --max-time 25 ${send} "http://localhost:$port/en/build/agent-api/${door}"`
  const r = await exec(client, cmd, { timeoutMs: 40_000, ...(body ? { stdin: JSON.stringify(body) } : {}) })
  try { const v = JSON.parse(r.stdout); return v && typeof v === 'object' ? v : null } catch { return null }
}

/** The bot as the page may see it. A token that waited for the node is handed over the first time the node answers, then removed.
 *  761: with the bot's lines it waited with, the server's Claude Code sign-in (`claude-auth`) and, once both are there, the greeting. */
async function readTelegram(client, live, site = {}) {
  const raw = (await exec(client, `cat ${q(TELEGRAM_FILE())} 2>/dev/null || true`)).stdout
  const waiting = readWaiting(raw)
  let lines = null
  try { lines = cleanLines(JSON.parse(raw || 'null')?.lines) } catch { lines = null }
  let state = live ? await channel(client) : null
  if (live && waiting.token && state?.configured !== true) {
    const saved = await channel(client, { action: 'token', token: waiting.token })
    if (saved?.ok) {
      if (lines) await channel(client, { action: 'messages', messages: lines })
      await exec(client, `rm -f ${q(TELEGRAM_FILE())}`)
      state = await channel(client)
      return withAgent(client, telegramView({ pending: false, tail: null, skipped: false }, state), site)
    }
    // Telegram refused the waiting token: it is dropped (never tried again on every read), the step asks for a new one by its tail
    if (saved?.error === 'token-rejected' || saved?.error === 'bad-format') {
      await writeTelegram(client, { rejected: waiting.tail })
      return telegramView({ pending: false, tail: null, skipped: false, rejected: waiting.tail }, state && state.ok !== false ? state : null)
    }
  }
  if (live && waiting.token && state?.configured === true) await exec(client, `rm -f ${q(TELEGRAM_FILE())}`)
  return withAgent(client, telegramView(waiting, state && state.ok !== false ? state : null), site)
}

const GREETED_FILE = () => `${DIR}/telegram-greeted.json`

/** 761-1: can the server's agent answer — is its Claude Code signed in (`claude auth status` behind its own door)? Once the bot is set
 *  and the sign-in is there, the server's main agent is woken ONCE by the node line `moved` to greet the person, naming the site. */
async function withAgent(client, view, site) {
  if (!view.live || !view.configured) return { ...view, signedIn: null, greeted: false }
  const auth = await channel(client, null, 'claude-auth')
  const signedIn = typeof auth?.loggedIn === 'boolean' ? auth.loggedIn : null
  // 🔒 ONE GREETING: the mark is written BEFORE the wake (a wake whose answer is lost never wakes twice); a failed one is tried again
  // only after ten minutes, never on every read of the page.
  let mark = null
  try { mark = JSON.parse((await exec(client, `cat ${q(GREETED_FILE())} 2>/dev/null || true`)).stdout || 'null') } catch { mark = null }
  let greeted = mark?.ok === true
  const fresh = mark && Date.now() - Date.parse(mark.at) < 10 * 60_000
  if (signedIn === true && !greeted && !fresh && view.allowed > 0) greeted = await greet(client, site)
  return { ...view, signedIn, greeted }
}

async function greet(client, site) {
  const node = `/home/${REMOTE_USER}/${FOLDER}`
  const as = dry ? '' : `runuser -u ${REMOTE_USER} -- env HOME=/home/${REMOTE_USER} `
  // the greeting runs on Haiku (the owner, 2026-11-16: a simple act — the economy model); a failure of the switch never stops the greeting
  const js = "const t=require('fs').readFileSync(0,'utf8');const r=process.cwd();const nl=require(r+'/lib/agent-kit/node-line.cjs');require(r+'/lib/deploy/agent-return.cjs').wakeMainByNode(r,nl.head('moved','build')+t).then((w)=>console.log(JSON.stringify({ok:!w,why:w||null})))"
  const cmd = `node_dir="\${STATE_NODE_DIR:-${node}}"; cd "$node_dir" && { ${as}node scripts/main-agent-cli.mjs session model haiku build >/dev/null 2>&1 || true; ${as}node -e ${q(js)}; }`
  const markIt = (ok) => upload(client, GREETED_FILE(), `${JSON.stringify({ at: new Date().toISOString(), ok, site: site.zone ?? site.ip ?? null })}\n`, 0o600)
  await markIt(false)
  const r = await exec(client, cmd, { timeoutMs: 90_000, stdin: greetText(site) })
  let ok = false
  try { ok = JSON.parse(r.stdout.trim().split('\n').pop() ?? '')?.ok === true } catch { ok = false }
  if (ok) await markIt(true)
  return ok
}

async function writeTelegram(client, value) {
  await exec(client, `mkdir -p ${q(DIR)} && chmod 700 ${q(DIR)}`)
  await upload(client, `${TELEGRAM_FILE()}.tmp`, `${JSON.stringify({ ...value, at: new Date().toISOString() })}\n`, 0o600)
  await exec(client, `mv ${q(`${TELEGRAM_FILE()}.tmp`)} ${q(TELEGRAM_FILE())}`)
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
    const { password, key } = await input()
    const typed = typeof password === 'string' && password ? password : null
    try {
      // 744-3: the password opens a visit (this browser's earlier key, if any, is replaced on the server); without one — the visit key.
      const visit = typed ? await openVisit({ root, host, port, password: typed, expect: opt('trust'), previous: typeof key === 'string' && key ? key : null, minutes: opt('minutes') ?? undefined }) : null
      // 769 (✗ 2026-11-16 19:25 and 19:31: a reinstalled server — openVisit pinned it, then probe.sh + state.sh outran the door's 150 s; the
      // runner was killed with the visit key in its memory: the server had the key, the browser had nothing): the visit goes back AT ONCE,
      // the door keeps it in the cookie; the long check is the page's next call (`probe`, by that cookie) and can lose nothing.
      if (visit) return done({ ok: true, fingerprint: visit.fingerprint, visit: { key: visit.privateKey, deadline: visit.deadline }, state: null, check: 'probe' })
      const { client, fingerprint: seen } = await byKey()
      try {
        await probe(client)
        done({ ok: true, fingerprint: seen, visit: null, state: await readState(client) })
      } finally { client.end() }
    } catch (e) {
      fail(e.reason ?? 'unreachable', { seen: e.seen ?? null, pinned: e.pinned ?? null })
    }
  },

  async close() {
    const { key } = await input()
    try {
      done({ ok: true, ...(await closeVisit({ root, host, port, privateKey: typeof key === 'string' && key ? key : null })) })
    } catch (e) {
      fail(e.reason === 'auth' ? 'need-password' : e.reason ?? 'unreachable')
    }
  },

  async state() {
    const { client } = await byKey()
    try { done({ ok: true, state: await readState(client) }) } finally { client.end() }
  },

  // 806-3: the live reader — the running stage's log tail and the checklist with times (`log.sh`), asked every few seconds by the page
  async log() {
    const { client } = await byKey()
    try {
      await scripts(client, ['log.sh'])
      const r = await exec(client, `bash ${q(`${DIR}/log.sh`)} ${q(FOLDER)} ${q(DIR)}`, { timeoutMs: 20_000 })
      done({ ok: true, log: JSON.parse(r.stdout.trim().split('\n').pop() ?? '') })
    } finally { client.end() }
  },

  async probe() {
    const { client } = await byKey()
    try { await probe(client); done({ ok: true, state: await readState(client) }) } finally { client.end() }
  },

  async install() {
    const mode = opt('mode') === 'update' ? 'update' : 'install'
    const { client } = await byKey()
    try {
      const s = await readState(client)
      if (s.launch?.state === 'running') return fail('running', { state: s })
      // 744-4: a server not related to this node is cleared first — the page opens nothing else, and neither does this runner.
      if (s.relation?.kind === 'unrelated') return fail('unrelated', { state: s })
      // 744-5, D46: the installation stands after the domain — refused here as the page keeps it closed, by the same reading of step 3.
      const missing = domainMissing(s.domain)
      if (missing.length) return fail('domain-not-ready', { state: s, missing })
      // (a dry run's «server» is this very machine: its numbers are not a server's, so only a real run is judged here)
      if (!dry && s.verdict?.level === 'fail') return fail('server-unfit', { state: s })
      const ip = ipOf(s)
      if (!ip) return fail('no-ip', { state: s })
      // 808: the server's own repository (step 4) — «own» without GitHub's yes is refused as the page keeps step 5 closed
      const fork = s.repo?.url ?? null
      if (!fork) return fail(s.repo?.mode === 'own' ? 'repo-not-chosen' : 'no-fork', { state: s })
      await scripts(client, ['launch.sh', 'prepare.sh', 'stages.sh', 'fractera-root.sh', 'fractera-element.sh', 'node-git.sh', 'state.sh'])
      // 743-5: this computer's stage 0 — the update of a server of any version is done by the target's own updater
      await upload(client, `${DIR}/node-update-stage0.mjs`, readFileSync(path.join(here, '..', 'node-update-stage0.mjs')), 0o700)
      await startDetached(client, `${DRY}bash ${q(`${DIR}/launch.sh`)} ${REMOTE_USER} ${q(FOLDER)} ${port} ${q(fork)} ${mode} ${q(ip)}`, `${DIR}/launch.out`)
      await new Promise((r) => setTimeout(r, dry ? 300 : 1500))
      done({ ok: true, started: mode, state: await readState(client) })
    } finally { client.end() }
  },

  async domain() {
    const name = cleanDomain(opt('name'))
    if (!name) return fail('bad-domain')
    const { client } = await byKey()
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
    const way = ['dns', 'none'].find((w) => w === opt('way')) // 759: the registrar only
    if (!way) return fail('bad-way')
    const { client } = await byKey()
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
    const { client } = await byKey()
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
    const { client } = await byKey()
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
    const body = (await input()).body ?? {}
    if (!['dns-check', 'certs', 'check', 'activate', 'upload', 'claim'].includes(body?.action)) return fail('bad-action')
    // 796 ✗ 14:56–15:00 (Telegram 697, 699): a status read through SSH (a whole state read per call) piled up on the server while the page
    // asked in a loop. The read is answered here, without the server: «not known» — the page shows the e-mail road, and the claim
    // itself says «claimed» when an architect already exists.
    if (body.action === 'claim' && body.status === true) return done({ ok: true, answer: { ok: true, claimed: false, known: false } })
    const { client } = await byKey()
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
      // 744-6: the domain is switched on only over names that are ready — a certificate and HTTPS for every required one.
      if (body.action === 'activate') {
        const names = namesReady(s)
        if (!names.ok) return fail('not-ready', { missing: names.missing, state: s })
      }
      // 796: the claim carries the architect's e-mail (or `status`) to the server's own door — by the SSH channel's stdin, never an argv
      const claim = body.action === 'claim' ? { ...(typeof body.email === 'string' && body.email ? { email: body.email.slice(0, 254) } : {}), ...(body.status === true ? { status: true } : {}) } : {}
      if (body.action === 'claim') trace({ verb: 'claim', key: 'given', result: claim.status ? 'status' : claim.email ? 'email' : 'code' })
      const answer = await serverDoor(client, body.action === 'upload' ? { action: 'upload', host: body.name, fullchain: body.fullchain, privkey: body.privkey } : { action: body.action, ...claim })
      // 744-9: the server door's own refusal reaches the page with its reason; silence is a failure, never «ok».
      // ✗ Measured 2026-11-14: activate refused by the server node («check-first», its code older than this computer's rule) and the
      // page said «Узел не ответил» — the reason was lost here, and a door that answered nothing passed as ok.
      if (!answer) return fail('door-silent', { state: await readState(client) })
      if (answer.ok === false) return fail(typeof answer.reason === 'string' ? answer.reason : 'door-refused', { answer, state: await readState(client) })
      if (body.action === 'activate' && answer?.ok) {
        // The auth element restarts with its public address: a few seconds before it answers there.
        await new Promise((r) => setTimeout(r, dry ? 10 : 8000))
        const d = await readDomain(client)
        await writeDomain(client, { ...d, signin: await signinCheck(s.core.zone) })
        // 741-6, D36: this computer remembers the server it launched lives at its domain — its online bar stops offering a temporary
        // address. 744-6: only once the final check passed on the server's fresh state.
        const fresh = await readState(client)
        const ready = finalCheck(fresh)
        if (ready.ok) markLaunched(root, { ip: ipOf(fresh), domain: s.core.zone })
        return done({ ok: true, answer, ready, state: fresh })
      }
      done({ ok: answer?.ok !== false, answer, state: await readState(client) })
    } finally { client.end() }
  },

  // 808: step 4 — the server's own repository, chosen before the installation; never changed under a node (only the clear frees it).
  async repo() {
    const body = (await input()).body ?? {}
    const op = ['same', 'own', 'account', 'fork', 'url'].find((a) => a === body?.op)
    if (!op) return fail('bad-action')
    // the tests' dry runs never call GitHub: LAUNCH_DRY_REPO=<reason> plays a refusal, otherwise the address is taken as a fork
    const check = op !== 'url' ? null : dry ? (process.env.LAUNCH_DRY_REPO ? { ok: false, reason: process.env.LAUNCH_DRY_REPO } : { ok: true, url: String(body.url ?? '').replace(/\/?$/, '').replace(/(\.git)?$/, '.git') }) : await forkCheck(body.url)
    if (check && !check.ok) return fail(`repo-${check.reason}`, check.parent ? { parent: check.parent } : {})
    const { client } = await byKey()
    try {
      const s0 = await readState(client)
      if (['running', 'done'].includes(s0.launch?.state) || s0.probe?.fractera) return fail('repo-installed', { state: s0 })
      const record = nextRepo(s0.repo, { op, ...(check?.ok ? { url: check.url } : {}) })
      await exec(client, `mkdir -p ${q(DIR)} && chmod 700 ${q(DIR)}`)
      await upload(client, `${REPO_FILE()}.tmp`, `${JSON.stringify({ ...record, at: new Date().toISOString() })}\n`, 0o600)
      await exec(client, `mv ${q(`${REPO_FILE()}.tmp`)} ${q(REPO_FILE())}`)
      done({ ok: true, state: await readState(client) })
    } finally { client.end() }
  },

  // 758: step 5 — the server's own bot, while the server installs or after it.
  async telegram() {
    const body = (await input()).body ?? {}
    const action = ['token', 'skip', 'link', 'messages'].find((a) => a === body?.action)
    const lines = cleanLines(body?.lines)
    if (!action) return fail('bad-action')
    // 784 (Telegram 714): the token alone or BotFather's whole message; Telegram confirms it before anything is kept
    const token = action === 'token' ? tokenFrom(body.token) ?? '' : ''
    if (action === 'token' && !TOKEN_SHAPE.test(token)) return fail('bad-token')
    // the tests' dry runs never call Telegram: LAUNCH_DRY_TELEGRAM=refused|silent plays its refusal
    const dryBot = () => (process.env.LAUNCH_DRY_TELEGRAM ? { ok: false, reason: `token-${process.env.LAUNCH_DRY_TELEGRAM}`.replace('token-silent', 'telegram-silent') } : { ok: true, username: 'dry_test_bot', name: 'Dry' })
    const bot = action === 'token' ? (dry ? dryBot() : await checkToken(token)) : null
    if (bot && !bot.ok) return fail(bot.reason)
    const { client } = await byKey()
    try {
      const s0 = await readState(client)
      const live = s0.telegram?.live === true
      if (action === 'skip') {
        if (!s0.telegram?.configured && !s0.telegram?.pending) await writeTelegram(client, { skipped: true })
        return done({ ok: true, state: await readState(client) })
      }
      if (action === 'messages') {
        // 761-2/761-14: the bot's lines in the page's language, each naming the site — sent again to a bot set before 761
        if (!lines) return fail('bad-lines', { state: s0 })
        if (!live || !s0.telegram?.configured) return fail('no-bot', { state: s0 })
        const r = await channel(client, { action: 'messages', messages: lines })
        return r?.ok ? done({ ok: true, state: s0 }) : fail(String(r?.error ?? 'server-silent'), { state: s0 })
      }
      if (action === 'link') {
        if (!live || !s0.telegram?.configured) return fail('no-bot', { state: s0 })
        const r = await channel(client, { action: 'activation-link' })
        return r?.ok && typeof r.url === 'string' ? done({ ok: true, link: r.url, state: s0 }) : fail(String(r?.error ?? 'server-silent'), { state: s0 })
      }
      if (live) {
        // the node lives: the token goes straight to its channel door, which checks it with Telegram before it keeps it
        const r = await channel(client, { action: 'token', token })
        if (!r?.ok) return fail(String(r?.error ?? 'server-silent'), { state: s0 })
        if (lines) await channel(client, { action: 'messages', messages: lines })
        await exec(client, `rm -f ${q(TELEGRAM_FILE())}`)
      } else {
        await writeTelegram(client, { token, username: bot?.ok ? bot.username : null, name: bot?.ok ? bot.name : null, ...(lines ? { lines } : {}) })
      }
      done({ ok: true, tail: tailOf(token), state: await readState(client) })
    } finally { client.end() }
  },

  async signin() {
    const { client } = await byKey()
    try {
      const s = await readState(client)
      const zone = s.core?.zone
      if (!zone || s.mark?.domainActive !== true) return fail('not-live', { state: s })
      const d = await readDomain(client)
      await writeDomain(client, { ...d, signin: await signinCheck(zone) })
      // 741-6, D36: a live server, seen live — 744-6: only when the final check passed on the server's fresh state
      const fresh = await readState(client)
      const ready = finalCheck(fresh)
      if (ready.ok) markLaunched(root, { ip: ipOf(fresh), domain: zone })
      done({ ok: true, ready, state: fresh })
    } finally { client.end() }
  },

  // 806-8 (the owner, 2026-11-19: «yes of course 100%»): what earlier installers left — the Easy Starter's trees, root's caches, Docker's
  // unused — erased beside this node, which is never named there (`leftovers.sh`); detached like the clear, its one line read here
  async leftovers() {
    if (opt('confirm') !== host) return fail('not-confirmed')
    const { client } = await byKey()
    try {
      await scripts(client, ['leftovers.sh'])
      const out = `${DIR}/leftovers.out`
      await exec(client, `rm -f ${q(out)}`)
      await startDetached(client, `${dry ? 'LEFT_TEST=1 ' : ''}bash ${q(`${DIR}/leftovers.sh`)}`, out)
      let answer = null
      for (const t0 = Date.now(); !answer && Date.now() - t0 < 1_500_000;) {
        await new Promise((res) => setTimeout(res, dry ? 200 : 3000))
        const r = await exec(client, `tail -n 1 ${q(out)} 2>/dev/null || true`, { timeoutMs: 20_000 })
        try { const v = JSON.parse(r.stdout.trim()); if (v && typeof v === 'object' && 'erased' in v) answer = v } catch { /* not yet */ }
      }
      await probe(client)
      done({ ok: Boolean(answer), leftovers: answer, state: await readState(client) })
    } finally { client.end() }
  },

  async clear() {
    if (opt('confirm') !== host) return fail('not-confirmed')
    const { client } = await byKey()
    try {
      // 744-4: an unrelated node is set aside whole; beside a related node only the strangers go.
      const s0 = await readState(client)
      // 784 (the owner, 2026-11-18, Telegram 642/662: «будем делать перестановку на уровне ниже переустановки операционной системы … мне
      // нужна кнопка очистить данный сервер»): `--fresh` — the person chose «с нуля» for a server holding THIS node's own older install.
      // 806-1 (the owner, 2026-11-19: «полная очистка»): every Fractera node named here is ERASED with every older copy, the Easy
      // Starter's way; `--keep-site` keeps this node's own nginx site so its «updating» page answers while the fresh node installs (806-6).
      const fresh = args.includes('--fresh') && Boolean(s0.probe?.fractera)
      const nodes = fresh ? [...new Set([FOLDER, ...(s0.relation?.nodes ?? []), ...(s0.probe?.otherNodes ?? [])])] : s0.relation?.nodes ?? []
      await scripts(client, ['clear.sh', 'leftovers.sh'])
      // 806-1: an erase of whole nodes (millions of files) may outlast one SSH call — the script runs detached on the server and this
      // runner reads its one answer line; a dropped connection cuts nothing there.
      const out = `${DIR}/clear.out`
      await exec(client, `rm -f ${q(out)}`)
      await startDetached(client, `${DRY}bash ${q(`${DIR}/clear.sh`)} --dir ${q(DIR)}${fresh ? ' --keep-site' : ''}${nodes.map((n) => ` --node ${q(n)}`).join('')}`, out)
      let cleared = null
      // ✗ 2026-11-19 20:07–20:16: ~140 GB of three old nodes took about 9 minutes to erase — the wait is 25 minutes now
      for (const t0 = Date.now(); !cleared && Date.now() - t0 < 1_500_000;) {
        await new Promise((res) => setTimeout(res, dry ? 200 : 3000))
        const r = await exec(client, `tail -n 1 ${q(out)} 2>/dev/null || true`, { timeoutMs: 20_000 })
        try { const v = JSON.parse(r.stdout.trim()); if (v && typeof v === 'object' && 'nodes' in v) cleared = v } catch { /* not yet */ }
      }
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
    console.log('Запуск сервера: connect · close · state · log · probe · install --mode install|update · domain --name · way --way · detect · dns · door · repo · telegram · signin · clear --confirm · leftovers --confirm')
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
