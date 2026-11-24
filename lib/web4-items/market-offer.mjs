// AN APPLICATION TO OFFER AN OWN NATIVE ELEMENT IN A MARKETPLACE (node step 854; Roma 2026-11-24: «раздел предложить в маркетплейсе далее
// выпадающем списке выбрать веб два Fractera, Web4 (Lagrix) … там будет просто форма отправить заявку»).
//
// The application is KEPT ON THE NODE (data/node/f2f/offers.jsonl), one line per sending, never sent anywhere yet: the Fractera marketplace
// has no door to receive it, and Lagrix has not launched (Web4 is a simulation — the record says `mode: "simulation"`). The page says so.
// No personal data in the record: the element, the market, what it does, the price, a note of the architect about the element.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const MARKETS = ['web2', 'web4']
const FILE = 'offers.jsonl'
const clean = (s, n) => String(s ?? '').replace(/\r\n/g, '\n').trim().slice(0, n)

/** The application from a request body, or `{ ok: false, error }` with the kind of refusal. */
export function parseOffer(body) {
  const market = body?.market
  if (!MARKETS.includes(market)) return { ok: false, error: 'bad-market' }
  const summary = clean(body?.summary, 2000)
  if (summary.length < 20 || String(body?.summary ?? '').trim().length > 2000) return { ok: false, error: 'bad-summary' }
  let price = null
  if (body?.price != null && body?.price !== '') {
    const amount = Number(String(body.price).replace(',', '.'))
    if (!Number.isFinite(amount) || amount < 0 || amount > 100000) return { ok: false, error: 'bad-price' }
    price = amount === 0 ? null : { amount: Math.round(amount * 100) / 100, currency: 'USD', per: body?.per === 'month' ? 'month' : 'once' }
  }
  if (String(body?.note ?? '').trim().length > 1000) return { ok: false, error: 'bad-note' }
  return { ok: true, value: { market, summary, price, note: clean(body?.note, 1000) } }
}

/** Keeps the application of element `item`; returns the stored record. */
export function saveOffer(dataDir, item, offer, now = new Date()) {
  const record = { at: now.toISOString(), item, ...offer, sent: false, mode: offer.market === 'web4' ? 'simulation' : 'kept' }
  mkdirSync(dataDir, { recursive: true })
  appendFileSync(join(dataDir, FILE), JSON.stringify(record) + '\n')
  return record
}

/** The last application of element `item`, or null. */
export function lastOffer(dataDir, item) {
  const file = join(dataDir, FILE)
  if (!existsSync(file)) return null
  let last = null
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue
    try { const r = JSON.parse(line); if (r?.item === item) last = r } catch { /* a broken line is skipped */ }
  }
  return last
}
