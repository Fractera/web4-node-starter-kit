// TESTS OF THE DEDICATED-SERVER LIBRARY (node step 737). `npm run test:hosting`. Fixtures live in the system's temp folder, never inside
// the project (a copy of code inside the project is code to the core's build — ANTI-PATTERNS «All systems»).
// Every block has its negative control: the thing that must NOT happen is asserted, not only the thing that must.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { dnsRecords, isHostName, nodeNames, primaryZone } from '../lib/hosting/hostnames.mjs'

let passed = 0
const t = (name, fn) => {
  try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
const roots = []
function fixture({ services, runtime, domain, server, own = {}, addresses = {} }) {
  const root = mkdtempSync(join(tmpdir(), 'hosting-test-'))
  roots.push(root)
  const w = (rel, obj) => { mkdirSync(join(root, rel, '..'), { recursive: true }); writeFileSync(join(root, rel), JSON.stringify(obj)) }
  w('WEB4-ITEMS-REGISTRY/web4-items.json', { services })
  if (runtime) w('logs/runtime.json', runtime)
  if (domain) w('logs/domain.json', { zone: domain })
  if (server) w('data/node/server.json', server)
  for (const [id, rec] of Object.entries(own)) w(`data/services/${id}/domain.json`, rec)
  for (const [id, address] of Object.entries(addresses)) w(`data/services/${id}/address.json`, { address })
  return root
}
const hosts = (table) => table.rows.map((r) => `${r.host}>${r.service ?? 'nginx'}${r.port ? ':' + r.port : ''}${r.redirectTo ? '→' + r.redirectTo : ''}`)
const SERVICES = [
  { id: 'auth', port: 24681, kind: 'core' },
  { id: 'data', port: 24682, kind: 'core' },
  { id: 'config', port: 24685, kind: 'core' },
  { id: 'root', port: 24683, kind: 'user' },
  { id: 'bd5ln', port: 24684, kind: 'user' },
  { id: 'ghost', port: null, kind: 'user' },
]

console.log('737-1 the table of names')
t('no domain → no names (the IP stage)', () => {
  const root = fixture({ services: SERVICES })
  const table = nodeNames({ root })
  assert.equal(table.zone, null)
  assert.deepEqual(table.rows, [])
})
t('the tunnel layout: apex → root, architect → core, auth → auth, address or id → element', () => {
  const root = fixture({ services: SERVICES, runtime: { port: 24680 }, domain: 'example.org', addresses: { config: 'settings' } })
  assert.deepEqual(hosts(nodeNames({ root })), [
    'example.org>root:24683', 'www.example.org>nginx→example.org', 'architect.example.org>core:24680', 'auth.example.org>auth:24681',
    'data.example.org>data:24682', 'settings.example.org>config:24685', 'bd5ln.example.org>bd5ln:24684',
  ])
})
t('negative: an element without a port and a deleted element\'s data folder never appear', () => {
  const root = fixture({ services: SERVICES, domain: 'example.org', own: { s3v6y: { domain: 'left.example.net', primary: 'domain' } } })
  const all = hosts(nodeNames({ root })).join(' ')
  assert.ok(!all.includes('ghost'), all)
  assert.ok(!all.includes('left.example.net'), all)
  assert.ok(!all.includes('s3v6y'), all)
})
t('no root → the apex goes to the core and there is no architect name', () => {
  const root = fixture({ services: SERVICES.filter((s) => s.id !== 'root'), domain: 'example.org' })
  const rows = hosts(nodeNames({ root }))
  assert.equal(rows[0], 'example.org>core:24680')
  assert.ok(!rows.some((h) => h.startsWith('architect.')), rows.join(' '))
})
t('an own domain as the main address: the domain → the element, www and the subdomain → the core (301)', () => {
  const root = fixture({ services: SERVICES, domain: 'example.org', own: { bd5ln: { domain: 'pics.example.net', primary: 'domain' } } })
  const rows = hosts(nodeNames({ root }))
  assert.ok(rows.includes('bd5ln.example.org>core:24680→pics.example.net'), rows.join(' '))
  assert.ok(rows.includes('pics.example.net>bd5ln:24684'), rows.join(' '))
  assert.ok(rows.includes('www.pics.example.net>core:24680→pics.example.net'), rows.join(' '))
})
t('the subdomain as the main address: the subdomain → the element, the domain and www → the core (301)', () => {
  const root = fixture({ services: SERVICES, domain: 'example.org', own: { bd5ln: { domain: 'pics.example.net', primary: 'subdomain' } } })
  const rows = hosts(nodeNames({ root }))
  assert.ok(rows.includes('bd5ln.example.org>bd5ln:24684'), rows.join(' '))
  assert.ok(rows.includes('pics.example.net>core:24680→bd5ln.example.org'), rows.join(' '))
})
t('negative: a broken own domain is ignored, not routed', () => {
  const root = fixture({ services: SERVICES, domain: 'example.org', own: { bd5ln: { domain: 'not a domain', primary: 'domain' } } })
  assert.ok(hosts(nodeNames({ root })).includes('bd5ln.example.org>bd5ln:24684'))
})
t('the server\'s chosen domain wins over the tunnel\'s zone; an asked domain wins over both', () => {
  const root = fixture({ services: SERVICES, domain: 'tunnel.org', server: { domain: 'server.org' } })
  assert.equal(primaryZone(root), 'server.org')
  assert.equal(primaryZone(root, 'asked.org'), 'asked.org')
  assert.equal(primaryZone(root, 'not valid'), 'server.org')
})
t('the core port comes from logs/runtime.json, 24680 without it', () => {
  assert.equal(nodeNames({ root: fixture({ services: SERVICES, runtime: { port: 24700 }, domain: 'a.org' }) }).corePort, 24700)
  assert.equal(nodeNames({ root: fixture({ services: SERVICES, domain: 'a.org' }) }).corePort, 24680)
})
t('DNS records: grouped by zone, A to the IP, the * shortcut only for the node\'s zone', () => {
  const root = fixture({ services: SERVICES, domain: 'example.org', own: { bd5ln: { domain: 'pics.example.net', primary: 'domain' } } })
  const groups = dnsRecords(nodeNames({ root }), '203.0.113.7')
  assert.deepEqual(groups.map((g) => g.zone), ['example.org', 'pics.example.net'])
  assert.ok(groups[0].records.every((r) => r.type === 'A' && r.value === '203.0.113.7'))
  assert.deepEqual(groups[0].records.map((r) => r.name), ['@', 'www', 'architect', 'auth', 'data', 'config', 'bd5ln'])
  assert.deepEqual(groups[0].wildcard, { type: 'A', name: '*', value: '203.0.113.7' })
  assert.equal(groups[1].wildcard, null)
})
t('host names by the rules of DNS and the node\'s policy (no IDN `xn--`, lib/web4-items/dns-label.mjs)', () => {
  for (const ok of ['a.org', 'x-1.example.co.uk', '1password.com']) assert.ok(isHostName(ok), ok)
  for (const bad of ['org', 'a..org', '-a.org', 'a.123', 'a b.org', 'a.org.', '', 'xn--80ak6aa92e.com']) assert.ok(!isHostName(bad), bad)
})

for (const r of roots) rmSync(r, { recursive: true, force: true })
console.log(`${passed} passed${process.exitCode ? ', FAILED' : ''}`)
