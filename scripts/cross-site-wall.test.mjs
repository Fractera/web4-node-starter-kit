// TESTS OF THE CROSS-SITE WALL (node step 744-2). `npm run test:cross-site-wall`, in the prebuild.
// ✗ Measured 2026-11-14 (development-steps 744, probes/csrf.sh): a page of another site sent a «simple» POST (text/plain, no preflight)
// to http://localhost:24680/api/node/launch — 200, and the node opened SSH as root on the person's server with its key.
// Two planes here: the rule itself (`lib/auth/cross-site-wall.ts`, a table of browser headers) and THE REAL PROXY FUNCTION — `proxy.ts`
// bundled by esbuild into the system's temp folder and called with built requests on every state-changing door of the core, listed from
// the route files themselves (a door added tomorrow is tested tomorrow). Negative controls: requests without browser headers, same-origin
// pages and safe methods must NOT meet the wall.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// The `.ts` rule is read by Node's own type stripping (Node ≥ 22.18); its «typeless package» notice is not a failure (as hosting.test.mjs).
process.removeAllListeners('warning')
const { crossSiteRefusal } = await import('../lib/auth/cross-site-wall.ts')
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let passed = 0
const t = async (name, fn) => {
  try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
const headers = (h) => ({ get: (name) => h[name.toLowerCase()] ?? null })
const verdict = (method, h) => crossSiteRefusal({ method, headers: headers(h) })

const EVIL = 'https://evil.example'
const ME = 'http://localhost:24680'

console.log('744-2 the rule — the browser\'s own testimony')
await t('safe methods pass whatever the headers say (OPTIONS is the browser\'s own preflight)', () => {
  for (const m of ['GET', 'HEAD', 'OPTIONS', 'get']) assert.equal(verdict(m, { 'sec-fetch-site': 'cross-site', origin: EVIL }), null, m)
})
await t('Sec-Fetch-Site decides alone when present: same-origin and none pass; same-site, cross-site and any unknown value are refused', () => {
  assert.equal(verdict('POST', { 'sec-fetch-site': 'same-origin', origin: ME, host: 'localhost:24680' }), null)
  assert.equal(verdict('POST', { 'sec-fetch-site': 'none' }), null)
  assert.equal(verdict('POST', { 'sec-fetch-site': 'cross-site', origin: EVIL, host: 'localhost:24680' }), 'cross-site')
  assert.equal(verdict('DELETE', { 'sec-fetch-site': 'same-site', origin: 'http://localhost:24681', host: 'localhost:24680' }), 'same-site')
  assert.equal(verdict('PUT', { 'sec-fetch-site': 'sideways' }), 'sideways')
  // A proxy that rewrites Host cannot refuse the node's own page: the browser said same-origin, the Origin is not compared.
  assert.equal(verdict('POST', { 'sec-fetch-site': 'same-origin', origin: 'https://aifa.dev', host: '127.0.0.1:24680' }), null)
})
await t('without Sec-Fetch-Site the Origin decides: its host against x-forwarded-host or host; null and garbage are refused', () => {
  assert.equal(verdict('POST', { origin: EVIL, host: 'localhost:24680' }), 'foreign-origin')
  assert.equal(verdict('POST', { origin: 'null', host: 'localhost:24680' }), 'null-origin')
  assert.equal(verdict('POST', { origin: 'not a url', host: 'localhost:24680' }), 'foreign-origin')
  assert.equal(verdict('POST', { origin: ME, host: 'localhost:24680' }), null)
  // The port is part of the host: another element of this computer is another origin.
  assert.equal(verdict('PATCH', { origin: 'http://localhost:24681', host: 'localhost:24680' }), 'foreign-origin')
})
await t('behind nginx and cloudflared: the host is compared, never the scheme (TLS ends before the core)', () => {
  // nginx sets Host and X-Forwarded-Host to the server's own name (lib/hosting/nginx.mjs); the page's Origin is https.
  assert.equal(verdict('POST', { origin: 'https://aifa.dev', host: 'aifa.dev', 'x-forwarded-host': 'aifa.dev' }), null)
  assert.equal(verdict('POST', { origin: 'https://aifa.dev', host: '127.0.0.1:24680', 'x-forwarded-host': 'aifa.dev' }), null)
  assert.equal(verdict('POST', { origin: 'https://aifa.dev:443', host: 'aifa.dev:443' }), null)
  assert.equal(verdict('POST', { origin: 'http://[::1]:24680', host: '[::1]:24680' }), null)
  assert.equal(verdict('POST', { origin: 'https://AIFA.dev', host: 'aifa.DEV' }), null)
  assert.equal(verdict('POST', { origin: 'https://evil.dev', host: 'aifa.dev', 'x-forwarded-host': 'aifa.dev, edge.example' }), 'foreign-origin')
  assert.equal(verdict('POST', { origin: 'https://edge.example', host: 'aifa.dev', 'x-forwarded-host': 'aifa.dev, edge.example' }), null)
  // A subdomain of the node (an element's site) is another origin, not the core's panel.
  assert.equal(verdict('POST', { origin: 'https://blog.aifa.dev', host: 'aifa.dev' }), 'foreign-origin')
})
await t('no browser headers pass: curl, the node\'s scripts and services, Telegram, an element\'s door with its key', () => {
  assert.equal(verdict('POST', {}), null)
  assert.equal(verdict('POST', { host: 'localhost:24680', 'x-node-key': 'k', 'sec-fetch-mode': 'cors' }), null) // Node's fetch sends sec-fetch-mode only
})

// ── The real proxy ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log('744-2 the real proxy — every state-changing door of the core')

/** Every route file of the core with the state-changing methods it exports (any export form). */
function doors() {
  const files = execFileSync('git', ['ls-files', 'app/**/route.ts', 'app/**/route.tsx'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean)
  const out = []
  for (const file of files) {
    const src = readFileSync(join(ROOT, file), 'utf8')
    const methods = new Set()
    for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function|const|let)\s+(POST|PUT|PATCH|DELETE)\b/g)) methods.add(m[1])
    for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) for (const v of m[1].matchAll(/\b(POST|PUT|PATCH|DELETE)\b/g)) methods.add(v[1])
    if (methods.size) out.push({ file, methods: [...methods], urls: urlsOf(file) })
  }
  return out
}

/** The addresses a browser uses for a route file: groups dropped, parameters given sample values; the architect's doors answer from
 *  the core's root too (`/<lang>/…`, rewritten after the proxy — next.config.ts, 285-6). */
function urlsOf(file) {
  const segs = file.replace(/^app\//, '').replace(/\/route\.tsx?$/, '').split('/').filter((s) => !/^\(.*\)$/.test(s))
  const url = '/' + segs.map((s) => (s === '[lang]' ? 'en' : /^\[\[?\.\.\./.test(s) ? 'a/b' : /^\[.+\]$/.test(s) ? 'x1' : s)).join('/')
  const m = url.match(/^\/en\/architect(\/.*)?$/)
  return m ? [url, `/en${m[1] ?? ''}`] : [url]
}

/** A TypeScript module of the core bundled into the temp folder (never inside the project: a copy of code there is code to the build);
 *  its bare imports point at the project's node_modules by absolute path. `null` — esbuild is absent (a production install). */
const req = createRequire(join(ROOT, 'package.json'))
const dir = mkdtempSync(join(tmpdir(), 'cross-site-wall-'))
async function load(entry) {
  let esbuild
  try { esbuild = await import('esbuild') } catch { return null }
  const built = await esbuild.build({
    entryPoints: [join(ROOT, entry)], bundle: true, platform: 'node', format: 'cjs', target: 'node20',
    packages: 'external', write: false, absWorkingDir: ROOT, logLevel: 'silent',
  })
  const text = built.outputFiles[0].text.replace(/require\("([^".][^"]*)"\)/g, (all, spec) => (spec.startsWith('node:') ? all : `require(${JSON.stringify(req.resolve(spec))})`))
  const file = join(dir, `${entry.replace(/[^a-z0-9]+/gi, '-')}.cjs`)
  writeFileSync(file, text)
  return createRequire(file)(file)
}

process.chdir(ROOT) // the doors read the node's root from the working folder, as under `next start`
const proxyModule = await load('proxy.ts')
if (!proxyModule) {
  console.warn('  – the real proxy skipped: esbuild is not installed (devDependencies) — `npm install`')
} else {
  const { NextRequest } = req('next/server')
  const { proxy, config } = proxyModule
  const list = doors()
  const call = (url, method, h) => proxy(new NextRequest(new URL(url, ME), { method, headers: { host: 'localhost:24680', ...h }, body: method === 'GET' || method === 'HEAD' ? undefined : '{"action":"state","host":"203.0.113.7","port":22}' }))
  const isWall = async (res) => res.status === 403 && (await res.clone().json().catch(() => ({}))).reason === 'cross-site'
  const CASES = {
    'cross-site page (text/plain, no preflight)': { origin: EVIL, 'sec-fetch-site': 'cross-site', 'sec-fetch-mode': 'no-cors', 'content-type': 'text/plain;charset=UTF-8' },
    'another site of this node (same-site)': { origin: 'http://localhost:24681', 'sec-fetch-site': 'same-site', 'content-type': 'text/plain;charset=UTF-8' },
    'an old browser on a foreign page (Origin only)': { origin: EVIL, 'content-type': 'application/x-www-form-urlencoded' },
    'a sandboxed frame (Origin: null)': { origin: 'null', 'content-type': 'multipart/form-data; boundary=x' },
  }

  await t(`the door list is read from the route files (${list.length} doors), the launch and update doors among them`, () => {
    assert.ok(list.length >= 50, `only ${list.length} doors found — the listing broke`)
    for (const f of ['app/api/node/launch/route.ts', 'app/api/node/update/route.ts']) assert.ok(list.some((d) => d.file === f), `${f} not listed`)
  })
  await t('the proxy sees every door: each address matches its matcher (a door it never sees, the wall never guards)', () => {
    const matchers = [config?.matcher].flat().filter(Boolean).map((m) => new RegExp(`^${m}$`))
    assert.ok(matchers.length, 'proxy.ts exports no matcher')
    const unseen = list.flatMap((d) => d.urls).filter((u) => !matchers.some((re) => re.test(u)))
    assert.deepEqual(unseen, [])
  })
  for (const [name, h] of Object.entries(CASES)) {
    await t(`${name} → 403 «cross-site» on every door, every method, every address`, async () => {
      const open = []
      for (const d of list) for (const url of d.urls) for (const m of d.methods) if (!(await isWall(await call(url, m, h)))) open.push(`${m} ${url}`)
      assert.deepEqual(open, [])
    })
  }
  await t('negative control: the node\'s own page (same-origin), a request without browser headers, a safe method — never the wall', async () => {
    const met = []
    for (const d of list) for (const url of d.urls) for (const m of d.methods) {
      if (await isWall(await call(url, m, { origin: ME, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }))) met.push(`same-origin ${m} ${url}`)
      if (await isWall(await call(url, m, {}))) met.push(`no headers ${m} ${url}`)
    }
    for (const url of ['/api/health', '/en', '/en/hosting/hosting']) if (await isWall(await call(url, 'GET', CASES['cross-site page (text/plain, no preflight)']))) met.push(`GET ${url}`)
    assert.deepEqual(met, [])
  })
  await t('the wall stands before every other job of the proxy: a foreign POST to a page address is refused, not routed', async () => {
    const res = await call('/en/hosting/hosting', 'POST', CASES['cross-site page (text/plain, no preflight)'])
    assert.ok(await isWall(res), `a page address answered ${res.status}`)
  })

  // The launch door itself, behind the wall: JSON only. A bad address is sent, so nothing reaches a server whatever the door decides.
  const { POST } = await load('app/api/node/launch/route.ts')
  const launch = (type) => POST(new NextRequest(new URL('/api/node/launch', ME), { method: 'POST', headers: { host: 'localhost:24680', 'content-type': type }, body: '{"action":"state","host":"not an address","port":22}' }))
  await t('the launch door takes JSON only: text/plain, a form or no type → 415 «json-only»; JSON goes on to the door\'s own checks', async () => {
    for (const type of ['text/plain;charset=UTF-8', 'application/x-www-form-urlencoded', 'multipart/form-data; boundary=x', '']) {
      const res = await launch(type)
      assert.deepEqual([res.status, (await res.json()).reason], [415, 'json-only'], `«${type}»`)
    }
    const res = await launch('application/json')
    assert.notEqual(res.status, 415, 'JSON was refused as not JSON') // 400 bad-address here, 409 on a server node — never json-only
  })
}
rmSync(dir, { recursive: true, force: true })

console.log(`${passed} passed${process.exitCode ? ', FAILED' : ''}`)
