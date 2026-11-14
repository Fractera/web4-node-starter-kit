// TESTS OF THE SERVICE WORKER'S DOCUMENTS (node step 742-10). In the prebuild.
// ✗ Measured 2026-11-14 in the owner's Chrome on aifa.dev: the first navigation after a core update showed the page of the previous build
// — the worker's «network first» `fetch(req)` went through the browser's HTTP cache, and Next's `stale-while-revalidate=31535400` let
// Chrome serve its stored copy (`deliveryType: "cache"`, `transferSize: 0`); the second navigation was fresh.
// `public/sw.js` runs here in a fake worker (node:vm): its document fetch must ask the server (`cache: "no-cache"`), offline it still
// answers with the last page seen. The negative control is built in: the same file with the option cut out must fail the first check.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = readFileSync(join(ROOT, 'public', 'sw.js'), 'utf8').replace(/\r\n/g, '\n')
let passed = 0
const t = async (name, fn) => {
  try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}

/** The worker of `source` in a fake global; `fetchImpl(request, init)` answers its network calls. */
function worker(source, { online = true, fetchImpl, stored = null } = {}) {
  const listeners = {}
  const store = new Map()
  if (stored) store.set(stored.url, stored.response)
  const cache = { match: async (r) => store.get(typeof r === 'string' ? r : r.url) ?? undefined, put: async (r, res) => { store.set(typeof r === 'string' ? r : r.url, res) } }
  const calls = []
  const self = {
    location: new URL('https://node.test/sw.js?v=b2'),
    navigator: { onLine: online },
    addEventListener: (type, fn) => { listeners[type] = fn },
    skipWaiting: () => {},
    clients: { claim: async () => {}, matchAll: async () => [] },
  }
  const sandbox = {
    self, URL, Request, Response, Headers, setTimeout, Promise,
    caches: { open: async () => cache, keys: async () => [], delete: async () => true, match: cache.match },
    fetch: async (request, init) => { calls.push({ request, init }); return fetchImpl(request, init) },
  }
  vm.runInNewContext(source, sandbox)
  /** Any request of the browser; the worker's answer, or `null` when it leaves the request to the browser. */
  const dispatch = async (request) => {
    let answer = null
    listeners.fetch({ request, respondWith: (p) => { answer = p } })
    return answer ? await answer : null
  }
  /** A page request of the browser. */
  const visit = (url) => dispatch(new Request(url, { headers: { accept: 'text/html' } }))
  return { visit, dispatch, calls }
}

const page = (body) => new Response(body, { status: 200, headers: { 'content-type': 'text/html' } })

await t('a document is asked of the server, past the browser HTTP cache (cache: "no-cache")', async () => {
  const w = worker(SOURCE, { fetchImpl: async () => page('fresh') })
  const res = await w.visit('https://node.test/ru/hosting')
  assert.equal(await res.text(), 'fresh')
  assert.equal(w.calls.length, 1)
  assert.equal(w.calls[0].init?.cache, 'no-cache', `the worker fetched the document with ${JSON.stringify(w.calls[0].init)} — the HTTP cache may answer with the previous build`)
})

await t('negative control: the same worker without the option is caught by the check above', async () => {
  const cut = SOURCE.replace(/fetch\(req,\s*\{\s*cache:\s*"no-cache"\s*\}\)/, 'fetch(req)')
  assert.notEqual(cut, SOURCE, 'the option was not found in public/sw.js to cut it out')
  const w = worker(cut, { fetchImpl: async () => page('fresh') })
  await w.visit('https://node.test/ru/hosting')
  assert.notEqual(w.calls[0].init?.cache, 'no-cache')
})

await t('offline: the last page seen is still the answer (the old promise of the worker)', async () => {
  const w = worker(SOURCE, { online: false, fetchImpl: async () => { throw new TypeError('offline') }, stored: { url: 'https://node.test/ru/hosting', response: page('seen before') } })
  const res = await w.visit('https://node.test/ru/hosting')
  assert.equal(await res.text(), 'seen before')
})

await t('an API call is not a document: the worker leaves it to the browser', async () => {
  const w = worker(SOURCE, { fetchImpl: async () => new Response('{}', { status: 200 }) })
  const res = await w.dispatch(new Request('https://node.test/api/node/machine', { headers: { accept: 'application/json' } }))
  assert.equal(res, null)
  assert.equal(w.calls.length, 0)
})

console.log(process.exitCode ? `===SW_TEST_FAILED=== ${passed} passed` : `===SW_TEST_OK=== ${passed} passed`)
