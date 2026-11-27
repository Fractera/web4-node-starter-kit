// THE CERTIFICATES OF THE SERVER — CHECKED AND THE MISSING ONES ADDED (node step 737-8). The owner, 2026-11-13: «ты вызываешь кнопку
// проверки в наличии сертификатов если нет дополнение ших». `node scripts/dedicated-server/certs.mjs [--dry]`, started detached by the door
// `app/api/node/server/domain` (a certbot run takes minutes; the core may restart meanwhile). Progress: `data/node/server-side/certs.json`.
// 🔒 ORDER: nginx first learns every name on port 80 (the ACME path open, the rest 503) — Let's Encrypt asks there; then one certificate
// per name whose DNS was checked «ok» and which has none or under 30 days; then nginx again, now with 443 for every name covered.
// 🔒 ONE NAME FAILING NEVER STOPS THE OTHERS (the old wizard issued all names in one certificate, and one bad DNS record failed them
// all). Each name says its own result and the tail of certbot's words.
// 🔒 ROOT ONLY THROUGH THE HELPER (`fractera-root cert-issue|nginx-apply`, fixed verbs, `sudo -n`): this runner runs as the node's user.
// 🔒 864: PUBLIC DNS IS ASKED FIRST, HTTPS AFTER — «check and add» means it. ✗ 2026-11-27 (fractera.ai): a name born after the last DNS
// check read «unchecked», this runner issued nothing for it, and only a hand-run `dns-check` before `certs` helped. `--dns-fresh` — the
// caller has just asked DNS (`names-ready.mjs`); `--no-check` — the caller checks HTTPS itself (`name-up.mjs`).
// `--dry` — no command runs; each would-be command is recorded (the tests).
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { alive, domainState, HELPER, namesToIssue, readSide, runDnsCheck, runHttpsCheck, writeSide } from '../../lib/hosting/server-domain.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const dry = args.includes('--dry')
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] ?? null : null }
const root = path.resolve(opt('root') ?? path.join(here, '..', '..'))
const now = () => new Date().toISOString()
const commands = []

function helper(...verb) {
  commands.push(['fractera-root', ...verb].join(' '))
  if (dry) return { ok: true, out: `DRY ${verb.join(' ')}` }
  const r = spawnSync('sudo', ['-n', HELPER, ...verb], { encoding: 'utf8', timeout: 20 * 60_000 })
  return { ok: r.status === 0, out: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim() }
}

function nginx() {
  const w = spawnSync(process.execPath, [path.join(here, '..', 'server.mjs'), 'nginx', '--write', '--root', root], { encoding: 'utf8', timeout: 60_000 })
  if (w.status !== 0) return { ok: false, out: `${w.stdout}${w.stderr}`.trim() }
  return helper('nginx-apply')
}

const prev = readSide(root, 'certs')
if (prev?.running && alive(prev.pid) && prev.pid !== process.pid) {
  console.error('===CERTS_BUSY=== another certificate run is working')
  process.exit(2)
}

if (!args.includes('--dns-fresh')) {
  commands.push('dns-check')
  if (!dry) await runDnsCheck(root).catch((e) => console.log(`DNS was not asked: ${e?.message ?? e} — the last check decides`))
}
const state = domainState(root, dry ? { certs: [] } : {})
if (!dry && !state.helper) {
  writeSide(root, 'certs', { running: false, endedAt: now(), ok: false, detail: 'no-helper', hosts: [] })
  console.error('===CERTS_FAILED=== no root helper on this machine — this is not a prepared server')
  process.exit(1)
}
const targets = namesToIssue(state)
const hosts = targets.map((host) => ({ host, state: 'waiting', detail: '' }))
const save = (patch) => writeSide(root, 'certs', { running: true, pid: process.pid, startedAt, hosts, ...patch })
const startedAt = now()
save({})

const before = nginx()
if (!before.ok) {
  save({ running: false, endedAt: now(), ok: false, detail: `nginx: ${before.out.slice(-300)}` })
  console.error(`===CERTS_FAILED=== nginx refused the names: ${before.out.slice(-200)}`)
  process.exit(1)
}
for (const h of hosts) {
  h.state = 'running'
  save({})
  const r = helper('cert-issue', h.host)
  h.state = r.ok ? 'done' : 'failed'
  h.detail = r.out.split('\n').slice(-4).join(' ').slice(-300)
  save({})
}
const after = nginx()
const ok = after.ok && hosts.every((h) => h.state === 'done')
if (!args.includes('--no-check') && hosts.length > 0) {
  commands.push('https-check')
  if (!dry) await runHttpsCheck(root).catch((e) => console.log(`HTTPS was not checked: ${e?.message ?? e}`))
}
save({ running: false, endedAt: now(), ok, detail: after.ok ? '' : `nginx: ${after.out.slice(-300)}`, ...(dry ? { commands } : {}) })
console.log(`===CERTS_${ok ? 'DONE' : 'FAILED'}=== ${hosts.filter((h) => h.state === 'done').length}/${hosts.length} issued${after.ok ? '' : ', nginx refused'}`)
process.exit(ok ? 0 : 1)
