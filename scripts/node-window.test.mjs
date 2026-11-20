// 818-8 the node's public window for walled elements (lib/hosting/node-window.cjs): only the fields the templates read pass, a planted
// link never redirects a write, the templates' own derivation finds the core's runtime beside the domain file, and the installer's
// NODE_DOMAIN_FILE names the window only for a custom element behind a wall. Run: node scripts/node-window.test.mjs
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, symlinkSync, existsSync, lstatSync, statSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const win = require('../lib/hosting/node-window.cjs')
const { publicAuth } = require('../lib/domain/public-auth.cjs')

let passed = 0
const t = (name, fn) => { fn(); passed += 1; console.log(`  ✓ ${name}`) }
const node = () => { const r = mkdtempSync(join(tmpdir(), 'node-window-')); mkdirSync(join(r, 'logs')); mkdirSync(join(r, 'data')); return r }
const put = (f, v) => { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, typeof v === 'string' ? v : JSON.stringify(v)) }
const read = (f) => JSON.parse(readFileSync(f, 'utf8'))

t('only the named fields of the domain pass — a secret beside them never does (negative control)', () => {
  const r = node()
  put(join(r, 'logs', 'domain.json'), { zone: 'fractera.ai', hostname: 'fractera.ai', authHostname: 'auth.fractera.ai', authRouted: true, architectHostname: 'architect.fractera.ai', tunnelToken: 'SECRET-T', apiToken: 'SECRET-A', nested: { key: 'SECRET-N' } })
  put(join(r, 'logs', 'runtime.json'), { port: 24680, hostname: 'localhost', pid: 123, commit: 'abc', startedAt: 'x' })
  const w = win.writeNodeWindow(r, { force: true })
  assert.equal(w.ok, true, w.reason)
  const d = readFileSync(join(win.windowDir(r), 'domain.json'), 'utf8')
  assert.ok(!/SECRET/.test(d), 'no secret in the window')
  assert.deepEqual(Object.keys(JSON.parse(d)).sort(), ['architectHostname', 'authHostname', 'authRouted', 'hostname', 'zone'])
  assert.deepEqual(read(join(win.windowDir(r), 'runtime.json')), { port: 24680, hostname: 'localhost' })
  for (const f of ['domain.json', 'runtime.json']) assert.equal(statSync(join(win.windowDir(r), f)).mode & 0o777, 0o644)
  assert.equal(statSync(win.windowDir(r)).mode & 0o777, 0o755)
})

t('no domain → {} and the core not started → its fixed port: both files always exist (the walls refuse a missing one)', () => {
  const r = node()
  assert.equal(win.writeNodeWindow(r, { force: true }).ok, true)
  assert.deepEqual(read(join(win.windowDir(r), 'domain.json')), {})
  assert.deepEqual(read(join(win.windowDir(r), 'runtime.json')), { port: 24680, hostname: 'localhost' })
})

t('the templates derive the core beside the domain file, and the sign-in formula reads the window', () => {
  const r = node()
  put(join(r, 'logs', 'domain.json'), { zone: 'fractera.ai', hostname: 'fractera.ai', authRouted: true })
  put(join(r, 'logs', 'runtime.json'), { port: 24680, hostname: 'localhost' })
  win.writeNodeWindow(r, { force: true })
  const file = join(win.windowDir(r), 'domain.json')
  assert.deepEqual(read(join(dirname(dirname(file)), 'logs', 'runtime.json')).port, 24680)
  // the sign-in formula (one for the node and the templates: zone, hostname, authRouted) read at the window's own root
  assert.deepEqual(publicAuth(dirname(dirname(file))), { zone: 'fractera.ai', siteHost: 'fractera.ai', authHost: 'auth.fractera.ai', architectHost: null })
})

t('a link planted at the window folder is refused; a link at a file is replaced, its target untouched', () => {
  const r = node()
  const elsewhere = mkdtempSync(join(tmpdir(), 'node-window-elsewhere-'))
  symlinkSync(elsewhere, join(r, 'data', 'node-window'))
  const w = win.writeNodeWindow(r, { force: true })
  assert.equal(w.ok, false)
  assert.equal(existsSync(join(elsewhere, 'logs')), false, 'nothing written through the link')
  rmSync(join(r, 'data', 'node-window'))
  mkdirSync(win.windowDir(r), { recursive: true })
  const target = join(elsewhere, 'precious.json')
  writeFileSync(target, 'keep')
  symlinkSync(target, join(win.windowDir(r), 'domain.json'))
  assert.equal(win.writeNodeWindow(r, { force: true }).ok, true)
  assert.equal(readFileSync(target, 'utf8'), 'keep')
  assert.equal(lstatSync(join(win.windowDir(r), 'domain.json')).isSymbolicLink(), false)
})

t('NODE_DOMAIN_FILE: the window only for a custom element behind a wall; a native and a computer keep the node\'s file', () => {
  const r = node()
  const helper = join(r, 'fake-helper'); writeFileSync(helper, '#!/bin/sh\n')
  const nodeEnv = join(r, 'node.env'); writeFileSync(nodeEnv, `NODE_USER=fractera\nNODE_DIR=${r}\n`)
  const on = { helper, nodeEnv, anyPlatform: true }
  assert.equal(win.domainFileFor(r, { id: 'z6esw', kind: 'user' }, on), join(r, 'data', 'node-window', 'logs', 'domain.json'))
  assert.equal(win.domainFileFor(r, { id: 'auth', kind: 'core' }, on), join(r, 'logs', 'domain.json'))
  assert.equal(win.domainFileFor(r, { id: 'z6esw', kind: 'user' }, { helper: join(r, 'no-helper'), nodeEnv, anyPlatform: true }), join(r, 'logs', 'domain.json'))
  assert.equal(win.writeNodeWindow(r, { helper: join(r, 'no-helper'), nodeEnv, anyPlatform: true }).skipped, 'no-wall')
})

t('the walls open exactly the two window files', () => {
  const list = readFileSync(new URL('./dedicated-server/element-readable.txt', import.meta.url), 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean)
  assert.deepEqual(list.filter((l) => l.startsWith('data/node-window/')).sort(), ['data/node-window/logs/domain.json', 'data/node-window/logs/runtime.json'])
  assert.ok(!list.some((l) => l.startsWith('logs/')), 'the node\'s own logs stay closed')
})

console.log(`===NODE_WINDOW_OK=== ${passed} passed`)
