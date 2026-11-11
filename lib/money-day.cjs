// THE DAY'S MONEY — balances, the day's burn and a daily budget (step 726-4). Two questions of the owner, 2026-11-11, verbatim:
// «текущая состояние то есть активно или неактивно – хватит на сегодня оплаченных ресурсов или текущие сессию».
//
// 🔒 WHAT A PROVIDER TELLS IS MEASURED AT ITS PRIMARY SOURCE, never from memory (read 2026-11-12):
//   OpenAI — the API has NO balance endpoint. The organization's spend per day (USD) is `GET /v1/organization/costs`, and only with an
//     Admin key (`OPENAI_ADMIN_KEY`), not the project key the node calls models with
//     (developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/usage/methods/costs).
//   Exa — the remaining prepaid balance in USD is `GET https://admin-api.exa.ai/team-management/credits` with a SERVICE key
//     (`EXA_SERVICE_KEY`); the Team Management API is enabled per team on request to support@exa.ai; the balance may lag 5 minutes
//     (exa.ai/docs/reference/team-management/get-team-credits.md).
//   Any other provider — «the node does not know how it tells»; a new one joins by a measured entry in PROBES.
// 🔒 THE BURN IS COUNTED, NOT GUESSED: from the ledger of paid calls (`lib/usage-ledger.cjs`) in CALLS — the node knows no price table,
//   and a price from memory would be a lie. No lines → «no spend», never a projection.
// 🔒 A POLL ONLY ON REQUEST (the page's button, `npm run money -- --balances`): a few HTTP calls, no model, free at both providers.
//   No timer — none was ordered.
// 🔒 A KEY NEVER LEAVES: the probe receives a getter of values, answers a number or a reason.
//
// CommonJS like the ledger: `npm run money` and the fixture test read it with plain `node`.

const { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } = require('node:fs')
const path = require('node:path')
const { readOpenAiResponse, readOpenAiException } = require('./openai-error.cjs')
const { recordOk, recordRefusal } = require('./usage-ledger.cjs')

const HOUR = 3_600_000

/** What each provider tells about its money — measured, with the source. */
const PROBES = {
  openai: {
    balance: false,
    spendKey: 'OPENAI_ADMIN_KEY',
    source: 'https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/usage/methods/costs',
    billing: 'https://platform.openai.com/settings/organization/billing/overview',
  },
  exa: {
    balance: true,
    balanceKey: 'EXA_SERVICE_KEY',
    source: 'https://exa.ai/docs/reference/team-management/get-team-credits.md',
    billing: 'https://dashboard.exa.ai/billing',
  },
}

const startOfDay = (now) => { const d = new Date(now); d.setUTCHours(0, 0, 0, 0); return d.getTime() }

/**
 * The burn of one service today (UTC) against a daily budget in calls.
 * @param {{ at: string, ok?: boolean, reason?: string }[]} lines — today's ledger lines of this service, any order
 * @param {{ budget?: number | null, now?: number }} [opts]
 * @returns {{ state: 'no-spend' | 'no-budget' | 'within' | 'will-cross' | 'crossed' | 'refusing', calls: number, perHour: number,
 *   projected: number, budget: number | null, at: string | null }}
 */
function dayBurn(lines, opts = {}) {
  const now = opts.now ?? Date.now()
  const budget = Number.isFinite(opts.budget) && opts.budget > 0 ? Math.floor(opts.budget) : null
  const day0 = startOfDay(now)
  const today = lines.filter((l) => l && l.at && Date.parse(l.at) >= day0 && Date.parse(l.at) <= now).sort((a, b) => (a.at < b.at ? -1 : 1))
  const calls = today.length
  if (!calls) return { state: 'no-spend', calls: 0, perHour: 0, projected: 0, budget, at: null }
  const hours = Math.max(1, (now - day0) / HOUR)
  const perHour = calls / hours
  const projected = Math.round(perHour * 24)
  const last = today[calls - 1]
  // The provider already refuses for money: no projection says more than that.
  if (last.ok === false && last.reason === 'no-funds') return { state: 'refusing', calls, perHour, projected, budget, at: last.at }
  if (!budget) return { state: 'no-budget', calls, perHour, projected, budget, at: null }
  if (calls >= budget) return { state: 'crossed', calls, perHour, projected, budget, at: today[budget - 1].at }
  if (projected <= budget) return { state: 'within', calls, perHour, projected, budget, at: null }
  return { state: 'will-cross', calls, perHour, projected, budget, at: new Date(day0 + (budget / perHour) * HOUR).toISOString() }
}

/**
 * Ask a provider what it tells about money, on request only.
 * @param {string} service
 * @param {(name: string) => string} keyOf — returns the value of a variable or ''; the value never leaves this function
 * @param {{ fetch?: typeof fetch, now?: number }} [opts]
 * @returns {Promise<{ state: 'balance', usd: number, at: string } | { state: 'spent-today', usd: number }
 *   | { state: 'not-told' | 'needs-key' | 'unknown' | 'failed', key?: string, status?: number }>}
 */
async function probe(service, keyOf, opts = {}) {
  const p = PROBES[service]
  const go = opts.fetch ?? fetch
  if (!p) return { state: 'unknown' }
  try {
    if (p.balance) {
      const key = keyOf(p.balanceKey)
      if (!key) return { state: 'needs-key', key: p.balanceKey }
      const r = await go('https://admin-api.exa.ai/team-management/credits', { headers: { 'x-api-key': key }, signal: AbortSignal.timeout(10_000) })
      if (!r.ok) return { state: 'failed', status: r.status }
      const d = await r.json()
      return typeof d.credits_usd === 'number' ? { state: 'balance', usd: d.credits_usd, at: d.metadata?.generated_at ?? new Date().toISOString() } : { state: 'failed', status: r.status }
    }
    const key = keyOf(p.spendKey)
    if (!key) return { state: 'not-told', key: p.spendKey }
    return await openAiSpend(key, go, opts)
  } catch {
    return { state: 'failed' }
  }
}

// The day's spend of the OpenAI organization. A refusal is read by the node's ONE reader (726-0) and the call writes its ledger line
// (726-1) under the provider `openai-admin`: the admin endpoints are free, so they never count into OpenAI's burn of the day.
async function openAiSpend(key, go, opts) {
  const call = { who: 'money/balances', provider: 'openai-admin', endpoint: 'organization/costs', started: Date.now() }
  const start = Math.floor(startOfDay(opts.now ?? Date.now()) / 1000)
  try {
    const r = await go(`https://api.openai.com/v1/organization/costs?start_time=${start}&limit=1`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10_000) })
    if (!r.ok) {
      const info = await readOpenAiResponse(r)
      recordRefusal({ ...call, info }, opts.root)
      return { state: 'failed', status: r.status, reason: info.reason }
    }
    const d = await r.json()
    recordOk({ ...call, status: r.status }, opts.root)
    const usd = (d.data ?? []).flatMap((b) => b.results ?? []).reduce((s, x) => s + (Number(x?.amount?.value) || 0), 0)
    return { state: 'spent-today', usd: Math.round(usd * 100) / 100 }
  } catch (e) {
    const info = readOpenAiException(e)
    recordRefusal({ ...call, info }, opts.root)
    return { state: 'failed', reason: info.reason }
  }
}

// THE DAILY BUDGETS — `data/node/budgets.json` (outside git): `{ "<service>": { "calls": <n> } }`, set by the person on the page.
const budgetsFile = (root) => path.join(root || process.cwd(), 'data', 'node', 'budgets.json')

/** @returns {Record<string, { calls: number }>} */
function readBudgets(root) {
  try { const j = JSON.parse(readFileSync(budgetsFile(root), 'utf8')); return j && typeof j === 'object' ? j : {} } catch { return {} }
}

/** Set (calls > 0) or remove (0, null) the daily budget of one service; atomic. */
function writeBudget(service, calls, root) {
  const id = String(service || '').trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9._-]{0,63}$/.test(id)) return false
  const all = readBudgets(root)
  const n = Number(calls)
  if (Number.isFinite(n) && n > 0) all[id] = { calls: Math.min(1_000_000, Math.floor(n)) }
  else delete all[id]
  const f = budgetsFile(root)
  mkdirSync(path.dirname(f), { recursive: true })
  writeFileSync(`${f}.tmp`, `${JSON.stringify(all, null, 2)}\n`)
  renameSync(`${f}.tmp`, f)
  return true
}

/** A value from a `.env.local` (the core's), for scripts; the page passes its own reader. */
function envLocalReader(root) {
  const f = path.join(root || process.cwd(), '.env.local')
  const text = existsSync(f) ? readFileSync(f, 'utf8') : ''
  return (name) => process.env[name] || (new RegExp(`^${name}=(.*)$`, 'm').exec(text)?.[1] ?? '').trim().replace(/^["']|["']$/g, '')
}

/**
 * 726-5: what is RED today in the core's ledger, one line per service, or nothing — for the start of a session and `npm run where`.
 * Red = the provider refuses for money, the budget is reached, or the pace will not last the day. No model, no network.
 * @param {string} [root]
 * @param {(line: { service: string, state: string, calls: number, budget: number | null, at: string | null }) => string} [say]
 */
function redLines(root, say) {
  const { readDay } = require('./usage-ledger.cjs')
  const today = readDay(undefined, root)
  const budgets = readBudgets(root)
  const services = [...new Set(today.map((l) => l.provider).filter((p) => p && p !== 'openai-admin'))]
  const out = []
  for (const s of services) {
    const b = dayBurn(today.filter((l) => l.provider === s), { budget: budgets[s]?.calls ?? null })
    if (!['refusing', 'crossed', 'will-cross'].includes(b.state)) continue
    out.push(say ? say({ service: s, ...b }) : `${s}: ${b.state}${b.at ? ` ${b.at}` : ''} (${b.calls} calls today${b.budget ? ` of ${b.budget}` : ''})`)
  }
  return out
}

module.exports = { PROBES, dayBurn, probe, readBudgets, writeBudget, envLocalReader, startOfDay, redLines }
