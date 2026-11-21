// Node step 828: a domain name is asked of its registry before the node touches Cloudflare; the node takes back only the empty,
// inactive zone it created itself; the empty «now the internet sees» column says what was measured. `npm run test:domain-registry`.
import assert from 'node:assert/strict'
import { closestName, distance, nsNothing, rdapBase, registryOf } from '../lib/domain/registry.mjs'
import { zoneFate } from '../lib/domain/own-zone.mjs'

let passed = 0
const t = async (name, fn) => { try { await fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }

const BOOT = { services: [[['com', 'net'], ['https://rdap.verisign.com/com/v1/']], [['uk'], ['https://rdap.nominet.uk/uk']]] }
const reply = (status, body = {}) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
/** A fake network: the bootstrap and one answer per domain URL; `seen` — every URL asked. */
function net(answers, { bootstrap = BOOT, seen = [] } = {}) {
  return async (url) => {
    seen.push(url)
    if (url === 'https://data.iana.org/rdap/dns.json') return bootstrap instanceof Error ? Promise.reject(bootstrap) : reply(200, bootstrap)
    const a = answers[url]
    if (a instanceof Error) throw a
    return a ?? reply(404)
  }
}
const REG = { entities: [{ roles: ['registrar'], vcardArray: ['vcard', [['version', {}, 'text', '4.0'], ['fn', {}, 'text', 'Porkbun LLC']]] }] }

await t('828: RDAP 200 — registered with its registrar; 404 — unregistered (RFC 7480 §5.3)', async () => {
  const f = net({
    'https://rdap.verisign.com/com/v1/domain/throughsongs.com': reply(200, REG),
    'https://rdap.verisign.com/com/v1/domain/througsongs.com': reply(404),
  })
  assert.deepEqual(await registryOf('throughsongs.com', f), { state: 'registered', registrar: 'Porkbun LLC' })
  assert.deepEqual(await registryOf('througsongs.com', f), { state: 'unregistered', registrar: null })
})

await t('828 negative: a registry that is down (503), a network failure, a zone with no RDAP server — unknown, never «unregistered»', async () => {
  const f = net({
    'https://rdap.verisign.com/com/v1/domain/busy.com': reply(503),
    'https://rdap.verisign.com/com/v1/domain/cut.com': new Error('ECONNRESET'),
  })
  assert.equal((await registryOf('busy.com', f)).state, 'unknown')
  assert.equal((await registryOf('cut.com', f)).state, 'unknown')
  assert.equal((await registryOf('brand.zz', f)).state, 'unknown', 'no RDAP server for .zz')
  assert.equal((await registryOf('brand.co.uk', net({ 'https://rdap.nominet.uk/uk/domain/brand.co.uk': reply(200, {}) }))).state, 'registered', 'the bootstrap base without a trailing slash')
})

await t('828: the longest suffix the bootstrap lists wins (RFC 9224 §4); none — null', () => {
  const list = [[['uk'], ['https://a/']], [['co.uk'], ['https://b']]]
  assert.equal(rdapBase('brand.co.uk', list), 'https://b/')
  assert.equal(rdapBase('brand.uk', list), 'https://a/')
  assert.equal(rdapBase('brand.zz', list), null)
})

await t('828: closestName — one letter away is the typo of today; a short name two edits away is another name; the same name is never «closest»', () => {
  assert.equal(distance('througsongs.com', 'throughsongs.com'), 1)
  assert.equal(distance('ab', 'ba'), 1, 'two neighbours swapped — one edit')
  assert.equal(closestName('througsongs.com', ['fractera.ai', 'throughsongs.com', 'lagrix.dev']), 'throughsongs.com')
  assert.equal(closestName('throughsongs.com', ['throughsongs.com']), null)
  assert.equal(closestName('ab.io', ['cd.io']), null, 'a short name: distance 2 is not a typo')
  assert.equal(closestName('ab.io', ['ac.io']), 'ac.io')
  assert.equal(closestName('mybrand.com', ['other-name.org']), null)
})

await t('828-3: the empty column — not measured · no such domain · DNS did not answer · no name servers', () => {
  assert.equal(nsNothing({}), 'not-yet')
  assert.equal(nsNothing({ checkedAt: 'x', registry: 'unregistered', registrarNs: [] }), 'no-domain')
  assert.equal(nsNothing({ checkedAt: 'x', registry: 'registered' }), 'ask-failed')
  assert.equal(nsNothing({ checkedAt: 'x', registry: 'registered', registrarNs: [] }), 'none')
  assert.equal(nsNothing({ checkedAt: 'x', registrarNs: [] }), 'none', 'an entry measured before 828 (no registry field)')
})

await t('828-2: only the node\'s own, empty, inactive zone leaves; an active one, one with records, another id or an unanswered question stay', () => {
  const mine = 'a'.repeat(32)
  assert.equal(zoneFate({ createdZoneId: mine, zone: { id: mine, status: 'pending' }, hasRecords: false }), 'delete')
  assert.equal(zoneFate({ createdZoneId: mine, zone: { id: mine, status: 'active' }, hasRecords: false }), 'kept-active')
  assert.equal(zoneFate({ createdZoneId: mine, zone: { id: mine, status: 'pending' }, hasRecords: true }), 'kept-records')
  assert.equal(zoneFate({ createdZoneId: mine, zone: { id: mine, status: 'pending' }, hasRecords: null }), 'kept-failed')
  assert.equal(zoneFate({ createdZoneId: mine, zone: { id: 'b'.repeat(32), status: 'pending' }, hasRecords: false }), null, 'the person re-created it — not ours')
  assert.equal(zoneFate({ createdZoneId: undefined, zone: { id: mine, status: 'pending' }, hasRecords: false }), null, 'a zone the node did not create')
  assert.equal(zoneFate({ createdZoneId: mine, zone: null, hasRecords: null }), null, 'already gone')
})

console.log(process.exitCode ? `===DOMAIN_REGISTRY_FAILED=== ${passed} passed` : `===DOMAIN_REGISTRY_OK=== ${passed} passed`)
