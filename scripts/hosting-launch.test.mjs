// THE LAUNCH OF A DEDICATED SERVER, END TO END, DRY (node step 738). `npm run test:hosting-launch` — not in prebuild (it waits on detached
// scripts for seconds; prebuild time is time the node's sites stand behind the closed lid). Real ssh2 servers in this process play the
// servers; the runner (`scripts/dedicated-server/launch.mjs --dry`) runs every act: the server scripts print their commands instead of
// running them, and each «server's» folder is a temporary folder of this machine.
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
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
const run = (srv, verb, extra = [], input = '') => new Promise((resolve) => {
  const env = { ...process.env, FRACTERA_LAUNCH_NODE_ROOT: node, FRACTERA_LAUNCH_ROOT_DIR: srv.dir, FRACTERA_LAUNCH_FORK: FORK }
  const child = spawn(process.execPath, [runner, verb, '--dry', '--host', '127.0.0.1', '--port', String(srv.port), ...extra], { env })
  let out = ''
  child.stdout.on('data', (d) => { out += d })
  child.stderr.on('data', (d) => { out += d })
  const timer = setTimeout(() => child.kill(), 120_000)
  child.on('close', (status) => {
    clearTimeout(timer)
    const line = out.split('\n').reverse().find((l) => l.startsWith('===LAUNCH=== '))
    resolve({ status, out, a: line ? JSON.parse(line.slice(13)) : null })
  })
  child.stdin.end(input)
})
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

console.log('738-2 a map of pins: one per server')
const A = await server()
const B = await server()
await t('two servers in turn: each pinned, neither forgets the other; system ssh to the FIRST still works', async () => {
  const a = await run(A, 'connect', [], `${PASSWORD}\n`)
  assert.equal(a.a?.ok, true, a.out)
  const b = await run(B, 'connect', [], `${PASSWORD}\n`)
  assert.equal(b.a?.ok, true, b.out)
  const pins = JSON.parse(readFileSync(join(node, 'data', 'node', 'server', 'known-hosts.json'), 'utf8'))
  assert.ok(pins[`127.0.0.1:${A.port}`] && pins[`127.0.0.1:${B.port}`], JSON.stringify(pins))
  const known = readFileSync(join(node, 'data', 'node', 'server', 'known_hosts'), 'utf8').trim().split('\n')
  assert.equal(known.length, 2)
  // The system's own ssh, asynchronously (the «server» answers from this very process), against the multi-line known_hosts.
  const ssh = await new Promise((resolve) => {
    const c = spawn('ssh', ['-i', join(node, 'data', 'node', 'server', 'id_ed25519'), '-p', String(A.port), '-o', 'BatchMode=yes', '-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=yes',
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
  const r = await run(C, 'connect')
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
  const wrong = await run(A, 'connect', ['--trust', r.a.pinned], `${PASSWORD}\n`)
  assert.equal(wrong.a?.ok, false, wrong.out)
  A.seen = r.a.seen
})
await t('trusting the key the person saw (with the password) re-pins this server only; the other pin stays', async () => {
  const r = await run(A, 'connect', ['--trust', A.seen], `${PASSWORD}\n`)
  assert.equal(r.a?.ok, true, r.out)
  const pins = JSON.parse(readFileSync(join(node, 'data', 'node', 'server', 'known-hosts.json'), 'utf8'))
  assert.equal(pins[`127.0.0.1:${A.port}`].fingerprint, A.seen)
  assert.ok(pins[`127.0.0.1:${B.port}`])
  assert.equal((await run(A, 'state')).a?.ok, true)
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
await t('negative: a wrong way, a bad domain, and the server node\'s door before its node lives', async () => {
  assert.equal((await run(A, 'way', ['--way', 'telepathy'])).a?.reason, 'bad-way')
  assert.equal((await run(A, 'domain', ['--name', 'not a domain'])).a?.reason, 'bad-domain')
  assert.equal((await run(A, 'door', [], JSON.stringify({ action: 'certs' }))).a?.reason, 'not-live')
})
await t('negative: nothing per server is written on the computer — only the key, the pins and (later) the certificate ledger', async () => {
  assert.deepEqual(readdirSync(join(node, 'data', 'node', 'server')).sort(), ['id_ed25519', 'id_ed25519.pub', 'known-hosts.json', 'known_hosts'])
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

console.log('738-7 the move road is gone')
await t('serve:start sets a 737 move mark aside and never refuses; no code reads the move\'s state any more', async () => {
  const serve = readFileSync(join(here, 'serve.mjs'), 'utf8')
  assert.ok(serve.includes("renameSync(mark, path.join(kept, `moved-${Date.now()}.json`))") && !serve.includes('SERVE_MOVED'))
  const left = spawnSync('git', ['grep', '-l', '-e', 'move-state', '-e', 'local-node.mjs', '-e', 'transfer.mjs', '--', 'app', 'lib', 'components', 'scripts/*.mjs', 'scripts/dedicated-server'], { cwd: join(here, '..'), encoding: 'utf8' })
  assert.equal(left.stdout.trim(), '', left.stdout)
})

reinstalled?.server.close()
B.server.close()
console.log(`${passed} passed`)
setTimeout(() => process.exit(), 100)
