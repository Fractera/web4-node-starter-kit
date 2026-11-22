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
// The address — FRACTERA_MARKET_URL, else https://fractera.ai. Until Fractera's side answers in this shape (its endpoint is built by the
// agent of Fractera's own site), the rung answers a SIMULATION marked `mode: "simulation"` — said to the person exactly so, never as an offer.
// Every search is one line in the node's data journal (no personal data: the words of the task and the mode).

import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export const MARKET_V = 1
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

/** The stand-in answer while Fractera's side is not live: two or three public pages of the marketplace, marked a simulation. */
export function simulatedMarket(query, lang = 'en', base = 'https://fractera.ai') {
  const ru = lang === 'ru'
  const q = clean(query, 300)
  const page = (slug) => `${base.replace(/\/+$/, '')}/marketplace/${slug}`
  return {
    v: MARKET_V,
    mode: 'simulation',
    summary: ru
      ? `Маркетплейс Fractera пока имитируется: это пример ответа на «${q}». Живые элементы появятся здесь, когда авторы выложат их.`
      : `The Fractera marketplace is simulated for now: an example answer to «${q}». Live elements appear here once their makers publish them.`,
    items: [
      { title: ru ? 'Пример: нативный элемент' : 'Example: a native element', summary: ru ? 'Общее решение, которым пользуются все элементы узла.' : 'A shared solution every element of a node uses.', url: page('example-native'), kind: 'native', price: null },
      { title: ru ? 'Пример: готовый элемент' : 'Example: a ready element', summary: ru ? 'Готовый элемент другого автора, ставится целиком (f2f).' : 'A ready element by another maker, installed whole (f2f).', url: page('example-custom'), kind: 'custom', price: { amount: 49, currency: 'USD', per: 'once' } },
    ],
  }
}

/** Ask the marketplace; anything but a v1 answer → the marked simulation. */
export async function marketSearch(query, { lang = 'en', base = process.env.FRACTERA_MARKET_URL || 'https://fractera.ai', dataDir = '', timeoutMs = 8000 } = {}) {
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
