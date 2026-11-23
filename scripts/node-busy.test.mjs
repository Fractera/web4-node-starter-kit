// 839-14: the «node busy» lock — a birth and a node update never run at once (the owner, Telegram 1085; ✗ 2026-11-23 00:37–00:39 on the
// server: jkz0e's birth and the update's step «элементы» built one folder, BIRTH_FAILED). Proven on a scratch root: a live birth without
// its verdict holds, a finished, dead or stale one does not; a live running update holds, a done, dead or stale one does not; and the two
// callers ask the lock before they start (the update before it fetches, the birth before it spawns).
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const busy = require('../lib/deploy/node-busy.cjs')
let n = 0
const t = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`) }

const deadPid = (() => { const r = spawnSync(process.execPath, ['-e', 'process.stdout.write(String(process.pid))'], { encoding: 'utf8' }); return Number(r.stdout) })()
const now = Date.now()
const iso = (ms) => new Date(ms).toISOString()

function root() {
  const r = mkdtempSync(join(tmpdir(), 'node-busy-'))
  mkdirSync(join(r, 'logs'), { recursive: true })
  mkdirSync(join(r, 'data', 'node'), { recursive: true })
  return r
}
function birth(r, id, { pid = process.pid, startedAt = iso(now), log = '[1.0 с] установка\n' } = {}) {
  writeFileSync(join(r, 'logs', `birth-${id}.json`), JSON.stringify({ pid, startedAt }))
  if (log !== null) writeFileSync(join(r, 'logs', `birth-${id}.log`), log)
}
function update(r, s) { writeFileSync(join(r, 'data', 'node', 'node-update.json'), JSON.stringify(s)) }

console.log('839-14 node-busy — a birth and a node update exclude each other')
t('a live birth without its verdict holds the update (its id named)', () => {
  const r = root(); try { birth(r, 'jkz0e'); assert.deepEqual(busy.birthRunning(r, now)?.id, 'jkz0e') } finally { rmSync(r, { recursive: true, force: true }) }
})
t('a birth that only just started (no journal yet) holds too', () => {
  const r = root(); try { birth(r, 'abc', { log: null }); assert.equal(busy.birthRunning(r, now)?.id, 'abc') } finally { rmSync(r, { recursive: true, force: true }) }
})
t('negative: a finished birth (BIRTH_OK or BIRTH_FAILED) does not hold', () => {
  const r = root()
  try {
    birth(r, 'ok1', { log: '===BIRTH_OK=== port 24690\n' }); birth(r, 'bad1', { log: '===BIRTH_FAILED=== запуск\n' })
    assert.equal(busy.birthRunning(r, now), null)
  } finally { rmSync(r, { recursive: true, force: true }) }
})
t('negative: a dead birth process or a record older than three hours does not hold', () => {
  const r = root()
  try {
    birth(r, 'dead', { pid: deadPid }); birth(r, 'old', { startedAt: iso(now - busy.STALE_MS - 1000) })
    assert.equal(busy.birthRunning(r, now), null)
  } finally { rmSync(r, { recursive: true, force: true }) }
})
t('a live running node update holds a birth (its stage named)', () => {
  const r = root(); try { update(r, { state: 'running', pid: process.pid, startedAt: iso(now), stage: 'elements' }); assert.equal(busy.updateRunning(r, now)?.stage, 'elements') } finally { rmSync(r, { recursive: true, force: true }) }
})
t('negative: a done, dead or stale update does not hold', () => {
  const r = root()
  try {
    update(r, { state: 'done', pid: process.pid, startedAt: iso(now) }); assert.equal(busy.updateRunning(r, now), null)
    update(r, { state: 'running', pid: deadPid, startedAt: iso(now) }); assert.equal(busy.updateRunning(r, now), null)
    update(r, { state: 'running', pid: process.pid, startedAt: iso(now - busy.STALE_MS - 1000) }); assert.equal(busy.updateRunning(r, now), null)
    rmSync(join(r, 'data', 'node', 'node-update.json')); assert.equal(busy.updateRunning(r, now), null)
  } finally { rmSync(r, { recursive: true, force: true }) }
})
t('the callers ask the lock before they start: the update before it fetches the fork, the birth before it spawns', () => {
  const upd = readFileSync('scripts/node-update.mjs', 'utf8')
  const lock = upd.indexOf("node-busy.cjs').birthRunning(ROOT)"), fetchAt = upd.indexOf("stage('fetch'")
  assert.ok(lock > 0 && fetchAt > lock, 'node-update refuses a running birth in its check, before stage «fetch»')
  const birthTs = readFileSync('lib/web4-items/birth.ts', 'utf8')
  const ask = birthTs.indexOf('nodeBusy.updateRunning(process.cwd())'), spawnAt = birthTs.indexOf('spawn(process.execPath')
  assert.ok(ask > 0 && spawnAt > ask, 'startBirth refuses a running update before it spawns item-birth')
  const door = readFileSync('app/api/architect/drafts/[id]/birth/route.ts', 'utf8')
  assert.ok(/reason === "node-updating"/.test(door) && /status: 400/.test(door), 'the birth door words the refusal for the birth window (400 + message)')
})
console.log(`===NODE_BUSY_OK=== ${n} passed`)
