// Samples of the bought starter's road into the node (core step 862-4): a local stub of the store with the exact shapes of the standard
// v1.2 §3–§4 — the paid order is kept; negatives: an unpaid order, a starter outside the order, bytes whose sha256 differs from the order
// or from the header, a member «../», a link leading outside, two top folders — each refused with nothing kept. A scratch identity and a
// scratch node folder — never the node's own key or data.
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fetchStarter, keptStarter } from '../lib/web4-items/starter-fetch.mjs'

let failures = 0
const check = (label, ok, extra = '') => { if (!ok) failures++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${!ok && extra ? ` — ${extra}` : ''}`) }

// A minimal ustar writer: [{ name, body?, link? }] → gzip bytes. Lets the test build members a normal tar would refuse to create.
function tarGz(entries) {
  const chunks = []
  for (const e of entries) {
    const body = Buffer.from(e.body ?? '')
    const h = Buffer.alloc(512)
    h.write(e.name, 0, 100, 'utf8')
    h.write(e.dir ? '0000755\0' : '0000644\0', 100); h.write('0000000\0', 108); h.write('0000000\0', 116)
    h.write(`${(e.link || e.dir ? 0 : body.length).toString(8).padStart(11, '0')}\0`, 124)
    h.write(`${Math.floor(Date.now() / 1000).toString(8).padStart(11, '0')}\0`, 136)
    h.write('        ', 148)
    h.write(e.dir ? '5' : e.link ? '2' : '0', 156)
    if (e.link) h.write(e.link, 157, 100, 'utf8')
    h.write('ustar\0', 257); h.write('00', 263)
    let sum = 0
    for (const b of h) sum += b
    h.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148)
    chunks.push(h)
    if (!e.link && !e.dir) chunks.push(body, Buffer.alloc((512 - (body.length % 512)) % 512))
  }
  chunks.push(Buffer.alloc(1024))
  return gzipSync(Buffer.concat(chunks))
}
const sha = (b) => createHash('sha256').update(b).digest('hex')

const SLUG = 'test-post-starter'
const T = `${SLUG}-v0.1.0` // the live store's top folder «<slug>-<tag>»
const good = tarGz([{ name: `${T}/`, dir: true }, { name: `${T}/package.json`, body: '{"name":"x"}' }, { name: `${T}/lib/`, dir: true }, { name: `${T}/lib/a.txt`, body: 'a' }, { name: `${T}/lib/in`, link: 'a.txt' }])
const archives = {
  good,
  dotdot: tarGz([{ name: `${SLUG}/`, dir: true }, { name: `${SLUG}/../evil.txt`, body: 'x' }]),
  link: tarGz([{ name: `${SLUG}/`, dir: true }, { name: `${SLUG}/out`, link: '../../../etc/passwd' }]),
  two: tarGz([{ name: `${SLUG}/`, dir: true }, { name: `${SLUG}/a`, body: 'a' }, { name: 'other/', dir: true }]),
}
let mode = { archive: 'good', orderSha: null, headerSha: null, status: 'paid' }
const server = createServer((req, res) => {
  let raw = ''
  req.on('data', (c) => { raw += c })
  req.on('end', () => {
    const env = JSON.parse(raw)
    const bytes = archives[mode.archive]
    if (req.url === '/api/marketplace/order') {
      res.writeHead(200, { 'content-type': 'application/json' })
      // v1.2 §3 as the store answers live (paid boolean, items[] with bytes)
      return res.end(JSON.stringify({ v: 2, order: env.body.order, paid: mode.status === 'paid', paidBy: 'free', at: new Date().toISOString(), element: 'market', total: { amount: 0, currency: 'USD' }, items: mode.status === 'paid' ? [{ slug: SLUG, name: 'Test post', tag: 'v0.1.0', commit: 'abc1234', sha256: mode.orderSha ?? sha(bytes), bytes: bytes.length }] : [] }))
    }
    if (req.url === '/api/marketplace/archive') {
      if (env.body.slug !== SLUG) { res.writeHead(400); return res.end('{"error":"not-in-order"}') }
      res.writeHead(200, { 'content-type': 'application/gzip', 'x-sha256': mode.headerSha ?? sha(bytes), 'x-tag': 'v0.1.0' })
      return res.end(bytes)
    }
    res.writeHead(404); res.end()
  })
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`
const root = mkdtempSync(join(tmpdir(), 'starter-fetch-'))
const nothingKept = () => !existsSync(join(root, 'data', 'node', 'starters', SLUG)) || readdirSync(join(root, 'data', 'node', 'starters', SLUG)).length === 0
try {
  mode = { archive: 'good', status: 'open' }
  let r = await fetchStarter(root, { order: 'ord-test1', slug: SLUG, base })
  check('negative: an unpaid order is refused, nothing kept', !r.ok && /order-not-paid/.test(r.reason) && nothingKept(), r.reason)

  mode = { archive: 'good', status: 'paid' }
  r = await fetchStarter(root, { order: 'ord-test1', slug: 'other-starter', base })
  check('negative: a starter outside the order is refused', !r.ok && /starter-not-in-order/.test(r.reason) && nothingKept(), r.reason)

  mode = { archive: 'good', status: 'paid', orderSha: '0'.repeat(64) }
  r = await fetchStarter(root, { order: 'ord-test1', slug: SLUG, base })
  check('negative: bytes ≠ the order\'s sha256 → refused, nothing kept', !r.ok && /sha256-mismatch/.test(r.reason) && nothingKept(), r.reason)

  mode = { archive: 'good', status: 'paid', headerSha: 'f'.repeat(64) }
  r = await fetchStarter(root, { order: 'ord-test1', slug: SLUG, base })
  check('negative: bytes ≠ the x-sha256 header → refused, nothing kept', !r.ok && /sha256-mismatch/.test(r.reason) && nothingKept(), r.reason)

  for (const bad of ['dotdot', 'link', 'two']) {
    mode = { archive: bad, status: 'paid' }
    r = await fetchStarter(root, { order: 'ord-test1', slug: SLUG, base })
    check(`negative: archive «${bad}» refused, nothing kept, nothing outside`, !r.ok && nothingKept() && !existsSync(join(root, 'data', 'node', 'starters', 'evil.txt')), r.reason)
  }

  mode = { archive: 'good', status: 'paid' }
  r = await fetchStarter(root, { order: 'ord-test1', slug: SLUG, base })
  check('the paid order: kept in data/node/starters/<slug>/<tag>/', r.ok && existsSync(join(r.path, 'package.json')) && existsSync(join(r.path, 'lib', 'a.txt')), r.reason)
  const k = keptStarter(root, SLUG)
  check('the kept record: tag, sha256 of the bytes, the order', k.ok && k.meta.tag === 'v0.1.0' && k.meta.sha256 === sha(good) && k.meta.order === 'ord-test1')
  check('no scratch left beside it', readdirSync(join(root, 'data', 'node', 'starters', SLUG)).every((f) => !f.startsWith('.')))
} finally {
  server.close()
  rmSync(root, { recursive: true, force: true })
}
if (failures) { console.error(`===STARTER_FETCH_TEST_FAILED=== ${failures}`); process.exit(1) }
console.log('===STARTER_FETCH_TEST_OK===')
