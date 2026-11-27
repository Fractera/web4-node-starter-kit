// THE PURCHASE OF STARTERS (core step 862-3; the standard: skill `marketplace`, references/store-contract-v1.md §2, v1.2). The client
// element «Маркетплейс» never calls the store: its «Оплатить» comes to the core's door, the core signs the store's purchase with the node's
// identity and keeps the order in its own records (data/node/market/orders.jsonl, outside git — the client's «Покупки» read them first).
// A free cart is paid at once → the install may start. A priced cart gets the store's Checkout link → the PAYER's window (`person-asks`,
// by the client: its «Готово» wakes the client's agent, which asks the order's status through the core) with the starters, the total,
// «вы покупаете для всего проекта» and the consent line. The core pulls the status; nothing waits for a push (a closed lid has no door).
// The install of a paid starter runs detached from the core's processes (`scripts/spawn-free.mjs` → `npm run market -- install`), its
// log is the state the door reads back. Money never passes through the node: Stripe's page is Fractera's.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { storeCall } from './store-call.mjs'

const require = createRequire(import.meta.url)
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/
const ORDER = /^ord-[0-9a-f]{24}$/

export const ordersFile = (root) => join(root, 'data', 'node', 'market', 'orders.jsonl')

/** The node's own records of orders, the newest state of each order last written → [{ order, at, paid, total, items, by, … }]. */
export function readOrders(root) {
  const f = ordersFile(root)
  if (!existsSync(f)) return []
  const byOrder = new Map()
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    if (!line.trim()) continue
    try { const r = JSON.parse(line); if (r?.order) byOrder.set(r.order, { ...(byOrder.get(r.order) ?? {}), ...r }) } catch { /* a torn line */ }
  }
  return [...byOrder.values()].sort((a, b) => String(b.at).localeCompare(String(a.at)))
}

function record(root, rec) {
  mkdirSync(join(root, 'data', 'node', 'market'), { recursive: true })
  appendFileSync(ordersFile(root), JSON.stringify({ ...rec, at: rec.at ?? new Date().toISOString() }) + '\n', 'utf8')
}

const money = ({ amount, currency } = {}, lang) => {
  const n = Number(amount) || 0
  if (!n) return lang === 'en' ? 'free' : 'бесплатно'
  return `${n.toFixed(2)} ${currency || 'USD'}`
}

/** The payer's window for a priced order — the words of the standard §2/§7 in the person's language. */
export function payerWindow(root, { order, items, total, checkoutUrl, by, lang = 'ru', add = require('../node/person-asks.cjs').add }) {
  const names = items.map((x) => x.name || x.slug).join(', ')
  const text = lang === 'en'
    ? `Pay for the starters: ${names} — ${money(total, 'en')} in total. You buy them for the whole project. A starter is delivered at once; no refund unless the law requires it.`
    : `Оплатите стартеры: ${names} — итого ${money(total, 'ru')}. Вы покупаете для всего проекта. Стартер передаётся сразу; возврата нет, кроме случаев, когда этого требует закон.`
  const item = add(root, {
    text: text.slice(0, 400),
    href: checkoutUrl,
    by,
    why: lang === 'en' ? 'Only the payer pays: the page is Fractera\'s Stripe Checkout, the node never sees the card.' : 'Платит только плательщик: страница — Stripe Checkout Fractera, узел карту не видит.',
    hint: lang === 'en' ? `Order ${order}. After paying press «Готово» — the node checks the payment itself.` : `Заказ ${order}. После оплаты нажмите «Готово» — узел сам проверит оплату.`,
  })
  return item?.id ?? null
}

/**
 * «Оплатить»: the signed purchase of a cart. → { ok, state: 'paid' | 'awaiting-payer' | 'already-ordered', order, items, total, window? }
 * | { ok: false, status, reason }.
 * @param {string} root
 * @param {{ cart?: unknown, by?: string, lang?: string, consent?: { immediateDelivery?: boolean, noRefund?: boolean }, base?: string, add?: Function }} [o]
 */
export async function purchase(root, { cart, by, lang = 'ru', consent, base, add } = {}) {
  const slugs = Array.isArray(cart) ? cart.map((x) => (typeof x === 'string' ? x : x?.slug)).filter((s) => typeof s === 'string') : []
  if (!slugs.length || slugs.length > 20 || new Set(slugs).size !== slugs.length || !slugs.every((s) => SLUG.test(s))) return { ok: false, status: 400, reason: 'cart: 1–20 different starter slugs' }
  if (consent?.immediateDelivery !== true || consent?.noRefund !== true) return { ok: false, status: 400, reason: 'consent: the payer agrees to immediate delivery and no refund unless the law requires it' }
  const r = await storeCall(root, 'purchase', { element: by, cart: slugs.map((slug) => ({ slug })), consent: { immediateDelivery: true, noRefund: true }, lang }, base ? { base } : {})
  if (r.status === 409 && Array.isArray(r.body?.items)) {
    // R-05: one copy per buyer — the node installs again from the order it already holds, never pays twice.
    return { ok: true, state: 'already-ordered', items: r.body.items.filter((x) => SLUG.test(x?.slug ?? '') && ORDER.test(x?.order ?? '')).map((x) => ({ slug: x.slug, order: x.order })) }
  }
  if (r.status !== 200 || !ORDER.test(r.body?.order ?? '')) return { ok: false, status: r.status || 502, reason: `store purchase ${r.status}${r.body?.error ? ` ${r.body.error}` : ''}` }
  const b = r.body
  const paid = b.paid === true || b.status === 'paid'
  const items = (Array.isArray(b.items) ? b.items : Array.isArray(b.starters) ? b.starters : []).map((x) => ({ slug: x.slug, name: x.name ?? x.slug, tag: x.tag ?? null }))
  const total = b.total ?? { amount: 0, currency: 'USD' }
  record(root, { order: b.order, paid, paidBy: b.paidBy ?? null, total, items, by, lang })
  if (paid) return { ok: true, state: 'paid', order: b.order, items, total }
  let checkoutUrl = null
  try { const u = new URL(b.checkoutUrl ?? ''); if (u.protocol === 'https:') checkoutUrl = u.href } catch { /* none */ }
  if (!checkoutUrl) return { ok: false, status: 502, reason: 'the store left a priced order without an https Checkout link' }
  const window = payerWindow(root, { order: b.order, items, total, checkoutUrl, by, lang, ...(add ? { add } : {}) })
  record(root, { order: b.order, window })
  return { ok: true, state: 'awaiting-payer', order: b.order, items, total, window }
}

/** The order's status from the store, signed; the node's record follows it. → { ok, order, paid, items } | { ok: false, status, reason } */
export async function orderStatus(root, order, { base } = {}) {
  if (!ORDER.test(order ?? '')) return { ok: false, status: 400, reason: 'order: ord- and 24 hex' }
  const r = await storeCall(root, 'order', { order }, base ? { base } : {})
  if (r.status !== 200) return { ok: false, status: r.status === 404 ? 404 : r.status || 502, reason: `store order ${r.status}${r.body?.error ? ` ${r.body.error}` : ''}` }
  const paid = r.body?.paid === true || r.body?.status === 'paid'
  const items = (Array.isArray(r.body?.items) ? r.body.items : r.body?.starters ?? []).map((x) => ({ slug: x.slug, name: x.name ?? x.slug, tag: x.tag ?? null }))
  if (readOrders(root).find((o) => o.order === order)?.paid !== paid) record(root, { order, paid, items, ...(paid ? { paidSeenAt: new Date().toISOString() } : {}) })
  return { ok: true, order, paid, items }
}

const installLog = (root, order, slug) => join(root, 'logs', `market-install-${order}-${slug}.log`)

/** The state of an install the door started: running | installed (element) | failed (reason) | none. */
export function installState(root, order, slug) {
  const f = installLog(root, order, slug)
  if (!existsSync(f)) return { state: 'none' }
  const log = readFileSync(f, 'utf8')
  const ok = /===STARTER_INSTALLED=== ([a-z0-9]+)/.exec(log)
  if (ok) return { state: 'installed', element: ok[1] }
  // 862-9: the order was installed before (another call, a script) — that is «installed», not a failure (market 2026-11-27 20:17)
  const had = /already installed here: ([a-z0-9]+)/.exec(log)
  if (had) return { state: 'installed', element: had[1] }
  const bad = /===MAIN_AGENT_FAIL=== (.+)/.exec(log)
  if (bad) return { state: 'failed', reason: bad[1].slice(0, 300) }
  return { state: 'running' }
}

/** Start the install of a paid starter, detached from the core's processes; the log is its state. */
export function startInstall(root, { order, slug, again = false }) {
  if (!ORDER.test(order ?? '') || !SLUG.test(slug ?? '')) return { ok: false, status: 400, reason: 'order and slug' }
  const now = installState(root, order, slug)
  if (now.state === 'running') return { ok: true, state: 'running' }
  if (now.state === 'installed' && !again) return { ok: true, ...now }
  mkdirSync(join(root, 'logs'), { recursive: true })
  const log = installLog(root, order, slug)
  // The shell-free launcher writes the log itself: `market-install-run.mjs` runs the CLI with its output into the file.
  spawnSync(process.execPath, [join(root, 'scripts', 'spawn-free.mjs'), join(root, 'scripts', 'market-install-run.mjs'), order, slug, log, ...(again ? ['--again'] : [])], { cwd: root, windowsHide: true, stdio: 'ignore', timeout: 10_000 })
  return { ok: true, state: 'running' }
}
