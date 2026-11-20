// TESTS OF THE CLEAN SERVER INSTALL AND ITS LIVE READER (node step 806). `npm run test:server-install-live`, in the prebuild.
// A REAL run of the server's own scripts on a scratch tree in the temp folder — `clear.sh` (806-1) with its test roots and no service
// command (CLEAR_TEST=1: this machine's pm2 and nginx are never touched), `log.sh` (806-3) on a launch's progress files and logs.
// Every erase has its negative control: what the clear must keep stays, a folder name «..» erases nothing.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const CLEAR = path.join(here, 'dedicated-server', 'clear.sh')
const LOG = path.join(here, 'dedicated-server', 'log.sh')
let passed = 0
const t = (name, fn) => {
  try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
const scratch = mkdtempSync(path.join(os.tmpdir(), 'server-install-live-'))
const put = (p, text = 'x') => { mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, text) }
const MARK = '# Managed by the Fractera node (step 737)\n'

function tree(name) {
  const base = path.join(scratch, name)
  const home = path.join(base, 'home', 'fractera')
  const root = path.join(base, 'root')
  const nginx = path.join(base, 'etc', 'nginx')
  const dir = path.join(root, '.fractera')
  put(path.join(home, 'web4-node-starter-kit', 'package.json'), '{}')
  put(path.join(home, 'web4-node-starter-kit', 'node_modules', 'a', 'index.js'))
  put(path.join(home, 'web4-node-starter-kit.before-20261118T000000Z', 'x'))
  for (const c of ['.npm/_cacache/x', '.cache/ms-playwright/x', '.pm2/logs/web4-out.log']) put(path.join(home, c))
  for (const k of ['.ssh/authorized_keys', '.claude/settings.json', '.local/bin/claude']) put(path.join(home, k))
  put(path.join(root, 'fractera-cleared-20261118-151521', 'nodes', 'web4-node-starter-kit', 'big'))
  put(path.join(root, 'fractera-cleared-20261118-151521', 'pm2.json'), '[]')
  mkdirSync(path.join(root, 'fractera-cleared-20261118-151521', 'nginx'), { recursive: true })
  put(path.join(root, 'fractera-cleared-20261119-081456', 'nodes', 'web4-node-starter-kit', 'big'))
  put(path.join(root, 'fractera-cleared-20261119-081456', 'nginx', 'shop'), 'server { }') // a stranger's site kept by an earlier clear
  put(path.join(root, '.ssh', 'authorized_keys'))
  put(path.join(root, '.npm', '_cacache', 'index-v5', 'x'))
  put(path.join(base, 'opt', 'fractera', 'app', 'x')); put(path.join(base, 'etc', 'fractera', 'node.env'))
  put(path.join(base, 'etc', 'letsencrypt', 'live', 'fractera.ai', 'fullchain.pem'))
  put(path.join(nginx, 'sites-enabled', 'fractera'), `${MARK}server { }`)
  put(path.join(nginx, 'sites-enabled', 'blog'), 'server { }')
  mkdirSync(path.join(nginx, 'conf.d'), { recursive: true })
  for (const f of ['launch.json', 'launch.progress.jsonl', 'domain.json', 'probe.json']) put(path.join(dir, f), '{}')
  put(path.join(dir, 'telegram.json'), '{"token":"waits"}')
  put(path.join(dir, 'timings.json'), '{"run":"x","sec":{}}')
  put(path.join(dir, 'clear.sh'), '#!/bin/sh')
  return { base, home, root, nginx, dir }
}
const clear = (tr, ...args) => {
  const r = spawnSync('bash', [CLEAR, '--dir', tr.dir, ...args], {
    encoding: 'utf8', env: { ...process.env, CLEAR_TEST: '1', CLEAR_HOME: tr.home, CLEAR_ROOT: tr.root, CLEAR_NGINX: tr.nginx, CLEAR_BASE: tr.base },
  })
  const line = r.stdout.trim().split('\n').pop()
  try { return { ...JSON.parse(line), rc: r.status } } catch { throw new Error(`clear.sh said: ${r.stdout}\n${r.stderr}`) }
}

console.log('806-1 · the clear erases a Fractera node and every older copy')
const a = tree('a')
const ra = clear(a, '--node', 'web4-node-starter-kit')
t('the node folder is erased', () => assert.equal(existsSync(path.join(a.home, 'web4-node-starter-kit')), false))
t('the copies of earlier clears and launches are erased', () => {
  assert.equal(existsSync(path.join(a.root, 'fractera-cleared-20261118-151521')), false, 'an old backup with nothing of a stranger goes whole')
  assert.equal(existsSync(path.join(a.root, 'fractera-cleared-20261119-081456', 'nodes')), false)
  assert.equal(existsSync(path.join(a.home, 'web4-node-starter-kit.before-20261118T000000Z')), false)
})
t('the node user\'s caches and root\'s npm cache are erased', () => {
  for (const c of ['.npm', '.cache', '.pm2']) assert.equal(existsSync(path.join(a.home, c)), false, c)
  assert.equal(existsSync(path.join(a.root, '.npm', '_cacache')), false)
  assert.equal(existsSync(path.join(a.base, 'opt', 'fractera')), false, 'the Easy Starter\'s tree goes with every clear of a node')
  assert.ok(existsSync(path.join(a.base, 'etc', 'fractera', 'node.env')), 'the node\'s own /etc/fractera stays')
})
t('negative: the keys, the Claude sign-in, the certificates, a stranger\'s kept site, the bot token and the stopwatch stay', () => {
  for (const k of ['.ssh/authorized_keys', '.claude/settings.json', '.local/bin/claude']) assert.ok(existsSync(path.join(a.home, k)), k)
  assert.ok(existsSync(path.join(a.root, '.ssh', 'authorized_keys')))
  assert.ok(existsSync(path.join(a.base, 'etc', 'letsencrypt', 'live', 'fractera.ai', 'fullchain.pem')))
  assert.ok(existsSync(path.join(a.root, 'fractera-cleared-20261119-081456', 'nginx', 'shop')), 'a stranger\'s site an earlier clear kept')
  assert.ok(existsSync(path.join(a.dir, 'telegram.json')) && existsSync(path.join(a.dir, 'timings.json')) && existsSync(path.join(a.dir, 'clear.sh')))
})
t('the launch records go; the node\'s own nginx site goes without --keep-site', () => {
  for (const f of ['launch.json', 'launch.progress.jsonl', 'domain.json', 'probe.json']) assert.equal(existsSync(path.join(a.dir, f)), false, f)
  assert.equal(existsSync(path.join(a.nginx, 'sites-enabled', 'fractera')), false)
})
t('a stranger\'s site is set aside, not deleted, and the answer names what was erased', () => {
  assert.deepEqual(ra.sites, ['blog'])
  assert.ok(ra.backup && existsSync(path.join(ra.backup, 'nginx', 'blog')) && existsSync(path.join(ra.backup, 'README.txt')))
  assert.deepEqual(ra.nodes, ['web4-node-starter-kit'])
  assert.ok(ra.erased.length >= 6 && typeof ra.freeGb === 'number' && typeof ra.freedGb === 'number')
})

const b = tree('b')
rmSync(path.join(b.nginx, 'sites-enabled', 'blog'))
const rb = clear(b, '--keep-site', '--node', 'web4-node-starter-kit')
t('--keep-site: the node\'s own site stays for the «updating» page; with nothing of a stranger no backup is left', () => {
  assert.ok(existsSync(path.join(b.nginx, 'sites-enabled', 'fractera')))
  assert.equal(rb.backup, null)
  assert.equal(existsSync(path.join(b.home, 'web4-node-starter-kit')), false)
})
const c = tree('c')
const rc = clear(c, '--node', '..', '--node', '.')
t('negative: a folder name «..» or «.» erases nothing', () => {
  assert.deepEqual(rc.nodes, [])
  assert.ok(existsSync(path.join(c.home, 'web4-node-starter-kit', 'package.json')) && existsSync(path.join(c.home, '.npm')))
})

console.log('806-8 · what earlier installers left')
{
  const L = path.join(scratch, 'left')
  for (const f of ['opt/fractera/app/x', 'opt/fractera-main/x', 'root/.cache/camoufox/x', 'root/.npm/_cacache/x', 'root/.ssh/authorized_keys', 'etc/fractera/node.env', 'home/fractera/web4-node-starter-kit/x', 'etc/letsencrypt/live/a/x',
    'root/.pm2/dump.pm2', 'home/olduser/.pm2/dump.pm2', 'home/fractera/.pm2/dump.pm2', 'var/lib/docker/x', 'var/lib/containerd/x', 'var/lib/postgresql/14/main/x', 'etc/apache2/x', 'var/lib/mysql/x', 'var/www/html/index.html', 'var/www/oldsite/x', 'var/www/fractera-acme/x']) put(path.join(L, f))
  const r = spawnSync('bash', [path.join(here, 'dedicated-server', 'leftovers.sh')], { encoding: 'utf8', env: { ...process.env, LEFT_ROOT: L, LEFT_TEST: '1' } })
  const out = JSON.parse(r.stdout.trim().split('\n').pop())
  t('the Easy Starter\'s trees and root\'s caches are erased', () => {
    for (const f of ['opt/fractera', 'opt/fractera-main', 'root/.cache', 'root/.npm/_cacache']) assert.equal(existsSync(path.join(L, f)), false, f)
    assert.equal(out.erased.length, 13)
  })
  t('818-1 everything foreign goes: other users\' pm2, Docker\'s and the databases\' data, Apache, every site but the node\'s', () => {
    for (const f of ['root/.pm2', 'home/olduser/.pm2', 'var/lib/docker', 'var/lib/containerd', 'var/lib/postgresql', 'etc/apache2', 'var/lib/mysql', 'var/www/html', 'var/www/oldsite']) assert.equal(existsSync(path.join(L, f)), false, f)
    assert.deepEqual(out.pm2Killed.sort(), ['olduser', 'root'])
    assert.ok(Array.isArray(out.purged) && Array.isArray(out.foreignListening))
  })
  t('818-1 negative: the node user\'s own pm2 and the node\'s ACME folder stay', () => {
    for (const f of ['home/fractera/.pm2/dump.pm2', 'var/www/fractera-acme/x']) assert.ok(existsSync(path.join(L, f)), f)
  })
  t('negative: the node, its /etc/fractera, the keys and the certificates stay', () => {
    for (const f of ['home/fractera/web4-node-starter-kit/x', 'etc/fractera/node.env', 'root/.ssh/authorized_keys', 'etc/letsencrypt/live/a/x']) assert.ok(existsSync(path.join(L, f)), f)
  })
}

console.log('806-3 · the live reader')
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z')
const hms = (ms) => new Date(ms).toISOString().slice(11, 19)
function launchTree(name, { running }) {
  const base = path.join(scratch, name)
  const dir = path.join(base, 'fractera')
  const node = path.join(base, 'node')
  const ds = path.join(node, 'logs', 'dedicated-server')
  const t0 = Date.now() - 30 * 60_000
  const at = (min) => iso(t0 + min * 60_000)
  put(path.join(dir, 'launch.json'), JSON.stringify({ state: running ? 'running' : 'done', mode: 'install', startedAt: at(0), ...(running ? {} : { endedAt: at(29) }) }))
  put(path.join(dir, 'launch.progress.jsonl'), [
    { id: 'launch', state: 'running', at: at(0) }, { id: 'prepare', state: 'running', at: at(0) }, { id: 'prepare', state: 'done', at: at(1) },
    { id: 'install', state: 'running', at: at(1) }, ...(running ? [] : [{ id: 'install', state: 'done', at: at(28) }, { id: 'start', state: 'running', at: at(28) }, { id: 'start', state: 'done', at: at(29) }, { id: 'launch', state: 'done', at: at(29) }]),
  ].map((x) => JSON.stringify({ detail: '', ...x })).join('\n') + '\n')
  put(path.join(ds, 'install.progress.jsonl'), [
    { id: 'install', state: 'running', at: at(1) }, { id: 'deps', state: 'running', at: at(1) }, { id: 'deps', state: 'done', at: at(6) },
    { id: 'build', state: 'running', at: at(6) }, { id: 'build', state: 'done', at: at(16) }, { id: 'elements', state: 'running', at: at(16) },
    ...(running ? [] : [{ id: 'elements', state: 'done', at: at(28) }, { id: 'install', state: 'done', at: at(28) }]),
  ].map((x) => JSON.stringify({ detail: '', ...x })).join('\n') + '\n')
  put(path.join(ds, 'install.log'), [
    `### ${at(16)} elements: npm run services:install`, '', `── auth — v2.4.45 · ${hms(t0 + 16 * 60_000)}`, '  зависимости поставлены',
    `── data — v1.2.0 · ${hms(t0 + 20 * 60_000)}`, '  ОШИБКА сборки элемента (работающая версия не тронута):', `── root — v3.0.69 · ${hms(t0 + 24 * 60_000)}`,
    '  npm token 123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh_ij', '  building…',
  ].join('\n') + '\n')
  return { dir, node, ds }
}
const readLog = (lt) => {
  const r = spawnSync('bash', [LOG, 'node', lt.dir], { encoding: 'utf8', env: { ...process.env, STATE_NODE_DIR: lt.node } })
  try { return JSON.parse(r.stdout.trim().split('\n').pop()) } catch { throw new Error(`log.sh said: ${r.stdout}\n${r.stderr}`) }
}
const live = launchTree('live', { running: true })
utimesSync(path.join(live.ds, 'install.log'), new Date(Date.now() - 400_000), new Date(Date.now() - 400_000))
const l1 = readLog(live)
t('the running stage\'s own log is shown, its secrets masked', () => {
  assert.equal(l1.stage, 'install')
  assert.equal(l1.file, 'install.log')
  assert.ok(l1.lines.some((x) => x.includes('building…')))
  assert.ok(!l1.lines.join('\n').includes('ABCDEFGHIJKLMNOP'), 'a bot token in the log is masked')
})
t('the checklist: the stages, the install\'s own steps, one line per element — the last one runs, a failed one is red', () => {
  const ids = l1.steps.map((s) => `${s.kind}:${s.id}`)
  assert.deepEqual(ids, ['stage:prepare', 'stage:install', 'sub:deps', 'sub:build', 'sub:elements', 'element:auth', 'element:data', 'element:root'])
  const el = Object.fromEntries(l1.steps.filter((s) => s.kind === 'element').map((s) => [s.id, s]))
  assert.equal(el.auth.state, 'done'); assert.equal(el.auth.sec, 240)
  assert.equal(el.data.state, 'failed')
  assert.equal(el.root.state, 'running'); assert.ok(el.root.sec >= 360)
  assert.equal(l1.steps.find((s) => s.id === 'build').sec, 600)
})
t('806-7: the page\'s state names the install\'s own steps while it runs (the «launch» row is never the running stage)', () => {
  const r = spawnSync('bash', [path.join(here, 'dedicated-server', 'state.sh'), 'node', live.dir], { encoding: 'utf8', env: { ...process.env, STATE_NODE_DIR: live.node } })
  const st = JSON.parse(r.stdout.trim().split('\n').pop())
  assert.deepEqual(st.sub.map((x) => x.id), ['install', 'deps', 'build', 'elements'])
})
t('how long the log has been quiet', () => assert.ok(l1.quietSec >= 395 && l1.quietSec < 460, String(l1.quietSec)))
t('negative: a running launch writes no stopwatch', () => assert.equal(existsSync(path.join(live.dir, 'timings.json')), false))
const fin = launchTree('fin', { running: false })
const l2 = readLog(fin)
t('a finished launch: the last element ended with its step, the stopwatch is kept for the next run', () => {
  assert.equal(l2.steps.find((s) => s.id === 'root').state, 'done')
  const tm = JSON.parse(readFileSync(path.join(fin.dir, 'timings.json'), 'utf8'))
  assert.equal(tm.sec['sub:install:build'], 600)
  assert.equal(tm.sec['element:install/elements:auth'], 240)
  assert.equal(readLog(fin).steps.find((s) => s.id === 'build').lastSec, 600, 'the next read shows last time beside the line')
})

rmSync(scratch, { recursive: true, force: true })
console.log(process.exitCode ? `server-install-live: FAILED (${passed} passed)` : `server-install-live: ${passed} passed`)
