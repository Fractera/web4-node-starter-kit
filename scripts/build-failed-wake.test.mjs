// 839-5: a failed core build reaches the main agent even when nobody was working — the node wakes it with the summary, where the log is
// and the order to tell the person in Telegram what broke, why and what it does (✗ the server, 2026-11-22 18:30: the main agent slept, only
// an outside agent found the cause). A fake core answers /api/health and records /api/agents/wake; negative: a refusal that is not «core
// silent» is not retried and the held messages are kept for later.
import assert from 'node:assert/strict'
import http from 'node:http'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = mkdtempSync(join(tmpdir(), 'build-failed-'))
mkdirSync(join(root, 'data', 'node'), { recursive: true })
let answer = { ok: true }
const woke = []
const server = http.createServer((req, res) => {
  let b = ''
  req.on('data', (c) => (b += c))
  req.on('end', () => {
    res.setHeader('content-type', 'application/json')
    if (req.url === '/api/health') return res.end('{"ok":true}')
    if (req.url === '/api/agents/wake') { woke.push(JSON.parse(b)); return res.end(JSON.stringify(answer)) }
    res.statusCode = 404; res.end('{}')
  })
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
process.env.FRACTERA_CORE_URL = `http://127.0.0.1:${server.address().port}`
const ret = require('../lib/deploy/agent-return.cjs')

let n = 0
const t = async (name, fn) => { await fn(); n++; console.log(`  ✓ ${name}`) }
try {
  await t('nobody was working → the main agent is woken by the node with the cause, the log and «tell the person»', async () => {
    ret.hold(root, 'the stripe element finished its report', 'stripe')
    const r = await ret.afterBuildFailed(root, 'the core build FAILED; the previous build runs again', 'logs/node-update.log', () => {})
    assert.equal(r.woke, true)
    assert.equal(woke.length, 1)
    const w = woke[0]
    assert.deepEqual([w.service, w.reason, w.from], ['build', 'alarm', 'node'])
    assert.match(w.text, /the core build FAILED/)
    assert.match(w.text, /logs\/node-update\.log/)
    assert.match(w.text, /Tell the person in Telegram, in their language: what broke, why, and what you do about it/)
    assert.match(w.text, /the stripe element finished its report/, 'held messages ride along')
  })
  await t('negative: a refusal (not «core silent») — no retry, the held messages are kept', async () => {
    woke.length = 0; answer = { ok: false, reason: 'no-account' }
    ret.hold(root, 'a held line', 'config')
    const r = await ret.afterBuildFailed(root, 'the core build FAILED', 'the build log', () => {})
    assert.equal(r.woke, false); assert.equal(r.reason, 'no-account'); assert.equal(woke.length, 1)
    assert.equal(ret.takeHeld(root).length, 1)
  })
  await t('the update waiter: a failed update with nobody working still wakes the main agent (wakeAfter → was-asleep → the failure)', async () => {
    woke.length = 0; answer = { ok: true }
    const since = Date.now() - 1000
    writeFileSync(join(root, 'data', 'node', 'node-update.json'), JSON.stringify({ state: 'failed', reason: 'сборка ядра не удалась', finishedAt: new Date().toISOString() }))
    const r = await ret.afterUpdate(root, since, { every: 50, limitMs: 2000, say: () => {} })
    assert.equal(r.woke, true); assert.equal(r.reason, 'woke-by-failure')
    assert.match(woke[0].text, /the node update ended WITHOUT success/)
  })
  await t('serve.mjs: a failed build of an update spawns the waiter even with nobody working; a failed core build calls the failure wake', async () => {
    const s = readFileSync(join(process.cwd(), 'scripts', 'serve.mjs'), 'utf8')
    assert.match(s, /buildWhat === "update" && \(agentBack \|\| failed\)/)
    assert.match(s, /agentReturn\.afterBuildFailed\(root, summary,/)
  })
} finally {
  server.close()
  if (existsSync(root)) rmSync(root, { recursive: true, force: true })
}
console.log(`===BUILD_FAILED_WAKE_OK=== ${n} passed`)
