// THE LAUNCH OF A DEDICATED SERVER, END TO END, DRY (node step 738). `npm run test:hosting-launch` — not in prebuild (it waits on detached
// scripts for seconds; prebuild time is time the node's sites stand behind the closed lid). Real ssh2 servers in this process play the
// servers; the runner (`scripts/dedicated-server/launch.mjs --dry`) runs every act: the server scripts print their commands instead of
// running them, and each «server's» folder is a temporary folder of this machine.
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { domainMissing, wayOf } from '../lib/hosting/launch-domain.mjs'
import { readableKeyPair } from '../lib/hosting/ssh.mjs'
import { startTestSshServer } from './hosting-test-ssh.mjs'

if (process.platform === 'win32') { console.log('· skipped on Windows: the server side is a Linux shell'); process.exit(0) }
const here = fileURLToPath(new URL('.', import.meta.url))
const tmp = (p) => mkdtempSync(join(tmpdir(), p))
const node = tmp('launch-node-')
const PASSWORD = 'dry-run-password-738'
const FORK = 'https://github.com/test-owner/web4-node-starter-kit.git'
const runner = join(here, 'dedicated-server', 'launch.mjs')
let passed = 0
const t = async (name, fn) => { try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.stack?.split('\n').slice(0, 3).join('\n    ') ?? e.message}`); process.exitCode = 1 } }

/** One «server»: its own home (authorized_keys) and its own launch folder (what /root/.fractera is on a real server). */
async function server(hostKey = readableKeyPair().private, port = 0) {
  const home = tmp('launch-home-')
  const dir = tmp('launch-root-')
  const s = await startTestSshServer({ home, password: PASSWORD, hostKey, port })
  return { ...s, home, dir }
}
// Asynchronous on purpose: the «servers» live in THIS process — a blocking spawn would starve them.
// 744-3: stdin is one JSON object; by default it carries this «browser's» visit key of that server, kept from its last connect.
const run = (srv, verb, extra = [], input = { key: srv.key }) => new Promise((resolve) => {
  const env = { ...process.env, FRACTERA_LAUNCH_NODE_ROOT: node, FRACTERA_LAUNCH_ROOT_DIR: srv.dir, FRACTERA_LAUNCH_FORK: FORK }
  const child = spawn(process.execPath, [runner, verb, '--dry', '--host', '127.0.0.1', '--port', String(srv.port), ...extra], { env })
  let out = ''
  child.stdout.on('data', (d) => { out += d })
  child.stderr.on('data', (d) => { out += d })
  const timer = setTimeout(() => child.kill(), 120_000)
  child.on('close', (status) => {
    clearTimeout(timer)
    const line = out.split('\n').reverse().find((l) => l.startsWith('===LAUNCH=== '))
    const a = line ? JSON.parse(line.slice(13)) : null
    if (a?.visit?.key) srv.key = a.visit.key
    resolve({ status, out, a })
  })
  child.stdin.end(JSON.stringify(input))
})
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const domainOf = (srv) => JSON.parse(readFileSync(join(srv.dir, 'domain.json'), 'utf8'))
/** Step 3 done on a «server» as the page leaves it: a domain, where its records live, a way, the first check (744-5) — written as the
 *  runner's `detect` and `dns` would (they ask the internet; this test does not). */
const domainReady = (srv, over = {}) => writeFileSync(join(srv.dir, 'domain.json'), JSON.stringify({
  domain: 'example.org', detect: { name: 'example.org', zone: 'example.org', dnsHost: 'other', ns: ['ns1.registrar.example'] }, way: 'dns',
  check: { at: new Date().toISOString(), ip: '127.0.0.1', results: [{ host: 'example.org', state: 'missing' }] }, ...over,
}))

console.log('738-2 a map of pins: one per server')
const A = await server()
const B = await server()
await t('two servers in turn: each pinned, neither forgets the other; system ssh to the FIRST still works', async () => {
  const a = await run(A, 'connect', [], { password: PASSWORD })
  assert.equal(a.a?.ok, true, a.out)
  const b = await run(B, 'connect', [], { password: PASSWORD })
  assert.equal(b.a?.ok, true, b.out)
  const pins = JSON.parse(readFileSync(join(node, 'data', 'node', 'server', 'known-hosts.json'), 'utf8'))
  assert.ok(pins[`127.0.0.1:${A.port}`] && pins[`127.0.0.1:${B.port}`], JSON.stringify(pins))
  const known = readFileSync(join(node, 'data', 'node', 'server', 'known_hosts'), 'utf8').trim().split('\n')
  assert.equal(known.length, 2)
  // The system's own ssh, asynchronously (the «server» answers from this very process), against the multi-line known_hosts.
  const ssh = await new Promise((resolve) => {
    const keyFile = join(tmp('launch-visit-'), 'visit') // the «browser's» key, outside the node: the node keeps none
    writeFileSync(keyFile, A.key, { mode: 0o600 })
    const c = spawn('ssh', ['-i', keyFile, '-p', String(A.port), '-o', 'BatchMode=yes', '-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=yes',
      '-o', `UserKnownHostsFile=${join(node, 'data', 'node', 'server', 'known_hosts')}`, 'root@127.0.0.1', 'echo FIRST_OK'])
    let o = ''
    c.stdout.on('data', (d) => { o += d })
    c.stderr.on('data', (d) => { o += d })
    const k = setTimeout(() => c.kill(), 30_000)
    c.on('close', () => { clearTimeout(k); resolve(o) })
  })
  assert.ok(ssh.includes('FIRST_OK'), ssh)
})
await t('negative: no key on a new server and no password → «need-password», nothing pinned for it', async () => {
  const C = await server()
  const r = await run(C, 'connect', [], {})
  assert.equal(r.a?.reason, 'need-password', r.out)
  C.server.close()
})
let reinstalled = null
await t('negative: a reinstalled server (a new key on the same address) is refused with both fingerprints; a wrong one is never trusted', async () => {
  await new Promise((r) => A.server.close(r))
  reinstalled = await startTestSshServer({ home: A.home, password: PASSWORD, port: A.port })
  const r = await run(A, 'connect')
  assert.equal(r.a?.reason, 'host-key-changed', r.out)
  assert.ok(/^SHA256:/.test(r.a.seen) && /^SHA256:/.test(r.a.pinned) && r.a.seen !== r.a.pinned)
  const wrong = await run(A, 'connect', ['--trust', r.a.pinned], { password: PASSWORD })
  assert.equal(wrong.a?.ok, false, wrong.out)
  A.seen = r.a.seen
})
await t('trusting the key the person saw (with the password) re-pins this server only; the other pin stays', async () => {
  const r = await run(A, 'connect', ['--trust', A.seen], { password: PASSWORD })
  assert.equal(r.a?.ok, true, r.out)
  const pins = JSON.parse(readFileSync(join(node, 'data', 'node', 'server', 'known-hosts.json'), 'utf8'))
  assert.equal(pins[`127.0.0.1:${A.port}`].fingerprint, A.seen)
  assert.ok(pins[`127.0.0.1:${B.port}`])
  assert.equal((await run(A, 'state')).a?.ok, true)
})

console.log('744-3 access for one day: the visit key goes back to the door only; without it — the password again')
await t('connect with the password: the answer carries the visit key (for the cookie the door sets) and a deadline ≈ now + 24 h; `--minutes 1` ≈ + 1 min', async () => {
  const D = await server()
  const day = await run(D, 'connect', [], { password: PASSWORD })
  assert.equal(day.a?.ok, true, day.out)
  assert.match(day.a.visit.key, /OPENSSH PRIVATE KEY/)
  const left = Date.parse(day.a.visit.deadline) - Date.now()
  assert.ok(left > 23.9 * 3600e3 && left <= 24 * 3600e3, String(left))
  const minute = await run(D, 'connect', ['--minutes', '1'], { password: PASSWORD, key: D.key })
  const short = Date.parse(minute.a.visit.deadline) - Date.now()
  assert.ok(short > 0 && short <= 60e3, String(short))
  assert.equal(readFileSync(join(D.home, '.ssh', 'authorized_keys'), 'utf8').split('\n').filter((l) => l.includes('fractera-visit')).length, 1, 'the second visit replaced the first')
  D.server.close()
})
await t('negative: an act without the visit key → need-password; with it → the state; close → the next act needs the password again', async () => {
  assert.equal((await run(B, 'state', [], {})).a?.reason, 'need-password')
  assert.equal((await run(B, 'state')).a?.ok, true)
  const keep = B.key
  assert.equal((await run(B, 'close')).a?.closed, true)
  assert.equal((await run(B, 'state', [], { key: keep })).a?.reason, 'need-password')
  assert.equal((await run(B, 'connect', [], { password: PASSWORD })).a?.ok, true)
})

console.log('744-5 the domain first: two questions, then the installation')
await t('install before step 3 is refused with every missing fact named; «registrar no, Cloudflare yes» → `cloudflare` recorded; «no, no» → `none`, still refused; negative: step 3 done → the next case installs', async () => {
  const r = await run(A, 'install', ['--mode', 'install'])
  assert.deepEqual([r.a?.reason, r.a?.missing], ['domain-not-ready', ['domain', 'where', 'who', 'records']], r.out)
  assert.equal((await run(A, 'domain', ['--name', 'example.org'])).a?.ok, true)
  const yes = wayOf({ cloudflareDns: true, registrar: 'no', cloudflare: 'yes' })
  assert.equal((await run(A, 'way', ['--way', yes])).a?.ok, true)
  assert.equal(domainOf(A).way, 'cloudflare')
  const no = wayOf({ cloudflareDns: true, registrar: 'no', cloudflare: 'no' })
  assert.equal((await run(A, 'way', ['--way', no])).a?.ok, true)
  assert.equal(domainOf(A).way, 'none')
  const still = await run(A, 'install', ['--mode', 'install'])
  assert.deepEqual([still.a?.reason, still.a?.missing], ['domain-not-ready', ['where', 'who', 'records']], still.out)
  domainReady(A)
  assert.deepEqual(domainMissing((await run(A, 'state')).a?.state.domain), [])
})

console.log('738-3/4 the launch: on the server, read back by its address')
await t('install: launch.sh runs on the server (dry) — prepare · source · install · mark · start · version, all done; launch.json says done', async () => {
  const r = await run(A, 'install', ['--mode', 'install'])
  assert.equal(r.a?.ok, true, r.out)
  let s = null
  for (let i = 0; i < 40; i++) { s = (await run(A, 'state')).a?.state; if (s?.launch?.state === 'done') break; await wait(250) }
  assert.equal(s?.launch?.state, 'done', JSON.stringify(s?.launch))
  assert.deepEqual(s.progress.filter((x) => x.id !== 'launch').map((x) => `${x.id}:${x.state}`), ['prepare:done', 'source:done', 'install:done', 'mark:done', 'start:done', 'version:done'])
  assert.equal(JSON.parse(readFileSync(join(A.dir, 'launch.json'), 'utf8')).fork, FORK)
})
await t('parallel servers: B launches while A shows its own finished launch — each answers from its own folder', async () => {
  domainReady(B)
  const r = await run(B, 'install', ['--mode', 'install'])
  assert.equal(r.a?.ok, true, r.out)
  const a = (await run(A, 'state')).a?.state
  const b = (await run(B, 'state')).a?.state
  assert.equal(a.launch.state, 'done')
  assert.ok(b.launch && ['running', 'done'].includes(b.launch.state))
  assert.notEqual(a.launch.startedAt, b.launch.startedAt)
})
await t('negative: a launch running on the server refuses a second one', async () => {
  writeFileSync(join(B.dir, 'launch.json'), JSON.stringify({ state: 'running', mode: 'install', pid: process.pid, startedAt: new Date().toISOString() }))
  const r = await run(B, 'install', ['--mode', 'install'])
  assert.equal(r.a?.reason, 'running', r.out)
})
await t('the domain chosen on the page is kept on the server: a typed address is cleaned, who writes the records is kept', async () => {
  assert.equal((await run(A, 'domain', ['--name', 'https://Example.ORG/path'])).a?.ok, true)
  assert.equal((await run(A, 'way', ['--way', 'dns'])).a?.ok, true)
  const d = JSON.parse(readFileSync(join(A.dir, 'domain.json'), 'utf8'))
  assert.equal(d.domain, 'example.org')
  assert.equal(d.way, 'dns')
  const s = (await run(A, 'state')).a?.state
  assert.deepEqual(s.records[0].records.map((x) => x.name), ['@', 'www', 'architect', 'auth'])
  assert.equal(s.records[0].wildcard.name, '*')
})
await t('744-4 a server whose node is a 737 move of a computer: «unrelated, moved», the reasons named; negative: install is refused', async () => {
  const kept = readFileSync(join(B.dir, 'probe.json'), 'utf8')
  const p = JSON.parse(kept)
  writeFileSync(join(B.dir, 'probe.json'), JSON.stringify({ ...p, fractera: { head: 'a'.repeat(40), ahead: 351, behind: 0, phase: 'live', origin: FORK, movedFrom: { from: 'MacBook-Pro-de-Roman.local', at: '2026-11-13T22:45:16Z' }, launching: false } }))
  writeFileSync(join(B.dir, 'launch.json'), JSON.stringify({ state: 'done', mode: 'install' }))
  const s = (await run(B, 'state')).a?.state
  assert.deepEqual([s.relation.kind, s.relation.reasons.map((r) => r.id), s.relation.nodes], ['unrelated', ['moved'], [basename(node)]])
  assert.equal((await run(B, 'install', ['--mode', 'update'])).a?.reason, 'unrelated')
  writeFileSync(join(B.dir, 'probe.json'), kept)
  assert.equal((await run(B, 'state')).a?.state.relation.kind, 'clean', 'the same server without the move: clean')
})
await t('744-5 a server whose node holds a domain and no record of the page: the record is written from its mark once (from: server, since); step 3 done without a detection or a check; negative: no mark → no record', async () => {
  const C = await server()
  assert.equal((await run(C, 'connect', [], { password: PASSWORD })).a?.ok, true)
  assert.equal((await run(C, 'state')).a?.state.domain, null, 'no mark, no record')
  // C's own «node» folder with its mark — never the shared one of A and B
  const own = tmp('launch-held-node-')
  mkdirSync(join(own, 'data', 'node'), { recursive: true })
  writeFileSync(join(own, 'data', 'node', 'server.json'), JSON.stringify({ phase: 'live', domain: 'held.example.org', domainWay: 'migrate', domainActive: true, ip: '127.0.0.1', at: '2026-11-13T22:45:16Z' }))
  process.env.STATE_NODE_DIR = own
  try {
    const d = (await run(C, 'state')).a?.state.domain
    assert.deepEqual([d?.domain, d?.way, d?.from, d?.since], ['held.example.org', 'migrate', 'server', '2026-11-13T22:45:16Z'], JSON.stringify(d))
    assert.equal(domainOf(C).from, 'server', 'kept on the server')
    assert.deepEqual(domainMissing(d), [], JSON.stringify(d))
    assert.deepEqual(domainMissing({ ...d, from: undefined }), ['where', 'records'], 'the same record typed on the page needs its detection and first check')
  } finally {
    delete process.env.STATE_NODE_DIR
    rmSync(own, { recursive: true, force: true })
    C.server.close()
  }
})
await t('negative: a wrong way, a bad domain, and the server node\'s door before its node lives', async () => {
  assert.equal((await run(A, 'way', ['--way', 'telepathy'])).a?.reason, 'bad-way')
  assert.equal((await run(A, 'domain', ['--name', 'not a domain'])).a?.reason, 'bad-domain')
  assert.equal((await run(A, 'door', [], { key: A.key, body: { action: 'certs' } })).a?.reason, 'not-live')
})
await t('negative: nothing per server is written on the computer — no key (744-3), only the pins and (later) the certificate ledger', async () => {
  assert.deepEqual(readdirSync(join(node, 'data', 'node', 'server')).sort(), ['known-hosts.json', 'known_hosts'])
})

console.log('744-6 never «available» before every certificate and the final check')
await t('the domain is switched on only over ready names (negative: a name without its certificate → not-ready, named); with the names ready but sign-in elsewhere → no «launched» mark on this computer; the server door\'s refusal keeps its reason, its silence fails', async () => {
  const D = await server()
  assert.equal((await run(D, 'connect', [], { password: PASSWORD })).a?.ok, true)
  // D's own node: its mark (live, the domain on) and its door on loopback, answering as a live node's /api/node/server/domain does
  let core = { zone: 'ready.invalid', rows: [{ host: 'ready.invalid', zone: 'ready.invalid', optional: false, dns: 'ok', cert: 'missing', https: null }], steps: { domain: true, dns: true, certs: false, check: false, active: true }, certsRun: null, helper: true }
  let refuse = null // 744-9: what the server node's door answers to an act (POST); null — it answers like a GET
  const door = createServer((req, res) => { res.setHeader('content-type', 'application/json'); res.end(req.method === 'POST' && refuse !== null ? refuse : JSON.stringify(core)) })
  await new Promise((r) => door.listen(0, '127.0.0.1', r))
  const own = tmp('launch-ready-node-')
  mkdirSync(join(own, 'data', 'node'), { recursive: true })
  mkdirSync(join(own, 'logs'), { recursive: true })
  writeFileSync(join(own, 'data', 'node', 'server.json'), JSON.stringify({ phase: 'live', domain: 'ready.invalid', domainWay: 'dns', domainActive: true, ip: '127.0.0.1', at: '2026-11-14T12:00:00Z' }))
  writeFileSync(join(own, 'logs', 'runtime.json'), JSON.stringify({ port: door.address().port }))
  const launched = join(node, 'data', 'node', 'server', 'launched.json')
  process.env.STATE_NODE_DIR = own
  try {
    const r = await run(D, 'door', [], { key: D.key, body: { action: 'activate' } })
    assert.deepEqual([r.a?.reason, r.a?.missing], ['not-ready', [{ host: 'ready.invalid', what: 'cert' }, { host: 'ready.invalid', what: 'https' }]], r.out)
    core = { ...core, rows: [{ ...core.rows[0], cert: 'ok', https: true }], steps: { ...core.steps, certs: true, check: true } }
    const s = await run(D, 'signin') // asked from the internet: auth.ready.invalid never answers (RFC 2606)
    assert.deepEqual([s.a?.ok, s.a?.ready?.ok, s.a?.ready?.missing], [true, false, [{ host: 'auth.ready.invalid', what: 'signin' }]], s.out)
    assert.equal(existsSync(launched), false, 'no «launched» mark without the final check')
    // 744-9: the server node's own refusal reaches the page with its reason; a door that answers nothing is a failure, never ok
    refuse = JSON.stringify({ ok: false, reason: 'check-first' })
    const refused = await run(D, 'door', [], { key: D.key, body: { action: 'activate' } })
    assert.deepEqual([refused.a?.ok, refused.a?.reason], [false, 'check-first'], refused.out)
    refuse = 'not json'
    const silent = await run(D, 'door', [], { key: D.key, body: { action: 'activate' } })
    assert.deepEqual([silent.a?.ok, silent.a?.reason], [false, 'door-silent'], silent.out)
    assert.equal(existsSync(launched), false, 'a refused or silent switch-on leaves no «launched» mark')
  } finally {
    delete process.env.STATE_NODE_DIR
    door.close()
    rmSync(own, { recursive: true, force: true })
    D.server.close()
  }
})

console.log('738-5/6/8 the weekly budget, where sign-in leads, a silent core')
const launch = await import('./dedicated-server/launch.mjs')
await t('Let\'s Encrypt week: the ledger plus young certificates it never saw; older than 7 days is not counted', async () => {
  const now = Date.parse('2026-11-14T12:00:00Z')
  const day = 24 * 3600_000
  const ledger = { 'example.org': [...Array.from({ length: 46 }, (_, i) => ({ host: `e${i}.example.org`, at: new Date(now - 2 * day).toISOString(), ip: '203.0.113.7' })), { host: 'old.example.org', at: new Date(now - 8 * day).toISOString(), ip: '203.0.113.7' }, ...Array.from({ length: 4 }, () => ({ host: 'auth.example.org', at: new Date(now - day).toISOString(), ip: '203.0.113.7' }))] }
  const rows = [{ host: 'fresh.example.org', certSource: 'letsencrypt', daysLeft: 89 }, { host: 'aged.example.org', certSource: 'letsencrypt', daysLeft: 40 }, { host: 'own.example.org', certSource: 'own', daysLeft: 300 }]
  const c = launch.weekCount(ledger, 'example.org', rows, '203.0.113.7', now)
  assert.equal(c.week, 51)
  assert.equal(c.perName['auth.example.org'], 4)
  assert.equal(launch.LE_LIMITS.domain, 50)
})
await t('sign-in leads to https://auth.<zone>; negative: a loopback address or a silent auth element is a failure', async () => {
  const net = (location, providers = 200) => async (url) => {
    if (url.endsWith('/api/auth/providers')) return { status: providers, headers: new Headers() }
    if (url === 'https://architect.example.org/architect') return { status: 307, headers: new Headers({ location: '/en/architect' }) }
    return { status: 307, headers: new Headers({ location }) }
  }
  assert.equal((await launch.signinCheck('example.org', net('https://auth.example.org/login?requireRole=architect'))).ok, true)
  assert.equal((await launch.signinCheck('example.org', net('http://127.0.0.1:24681/login?requireRole=architect'))).ok, false)
  assert.equal((await launch.signinCheck('example.org', net('https://auth.example.org/login', 502))).ok, false)
})
await t('a silent core is «a build» only while its reader answered or for three minutes; then «the core does not answer»', async () => {
  const { silenceVerdict, SILENT_AFTER_MS } = await import('../lib/deploy/core-silence.mjs')
  const now = Date.now()
  assert.equal(silenceVerdict({ since: now - SILENT_AFTER_MS - 1000, now, readerSeen: false }), 'silent')
  assert.equal(silenceVerdict({ since: now - 60_000, now, readerSeen: false }), 'build')
  assert.equal(silenceVerdict({ since: now - 10 * 3600_000, now, readerSeen: true }), 'build')
})

console.log('739-4/5 sign-in never leads a public visitor to loopback; the architect code passes through, kept nowhere')
await t('a public name with the registry\'s loopback sign-in → closed; negative: loopback requests and a real auth name stay as they are', async () => {
  const { loopbackForPublic, signInClosedPage } = await import('../lib/auth/sign-in-closed.mjs')
  assert.equal(loopbackForPublic('architect.aifa.dev', 'http://127.0.0.1:24681'), true)
  assert.equal(loopbackForPublic('aifa.dev:443', 'http://localhost:24681'), true)
  assert.equal(loopbackForPublic('localhost:24680', 'http://127.0.0.1:24681'), false)
  assert.equal(loopbackForPublic('127.0.0.1:24680', 'http://127.0.0.1:24681'), false)
  assert.equal(loopbackForPublic('architect.aifa.dev', 'https://auth.aifa.dev'), false)
  assert.ok(signInClosedPage('ru').includes('Вход ещё не включён') && signInClosedPage('en').includes('not switched on'))
  const base = readFileSync(join(here, '..', 'lib', 'auth-base-server.ts'), 'utf8')
  assert.ok(/if \(assigned && loopbackForPublic\(host, assigned\)\) return ""/.test(base))
})
await t('the claim goes server door → sign-in element with the architect key; the computer keeps no code', async () => {
  const door = readFileSync(join(here, '..', 'app', 'api', 'node', 'server', 'domain', 'route.ts'), 'utf8')
  assert.ok(door.includes('action === "claim"') && door.includes('"x-architect-token": token') && door.includes('/api/claim'))
  const runner = readFileSync(join(here, 'dedicated-server', 'launch.mjs'), 'utf8')
  assert.ok(!/writeFileSync\([^)]*code/.test(runner) && runner.includes("'claim'"))
  const reg = JSON.parse(readFileSync(join(here, '..', 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8'))
  assert.equal(reg.services.find((x) => x.id === 'auth').version, 'v2.4.36')
})

console.log('738-7 the move road is gone')
await t('serve:start sets a 737 move mark aside and never refuses; no code reads the move\'s state any more', async () => {
  const serve = readFileSync(join(here, 'serve.mjs'), 'utf8')
  assert.ok(serve.includes("renameSync(mark, path.join(kept, `moved-${Date.now()}.json`))") && !serve.includes('SERVE_MOVED'))
  const left = spawnSync('git', ['grep', '-l', '-e', 'move-state', '-e', 'local-node.mjs', '-e', 'transfer.mjs', '--', 'app', 'lib', 'components', 'scripts/*.mjs', 'scripts/dedicated-server', ':!scripts/hosting-launch.test.mjs'], { cwd: join(here, '..'), encoding: 'utf8' })
  assert.equal(left.stdout.trim(), '', left.stdout)
})

reinstalled?.server.close()
B.server.close()
console.log(`${passed} passed`)
setTimeout(() => process.exit(), 100)
