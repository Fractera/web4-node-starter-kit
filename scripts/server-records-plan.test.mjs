// TESTS OF THE SERVER'S RECORDS PLAN (node step 760-8). `npm run test:server-records`, in the prebuild.
// The zone of fractera.ai as measured 2026-11-16 (Cloudflare, records proxied to Vercel) is the main fixture: the plan adds `@` and `*` to the
// server's IP, removes the apex and `www` records that lead to Vercel, never touches mail, a name the node does not use, or a tunnel CNAME.
// Negative controls: a removal not confirmed stops the write; a tunnel CNAME is blocked, never removed.
import assert from 'node:assert/strict'
import { planIsEmpty, planServerRecords, removalsConfirmed } from '../lib/hosting/server-records-plan.mjs'

let passed = 0
const t = (name, fn) => {
  try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
const IP = '109.199.105.213'
const BASE = 'fractera.ai'
const HOSTS = ['fractera.ai', 'www.fractera.ai', 'architect.fractera.ai', 'auth.fractera.ai', 'data.fractera.ai']
const vercel = [
  { id: 'r-apex', type: 'CNAME', name: 'fractera.ai', content: 'cname.vercel-dns.com', proxied: true },
  { id: 'r-www', type: 'CNAME', name: 'www.fractera.ai', content: 'cname.vercel-dns.com', proxied: true },
  { id: 'r-mx', type: 'MX', name: 'fractera.ai', content: 'mx.example.net' },
  { id: 'r-txt', type: 'TXT', name: 'fractera.ai', content: 'google-site-verification=abc' },
  { id: 'r-blog', type: 'CNAME', name: 'blog.fractera.ai', content: 'hashnode.network' },
]

console.log('760-8 the records a server needs, from what the zone holds now')

t('fractera.ai today: add @ and *, remove the two Vercel records, keep mail and blog', () => {
  const p = planServerRecords({ base: BASE, hosts: HOSTS, ip: IP, records: vercel })
  assert.deepEqual(p.add.map((a) => a.host), ['fractera.ai', '*.fractera.ai'])
  assert.deepEqual(p.remove.map((r) => r.id).sort(), ['r-apex', 'r-www'])
  assert.equal(p.remove.find((r) => r.id === 'r-www').content, 'cname.vercel-dns.com')
  assert.deepEqual(p.blocked, [])
  assert.equal(p.names.includes('blog.fractera.ai'), false, 'a name the node does not use is not planned')
})

t('negative control: a removal the person did not confirm stops the write', () => {
  const p = planServerRecords({ base: BASE, hosts: HOSTS, ip: IP, records: vercel })
  assert.equal(removalsConfirmed(p, ['r-apex', 'r-www']), true)
  assert.equal(removalsConfirmed(p, ['r-apex']), false)
  assert.equal(removalsConfirmed(p, null), false)
})

t('an A to the server already: nothing to add; proxied — switched to DNS only, not removed', () => {
  const recs = [
    { id: 'a1', type: 'A', name: 'fractera.ai', content: IP, proxied: false },
    { id: 'a2', type: 'A', name: '*.fractera.ai', content: IP, proxied: true },
  ]
  const p = planServerRecords({ base: BASE, hosts: HOSTS, ip: IP, records: recs })
  assert.deepEqual(p.add, [])
  assert.deepEqual(p.change, [{ host: '*.fractera.ai', id: 'a2' }])
  assert.deepEqual(p.remove, [])
  assert.equal(planIsEmpty(p), false)
  assert.equal(planIsEmpty(planServerRecords({ base: BASE, hosts: HOSTS, ip: IP, records: [recs[0], { ...recs[1], proxied: false }] })), true)
})

t('an A to another IP and an AAAA on a used name are in the way', () => {
  const recs = [
    { id: 'old', type: 'A', name: 'auth.fractera.ai', content: '203.0.113.9' },
    { id: 'six', type: 'AAAA', name: 'fractera.ai', content: '2001:db8::1' },
  ]
  const p = planServerRecords({ base: BASE, hosts: HOSTS, ip: IP, records: recs })
  assert.deepEqual(p.remove.map((r) => r.id).sort(), ['old', 'six'])
})

t('negative control: a CNAME to a Cloudflare tunnel is blocked, never removed', () => {
  const recs = [{ id: 'tun', type: 'CNAME', name: 'www.fractera.ai', content: '1f2e3d4c.cfargotunnel.com' }]
  const p = planServerRecords({ base: BASE, hosts: HOSTS, ip: IP, records: recs })
  assert.deepEqual(p.blocked, [{ host: 'www.fractera.ai', content: '1f2e3d4c.cfargotunnel.com' }])
  assert.deepEqual(p.remove, [])
})

t('a node on a subdomain plans node and *.node inside its zone', () => {
  const p = planServerRecords({ base: 'node.example.org', hosts: ['node.example.org', 'auth.node.example.org', 'example.org'], ip: IP, records: [] })
  assert.deepEqual(p.add.map((a) => a.host), ['node.example.org', '*.node.example.org'])
  assert.equal(p.names.includes('example.org'), false, 'the zone apex of someone else is never planned')
})

console.log(process.exitCode ? `✗ server-records: failed (${passed} passed)` : `✓ server-records: ${passed} cases`)
