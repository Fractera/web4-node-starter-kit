// THE DEDICATED SERVER — ONE COMMAND FOR THE MAIN AGENT AND THE PERSON (node step 737). `npm run server -- <verb>`.
// The owner, 2026-11-13: «шаг за шагом автоматически и по возможности без искусственного интеллекта» — every verb is plain code; the
// main agent only calls it (from Telegram too) and reads the marked last line. 738: a server is LAUNCHED from the page «Активация
// выделенного сервера» (`scripts/dedicated-server/launch.mjs`), never moved to — the move's verbs (status, return) are gone; the window
// came back in 741-5 (it is not a part of a move: it is how the owner sees a server before its domain).
//   names [--domain <name>] [--root <node folder>]   every public name of the node, its port and its DNS label (737-1)
//   dns   --ip <IPv4> [--domain <name>] [--root …]   the A records to write at the registrar, per zone, with the `*` shortcut (737-1)
//   nginx [--write]                                    the server's nginx site from the names and the certificates present (737-2)
//   phase                                              live · none — this node's phase on a dedicated server (737-4, 738)
//   window --ip <IPv4> [--port <local>] [--user <name>] [--folder <name>] [--key-stdin --until <epoch s> --close-file <path>]
//                                                      741-5: the server's own panel at http://localhost:<port> through the node's
//                                                      pinned key (no nginx, no edge mark — the owner); holds until Ctrl+C
//   domain [<name>] · dns-check · certs · check · activate · deactivate
//                                                      the server's own domain, its five steps (737-8): on the server itself, as
//                                                      the owner at the keyboard — a loopback call of /api/node/server/domain
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { certFor, parseCertList } from '../lib/hosting/certs.mjs'
import { dnsRecords, nodeNames } from '../lib/hosting/hostnames.mjs'
import { nginxSite } from '../lib/hosting/nginx.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const verb = args[0]
const opt = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null
}
const root = path.resolve(opt('root') ?? path.join(here, '..'))
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/

function names() {
  const table = nodeNames({ root, domain: opt('domain') })
  if (!table.zone) {
    console.log('У узла нет домена: имена появятся, когда домен будет выбран (--domain <имя> — посмотреть заранее).')
    console.log('===SERVER_NAMES=== 0 no-domain')
    return
  }
  for (const r of table.rows) {
    const target = r.redirectTo ? `301 → ${r.redirectTo}${r.service ? ` (${r.service}:${r.port})` : ' (nginx)'}` : `${r.service}:${r.port}`
    console.log(`${r.host.padEnd(40)} ${r.label.padEnd(12)} ${r.kind.padEnd(15)} ${target}${r.optional ? '  · по желанию' : ''}`)
  }
  console.log(`===SERVER_NAMES=== ${table.rows.length} ${table.zone}`)
}

function dns() {
  const ip = opt('ip')
  if (!ip || !IPV4.test(ip)) {
    console.error('Нужен IPv4 сервера: --ip 203.0.113.7')
    console.error('===SERVER_DNS_FAILED=== no-ip')
    process.exit(1)
  }
  const table = nodeNames({ root, domain: opt('domain') })
  if (!table.zone) {
    console.log('У узла нет домена — записывать пока нечего.')
    console.log('===SERVER_DNS=== 0 no-domain')
    return
  }
  let count = 0
  for (const group of dnsRecords(table, ip)) {
    console.log(`\nЗона ${group.zone} — записи у регистратора этого домена:`)
    console.log(`  ${'тип'.padEnd(5)}${'имя'.padEnd(14)}значение`)
    for (const r of group.records) {
      console.log(`  ${r.type.padEnd(5)}${r.name.padEnd(14)}${r.value}${r.optional ? '   (по желанию)' : ''}`)
      count += 1
    }
    if (group.wildcard) console.log(`  или одной строкой для всех поддоменов: ${group.wildcard.type} ${group.wildcard.name} ${group.wildcard.value} (плюс @)`)
  }
  console.log(`===SERVER_DNS=== ${count} ${table.zone}`)
}

const HELPER = '/usr/local/sbin/fractera-root'
const readJson = (file) => { try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null } }

/** The certificates the root helper sees; none on a machine without the helper (the person's computer). */
function certList() {
  if (!existsSync(HELPER)) return []
  const r = spawnSync('sudo', ['-n', HELPER, 'cert-list'], { encoding: 'utf8' })
  return r.status === 0 ? parseCertList(r.stdout) : []
}

function nginxVersion() {
  const r = spawnSync('nginx', ['-v'], { encoding: 'utf8' })
  return String(r.stderr || r.stdout || '').match(/nginx\/([\d.]+)/)?.[1] ?? '1.24.0'
}

function nginx() {
  const table = nodeNames({ root })
  const list = certList()
  const certs = Object.fromEntries(table.rows.map((r) => [r.host, certFor(r.host, list)]).filter(([, c]) => c))
  const server = readJson(path.join(root, 'data', 'node', 'server.json')) ?? {}
  const architect = table.rows.find((r) => r.kind === 'architect')?.host ?? table.zone
  // 737-15: the names serve the node only once it lives here; before that they answer 503 and Cloudflare's copy covers them.
  const live = createRequire(import.meta.url)('../lib/hosting/phase.cjs').nodePhase(root) === 'live'
  const text = nginxSite({ table, certs, active: server.domainActive === true, architectHost: architect, ipv6: existsSync('/proc/net/if_inet6'), nginxVersion: nginxVersion(), live })
  if (!args.includes('--write')) { process.stdout.write(text); return }
  const dir = path.join(root, 'data', 'node', 'server-side', 'nginx')
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'fractera.conf'), text)
  console.log(`===SERVER_NGINX=== written ${table.rows.length} names, ${Object.keys(certs).length} with a certificate`)
}

function phase() {
  const { nodePhase } = createRequire(import.meta.url)('../lib/hosting/phase.cjs')
  console.log(`===SERVER_PHASE=== ${nodePhase(root) ?? 'none'}`)
}

const STEP_WORDS = { domain: 'домен', dns: 'записи DNS', certs: 'сертификаты', check: 'HTTPS снаружи', active: 'включён' }
const DNS_WORDS = { ok: 'ведёт сюда', missing: 'нет записи', elsewhere: 'ведёт в другое место', aaaa: 'лишняя запись AAAA', unknown: 'DNS не ответил', unchecked: 'не проверено' }

/** The five steps of the server's domain, from the node's own door on loopback (the owner at the keyboard of the server). */
function domainStep(action) {
  return async () => {
    const url = `http://localhost:${readJson(path.join(root, 'logs', 'runtime.json'))?.port ?? 24680}/api/node/server/domain`
    const body = action === 'show' ? null : { action, ...(action === 'domain' ? { name: args[1] ?? '' } : {}) }
    let r
    try {
      r = await fetch(url, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {})
    } catch (e) {
      console.error(`Ядро узла не ответило: ${e.message}`)
      console.error('===SERVER_DOMAIN_FAILED=== core-silent')
      process.exit(1)
    }
    const s = await r.json().catch(() => ({}))
    if (!r.ok && !s.zone) {
      console.error(`===SERVER_DOMAIN_FAILED=== ${s.reason ?? r.status}`)
      process.exit(1)
    }
    if (action === 'certs') { console.log('Сертификаты выпускаются (минуты): npm run server -- domain — посмотреть ход.'); console.log('===SERVER_DOMAIN=== certs started'); return }
    console.log(`домен: ${s.zone ?? '—'}   сервер: ${s.ip ?? '—'}`)
    for (const row of s.rows ?? []) {
      const cert = row.cert === 'ok' || row.cert === 'expiring' ? `сертификат ${row.daysLeft} дн.` : row.cert === 'missing' ? 'без сертификата' : 'сертификат —'
      const https = row.https === true ? `HTTPS ${row.status}` : row.https === false ? 'HTTPS не отвечает' : ''
      console.log(`  ${row.host.padEnd(40)} ${DNS_WORDS[row.dns] ?? row.dns}; ${cert}${https ? `; ${https}` : ''}${row.optional ? '  · по желанию' : ''}`)
    }
    for (const h of s.certsRun?.hosts ?? []) if (h.state !== 'done') console.log(`  сертификат ${h.host}: ${h.state}${h.detail ? ` — ${h.detail}` : ''}`)
    const steps = s.steps ?? {}
    console.log(Object.entries(STEP_WORDS).map(([k, w]) => `${steps[k] ? '✓' : '·'} ${w}`).join('   '))
    // 864: ✗ 2026-11-27 (fractera.ai) a born name without a certificate under «✓ включён … ok domain,active» read as finished
    const left = Array.isArray(s.uncertified) ? s.uncertified : []
    const issuing = Boolean(s.certsRun?.running)
    if (left.length) console.log(`не закончено: без сертификата — ${left.join(', ')}${issuing ? ' (выпуск идёт)' : ' — npm run server -- certs'}`)
    const verdict = !r.ok ? `refused ${s.reason ?? r.status}` : left.length ? (issuing ? 'issuing' : 'unfinished') : (s.reason ?? 'ok')
    console.log(`===SERVER_DOMAIN=== ${verdict} ${Object.keys(STEP_WORDS).filter((k) => steps[k]).join(',') || 'none'}${left.length ? ` uncertified ${left.join(',')}` : ''}`)
    if (!r.ok) process.exit(1)
  }
}

// 741-5 (the owner approved 2026-11-14): the SSH window — `lib/hosting/window.mjs`. 744-3: the node keeps no key to a server, so the
// window needs a visit: in the person's own terminal it asks the root password once (not shown, never kept) and opens a visit for its
// own life, closed when the window closes; `--key-stdin` takes a visit key from its caller instead. Nobody else can open it.
const WINDOW_WHY = {
  'no-pin': 'this computer has not launched that server (no pinned key) — launch it from the page «Активация выделенного сервера»',
  'need-password': 'the node keeps no key to a server (744-3) — run this command in your own terminal: it asks the root password once',
  auth: 'the server refused the password or the visit key (expired or closed) — try again with the root password',
  'no-password-login': 'the server takes no password login — switch password login for root on at the provider, or reinstall it with one',
  'key-refused': "the server's sshd does not know expiry-time (OpenSSH older than 8.2) — the node grants no access without a deadline",
  'host-key-changed': "the server's key changed (a reinstalled server?) — the launch page shows both keys before trusting the new one",
  'no-core-port': "the server's core has not written its port yet (logs/runtime.json) — is the node started there?",
  'no-free-port': 'ports 25680–25689 on this computer are all busy',
  'bad-port': 'the local port must be outside 24680–25679, not 3000, below 49152',
}

/** The root password from the person's own terminal: raw mode, nothing echoed, held only by this process. */
function askHidden(question) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process
    stdout.write(question)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')
    let typed = ''
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n' || ch === '\u0004') { stdin.setRawMode(false); stdin.pause(); stdin.off('data', onData); stdout.write('\n'); resolve(typed); return }
        if (ch === '\u0003') { stdin.setRawMode(false); stdout.write('\n'); process.exit(130) }
        if (ch === '\u007f' || ch === '\b') typed = typed.slice(0, -1)
        else typed += ch
      }
    }
    stdin.on('data', onData)
  })
}

async function windowVerb() {
  const ip = opt('ip')
  const failed = (reason) => { console.log(`===WINDOW_FAILED=== ${reason}${WINDOW_WHY[reason] ? ` — ${WINDOW_WHY[reason]}` : ''}`); process.exit(reason === 'bad-ip' ? 2 : 1) }
  if (!ip || !IPV4.test(ip)) failed('bad-ip')
  const { openWindow, pinFor } = await import('../lib/hosting/window.mjs')
  const { closeVisit, openVisit } = await import('../lib/hosting/ssh.mjs')
  const pin = pinFor(root, ip)
  if (!pin) failed('no-pin')
  let privateKey = null
  let own = false
  if (args.includes('--key-stdin')) {
    let text = ''
    for await (const chunk of process.stdin) text += chunk
    privateKey = text.trim() ? `${text.trim()}\n` : null
  } else if (process.stdin.isTTY) {
    const password = await askHidden(`Root password of ${ip} (not shown, used once, kept nowhere): `)
    try {
      privateKey = (await openVisit({ root, host: ip, port: pin.port, password, minutes: 12 * 60 })).privateKey
      own = true
    } catch (e) { failed(e?.reason ?? 'unreachable') }
  }
  if (!privateKey) failed('need-password')
  const localPort = opt('port') ? Number(opt('port')) : null
  const end = async () => { if (own) await closeVisit({ root, host: ip, port: pin.port, privateKey }).catch(() => null) }
  const w = await openWindow({ root, ip, privateKey, user: opt('user') ?? 'fractera', folder: opt('folder') ?? path.basename(root), localPort,
    onDrop: () => { console.log('===WINDOW_CLOSED=== the SSH link dropped'); process.exit(1) } })
  if (!w.ok) { await end(); failed(w.reason) }
  console.log(`===WINDOW=== http://localhost:${w.port}/ru — the panel of the server ${ip} (its core listens on its own port ${w.corePort}); Ctrl+C closes it`)
  const stop = async (why) => { console.log(`===WINDOW_CLOSED=== ${why}`); w.close(); await end(); process.exit(0) }
  process.on('SIGINT', () => void stop('closed by Ctrl+C'))
  process.on('SIGTERM', () => void stop('closed'))
  // A window lives no longer than the visit it rides on (`--until <epoch seconds>` from the caller of `--key-stdin`), and the page closes
  // it by a signal file (`--close-file`) — never by a process id that may belong to someone else by then.
  const until = Number(opt('until'))
  if (until > 0) setTimeout(() => void stop('the visit ended'), Math.max(0, until * 1000 - Date.now())).unref?.()
  const closeFile = opt('close-file')
  if (closeFile) setInterval(() => { if (existsSync(closeFile)) { try { rmSync(closeFile, { force: true }) } catch { /* gone */ } void stop('closed from the page') } }, 1500).unref?.()
}

const verbs = {
  names, dns, nginx, phase, window: windowVerb,
  // 864: a flag is never a domain name (`domain --root <folder>` read «--root» as the name to set)
  domain: args[1] && !args[1].startsWith('--') ? domainStep('domain') : domainStep('show'),
  'dns-check': domainStep('dns-check'), certs: domainStep('certs'), check: domainStep('check'), activate: domainStep('activate'), deactivate: domainStep('deactivate'),
}
if (!verbs[verb]) {
  console.log('Команды: names · dns · nginx · phase · window --ip <IPv4> · domain [<имя>] · dns-check · certs · check · activate · deactivate')
  process.exit(verb ? 1 : 0)
}
verbs[verb]()
