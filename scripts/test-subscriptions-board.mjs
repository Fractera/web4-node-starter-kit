// npm run test:subscriptions-board — the rows of «Dashboard → Все подписки» over a fixture (step 726-3), no disk, no network.
//
// Proves: two elements declaring one service give ONE row with both in its dropdown; the ledger's provider joins the declared service;
// the core's refusal keeps OpenAI's own code; an element's OpenAI call is judged by the core's key; an element with neither a declared
// service nor a call appears nowhere — and the negative control: the same element with one paid call DOES appear (so its absence is
// the rule, not a filter that drops everyone). No key value can pass: a source carries names only.

import { createRequire } from 'node:module'
import assert from 'node:assert/strict'

const require = createRequire(import.meta.url)
const { boardRows } = require('../lib/subscriptions-board.cjs')

const exa = { id: 'exa', name: 'Exa', description: 'AI search', docs: 'https://exa.ai/docs', keys: [{ env: 'EXA_API_KEY', label: 'Key', secret: true }] }
const fixture = (quietLedger = []) => [
  {
    id: 'core', label: '', href: null, subscriptions: { example: false, services: [] }, setNames: ['OPENAI_API_KEY'],
    ledger: [
      { at: '2026-11-11T20:00:00.000Z', who: 'i18n/translate', provider: 'openai', ok: true, tokensIn: 100, tokensOut: 40 },
      { at: '2026-11-11T21:00:00.000Z', who: 'voice-input', provider: 'openai', ok: false, status: 429, reason: 'no-funds', code: 'credit_balance_exhausted', message: 'You have no credits remaining' },
    ],
  },
  {
    id: 'search', label: 'Поиск', href: '/architect/search/workflow/process/subscriptions',
    subscriptions: { example: false, services: [exa] }, setNames: ['EXA_API_KEY'],
    ledger: [{ at: '2026-11-11T19:00:00.000Z', who: 'search/run', provider: 'exa', ok: true }],
  },
  {
    id: 'news', label: 'Новости', href: '/architect/news/workflow/process/subscriptions',
    subscriptions: { example: false, services: [exa] }, setNames: [],
    ledger: [{ at: '2026-11-11T18:00:00.000Z', who: 'agent-kit/translate', provider: 'openai', ok: true }],
  },
  { id: 'quiet', label: 'Тихий', href: '/architect/quiet/workflow/process/subscriptions', subscriptions: null, setNames: ['SOMETHING'], ledger: quietLedger },
]

let failed = 0
const check = (name, fn) => {
  try { fn(); console.log(`  ✓ ${name}`) } catch (e) { failed++; console.log(`  ✗ ${name}\n      ${e.message}`) }
}

const rows = boardRows(fixture(), { coreSetNames: ['OPENAI_API_KEY'] })
const byId = Object.fromEntries(rows.map((r) => [r.service, r]))

console.log('subscriptions board over a fixture:')
check('one row per service: exa and openai, nothing else', () => assert.deepEqual(rows.map((r) => r.service).sort(), ['exa', 'openai']))
check('exa — one row with BOTH elements in its dropdown', () => assert.deepEqual(byId.exa.users.map((u) => u.id).sort(), ['news', 'search']))
check('exa — the declared name, docs and the link to each element’s page', () => {
  assert.equal(byId.exa.name, 'Exa')
  assert.equal(byId.exa.docs, 'https://exa.ai/docs')
  assert.equal(byId.exa.users.find((u) => u.id === 'search').href, '/architect/search/workflow/process/subscriptions/exa')
})
check('exa — keys: set at search, missing at news → partly set', () => {
  assert.equal(byId.exa.users.find((u) => u.id === 'search').keys, 'set')
  assert.equal(byId.exa.users.find((u) => u.id === 'news').keys, 'missing')
  assert.equal(byId.exa.keys, 'partial')
})
check('exa — the ledger joins the declared service (1 call by search/run)', () => {
  assert.equal(byId.exa.calls, 1)
  assert.deepEqual(byId.exa.users.find((u) => u.id === 'search').consumers, ['search/run'])
})
check('openai — the core and the element that call it', () => assert.deepEqual(byId.openai.users.map((u) => u.id).sort(), ['core', 'news']))
check('openai — the last refusal keeps OpenAI’s own code and the consumer', () => {
  assert.equal(byId.openai.lastError.code, 'credit_balance_exhausted')
  assert.equal(byId.openai.lastError.who, 'voice-input')
  assert.equal(byId.openai.lastCall.ok, false)
  assert.equal(byId.openai.refused, 1)
  assert.equal(byId.openai.tokensIn, 100)
})
check('openai — an element’s call is judged by the core’s key', () => assert.equal(byId.openai.users.find((u) => u.id === 'news').keys, 'set'))
check('an element with no declared service and no call appears nowhere', () => {
  for (const r of rows) assert.ok(!r.users.some((u) => u.id === 'quiet'), `quiet in ${r.service}`)
})
check('no value of a key in the rows', () => assert.ok(!/sk-|EXA_API_KEY=/.test(JSON.stringify(rows))))

console.log('negative control:')
const loud = boardRows(fixture([{ at: '2026-11-11T22:00:00.000Z', who: 'quiet/job', provider: 'openai', ok: true }]), { coreSetNames: ['OPENAI_API_KEY'] })
check('the same quiet element with ONE paid call does appear (absence is the rule, not a filter)', () => {
  assert.ok(loud.find((r) => r.service === 'openai').users.some((u) => u.id === 'quiet'))
})
check('without the core’s key the element’s OpenAI call reads «missing»', () => {
  const r = boardRows(fixture(), { coreSetNames: [] }).find((x) => x.service === 'openai')
  assert.equal(r.users.find((u) => u.id === 'news').keys, 'missing')
})

if (failed) { console.log(`\n${failed} failed`); process.exit(1) }
console.log('\nall passed')
