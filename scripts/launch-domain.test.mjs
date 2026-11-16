// TESTS OF THE DOMAIN OF A SERVER BEING LAUNCHED (node step 744-5, D46). `npm run test:launch-domain`, in the prebuild.
// 759, the owner 2026-11-16: «единственное возможный вариант подключения только через регистратора». Two pure readings of
// `lib/hosting/launch-domain.mjs`, each case with the one fact that turns it:
//   the one question → the way the records are written (the registrar, or the instruction for whoever has it);
//   the four facts of step 3, the same for the page and for the runner's `install` (the runner itself: `test:hosting-launch`, by hand).
import assert from 'node:assert/strict'
import { answersOf, domainMissing, domainSteps, normalWay, wayOf } from '../lib/hosting/launch-domain.mjs'

let passed = 0
const t = (name, fn) => {
  try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}

console.log('759 one question → a way; step 3 done by four facts')

t('one question, the registrar: «yes» → dns, «no» → none, unanswered → wait (759: the Cloudflare branch is gone)', () => {
  assert.equal(wayOf({ registrar: 'yes' }), 'dns')
  assert.equal(wayOf({ registrar: 'no' }), 'none')
  assert.equal(wayOf({}), null)
  assert.equal(wayOf({ registrar: 'yes', cloudflare: 'yes' }), 'dns', 'negative: an old Cloudflare answer never gives the removed way')
})
t('an earlier record with the removed ways reads as dns; a recorded way tells its answer back (a reload shows it)', () => {
  for (const old of ['cloudflare', 'migrate', 'dns']) assert.equal(normalWay(old), 'dns', old)
  assert.equal(normalWay('none'), 'none')
  assert.equal(normalWay(null), null)
  for (const registrar of ['yes', 'no']) assert.equal(wayOf({ registrar: answersOf(wayOf({ registrar })).registrar }), wayOf({ registrar }))
  assert.deepEqual(answersOf('cloudflare'), { registrar: 'yes' })
  assert.deepEqual(answersOf(null), { registrar: null })
})
const ready = { domain: 'example.org', detect: { dnsHost: 'other' }, way: 'dns', check: { results: [{ host: 'example.org', state: 'missing' }] } }
t('step 3 done: a domain, where its records live, a way, the first check (its result is the second check\'s business); each one missing is named', () => {
  assert.deepEqual(domainMissing(ready), [])
  assert.deepEqual(domainMissing(null), ['domain', 'where', 'who', 'records'])
  assert.deepEqual(domainMissing({ ...ready, way: 'none' }), ['who'])
  assert.deepEqual(domainMissing({ ...ready, detect: { dnsHost: 'none' } }), ['where'])
  assert.deepEqual(domainMissing({ ...ready, check: { results: [] } }), ['records'])
})
t('a domain the server already holds (from its mark) is connected: no detection or first check needed; negative: the same record from the page', () => {
  const held = { domain: 'aifa.dev', way: 'migrate', from: 'server', since: '2026-11-13T22:45:16Z' }
  assert.deepEqual(domainSteps(held), { domain: true, where: true, who: true, records: true })
  assert.deepEqual(domainMissing({ ...held, from: undefined }), ['where', 'records'])
  assert.deepEqual(domainMissing({ ...held, way: null }), ['who'], 'a held domain without its way still asks who writes the records')
})

console.log(process.exitCode ? `===LAUNCH_DOMAIN_FAILED=== ${passed} passed` : `===LAUNCH_DOMAIN_OK=== ${passed} passed`)
