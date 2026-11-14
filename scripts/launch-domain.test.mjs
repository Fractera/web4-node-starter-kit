// TESTS OF THE DOMAIN OF A SERVER BEING LAUNCHED (node step 744-5, D46). `npm run test:launch-domain`, in the prebuild.
// The owner, 2026-11-14: «спрашивать пользователя есть ли у неё доступ к регистратора и если нет у него доступа к регистратору то есть у него
// доступ к Cloud Flyer». Two pure readings of `lib/hosting/launch-domain.mjs`, each case with the one fact that turns it:
//   the two questions → the way the records are written (Cloudflare asked only where the records are kept there);
//   the four facts of step 3, the same for the page and for the runner's `install` (the runner itself: `test:hosting-launch`, by hand).
import assert from 'node:assert/strict'
import { answersOf, domainMissing, domainSteps, wayOf } from '../lib/hosting/launch-domain.mjs'

let passed = 0
const t = (name, fn) => {
  try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}

console.log('744-5 two questions → a way; step 3 done by four facts')

t('records kept elsewhere: «registrar yes» → dns, «no» → none (Cloudflare is not asked: an account there cannot write them); unanswered → wait', () => {
  assert.equal(wayOf({ cloudflareDns: false, registrar: 'yes' }), 'dns')
  assert.equal(wayOf({ cloudflareDns: false, registrar: 'no' }), 'none')
  assert.equal(wayOf({ cloudflareDns: false, registrar: 'no', cloudflare: 'yes' }), 'none', 'a Cloudflare answer changes nothing here')
  assert.equal(wayOf({ cloudflareDns: false }), null)
})
t('records kept at Cloudflare: the registrar first, then Cloudflare — yes → cloudflare; no → migrate with the registrar, none without', () => {
  assert.equal(wayOf({ cloudflareDns: true, registrar: 'no', cloudflare: 'yes' }), 'cloudflare')
  assert.equal(wayOf({ cloudflareDns: true, registrar: 'yes', cloudflare: 'yes' }), 'cloudflare')
  assert.equal(wayOf({ cloudflareDns: true, registrar: 'yes', cloudflare: 'no' }), 'migrate')
  assert.equal(wayOf({ cloudflareDns: true, registrar: 'no', cloudflare: 'no' }), 'none')
  assert.equal(wayOf({ cloudflareDns: true, registrar: 'no' }), null, 'the second question is still to be asked')
  assert.equal(wayOf({ cloudflareDns: true, cloudflare: 'yes' }), null, 'never the second before the first')
})
t('a recorded way tells its answers back (a reload shows them); every answer pair gives back its own way', () => {
  for (const cloudflareDns of [false, true]) {
    for (const registrar of ['yes', 'no']) {
      for (const cloudflare of cloudflareDns ? ['yes', 'no'] : [null]) {
        const way = wayOf({ cloudflareDns, registrar, cloudflare })
        const told = answersOf(way, cloudflareDns)
        assert.equal(wayOf({ cloudflareDns, registrar: told.registrar ?? registrar, cloudflare: told.cloudflare }), way, `${cloudflareDns} ${registrar} ${cloudflare}`)
      }
    }
  }
  assert.deepEqual(answersOf(null, true), { registrar: null, cloudflare: null })
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
