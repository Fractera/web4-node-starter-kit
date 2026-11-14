// THIS COMPUTER UNTOUCHED, MANY SERVERS FROM ONE PAGE (node step 744-8). `npm run test:launch-footprint` — by hand, like
// `test:hosting-launch` (it waits on detached scripts for seconds; the prebuild is time the node's sites stand behind the closed lid).
// The owner, 2026-11-14: «при активации сервера локальной компьютера умирает а побочные эффект этого то что вы должны иметь возможность с
// одного локального компьютера запускать множество серверов».
// A whole run — connect · state · install (dry) on server A, connect · state on server B, A again — against real ssh2 servers of this
// process (`hosting-test-ssh.mjs`), the runner `--dry` with a fixture node as «this computer». Two planes, each with a negative control:
//   files — every file of the fixture hashed before and after: the only changes are the map of pins (and the certificate ledger, when
//           certificates are seen); no changed file holds the password or a private key. Negative: a planted per-server record is named.
//   processes — `pm2` and `npm` are fakes first in PATH, one pair for the runner (this computer) and one for the «servers» (their scripts
//           run on this very machine in a dry run), logging every call and reaching nothing: this computer's side calls neither; the
//           «servers» only READ their process list (`probe.sh` counts root's programs — on a real launch, the server's own pm2).
//           Negative: a planted call on this computer's side is caught. (The real pm2 of this node is never reachable here.)
// And the page's promise: A's and B's states come from their own servers, alternately, nothing of one in the other.
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readableKeyPair } from '../lib/hosting/ssh.mjs'
import { startTestSshServer } from './hosting-test-ssh.mjs'

if (process.platform === 'win32') { console.log('· skipped on Windows: the server side is a Linux shell'); process.exit(0) }
const here = fileURLToPath(new URL('.', import.meta.url))
const tmp = (p) => mkdtempSync(join(tmpdir(), p))
const PASSWORD = 'footprint-password-744-8'
const FORK = 'https://github.com/test-owner/web4-node-starter-kit.git'
const runner = join(here, 'dedicated-server', 'launch.mjs')
let passed = 0
const t = async (name, fn) => { try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 } }

// The fakes: a process manager and a package runner that only write down that they were called — one pair per side.
const PATH = process.env.PATH
function fakes(side) {
  const bin = tmp(`footprint-${side}-bin-`)
  const log = join(bin, 'calls.log')
  for (const name of ['pm2', 'npm']) {
    writeFileSync(join(bin, name), `#!/bin/sh\necho "${name} $*" >> "${log}"\nexit 0\n`)
    chmodSync(join(bin, name), 0o755)
  }
  return { path: `${bin}:${PATH}`, called: () => (existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').filter(Boolean) : []) }
}
const computer = fakes('computer')
const servers = fakes('servers')
process.env.PATH = servers.path // the «servers» (`hosting-test-ssh.mjs`) run their commands with this process's PATH

// «This computer»: a fixture node with what a node keeps — its registry, its runtime, its place, its keys file, its data.
const node = tmp('footprint-node-')
const seed = (rel, text) => { mkdirSync(join(node, rel, '..'), { recursive: true }); writeFileSync(join(node, rel), text) }
seed('WEB4-ITEMS-REGISTRY/web4-items.json', JSON.stringify({ services: [{ id: 'auth', port: 24681, kind: 'core' }] }))
seed('logs/runtime.json', JSON.stringify({ port: 24680, pid: 4242 }))
seed('data/node/place.json', JSON.stringify({ kind: 'computer' }))
seed('data/node/server/le-ledger.json', JSON.stringify({}))
seed('.env.local', 'OPENAI_API_KEY=sk-test-footprint\n')

/** Every file of a folder → its sha256, by its path from the folder. */
function snapshot(root) {
  const out = {}
  const walk = (dir) => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n)
      if (statSync(p).isDirectory()) walk(p)
      else out[relative(root, p)] = createHash('sha256').update(readFileSync(p)).digest('hex')
    }
  }
  walk(root)
  return out
}
const ALLOWED = new Set(['data/node/server/known-hosts.json', 'data/node/server/known_hosts', 'data/node/server/le-ledger.json'])
/** What changed between two snapshots and is not allowed — each named; plus every changed file that holds a secret. */
function footprint(before, after, secrets = []) {
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((f) => before[f] !== after[f]).sort()
  const bad = changed.filter((f) => !ALLOWED.has(f)).map((f) => `${f} (${!(f in before) ? 'new' : !(f in after) ? 'gone' : 'changed'})`)
  for (const f of changed.filter((x) => x in after)) {
    const text = readFileSync(join(node, f), 'utf8')
    if (/PRIVATE KEY/.test(text) || secrets.some((s) => s && text.includes(s))) bad.push(`${f} holds a secret`)
  }
  return { changed, bad }
}

async function server() {
  const home = tmp('footprint-home-')
  const dir = tmp('footprint-root-')
  const s = await startTestSshServer({ home, password: PASSWORD, hostKey: readableKeyPair().private, port: 0 })
  return { ...s, home, dir }
}
const run = (srv, verb, extra = [], input = { key: srv.key }) => new Promise((resolve) => {
  const env = { ...process.env, PATH: computer.path, FRACTERA_LAUNCH_NODE_ROOT: node, FRACTERA_LAUNCH_ROOT_DIR: srv.dir, FRACTERA_LAUNCH_FORK: FORK }
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
const ready = (srv) => writeFileSync(join(srv.dir, 'domain.json'), JSON.stringify({
  domain: 'example.org', detect: { name: 'example.org', zone: 'example.org', dnsHost: 'other', ns: ['ns1.registrar.example'] }, way: 'dns',
  check: { at: new Date().toISOString(), ip: '127.0.0.1', results: [{ host: 'example.org', state: 'missing' }] },
}))

console.log('744-8 this computer untouched, many servers from one page')
const A = await server()
const B = await server()
const before = snapshot(node)
const keys = []
let sa = null
let sb = null
let sa2 = null

await t('a whole run A → B → A: connect, state, install (dry) on A; connect, state on B; A again — each act answered', async () => {
  assert.equal((await run(A, 'connect', [], { password: PASSWORD })).a?.ok, true)
  keys.push(A.key)
  sa = (await run(A, 'state')).a?.state
  ready(A)
  const i = await run(A, 'install', ['--mode', 'install'])
  assert.equal(i.a?.ok, true, i.out)
  for (let k = 0; k < 40; k++) { sa = (await run(A, 'state')).a?.state; if (sa?.launch?.state === 'done') break; await wait(250) }
  assert.equal(sa?.launch?.state, 'done')
  assert.equal((await run(B, 'connect', [], { password: PASSWORD })).a?.ok, true)
  keys.push(B.key)
  sb = (await run(B, 'state')).a?.state
  sa2 = (await run(A, 'state')).a?.state
  assert.ok(sa2 && sb)
})
await t('each server answers from itself: A keeps its own launch and port, B has none of A — alternately, nothing of one in the other', () => {
  assert.equal(sa2.probe.sshPort, A.port)
  assert.equal(sb.probe.sshPort, B.port)
  assert.equal(sa2.launch?.state, 'done')
  assert.equal(sb.launch, null)
  assert.equal(sb.domain, null, 'B never saw A\'s domain')
})
await t('files: only the map of pins changed on this computer; no changed file holds the password or a key; negative: a planted per-server record is named', () => {
  const after = snapshot(node)
  const f = footprint(before, after, [PASSWORD, ...keys])
  assert.deepEqual(f.bad, [], f.bad.join('; '))
  assert.ok(f.changed.includes('data/node/server/known-hosts.json'), `the pins were written: ${f.changed.join(', ')}`)
  for (const k of ['WEB4-ITEMS-REGISTRY/web4-items.json', 'logs/runtime.json', 'data/node/place.json', '.env.local']) assert.equal(after[k], before[k], k)
  writeFileSync(join(node, 'data', 'node', 'server', `127.0.0.1-${A.port}.json`), JSON.stringify({ launch: 'running' }))
  writeFileSync(join(node, 'data', 'node', 'server', 'visit.key'), '-----BEGIN OPENSSH PRIVATE KEY-----\n')
  const planted = footprint(before, snapshot(node), [PASSWORD])
  assert.ok(planted.bad.some((b) => b.startsWith(`data/node/server/127.0.0.1-${A.port}.json (new)`)), planted.bad.join('; '))
  assert.ok(planted.bad.includes('data/node/server/visit.key holds a secret'), planted.bad.join('; '))
})
await t('processes: this computer\'s side called neither pm2 nor npm; the «servers» only read their lists; negative: a planted call on this computer\'s side is caught', () => {
  assert.deepEqual(computer.called(), [])
  const server = servers.called()
  assert.ok(server.every((c) => /^pm2 (jlist|list)\b/.test(c)), `a «server» did more than read: ${server.join('; ')}`)
  spawnSync('sh', ['-c', 'pm2 restart all'], { env: { ...process.env, PATH: computer.path } })
  assert.deepEqual(computer.called(), ['pm2 restart all'])
})

A.server.close()
B.server.close()
console.log(process.exitCode ? `===LAUNCH_FOOTPRINT_FAILED=== ${passed} passed` : `===LAUNCH_FOOTPRINT_OK=== ${passed} passed`)
setTimeout(() => process.exit(), 100)
