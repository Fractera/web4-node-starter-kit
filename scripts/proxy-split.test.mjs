// TESTS OF THE PROXY IN TWO FILES (node step 744-1). `npm run test:proxy-split`, in the prebuild.
// The owner, 2026-11-14: «Конечно тот факт что прокси для сервера и прокси для локальной машины это разные файлы». Next.js takes ONE proxy
// entry (`proxy.ts`); it chooses once per process `proxy/computer.ts` or `proxy/server.ts` by the place record (lib/hosting/place.mjs).
// The table below is the request half of the map «where the node lives» (development-docs/reports/feature-where-the-node-lives-map.md,
// rows 3–9): each row is a request a browser, Cloudflare or nginx can bring, with the answer of each place. The answers were taken from
// the proxy BEFORE the split (one file, 2026-11-14) under a computer and a server record — the split changed none of them.
// Negative controls: the server's file runs under a COMPUTER record too — a computer branch planted there (the temporary-address trade)
// shows even through the place-aware helpers; the entry is run under a foreign record and under a record the machine contradicts.
// Every file is bundled by esbuild into the system's temp folder (never inside the project); the fixtures are temp folders too.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(join(ROOT, 'package.json'))
let passed = 0
const t = async (name, fn) => {
  try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}

const TUNNEL = 'quiet-fox-runs-far.trycloudflare.com'
const SAME = (host, scheme = 'http') => ({ origin: `${scheme}://${host}`, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' })
const PASS = { status: 200, pass: true }
const NONE = { status: 401, reason: 'Unauthorized' }
// [what, method, host, path, headers, the computer's answer, the server's answer (omitted — the same)]
const ROWS = [
  ['owner at the keyboard: a page', 'GET', 'localhost:24680', '/en/hosting/hosting', {}, PASS],
  ['owner at the keyboard: a door', 'POST', 'localhost:24680', '/api/node/launch', SAME('localhost:24680'), PASS],
  ['owner at the keyboard: /login → the sign-in of the own domain', 'GET', 'localhost:24680', '/login', {}, { status: 307, location: 'https://auth.aifa.dev/login' }],
  ['a loopback name through Cloudflare (cf-ray): a page', 'GET', 'localhost:24680', '/en/hosting/hosting', { 'cf-ray': 'x', 'cf-connecting-ip': '198.51.100.9' }, { status: 404 }],
  ['a loopback name through nginx (the edge mark): a door', 'GET', 'localhost:24680', '/api/me', { 'x-fractera-edge': '1' }, NONE],
  ['a tunnel name: a page — the read-only panel on a computer, a forgery on a server', 'GET', TUNNEL, '/en/hosting/hosting', {}, PASS, { status: 404 }],
  ['a tunnel name: a read door', 'GET', TUNNEL, '/api/me', {}, PASS, NONE],
  ['a tunnel name: a write door', 'POST', TUNNEL, '/api/node/launch', SAME(TUNNEL, 'https'), { status: 403, reason: 'temporary-address' }, NONE],
  ['a tunnel name: a service door (Telegram, its own secret)', 'POST', TUNNEL, '/api/telegram/hook', { 'content-type': 'application/json' }, PASS],
  ['a tunnel name: /login — the warning page on a computer, «sign-in closed» on a server', 'GET', TUNNEL, '/login', {}, { status: 404, html: true }, { status: 503, html: true }],
  ['a bare IP: a page', 'GET', '203.0.113.7', '/en/hosting/hosting', {}, PASS, { status: 404 }],
  ['a bare IP: health', 'GET', '203.0.113.7', '/api/health', {}, PASS],
  ['the own domain: a page, signed out (the page\'s own lock asks /api/me)', 'GET', 'aifa.dev', '/en/hosting/hosting', {}, PASS],
  ['the own domain: a door, signed out', 'GET', 'aifa.dev', '/api/me', {}, NONE],
  ['the own domain: a door with a session cookie', 'GET', 'aifa.dev', '/api/me', { cookie: '__Secure-authjs.session-token=t' }, PASS],
  ['the own domain: /login', 'GET', 'aifa.dev', '/login', {}, { status: 307, location: 'https://auth.aifa.dev/login?callbackUrl=https%3A%2F%2Faifa.dev%2Fen%3Fsigned-in%3D1&requireRole=user' }],
  ['the own domain: a write by its own page, signed out', 'POST', 'aifa.dev', '/api/node/launch', SAME('aifa.dev', 'https'), NONE],
  ['the showcase name on a guest node: a write (no showcase by Host)', 'POST', 'fractera.ai', '/api/revalidate', SAME('fractera.ai', 'https'), NONE],
  ['an element\'s mirror (www.) → its domain', 'GET', 'www.clay.example', '/en/x', {}, { status: 301, location: 'https://clay.example/en/x' }],
  ['a foreign page: a write — the cross-site wall (744-2)', 'POST', 'localhost:24680', '/api/node/launch', { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site', 'content-type': 'text/plain' }, { status: 403, reason: 'cross-site' }],
  ['the root path → the default language', 'GET', 'localhost:24680', '/', {}, { status: 200, rewrite: '/en' }],
  ['a page without a language → its language', 'GET', 'localhost:24680', '/hosting/hosting', {}, { status: 307, location: 'http://localhost:24680/en/hosting/hosting' }],
]

const roots = []
function fixture(place, machine = null) {
  const root = mkdtempSync(join(tmpdir(), `proxy-split-${place ?? 'none'}-`))
  roots.push(root)
  const w = (rel, obj) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), JSON.stringify(obj)) }
  w('WEB4-ITEMS-REGISTRY/web4-items.json', { services: [{ id: 'auth', port: 24681, kind: 'core' }, { id: 'clay1', port: 24690, kind: 'user' }] })
  w('logs/domain.json', { zone: 'aifa.dev', hostname: 'aifa.dev', authRouted: true })
  w('data/services/clay1/domain.json', { domain: 'clay.example', primary: 'domain' })
  if (place) w('data/node/place.json', { v: 2, place, by: place === 'server' ? 'dedicated-server' : 'launch', at: '2026-11-14T00:00:00Z', machine })
  return root
}

async function answer(res) {
  const out = { status: res.status }
  const loc = res.headers.get('location'); if (loc) out.location = loc
  if (res.headers.get('x-middleware-next') === '1') out.pass = true
  const rw = res.headers.get('x-middleware-rewrite'); if (rw) out.rewrite = new URL(rw).pathname
  const type = res.headers.get('content-type') ?? ''
  if (type.includes('json')) { const b = await res.clone().json().catch(() => ({})); out.reason = b.reason ?? b.error } else if (type.includes('html')) out.html = true
  return out
}

let esbuild
try { esbuild = req('esbuild') } catch { esbuild = null }
if (!esbuild) {
  console.warn('744-1 skipped: esbuild is not installed (devDependencies) — `npm install`')
  process.exit(0)
}
const bundles = new Map()
async function bundle(entry) {
  if (!bundles.has(entry)) {
    const built = await esbuild.build({ entryPoints: [join(ROOT, entry)], bundle: true, platform: 'node', format: 'cjs', target: 'node20', packages: 'external', write: false, absWorkingDir: ROOT, logLevel: 'silent' })
    bundles.set(entry, built.outputFiles[0].text.replace(/require\("([^".][^"]*)"\)/g, (all, spec) => (spec.startsWith('node:') ? all : `require(${JSON.stringify(req.resolve(spec))})`)))
  }
  return bundles.get(entry)
}
/** A FRESH instance of a bundled file, loaded inside `root` (the node reads its folder from the working directory at load and per request). */
let n = 0
async function load(entry, root) {
  process.chdir(root)
  const file = join(root, `bundle-${(n += 1)}.cjs`)
  writeFileSync(file, await bundle(entry))
  return createRequire(file)(file)
}
const { NextRequest } = req('next/server')
const call = (fn, [, method, host, path, h]) => fn(new NextRequest(new URL(path, `http://${host}`), { method, headers: { host, ...h }, body: method === 'GET' ? undefined : '{}' }))
const want = (row, place) => (place === 'server' && row.length > 6 ? row[6] : row[5])

async function table(fn, place) {
  const wrong = []
  for (const row of ROWS) {
    const got = await answer(await call(fn, row))
    if (JSON.stringify(got) !== JSON.stringify(want(row, place))) wrong.push(`${row[0]}: ${JSON.stringify(got)} ≠ ${JSON.stringify(want(row, place))}`)
  }
  assert.deepEqual(wrong, [])
}

console.log('744-1 the two files, each with its own answers')
const home = fixture('home')
const server = fixture('server')
await t(`proxy/computer.ts under a computer record: ${ROWS.length} rows`, async () => table((await load('proxy/computer.ts', home)).computerProxy, 'home'))
await t(`proxy/server.ts under a server record: ${ROWS.length} rows`, async () => table((await load('proxy/server.ts', server)).serverProxy, 'server'))
await t('negative control: proxy/server.ts under a COMPUTER record gives the server\'s answers — no computer branch hides in it', async () => table((await load('proxy/server.ts', home)).serverProxy, 'server'))
await t('the place rows really differ — the table can tell the two files apart', () => {
  assert.ok(ROWS.filter((r) => r.length > 6).length >= 5)
})

console.log('744-1 the entry chooses once, by the place record')
const DIFFERS = ROWS.filter((r) => r.length > 6)
async function entryAnswers(root) {
  const warned = []
  const warn = console.warn
  console.warn = (...a) => warned.push(a.join(' '))
  try {
    const { proxy } = await load('proxy.ts', root)
    const got = []
    for (const row of DIFFERS) got.push(JSON.stringify(await answer(await call(proxy, row))))
    return { got, warned }
  } finally { console.warn = warn }
}
const as = (place) => DIFFERS.map((r) => JSON.stringify(want(r, place)))
await t('proxy.ts is the entry only: at most 40 lines', () => {
  const lines = readFileSync(join(ROOT, 'proxy.ts'), 'utf8').trimEnd().split('\n').length
  assert.ok(lines <= 40, `${lines} lines`)
})
const place = await import('../lib/hosting/place.mjs')
const measured = place.measurePlace().kind
await t('a computer record → the computer\'s file; a server record → the server\'s file; the record this machine agrees with logs nothing', async () => {
  const a = await entryAnswers(home)
  const b = await entryAnswers(server)
  assert.deepEqual([a.got, b.got], [as('home'), as('server')])
  assert.deepEqual((measured === 'server' ? b : a).warned, [])
})
await t(`a record the machine contradicts is obeyed and said once in the log (this machine measures «${measured}»)`, async () => {
  const other = measured === 'server' ? 'home' : 'server'
  const r = await entryAnswers(fixture(other))
  assert.deepEqual(r.got, as(other))
  assert.equal(r.warned.length, 1, r.warned.join(' | '))
  assert.match(r.warned[0], /measures/)
})
await t('a record copied from another machine is not obeyed: the machine decides, said once in the log', async () => {
  if (!place.machineHash()) return console.log('    (this machine\'s id cannot be read — the foreign check is skipped by design)')
  const other = measured === 'server' ? 'home' : 'server'
  const r = await entryAnswers(fixture(other, '0000000000000000'))
  assert.deepEqual(r.got, as(measured))
  assert.equal(r.warned.length, 1, r.warned.join(' | '))
  assert.match(r.warned[0], /another machine/)
})

process.chdir(ROOT)
for (const r of roots) rmSync(r, { recursive: true, force: true })
console.log(`${passed} passed${process.exitCode ? ', FAILED' : ''}`)
