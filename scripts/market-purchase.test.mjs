// Samples of the purchase (core step 862-3) against a local stub of the store with the shapes of standard v1.2: a free cart is paid at
// once and recorded; a priced cart puts the payer's window with the Checkout link, the total and the consent line, and stays unpaid until
// the store says paid; a repeat → already-ordered with the held order (R-05). Negatives: no consent, a bad cart, a priced order without
// an https link, an unknown order → nothing installed, nothing recorded as paid. A scratch identity and folder; the window is a stub.
import { createServer } from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { orderStatus, purchase, readOrders } from '../lib/web4-items/market-purchase.mjs'

let failures = 0
const check = (label, ok, extra = '') => { if (!ok) failures++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${!ok && extra ? ` — ${extra}` : ''}`) }
const PRICED = 'ord-' + 'b'.repeat(24)
const FREE = 'ord-' + 'a'.repeat(24)
const state = { pricedPaid: false, held: false, link: 'https://checkout.stripe.com/c/pay/test' }
const server = createServer((req, res) => {
  let raw = ''
  req.on('data', (c) => { raw += c })
  req.on('end', () => {
    const b = JSON.parse(raw).body
    const json = (code, o) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)) }
    if (req.url === '/api/marketplace/purchase') {
      const slugs = b.cart.map((x) => x.slug)
      if (state.held && slugs.includes('free-one')) return json(409, { error: 'already-ordered', items: [{ slug: 'free-one', order: FREE }] })
      if (slugs.includes('priced-one')) return json(200, { v: 2, order: PRICED, paid: false, paidBy: 'stripe', total: { amount: 9, currency: 'USD' }, items: [{ slug: 'priced-one', name: 'Платный' }], checkoutUrl: state.link })
      return json(200, { v: 2, order: FREE, paid: true, paidBy: 'free', total: { amount: 0, currency: 'USD' }, items: [{ slug: 'free-one', name: 'Бесплатный', tag: 'v0.1.0' }] })
    }
    if (req.url === '/api/marketplace/order') {
      if (b.order === PRICED) return json(200, { v: 2, order: PRICED, paid: state.pricedPaid, items: [{ slug: 'priced-one', name: 'Платный', tag: 'v1.0.0' }] })
      if (b.order === FREE) return json(200, { v: 2, order: FREE, paid: true, items: [{ slug: 'free-one', tag: 'v0.1.0' }] })
      return json(404, { error: 'unknown-order' })
    }
    json(404, {})
  })
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`
const root = mkdtempSync(join(tmpdir(), 'market-purchase-'))
const windows = []
const add = (_root, w) => { windows.push(w); return { id: `w${windows.length}` } }
const consent = { immediateDelivery: true, noRefund: true }
try {
  let r = await purchase(root, { cart: [{ slug: 'free-one' }], by: 'market', consent: { immediateDelivery: true }, base, add })
  check('negative: no full consent → 400, nothing recorded', !r.ok && r.status === 400 && readOrders(root).length === 0, r.reason)
  r = await purchase(root, { cart: [{ slug: 'Bad Slug' }], by: 'market', consent, base, add })
  check('negative: a bad cart → 400', !r.ok && r.status === 400)
  r = await purchase(root, { cart: [{ slug: 'free-one' }, { slug: 'free-one' }], by: 'market', consent, base, add })
  check('negative: the same starter twice in one cart → 400', !r.ok && r.status === 400)

  r = await purchase(root, { cart: [{ slug: 'free-one' }], by: 'market', consent, base, add })
  check('a free cart → paid at once, no window', r.ok && r.state === 'paid' && r.order === FREE && windows.length === 0, JSON.stringify(r))
  check('the order is in the node\'s records, paid', readOrders(root).find((o) => o.order === FREE)?.paid === true)

  state.held = true
  r = await purchase(root, { cart: [{ slug: 'free-one' }], by: 'market', consent, base, add })
  check('a repeat → already-ordered with the held order (no second payment)', r.ok && r.state === 'already-ordered' && r.items[0]?.order === FREE)

  r = await purchase(root, { cart: [{ slug: 'priced-one' }], by: 'market', consent, lang: 'ru', base, add })
  const w = windows[0]
  check('a priced cart → awaiting-payer with the payer\'s window', r.ok && r.state === 'awaiting-payer' && r.window === 'w1', JSON.stringify(r))
  check('the window: the Checkout link, by the client, the total, «для всего проекта», the consent line', w?.href === state.link && w?.by === 'market' && /9\.00 USD/.test(w.text) && /для всего проекта/.test(w.text) && /возврата нет, кроме случаев, когда этого требует закон/.test(w.text))
  check('unpaid until the store says paid', readOrders(root).find((o) => o.order === PRICED)?.paid === false)
  let s = await orderStatus(root, PRICED, { base })
  check('the status pulled: not paid', s.ok && s.paid === false)
  state.pricedPaid = true
  s = await orderStatus(root, PRICED, { base })
  check('after the payment: paid, the record follows', s.ok && s.paid === true && readOrders(root).find((o) => o.order === PRICED)?.paid === true)

  state.link = 'http://evil.example/pay'
  const before = windows.length
  r = await purchase(root, { cart: [{ slug: 'priced-one' }], by: 'market', consent, base, add })
  check('negative: a priced order without an https link → refused, no window', !r.ok && windows.length === before)
  s = await orderStatus(root, 'ord-' + 'c'.repeat(24), { base })
  check('negative: an unknown order → 404', !s.ok && s.status === 404)
  s = await orderStatus(root, 'nonsense', { base })
  check('negative: a malformed order → 400, the store not asked', !s.ok && s.status === 400)
} finally {
  server.close()
  rmSync(root, { recursive: true, force: true })
}
if (failures) { console.error(`===MARKET_PURCHASE_TEST_FAILED=== ${failures}`); process.exit(1) }
console.log('===MARKET_PURCHASE_TEST_OK===')
