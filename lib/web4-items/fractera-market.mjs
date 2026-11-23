// THE FRACTERA MARKETPLACE RUNG — SEARCH v1 (node step 841-2; the owner, Telegram 984/985, 2026-11-22: «стандартизировать API который будет
// отправлять в элемент Fractera запрос например: описание, а в ответ принимать короткое описание и ссылки на публичной странице … быстро
// поднять … ответ заглушку»; «в будущем просто будем наращивать готовые элементы»).
//
// 🔒 THE CONTRACT (fixed; the marketplace grows behind it, nodes never change):
//   request  POST <market>/api/marketplace/search  { v: 1, query: "<the person's words, ≤300>", lang: "ru"|"en" }
//            — the task only: no personal data, no composition of the node, no keys.
//   response { v: 1, mode: "live"|"simulation", summary: "<a short answer>",
//              items: [{ title, summary, url, kind: "native"|"custom", price: { amount, currency: "USD"|"USDC", per: "once"|"month" } | null }] }
//            — three things per element (the owner, Telegram 991: «описание, ссылка, цена»): what it does, its PUBLIC page on the
//            marketplace, its price (`null` — free); the procedure (buy, f2f) is agreed after the person read the page.
// The address — FRACTERA_MARKET_URL, else MARKET_BASE: the native element «f2f-marketplace» on Fractera's own server (the owner, Telegram
// 1089/1091, 2026-11-23: born there, its own address and certificate). Until Fractera's side answers in this shape (its endpoint is built by the
// agent of Fractera's own site), the rung answers a SIMULATION marked `mode: "simulation"` — said to the person exactly so, never as an offer.
// Every search is one line in the node's data journal (no personal data: the words of the task and the mode).

import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export const MARKET_V = 1
export const MARKET_BASE = 'https://f2f-marketplace.fractera.ai'
const clean = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n)

/** A price in the v1 shape — a non-negative amount in USD or USDC, once or per month; anything else is no price (free or unknown). */
export function priceOf(p) {
  if (!p || typeof p.amount !== 'number' || !Number.isFinite(p.amount) || p.amount < 0) return null
  if (p.currency !== 'USD' && p.currency !== 'USDC') return null
  return { amount: Math.round(p.amount * 100) / 100, currency: p.currency, per: p.per === 'month' ? 'month' : 'once' }
}

/** A price in words for the person: «$49 · разово», «12 USDC / мес», «бесплатно». */
export function priceText(p, lang = 'en') {
  const ru = lang === 'ru'
  if (!p) return ru ? 'бесплатно' : 'free'
  const sum = p.currency === 'USD' ? `$${p.amount}` : `${p.amount} USDC`
  return p.per === 'month' ? `${sum} / ${ru ? 'мес' : 'month'}` : `${sum} · ${ru ? 'разово' : 'once'}`
}

/** An answer of the marketplace in the v1 shape, or null when it is not one. */
export function marketAnswer(body) {
  if (!body || body.v !== MARKET_V || !Array.isArray(body.items) || typeof body.summary !== 'string') return null
  const items = body.items
    .filter((x) => x && typeof x.title === 'string' && typeof x.url === 'string' && /^https:\/\//.test(x.url))
    .slice(0, 8)
    .map((x) => ({ title: clean(x.title, 120), summary: clean(x.summary, 300), url: x.url.slice(0, 300), kind: x.kind === 'native' ? 'native' : 'custom', price: priceOf(x.price) }))
  return { v: MARKET_V, mode: body.mode === 'live' ? 'live' : 'simulation', summary: clean(body.summary, 600), items }
}

/**
 * The rung's own answer when the marketplace did not answer in the v1 shape (the owner, Telegram 1093, 2026-11-23: «справедливо честный
 * ответ пусть и отрицательный»): it says exactly that — no invented elements, no example pages (the marketplace itself answers «live»
 * with what its catalogue has, empty while it is empty). Marked `mode: "simulation"`: no live answer came. `base` is kept for callers.
 */
// eslint-disable-next-line no-unused-vars
export function simulatedMarket(query, lang = 'en', base = MARKET_BASE) {
  const q = clean(query, 300)
  return {
    v: MARKET_V,
    mode: 'simulation',
    summary: lang === 'ru'
      ? `Маркетплейс Fractera сейчас не ответил на «${q}» — предложить из него нечего; спросите позже.`
      : `The Fractera marketplace did not answer «${q}» just now — there is nothing to offer from it; ask again later.`,
    items: [],
  }
}

/** Ask the marketplace; anything but a v1 answer → the rung's honest «did not answer» (marked a simulation). */
export async function marketSearch(query, { lang = 'en', base = process.env.FRACTERA_MARKET_URL || MARKET_BASE, dataDir = '', timeoutMs = 8000 } = {}) {
  const q = clean(query, 300)
  let out = null
  let why = 'no answer'
  try {
    const r = await fetch(`${base.replace(/\/+$/, '')}/api/marketplace/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ v: MARKET_V, query: q, lang: lang === 'ru' ? 'ru' : 'en' }),
      signal: AbortSignal.timeout(timeoutMs),
    })
    const body = r.ok ? await r.json().catch(() => null) : null
    out = marketAnswer(body)
    why = out ? 'answered' : `${r.status} not a v1 answer`
  } catch (e) {
    why = String(e?.message ?? e).slice(0, 120)
  }
  const answer = out ?? { ...simulatedMarket(q, lang, base), why }
  if (dataDir) {
    try {
      mkdirSync(dataDir, { recursive: true })
      appendFileSync(join(dataDir, 'market-searches.jsonl'), JSON.stringify({ at: new Date().toISOString(), query: q, mode: answer.mode, found: answer.items.length }) + '\n')
    } catch { /* the journal is a convenience */ }
  }
  return answer
}
