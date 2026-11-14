// TESTS OF THE DEDICATED-SERVER LIBRARY (node step 737). `npm run test:hosting`. Fixtures live in the system's temp folder, never inside
// the project (a copy of code inside the project is code to the core's build — ANTI-PATTERNS «All systems»).
// Every group of cases has its negative control: the thing that must NOT happen is asserted, not only the thing that must.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dnsRecords, isHostName, nodeNames, primaryZone } from '../lib/hosting/hostnames.mjs'
import { readableKeyPair } from '../lib/hosting/ssh.mjs'

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

console.log('737-2 the edge law and the generated nginx')
// The `.ts` modules are read by Node's own type stripping (Node ≥ 22.18); its «typeless package» notice is not a failure.
process.removeAllListeners('warning')
const { isBareIpHostname, isTemporaryHostname } = await import('../components/shell/temporary-host.ts')
const { isOwnerAtMachine } = await import('../lib/auth/owner-at-machine.ts')
const { nginxSite, http2Directive, letsEncryptPaths, rejectHandshake } = await import('../lib/hosting/nginx.mjs')
const req = (headers) => ({ headers: { get: (n) => headers[n.toLowerCase()] ?? null } })

t('a bare public IP is a temporary (read-only) address; loopback and names are not', () => {
  for (const yes of ['203.0.113.7', '203.0.113.7:80', '[2001:db8::1]', '[2001:db8::1]:8080']) assert.ok(isBareIpHostname(yes) && isTemporaryHostname(yes), yes)
  for (const no of ['127.0.0.1', '127.1.2.3:24680', 'localhost', '[::1]', '[::1]:24680', 'example.org', '0.0.0.0']) assert.ok(!isBareIpHostname(no), no)
  assert.ok(!isTemporaryHostname('example.org') && !isTemporaryHostname('localhost:24680'))
})
t('the lost backslash: a quick tunnel name with a port is temporary', () => {
  assert.ok(isTemporaryHostname('word-word-word-word.trycloudflare.com:443'))
})
t('the owner at the keyboard: loopback with no marks — yes', () => {
  assert.equal(isOwnerAtMachine(req({ host: 'localhost:24680' })), true)
})
t('negative: Host localhost through the server\'s nginx (the edge mark) — NOT the owner', () => {
  assert.equal(isOwnerAtMachine(req({ host: 'localhost', 'x-fractera-edge': '1' })), false)
  assert.equal(isOwnerAtMachine(req({ host: 'localhost', 'x-fractera-edge': '1', 'x-forwarded-host': 'localhost' })), false)
})
t('negative: Cloudflare marks and a public name stay outside', () => {
  assert.equal(isOwnerAtMachine(req({ host: 'localhost', 'cf-ray': 'x' })), false)
  assert.equal(isOwnerAtMachine(req({ host: '203.0.113.7' })), false)
})

const NAMES = nodeNames({ root: fixture({ services: SERVICES, runtime: { port: 24680 }, domain: 'example.org' }) })
const NOW = '2026-11-13T00:00:00Z'
const count = (text, needle) => text.split(needle).length - 1
t('IP stage: one default server — a card and /api/health only (741-1, D31), the edge mark, loopback refused, ACME open, no stapling', () => {
  const site = nginxSite({ table: { zone: null, corePort: 24680, rows: [] }, generatedAt: NOW })
  assert.equal(count(site, 'server {'), 1)
  assert.ok(site.includes('listen 80 default_server;') && site.includes('listen [::]:80 default_server;'))
  assert.equal(count(site, 'proxy_pass '), 1, 'the core is reached by IP for its health only')
  assert.ok(site.includes('location = /api/health {') && site.includes('proxy_pass http://localhost:24680;'), 'the core by its name')
  assert.ok(site.includes('proxy_set_header x-fractera-edge 1;'))
  assert.ok(site.includes('return 444;') && site.includes('/.well-known/acme-challenge/'))
  assert.ok(site.includes("return 200 '<!doctype html>") && site.includes('being connected to its domain'), 'the card without a domain')
  assert.ok(!site.includes('ssl_stapling') && !site.includes('443'), 'no certificate — nothing on 443')
})

// 741-1 (the owner approved 2026-11-14): nginx forwards only the name it matched. The negative control — the generator of 82a074ed
// passed `$host` — is recorded in completed-steps/741-1.md.
const CERTS_ALL = { 'example.org': letsEncryptPaths('example.org'), 'architect.example.org': letsEncryptPaths('architect.example.org'), 'www.example.org': letsEncryptPaths('www.example.org') }
const servers = (site) => site.split('\nserver {').slice(1).map((b) => b.slice(0, b.indexOf('\n}')))
t('741-1: no proxied location passes the client\'s name; a named server passes its own, the IP its address', () => {
  for (const version of ['1.18.0', '1.22.1', '1.24.0', '1.26.3']) {
    for (const site of [nginxSite({ table: NAMES, certs: CERTS_ALL, nginxVersion: version, generatedAt: NOW }), nginxSite({ table: NAMES, nginxVersion: version, generatedAt: NOW })]) {
      assert.ok(!/proxy_set_header (Host|X-Forwarded-Host) \$host;/.test(site), `$host forwarded (nginx ${version})`)
      for (const b of servers(site)) {
        const name = b.match(/server_name (\S+);/)?.[1]
        const hosts = [...b.matchAll(/proxy_set_header Host (\S+);/g)].map((m) => m[1])
        const forwarded = [...b.matchAll(/proxy_set_header X-Forwarded-Host (\S+);/g)].map((m) => m[1])
        assert.deepEqual(forwarded, hosts)
        for (const h of hosts) assert.equal(h, name === '_' ? '$fractera_ip_host' : name, `server ${name}`)
      }
    }
  }
  const site = nginxSite({ table: NAMES, certs: CERTS_ALL, generatedAt: NOW })
  assert.ok(site.includes('map $server_addr $fractera_ip_host { "~:" "[$server_addr]"; default $server_addr; }'), 'IPv6 in brackets')
  assert.ok(site.includes('return 301 https://example.org$request_uri;') && !site.includes('https://$host'), 'port 80 sends to its own name')
})
t('741-1: a default server on 443 refuses unknown names — the handshake from nginx 1.19.4, a certificate and 444 before it', () => {
  assert.equal(rejectHandshake('1.18.0'), false)
  assert.equal(rejectHandshake('1.19.3'), false)
  assert.equal(rejectHandshake('1.19.4'), true)
  assert.equal(rejectHandshake('1.24.0'), true)
  assert.equal(rejectHandshake('2.0.0'), true)
  const modern = nginxSite({ table: NAMES, certs: CERTS_ALL, nginxVersion: '1.24.0', generatedAt: NOW })
  const deflt = servers(modern).filter((b) => b.includes('default_server') && b.includes('443'))
  assert.equal(deflt.length, 1)
  assert.ok(deflt[0].includes('listen 443 ssl http2 default_server;') && deflt[0].includes('listen [::]:443 ssl http2 default_server;'))
  assert.ok(deflt[0].includes('ssl_reject_handshake on;') && deflt[0].includes('return 444;') && !deflt[0].includes('proxy_pass'))
  const old = nginxSite({ table: NAMES, certs: CERTS_ALL, nginxVersion: '1.18.0', ipv6: false, generatedAt: NOW })
  const oldDefault = servers(old).find((b) => b.includes('default_server') && b.includes('443'))
  assert.ok(!old.includes('ssl_reject_handshake'), 'nginx 1.18 does not know the directive')
  assert.ok(oldDefault.includes('ssl_certificate /etc/letsencrypt/live/') && oldDefault.includes('return 444;') && !oldDefault.includes('proxy_pass'))
  const modernHttp2 = nginxSite({ table: NAMES, certs: CERTS_ALL, nginxVersion: '1.26.3', ipv6: false, generatedAt: NOW })
  assert.ok(modernHttp2.includes('listen 443 ssl default_server;'), 'http2 on: the flag is not on listen')
  // negative: no certificate — no 443 at all, so no default server there either
  assert.ok(!nginxSite({ table: NAMES, nginxVersion: '1.24.0', generatedAt: NOW }).includes('443'))
})
t('741-1: the IP card names the domain, carries no $ or quote, and is replaced by the redirect once the domain is on', () => {
  const site = nginxSite({ table: { ...NAMES, zone: 'example.org' }, generatedAt: NOW })
  const ip = servers(site)[0]
  const card = ip.slice(ip.indexOf("return 200 '") + 12, ip.lastIndexOf("';"))
  assert.ok(card.includes('https://example.org') && card.includes('lang="ru"'))
  assert.ok(!/['$\\]/.test(card), card)
  const evil = nginxSite({ table: { zone: '$evil.org', corePort: 24680, rows: [] }, generatedAt: NOW })
  assert.ok(!evil.includes('$evil') && evil.includes('being connected to its domain'), 'an invalid zone never enters the card')
  const on = nginxSite({ table: NAMES, certs: CERTS_ALL, active: true, architectHost: 'architect.example.org', generatedAt: NOW })
  assert.ok(!servers(on)[0].includes("return 200 '") && !servers(on)[0].includes('proxy_pass'), 'switched on: the IP only redirects')
})
t('domain stage: 443 only for names with a certificate, 503 for the others, every proxy carries the edge mark', () => {
  const certs = { 'example.org': letsEncryptPaths('example.org'), 'architect.example.org': letsEncryptPaths('architect.example.org'), 'www.example.org': letsEncryptPaths('www.example.org') }
  const site = nginxSite({ table: NAMES, certs, generatedAt: NOW, nginxVersion: '1.24.0' })
  assert.ok(site.includes('server_name example.org;') && site.includes('ssl_certificate /etc/letsencrypt/live/example.org/fullchain.pem;'))
  assert.equal(count(site, 'listen 443 ssl http2;'), 3)
  assert.ok(site.includes('return 301 https://example.org$request_uri;'), 'www → apex')
  assert.equal(count(site, 'proxy_pass '), count(site, 'proxy_set_header x-fractera-edge 1;'))
  assert.equal(count(site, 'return 444;'), count(site, 'server {'))
  const authBlock = site.slice(site.indexOf('# auth.example.org'), site.indexOf('# data.example.org'))
  assert.ok(authBlock.includes('return 503') && !authBlock.includes('443'), authBlock)
})
t('switched on: the bare IP sends to the architect name', () => {
  const site = nginxSite({ table: NAMES, active: true, architectHost: 'architect.example.org', generatedAt: NOW })
  assert.ok(site.split('# example.org')[0].includes('return 301 https://architect.example.org$request_uri;'))
})
t('http2: `http2 on` from nginx 1.25.1, the listen flag before it; no IPv6 listens when the server has none', () => {
  assert.equal(http2Directive('1.24.0'), 'legacy')
  assert.equal(http2Directive('1.25.1'), 'modern')
  assert.equal(http2Directive('1.28.0'), 'modern')
  const site = nginxSite({ table: NAMES, certs: { 'example.org': letsEncryptPaths('example.org') }, nginxVersion: '1.26.3', ipv6: false, generatedAt: NOW })
  assert.ok(site.includes('http2 on;') && site.includes('listen 443 ssl;') && !site.includes('[::]'))
})
t('negative: a certificate path that could inject a directive, a bad port, a bad host — refused', () => {
  assert.throws(() => nginxSite({ table: NAMES, certs: { 'example.org': { fullchain: '/x; include /etc/passwd', privkey: '/y' } } }))
  assert.throws(() => nginxSite({ table: { zone: null, corePort: 70000, rows: [] } }))
  assert.throws(() => letsEncryptPaths('../etc'))
})

const ta = async (name, fn) => {
  try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
// The remote side of a move is always Linux: the SSH server of these cases runs its commands through bash in a POSIX home. On Windows
// (CI's second runner) the client half alone would prove nothing new — the ssh2 client is the same code proven on macOS and Linux.
if (process.platform === 'win32') {
  console.log('737-3 the SSH road — skipped on Windows (its remote side is a Linux shell)')
} else {
  console.log('737-3 the SSH road (a real ssh2 server in this process, commands run by bash in a temporary home)')
  const { default: ssh2 } = await import('ssh2')
  const { readdirSync, readFileSync, statSync } = await import('node:fs')
  const sshLib = await import('../lib/hosting/ssh.mjs')
  const SECRET = 'correct-horse-737'
  const home = mkdtempSync(join(tmpdir(), 'hosting-ssh-home-'))
  const nodeRoot = mkdtempSync(join(tmpdir(), 'hosting-ssh-node-'))
  roots.push(home, nodeRoot)
  const { startTestSshServer } = await import('./hosting-test-ssh.mjs')
  const sshState = { passwordAllowed: true }
  const sshServer = async (hostKey, port = 0) => (await startTestSshServer({ home, password: SECRET, hostKey, port, state: sshState })).server
  const hostKeyA = readableKeyPair().private
  let srv = await sshServer(hostKeyA)
  const sshPort = srv.address().port

  await ta('negative: a wrong password is refused as `auth`', async () => {
    await assert.rejects(sshLib.connect({ root: nodeRoot, host: '127.0.0.1', port: sshPort, password: 'wrong' }), (e) => e.reason === 'auth')
  })
  await ta('the password once: the node key lands in authorized_keys, a key-only login proves it, the server key is pinned', async () => {
    const r = await sshLib.installKey({ root: nodeRoot, host: '127.0.0.1', port: sshPort, password: SECRET })
    assert.match(r.fingerprint, /^SHA256:/)
    const keys = readFileSync(join(home, '.ssh', 'authorized_keys'), 'utf8')
    assert.ok(keys.includes(' fractera-node'), keys)
    const pins = JSON.parse(readFileSync(join(nodeRoot, 'data', 'node', 'server', 'known-hosts.json'), 'utf8'))
    assert.equal(pins[`127.0.0.1:${sshPort}`].fingerprint, r.fingerprint)
    assert.equal(statSync(join(nodeRoot, 'data', 'node', 'server', 'id_ed25519')).mode & 0o777, 0o600)
  })
  await ta('negative: with password login off, the password is refused and the key alone works', async () => {
    sshState.passwordAllowed = false
    await assert.rejects(sshLib.connect({ root: nodeRoot, host: '127.0.0.1', port: sshPort, password: SECRET }), (e) => e.reason === 'auth')
    const { client } = await sshLib.connect({ root: nodeRoot, host: '127.0.0.1', port: sshPort })
    const out = await sshLib.exec(client, 'echo hello-from-server; exit 3')
    client.end()
    assert.equal(out.stdout.trim(), 'hello-from-server')
    assert.equal(out.code, 3)
  })
  await ta('a second install adds no second line', async () => {
    sshState.passwordAllowed = true
    await sshLib.installKey({ root: nodeRoot, host: '127.0.0.1', port: sshPort, password: SECRET })
    const lines = readFileSync(join(home, '.ssh', 'authorized_keys'), 'utf8').split('\n').filter((l) => l.includes('fractera-node'))
    assert.equal(lines.length, 1)
  })
  await ta('negative: the password is in no file of the node', async () => {
    const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]))
    for (const f of walk(nodeRoot)) assert.ok(!readFileSync(f, 'utf8').includes(SECRET), f)
  })
  await ta('negative: the same address with a different server key is refused as `host-key-changed`', async () => {
    await new Promise((r) => srv.close(r))
    srv = await sshServer(readableKeyPair().private, sshPort)
    // 738-2: the refusal names both fingerprints — the page shows them before the person trusts a reinstalled server.
    await assert.rejects(sshLib.connect({ root: nodeRoot, host: '127.0.0.1', port: sshPort }), (e) => e.reason === 'host-key-changed' && /^SHA256:/.test(e.seen) && /^SHA256:/.test(e.pinned) && e.seen !== e.pinned)
  })
  await new Promise((r) => srv.close(r))
}

console.log('737-4/8 the phase mark and the certificates')
const { createRequire } = await import('node:module')
const { nodePhase } = createRequire(import.meta.url)('../lib/hosting/phase.cjs')
const certsLib = await import('../lib/hosting/certs.mjs')
t('the phase is read from data/node/server.json; anything else is «not a server node»', () => {
  assert.equal(nodePhase(fixture({ services: SERVICES, server: { phase: 'silent' } })), 'silent')
  assert.equal(nodePhase(fixture({ services: SERVICES, server: { phase: 'live' } })), 'live')
  assert.equal(nodePhase(fixture({ services: SERVICES, server: { phase: 'maybe' } })), null)
  assert.equal(nodePhase(fixture({ services: SERVICES })), null)
})
const NOWMS = Date.parse('2026-11-13T00:00:00Z')
const LIST = certsLib.parseCertList([
  '{"name":"example.org","source":"letsencrypt","fullchain":"/etc/letsencrypt/live/example.org/fullchain.pem","privkey":"/etc/letsencrypt/live/example.org/privkey.pem","notAfter":"Feb 10 00:00:00 2027 GMT","sans":"example.org"}',
  '{"name":"wild","source":"own","fullchain":"/etc/fractera/certs/wild/fullchain.pem","privkey":"/etc/fractera/certs/wild/privkey.pem","notAfter":"Jan 20 00:00:00 2027 GMT","sans":"*.example.org"}',
  '{"name":"old.example.org","source":"letsencrypt","fullchain":"/a","privkey":"/b","notAfter":"Nov 01 00:00:00 2026 GMT","sans":"old.example.org"}',
  'not json at all',
].join('\n'))
t('the inventory: three certificates read, a broken line skipped', () => assert.equal(LIST.length, 3))
t('a wildcard covers one level only (RFC 6125): a.example.org yes; example.org and a.b.example.org no', () => {
  assert.ok(certsLib.sanCovers('*.example.org', 'a.example.org'))
  assert.ok(!certsLib.sanCovers('*.example.org', 'example.org'))
  assert.ok(!certsLib.sanCovers('*.example.org', 'a.b.example.org'))
})
t('certFor: the apex by its lineage, an element by the wildcard; negative: an expired one covers nothing', () => {
  assert.equal(certsLib.certFor('example.org', LIST, NOWMS).fullchain, '/etc/letsencrypt/live/example.org/fullchain.pem')
  assert.equal(certsLib.certFor('data.example.org', LIST, NOWMS).source, 'own')
  assert.equal(certsLib.certFor('old.example.org', LIST, NOWMS)?.fullchain, '/etc/fractera/certs/wild/fullchain.pem')
  assert.equal(certsLib.certFor('other.net', LIST, NOWMS), null)
})
t('coverage of the table: ok / expiring / missing per name', () => {
  const cov = certsLib.coverage(NAMES, LIST, NOWMS)
  assert.equal(cov.find((c) => c.host === 'example.org').state, 'ok')
  assert.equal(cov.find((c) => c.host === 'www.example.org').state, 'ok')
  assert.equal(certsLib.coverage(NAMES, LIST, Date.parse('2027-01-05T00:00:00Z')).find((c) => c.host === 'auth.example.org').state, 'expiring')
  assert.equal(certsLib.coverage(NAMES, [], NOWMS).every((c) => c.state === 'missing'), true)
})

if (process.platform !== 'win32') {
  console.log('737-4 the server scripts (dry run: every command printed, none run)')
  const { spawnSync } = await import('node:child_process')
  const { cpSync, readFileSync: readText } = await import('node:fs')
  const scripts = mkdtempSync(join(tmpdir(), 'hosting-scripts-'))
  roots.push(scripts)
  cpSync(new URL('./dedicated-server/', import.meta.url), scripts, { recursive: true })
  const KEY = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDryRunDryRunDryRunDryRunDryRunDryRun01 fractera-node'
  const run = (...a) => spawnSync('bash', [join(scripts, 'prepare.sh'), ...a], { encoding: 'utf8', env: { ...process.env, DRY_RUN: '1' } })
  t('prepare.sh: every stage runs in order and reports done; the progress lines are JSON', () => {
    const r = run('fractera', 'web4-node-starter-kit', '22', KEY)
    assert.equal(r.status, 0, r.stderr)
    const lines = readText(join(scripts, 'prepare.progress.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l))
    const done = lines.filter((l) => l.state === 'done').map((l) => l.id)
    assert.deepEqual(done, ['apt-lock', 'swap', 'apt', 'node', 'pm2', 'certbot', 'user', 'git', 'helper', 'nginx', 'firewall', 'resolver', 'pm2-startup', 'prepare'])
  })
  t('negative: a command smuggled in place of the key, a bad user, a bad port — refused before any stage', () => {
    for (const a of [['fractera', 'x', '22', "evil'; rm -rf / #"], ['Root;', 'x', '22', KEY], ['fractera', 'x', '22;reboot', KEY]]) {
      const r = run(...a)
      assert.equal(r.status, 1, a.join(' '))
    }
    const last = readText(join(scripts, 'prepare.progress.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l)).pop()
    assert.equal(last.state, 'failed')
  })
}

console.log('737-8 the domain on the server: DNS, certificates, HTTPS, the five steps')
{
  const dom = await import('../lib/hosting/server-domain.mjs')
  const { checkNames } = await import('../lib/hosting/dns-check.mjs')
  const IP = '203.0.113.7'
  // A fake public resolver: a table host → { A, AAAA }; a host marked `down` makes every resolver fail.
  const resolver = (zone) => async (url) => {
    const u = new URL(url)
    const host = u.searchParams.get('name')
    const type = u.searchParams.get('type')
    const rec = zone[host] ?? {}
    if (rec.down) throw new Error('resolver down')
    const data = rec[type] ?? []
    return { ok: true, json: async () => ({ Answer: data.map((d) => ({ type: type === 'A' ? 1 : 28, data: d })) }) }
  }
  const serverRoot = (extra = {}) => fixture({ services: SERVICES, runtime: { port: 24680 }, server: { phase: 'live', ip: IP, domain: 'example.org', ...extra } })
  await ta('DNS: ok / missing / elsewhere / AAAA elsewhere / no resolver answered — each named', async () => {
    const table = nodeNames({ root: serverRoot() })
    const zone = { 'example.org': { A: [IP] }, 'architect.example.org': { A: [IP], AAAA: ['2001:db8::1'] }, 'auth.example.org': { A: ['198.51.100.1'] }, 'data.example.org': { down: true } }
    const res = await checkNames(table, IP, null, resolver(zone))
    const st = Object.fromEntries(res.map((r) => [r.host, r.state]))
    assert.equal(st['example.org'], 'ok')
    assert.equal(st['architect.example.org'], 'aaaa')
    assert.equal(st['auth.example.org'], 'elsewhere')
    assert.equal(st['data.example.org'], 'unknown')
    assert.equal(st['config.example.org'], 'missing')
    // negative: the server's own IPv6 in AAAA is no trap
    assert.equal((await checkNames(table, IP, '2001:db8::1', resolver(zone))).find((r) => r.host === 'architect.example.org').state, 'ok')
  })
  await ta('the five steps are measured: a DNS answer for another IP counts as «not checked»; all ok → steps open in order', async () => {
    const root = serverRoot()
    const all = Object.fromEntries(nodeNames({ root }).rows.map((r) => [r.host, { A: [IP] }]))
    await dom.runDnsCheck(root, resolver(all))
    let st = dom.domainState(root, { certs: [] })
    assert.equal(st.steps.domain, true)
    assert.equal(st.steps.dns, true)
    assert.equal(st.steps.certs, false)
    assert.ok(st.records.length >= 1 && st.records[0].records.every((r) => r.value === IP))
    assert.ok(!JSON.stringify(st).includes('2468'), 'a port leaked into the domain state')
    // negative: the server's IP changed → the old answer is not a proof
    dom.writeServerMark(root, { ip: '203.0.113.8' })
    st = dom.domainState(root, { certs: [] })
    assert.equal(st.steps.dns, false)
    assert.ok(st.rows.every((r) => r.dns === 'unchecked'))
  })
  await ta('certificates to issue: only names whose DNS points here and which have none or under 30 days', async () => {
    const root = serverRoot()
    const zone = Object.fromEntries(nodeNames({ root }).rows.map((r) => [r.host, { A: [r.host === 'auth.example.org' ? '198.51.100.1' : IP] }]))
    await dom.runDnsCheck(root, resolver(zone))
    const st = dom.domainState(root, { certs: LIST })
    const issue = dom.namesToIssue(st)
    assert.ok(!issue.includes('example.org'), 'the apex has a valid certificate')
    assert.ok(!issue.includes('auth.example.org'), 'auth points elsewhere')
    assert.ok(!issue.includes('data.example.org'), 'covered by the wildcard')
  })
  await ta('HTTPS from outside: 200 and 301 answer, nginx 503 and a TLS refusal do not', async () => {
    const root = serverRoot()
    const answers = { 'example.org': 200, 'www.example.org': 301, 'architect.example.org': 503 }
    const fake = async (url) => {
      const host = new URL(url).hostname
      if (host === 'auth.example.org') throw Object.assign(new Error('fetch failed'), { cause: { code: 'ERR_TLS_CERT_ALTNAME_INVALID' } })
      return { status: answers[host] ?? 200 }
    }
    const rec = await dom.runHttpsCheck(root, fake)
    const by = Object.fromEntries(rec.results.map((r) => [r.host, r]))
    assert.equal(by['example.org'].ok, true)
    assert.equal(by['www.example.org'].ok, true)
    assert.equal(by['architect.example.org'].ok, false)
    assert.equal(by['auth.example.org'].error, 'ERR_TLS_CERT_ALTNAME_INVALID')
    assert.equal(dom.domainState(root, { certs: [] }).steps.check, false)
  })
  t('the domain typed by a person is cleaned; negative: not a domain → null', () => {
    assert.equal(dom.cleanDomain(' https://Example.ORG/path?x=1 '), 'example.org')
    assert.equal(dom.cleanDomain('example.org.'), 'example.org')
    assert.equal(dom.cleanDomain('localhost'), null)
    assert.equal(dom.cleanDomain('a b.org'), null)
    assert.equal(dom.cleanDomain('203.0.113.7'), null)
  })
  await ta('the certificate runner (dry): nginx before and after, one cert-issue per name to issue; negative: a name pointing elsewhere is never issued', async () => {
    const { spawnSync } = await import('node:child_process')
    const root = serverRoot()
    const zone = Object.fromEntries(nodeNames({ root }).rows.map((r) => [r.host, { A: [r.host === 'auth.example.org' ? '198.51.100.1' : IP] }]))
    await dom.runDnsCheck(root, resolver(zone))
    const r = spawnSync(process.execPath, [join(import.meta.dirname, 'dedicated-server', 'certs.mjs'), '--dry', '--root', root], { encoding: 'utf8' })
    assert.equal(r.status, 0, r.stderr + r.stdout)
    const run = dom.readSide(root, 'certs')
    assert.equal(run.running, false)
    assert.equal(run.commands[0], 'fractera-root nginx-apply')
    assert.equal(run.commands.at(-1), 'fractera-root nginx-apply')
    assert.ok(run.commands.includes('fractera-root cert-issue example.org'))
    assert.ok(!run.commands.some((c) => c.includes('auth.example.org')), 'issued for a name that points elsewhere')
    assert.ok(run.hosts.every((h) => h.state === 'done'))
  })
}

console.log('737-7 the judge of a server (the owner\'s test server, 2026-11-13: another install lived there)')
{
  const { judge } = await import('../lib/hosting/judge.mjs')
  const base = { os: { id: 'ubuntu', pretty: 'Ubuntu 24.04', arch: 'x86_64' }, cores: 4, ramMb: 7941, availMb: 5838, diskFreeGb: 69, port80Busy: true, port443Busy: true, nginx: true, systemd: true, publicIp: '203.0.113.7' }
  const needs = { ramMb: 2549, copyBytes: 826e6 }
  t('another site on nginx is a refusal, root\'s pm2 processes a warning; the memory judged is the AVAILABLE one', () => {
    const v = judge({ ...base, foreignSites: ['fractera', 'fractera-custom'], pm2Root: 14 }, needs, '203.0.113.7')
    assert.equal(v.level, 'fail')
    assert.equal(v.items.find((i) => i.id === 'sites').value, 'fractera, fractera-custom')
    assert.equal(v.items.find((i) => i.id === 'others').level, 'warn')
    assert.equal(v.items.find((i) => i.id === 'memory').value, 5838)
    assert.equal(judge({ ...base, availMb: 2000 }, needs, '203.0.113.7').items.find((i) => i.id === 'memory').level, 'fail')
  })
  t('negative: a clean server with nginx of its own — no «sites», no «others», ok', () => {
    const v = judge({ ...base, port80Busy: false, port443Busy: false, foreignSites: [], pm2Root: 0 }, needs, '203.0.113.7')
    assert.equal(v.level, 'ok')
    assert.ok(!v.items.some((i) => i.id === 'sites' || i.id === 'others'))
  })
}

console.log('737-7 a busy server: freed, never erased')
{
  if (process.platform !== 'win32') {
    const { spawnSync } = await import('node:child_process')
    t('clear.sh is valid bash and erases nothing by its own words (no rm -rf, no apt purge, no dropdb)', () => {
      assert.equal(spawnSync('bash', ['-n', join(import.meta.dirname, 'dedicated-server', 'clear.sh')]).status, 0)
      const text = readFileSync(join(import.meta.dirname, 'dedicated-server', 'clear.sh'), 'utf8')
      assert.ok(!/rm -rf|apt(-get)? (purge|remove)|dropdb|DROP DATABASE/i.test(text))
    })
  }
}

console.log('737-18 the place is detected, never declared')
{
  const { nodePlace, isPublicIpv4 } = await import('../lib/hosting/place.mjs')
  const nic = (address) => ({ eth0: [{ family: 'IPv4', address, internal: false }], lo: [{ family: 'IPv4', address: '127.0.0.1', internal: true }] })
  t('a move record → server; macOS and Windows → computer; Linux with a public IPv4 → server, behind a private one → computer', () => {
    assert.equal(nodePlace(fixture({ services: SERVICES, server: { phase: 'live', at: '2026-11-13T11:00:00Z' } }), { platform: 'darwin' }).kind, 'server')
    const bare = fixture({ services: SERVICES })
    assert.equal(nodePlace(bare, { platform: 'darwin', interfaces: nic('213.199.61.7') }).kind, 'home')
    assert.equal(nodePlace(bare, { platform: 'win32' }).kind, 'home')
    assert.equal(nodePlace(bare, { platform: 'linux', interfaces: nic('213.199.61.7') }).detail, 'public-ip 213.199.61.7')
    assert.equal(nodePlace(bare, { platform: 'linux', interfaces: nic('192.168.1.20') }).kind, 'home')
  })
  t('negative: a declaration file never makes this computer «server»; private, shared and loopback ranges are not public', () => {
    const declared = fixture({ services: SERVICES })
    mkdirSync(join(declared, 'data', 'node'), { recursive: true })
    writeFileSync(join(declared, 'data', 'node', 'place.json'), JSON.stringify({ place: 'server' }))
    assert.equal(nodePlace(declared, { platform: 'darwin' }).kind, 'home')
    for (const ip of ['10.0.0.1', '172.20.1.1', '100.64.0.1', '169.254.1.1', '127.0.0.1']) assert.equal(isPublicIpv4(ip), false, ip)
    assert.equal(isPublicIpv4('213.199.61.7'), true)
  })
}

console.log('737-15 the names before the move')
{
  const { nginxSite } = await import('../lib/hosting/nginx.mjs')
  const dom = await import('../lib/hosting/server-domain.mjs')
  const table = { zone: 'example.org', corePort: 24680, rows: [{ host: 'example.org', service: 'root', port: 24683, redirectTo: null }] }
  const certs = { 'example.org': { fullchain: '/etc/letsencrypt/live/example.org/fullchain.pem', privkey: '/etc/letsencrypt/live/example.org/privkey.pem' } }
  t('before the move every name answers 503 on 80 and 443 with the ACME path open; after it the name serves the node', () => {
    const held = nginxSite({ table, certs, live: false })
    const site = held.slice(held.indexOf('# example.org'))
    assert.ok(!site.includes('proxy_pass'), 'a held name must not reach the rehearsal node')
    assert.equal((site.match(/return 503/g) ?? []).length, 2)
    assert.ok(site.includes('/.well-known/acme-challenge/'))
    assert.ok(nginxSite({ table, certs, live: true }).includes('proxy_pass http://127.0.0.1:24683'))
  })
  t('readiness: a name pointing here without a certificate waits; one on the tunnel or elsewhere does not hold the move', () => {
    const r = dom.readiness({ zone: 'example.org', rows: [
      { host: 'example.org', dns: 'ok', cert: 'ok' }, { host: 'auth.example.org', dns: 'ok', cert: 'missing' },
      { host: 'data.example.org', dns: 'elsewhere', cert: 'missing' }, { host: 'www.example.org', dns: 'missing', cert: 'missing' }] })
    assert.deepEqual(r.waiting, ['auth.example.org'])
    assert.deepEqual(r.elsewhere, ['data.example.org'])
    assert.deepEqual(r.unknown, ['www.example.org'])
  })
}

console.log('737-19 the domain ladder: detection, record names, DNS only')
{
  const det = await import('../lib/hosting/domain-detect.mjs')
  // A fake internet: DoH answers by «name type» and resolver, one registry, one site. Recorded from the live probe of 2026-11-13.
  const fakeNet = (zones) => async (url) => {
    const u = new URL(url)
    const json = (body, status = 200) => ({ ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body) })
    if (u.hostname === 'data.iana.org') return json({ services: [[['dev'], ['https://pubapi.registry.google/rdap/']]] })
    if (u.hostname === 'pubapi.registry.google') return json({ entities: [{ roles: ['registrar'], vcardArray: ['vcard', [['fn', {}, 'text', 'Porkbun LLC']]] }], events: [{ eventAction: 'expiration', eventDate: '2027-06-13T10:50:14Z' }] })
    if (u.pathname === '/' && !u.searchParams.has('name')) return { ok: true, status: 200, text: async () => '<html><title>Live &amp; well</title></html>' }
    const name = u.searchParams.get('name')
    const type = u.searchParams.get('type')
    const which = u.hostname === 'dns.google' ? 'google' : 'cf'
    const z = zones[which]?.[`${name} ${type}`] ?? zones.any?.[`${name} ${type}`]
    return json(z ?? { Status: 3, Answer: [], Authority: [{ name: 'aifa.dev.', type: 6, data: 'jaxson.ns.cloudflare.com. dns.cloudflare.com.' }] })
  }
  const ns = (a, b) => ({ Status: 0, Answer: [{ name: 'aifa.dev.', type: 2, TTL: 86400, data: `${a}.` }, { name: 'aifa.dev.', type: 2, TTL: 86400, data: `${b}.` }] })
  const base = {
    'aifa.dev SOA': { Status: 0, Answer: [{ name: 'aifa.dev.', type: 6, data: 'jaxson.ns.cloudflare.com. dns.cloudflare.com. 1 2 3 4 5' }] },
    'aifa.dev A': { Status: 0, Answer: [{ name: 'aifa.dev.', type: 1, TTL: 300, data: '188.114.96.5' }] },
    'aifa.dev MX': { Status: 0, Answer: [] }, 'aifa.dev TXT': { Status: 0, Answer: [] }, 'aifa.dev DS': { Status: 0, Answer: [] },
  }
  await ta('detect: an apex on Cloudflare behind the proxy — the registrar from the registry, the live site named', async () => {
    const d = await det.detectDomain('aifa.dev', { ip: '203.0.113.7', fetchImpl: fakeNet({ any: { ...base, 'aifa.dev NS': ns('jaxson.ns.cloudflare.com', 'kehlani.ns.cloudflare.com') } }) })
    assert.equal(d.zone, 'aifa.dev'); assert.equal(d.sub, ''); assert.equal(d.dnsHost, 'cloudflare'); assert.equal(d.aKind, 'cloudflare')
    assert.equal(d.registrar, 'Porkbun LLC'); assert.equal(d.nsTtl, 86400); assert.equal(d.changing, false)
    assert.equal(d.site?.title, 'Live & well')
  })
  await ta('detect: a subdomain belongs to its zone (SOA of the authority); nothing answers on it → no site', async () => {
    const d = await det.detectDomain('node.aifa.dev', { ip: '203.0.113.7', fetchImpl: fakeNet({ any: { ...base, 'aifa.dev NS': ns('jaxson.ns.cloudflare.com', 'kehlani.ns.cloudflare.com'), 'node.aifa.dev A': { Status: 3, Answer: [] } } }) })
    assert.equal(d.zone, 'aifa.dev'); assert.equal(d.sub, 'node'); assert.equal(d.aKind, 'none'); assert.equal(d.site, null)
  })
  await ta('detect: two resolvers disagree on the name servers → «changing»; the server\'s own IP → «server»; DNS elsewhere → «other»', async () => {
    const d = await det.detectDomain('aifa.dev', { ip: '203.0.113.7', fetchImpl: fakeNet({
      cf: { ...base, 'aifa.dev NS': ns('curitiba.ns.porkbun.com', 'fortaleza.ns.porkbun.com'), 'aifa.dev A': { Status: 0, Answer: [{ name: 'aifa.dev.', type: 1, data: '203.0.113.7' }] } },
      google: { ...base, 'aifa.dev NS': ns('jaxson.ns.cloudflare.com', 'kehlani.ns.cloudflare.com') },
    }) })
    assert.equal(d.changing, true); assert.equal(d.aKind, 'server'); assert.equal(d.dnsHost, 'other'); assert.equal(d.site, null)
  })
  await ta('negative: a TLD without RDAP and silent resolvers → unknown fields, never a guess', async () => {
    const d = await det.detectDomain('example.ru', { ip: '203.0.113.7', fetchImpl: async () => { throw new Error('offline') } })
    assert.equal(d.registrar, null); assert.equal(d.dnsHost, 'none'); assert.equal(d.aKind, 'unknown')
  })
  t('Cloudflare ranges: 188.114.96.5 inside, the server and a neighbour outside', () => {
    assert.equal(det.inRanges('188.114.96.5'), true); assert.equal(det.inRanges('104.21.26.12'), true)
    assert.equal(det.inRanges('213.199.61.7'), false); assert.equal(det.inRanges('188.114.112.1'), false)
  })
  const { dnsRecords } = await import('../lib/hosting/hostnames.mjs')
  const rows = (zone) => [{ host: zone, zone, label: '@', kind: 'apex', optional: false }, { host: `auth.${zone}`, zone, label: 'auth', kind: 'auth', optional: false }]
  t('record names: an apex → @ and *; a subdomain base → node, auth.node and *.node inside its zone', () => {
    const apex = dnsRecords({ zone: 'aifa.dev', rows: rows('aifa.dev') }, '1.2.3.4', 'aifa.dev')[0]
    assert.deepEqual([apex.zone, apex.records.map((r) => r.name), apex.wildcard.name], ['aifa.dev', ['@', 'auth'], '*'])
    const sub = dnsRecords({ zone: 'node.aifa.dev', rows: rows('node.aifa.dev') }, '1.2.3.4', 'aifa.dev')[0]
    assert.deepEqual([sub.zone, sub.records.map((r) => r.name), sub.wildcard.name], ['aifa.dev', ['node', 'auth.node'], '*.node'])
    // Negative: without the zone the old labels stay (a subdomain base would get «@» — what a registrar of aifa.dev would read as aifa.dev).
    assert.equal(dnsRecords({ zone: 'node.aifa.dev', rows: rows('node.aifa.dev') }, '1.2.3.4')[0].records[0].name, '@')
  })
  t('DNS only: the server\'s records are written with proxied:false (737-19b); the tunnel record keeps its own rule', () => {
    const src = readFileSync(new URL('../lib/domain/cloudflare.ts', import.meta.url), 'utf8')
    const fn = src.slice(src.indexOf('export async function upsertServerRecord'), src.indexOf('\n}\n', src.indexOf('export async function upsertServerRecord')))
    assert.match(fn, /proxied: false, ttl: 1/)
    assert.doesNotMatch(fn, /proxied: true/)
  })
}

for (const r of roots) rmSync(r, { recursive: true, force: true })
console.log(`${passed} passed${process.exitCode ? ', FAILED' : ''}`)
