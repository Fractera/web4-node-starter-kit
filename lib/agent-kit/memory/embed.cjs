// MEANING SEARCH (node step 595-8б): the diary's lines kept by the node's vector element in collections memory-<agent>, found by meaning in
// any language. The owner 2026-10-25, after «Миша должен / Мише должны»: «Векторы + проверка Haiku (Рекомендую)», and «русский язык был
// приведён в качестве примера любые другие языки могут работать с ещё более сильным отклонением» — a stemmer belongs to one language, a
// vector does not.
// 626-4: the core counts no vector. It sends TEXTS — a line to `POST /vectors { text }`, a question to `POST /vectors/search { query }` —
// and the vector element counts them through the node's own element `embeddings` (MiniLM-L12, 384, on this computer, no key). Nothing
// leaves the computer for a vector. 🪦 Until 626 the core counted them with its OpenAI key and sent each line to OpenAI.
// data/node/memory/vectors.json — the model, the size and which lines have a vector: `npm run memory -- vectors` adds the missing ones.
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { DIR } = require('./record.cjs')

const ROOT = path.join(__dirname, '..', '..', '..')
const LEDGER = path.join(DIR, 'vectors.json')

const readJson = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')) } catch { return fallback } }

function env() {
  const out = {}
  try {
    for (const line of fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch { /* no keys — no vectors */ }
  return out
}

/** The node's database element — the one door to the vector element (`/vectors/*`), as every consumer calls it. */
function dataUrl() {
  const reg = readJson(path.join(ROOT, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), {})
  const data = (reg.services ?? []).find((s) => s.id === 'data')
  return data?.port && !data.off ? `http://localhost:${data.port}` : null
}

/** A line's id, from its own fields: the same line always gets the same id, so «forget» finds its vector. */
const rowId = (r) => `m${crypto.createHash('sha1').update([r.agent, r.session, r.t, r.who, r.via, r.text].join('\u0000')).digest('hex').slice(0, 24)}`
const collectionOf = (agent) => `memory-${agent}`
const ledger = () => ({ ids: {}, ...readJson(LEDGER, {}) })
function saveLedger(l) {
  fs.mkdirSync(DIR, { recursive: true })
  fs.writeFileSync(`${LEDGER}.tmp`, JSON.stringify(l))
  fs.renameSync(`${LEDGER}.tmp`, LEDGER)
}

async function call(url, init, ms) {
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(ms) })
  const body = await r.json().catch(() => null)
  if (!r.ok) throw new Error(`${url.replace(/\/\/[^/]+/, '//…')} ${r.status} ${body?.error?.message ?? body?.error ?? ''}`.trim())
  return body
}

/**
 * What a vector is here: the vector element's model and size, ASKED EVERY TIME (a call on this computer) — ✗ 626-4: kept once in the
 * ledger, they never noticed a new model (OpenAI → the node's MiniLM), and the ledger went on saying lines had vectors in a store that
 * was set aside. When the element names another model, the ledger starts empty and `npm run memory -- vectors` counts every line again.
 */
async function kind(e = env(), base = dataUrl(), ms = 3000) {
  if (!base || !e.DATA_SECRET) throw new Error('no vector element or data key')
  const s = await call(`${base}/vectors/status`, { headers: { 'X-Data-Secret': e.DATA_SECRET } }, ms)
  if (!s?.model || !s?.dims) throw new Error('the vector element did not name its model')
  if (s.configured === false) throw new Error('the vector element cannot count vectors now (its embeddings element does not answer)')
  const l = ledger()
  if (l.model !== s.model || l.dims !== s.dims) saveLedger({ model: s.model, dims: s.dims, ids: {} })
  return { model: s.model, dims: s.dims }
}

/** Puts lines of the person and of the agents into the vector element as texts (the node's own texts are not searched by meaning). */
async function save(rows, { ms = 8000 } = {}) {
  const todo = rows.filter((r) => r && (r.who === 'person' || r.who === 'agent') && typeof r.text === 'string' && r.text.trim())
  if (!todo.length) return { saved: 0 }
  const e = env()
  const base = dataUrl()
  if (!base || !e.DATA_SECRET) throw new Error('no vector element or data key')
  await kind(e, base)
  const added = {}
  await Promise.all(todo.map(async (r) => {
    const id = rowId(r)
    await call(`${base}/vectors`, { method: 'POST', headers: { 'X-Data-Secret': e.DATA_SECRET, 'Content-Type': 'application/json' }, body: JSON.stringify({ id, collection: collectionOf(r.agent), text: r.text, refTable: 'memory', refId: id }) }, ms)
    added[id] = r.agent
  }))
  const fresh = ledger() // read again: another session may have written meanwhile
  saveLedger({ ...fresh, ids: { ...fresh.ids, ...added } })
  return { saved: todo.length }
}

/** The nearest lines to a text in the collections of these agents: [{ id, score }], best first. The question goes as text, a search per collection. */
async function search(text, agents, { k = 10, ms = 4000 } = {}) {
  const e = env()
  const base = dataUrl()
  if (!base || !e.DATA_SECRET) throw new Error('no vector element or data key')
  const started = Date.now()
  await kind(e, base, ms)
  const left = Math.max(500, ms - (Date.now() - started))
  const lists = await Promise.all(agents.map((a) => call(`${base}/vectors/search`, { method: 'POST', headers: { 'X-Data-Secret': e.DATA_SECRET, 'Content-Type': 'application/json' }, body: JSON.stringify({ collection: collectionOf(a), query: text, k }) }, left).then((b) => b?.results ?? [])))
  return lists.flat().map((x) => ({ id: x.id, score: x.score })).sort((a, b) => b.score - a.score)
}

/**
 * Deletes the vectors of these line ids (forgetting): { gone, left }. A vector the element could not be asked about stays in the ledger
 * and is named — the text sits in the element's base too, so a forgotten line must not be reported gone while it is still there.
 */
async function forget(ids, { ms = 8000 } = {}) {
  if (!ids.length) return { gone: 0, left: 0 }
  const e = env()
  const base = dataUrl()
  if (!base || !e.DATA_SECRET) return { gone: 0, left: ids.length }
  const confirmed = []
  for (let i = 0; i < ids.length; i += 16) {
    const part = ids.slice(i, i + 16)
    const done = await Promise.all(part.map((id) => call(`${base}/vectors/${id}`, { method: 'DELETE', headers: { 'X-Data-Secret': e.DATA_SECRET } }, ms).then((b) => (b?.ok ? id : null)).catch(() => null)))
    confirmed.push(...done.filter(Boolean))
  }
  const l = ledger()
  for (const id of confirmed) delete l.ids[id]
  saveLedger(l)
  return { gone: confirmed.length, left: ids.length - confirmed.length }
}

// 603-2: env, dataUrl и call — тем же путём ищет по смыслу самоописание элементов (`lib/a2a/self-description.cjs`), второй копии доступа нет.
module.exports = { rowId, collectionOf, ledger, kind, save, search, forget, LEDGER, env, dataUrl, call }
