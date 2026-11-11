// npm run test:money-day — the day's burn against a budget and the balance probes (step 726-4), over a fixture: no disk, no network.
//
// Proves: 20 calls by 10:00 UTC with a budget of 30 → «will cross at 15:00»; the budget reached → «crossed» at the 30th call; within
// it → «within»; the provider refusing for money → «refusing», whatever the budget; the probes read a fake Exa and a fake OpenAI and
// never return a key. Negative controls: no lines → «no-spend», never a projection; no key → «needs-key»/«not-told», no call made.

import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const { dayBurn, probe, readBudgets, writeBudget } = require('../lib/money-day.cjs')

let failed = 0
const check = async (name, fn) => {
  try { await fn(); console.log(`  ✓ ${name}`) } catch (e) { failed++; console.log(`  ✗ ${name}\n      ${e.message}`) }
}
const at = (h, m = 0) => `2026-11-12T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`
const now = Date.parse(at(10))
const twenty = Array.from({ length: 20 }, (_, i) => ({ at: at(Math.floor(i / 2), (i % 2) * 30), ok: true }))

console.log('the day\'s burn:')
await check('20 calls by 10:00, budget 30 → will cross at 15:00', () => {
  const b = dayBurn(twenty, { budget: 30, now })
  assert.equal(b.state, 'will-cross'); assert.equal(b.calls, 20); assert.equal(b.projected, 48); assert.equal(b.at, at(15))
})
await check('the same, budget 60 → within', () => assert.equal(dayBurn(twenty, { budget: 60, now }).state, 'within'))
await check('budget 15 → crossed at the 15th call', () => {
  const b = dayBurn(twenty, { budget: 15, now }); assert.equal(b.state, 'crossed'); assert.equal(b.at, twenty[14].at)
})
await check('no budget → the burn without a verdict', () => assert.equal(dayBurn(twenty, { now }).state, 'no-budget'))
await check('the last call refused for money → refusing, whatever the budget', () => {
  const b = dayBurn([...twenty, { at: at(9, 59), ok: false, reason: 'no-funds' }], { budget: 1000, now })
  assert.equal(b.state, 'refusing'); assert.equal(b.at, at(9, 59))
})
await check('yesterday\'s lines do not count today', () => assert.equal(dayBurn([{ at: '2026-11-11T23:59:00.000Z', ok: true }], { budget: 1, now }).state, 'no-spend'))

console.log('the balance probes (fake providers):')
const fake = (body, status = 200, seen = []) => async (url, init) => { seen.push({ url, init }); return { ok: status < 400, status, json: async () => body } }
await check('Exa with a service key → the balance in USD', async () => {
  const seen = []
  const r = await probe('exa', (n) => (n === 'EXA_SERVICE_KEY' ? 'svc-secret' : ''), { fetch: fake({ credits_usd: 412.37, metadata: { generated_at: at(9) } }, 200, seen) })
  assert.deepEqual(r, { state: 'balance', usd: 412.37, at: at(9) })
  assert.equal(seen[0].url, 'https://admin-api.exa.ai/team-management/credits')
  assert.ok(!JSON.stringify(r).includes('svc-secret'))
})
const ledgerRoot = mkdtempSync(join(tmpdir(), 'money-day-ledger-'))
const { readDay } = require('../lib/usage-ledger.cjs')
await check('OpenAI with an admin key → spent today in USD, the day starts at 00:00 UTC, one ledger line as openai-admin', async () => {
  const seen = []
  const r = await probe('openai', (n) => (n === 'OPENAI_ADMIN_KEY' ? 'sk-admin-x' : ''), { now, root: ledgerRoot, fetch: fake({ data: [{ results: [{ amount: { value: 0.06 } }, { amount: { value: 0.015 } }] }] }, 200, seen) })
  assert.deepEqual(r, { state: 'spent-today', usd: 0.08 })
  assert.ok(seen[0].url.includes(`start_time=${Date.parse('2026-11-12T00:00:00.000Z') / 1000}`))
  const lines = readDay(undefined, ledgerRoot)
  assert.equal(lines.length, 1); assert.equal(lines[0].provider, 'openai-admin'); assert.ok(!JSON.stringify(lines).includes('sk-admin-x'))
})
await check('a refused admin key is read by the node\'s reader (bad-key) and written to the ledger', async () => {
  const r = await probe('openai', () => 'sk-admin-x', { now, root: ledgerRoot, fetch: fake({ error: { code: 'invalid_api_key', type: 'invalid_request_error', message: 'Incorrect API key' } }, 401) })
  assert.equal(r.state, 'failed'); assert.equal(r.status, 401); assert.ok(r.reason && r.reason !== 'unknown', `reason ${r.reason}`)
  assert.equal(readDay(undefined, ledgerRoot).at(-1).ok, false)
})
await check('the admin line never counts into OpenAI\'s burn of the day', () => {
  const b = dayBurn(readDay(undefined, ledgerRoot).filter((l) => l.provider === 'openai'), { now: Date.now() })
  assert.equal(b.state, 'no-spend')
})
rmSync(ledgerRoot, { recursive: true, force: true })
await check('a refusal of the provider → failed with its status', async () => assert.deepEqual(await probe('exa', () => 'k', { fetch: fake({ error: 'Unauthorized' }, 401) }), { state: 'failed', status: 401 }))

console.log('negative controls:')
await check('no lines → no-spend, never a projection', () => {
  const b = dayBurn([], { budget: 30, now }); assert.equal(b.state, 'no-spend'); assert.equal(b.projected, 0); assert.equal(b.at, null)
})
await check('no key → needs-key / not-told, and NO call is made', async () => {
  const seen = []
  assert.deepEqual(await probe('exa', () => '', { fetch: fake({}, 200, seen) }), { state: 'needs-key', key: 'EXA_SERVICE_KEY' })
  assert.deepEqual(await probe('openai', () => '', { fetch: fake({}, 200, seen) }), { state: 'not-told', key: 'OPENAI_ADMIN_KEY' })
  assert.equal(seen.length, 0)
})
await check('an unknown provider → unknown, no call', async () => assert.deepEqual(await probe('acme', () => 'k', { fetch: async () => { throw new Error('called') } }), { state: 'unknown' }))

console.log('the budgets file:')
const root = mkdtempSync(join(tmpdir(), 'money-day-'))
await check('set, read, remove; a bad id refused', () => {
  assert.ok(writeBudget('exa', 30, root)); assert.deepEqual(readBudgets(root), { exa: { calls: 30 } })
  assert.ok(writeBudget('exa', 0, root)); assert.deepEqual(readBudgets(root), {})
  assert.equal(writeBudget('../etc', 5, root), false)
  assert.ok(JSON.parse(readFileSync(join(root, 'data', 'node', 'budgets.json'), 'utf8')))
})
rmSync(root, { recursive: true, force: true })

if (failed) { console.log(`\n${failed} failed`); process.exit(1) }
console.log('\nall passed')
