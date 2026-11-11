// «ВСЕ ПОДПИСКИ» — the rows of the Dashboard page (step 726-3). One row per outside service the node pays for or declares: from every
// element's `OWN-SERVICE-PROPS/SUBSCRIPTIONS.json` and from every ledger of paid calls (`lib/usage-ledger.cjs` — the core's and each
// element's own `data/node/usage/`). A row says which elements use the service, whether their keys are set, the last call and the last
// refusal with the provider's own code.
//
// The owner, 2026-11-11, verbatim: «таблица которая существует внутри дашборд называется все подписки она указывает название сервиса и
// выпадающем списке показывают все элементы которые его вызывают».
//
// 🔒 PURE: no disk, no network, no clock. The caller (`lib/web4-items/subscriptions-board.ts`) reads the sources and hands them in, so the
// same function is proven over a fixture (`npm run test:subscriptions-board`) and answers the page and `npm run money` alike.
// 🔒 NO VALUE OF A KEY EVER ENTERS: a source carries only the NAMES of its set variables (`setNames` of `lib/env-file.ts`).
// 🔒 A SOURCE WITH NEITHER A DECLARED SERVICE NOR A PAID CALL GIVES NO ROW AND APPEARS IN NO DROPDOWN.
//
// CommonJS like the ledger: a plain `node` test reads it without a TypeScript step.

/** Providers the ledger names, with the words a person knows and the key the node reads for them (the core's, step 336-1). */
const KNOWN = {
  openai: { name: 'OpenAI', docs: 'https://platform.openai.com/usage', keys: ['OPENAI_API_KEY'] },
  // 726-4: the free admin query of the day's spend («Проверить балансы»), kept apart so it never counts into OpenAI's burn.
  'openai-admin': { name: 'OpenAI Admin API', docs: 'https://platform.openai.com/settings/organization/admin-keys', keys: ['OPENAI_ADMIN_KEY'] },
}

const norm = (s) => String(s || '').trim().toLowerCase()
const later = (a, b) => (!a ? b : !b ? a : (b.at > a.at ? b : a))

/**
 * @typedef {{ env: string }} Key
 * @typedef {{ id: string, name?: string, description?: string, docs?: string, keys?: Key[] }} Declared
 * @typedef {{ at: string, who?: string, provider?: string, ok?: boolean, reason?: string, code?: string, message?: string,
 *   tokensIn?: number, tokensOut?: number }} Line
 * @typedef {{ id: string, label: string, href?: string | null, subscriptions?: { example?: boolean, services?: Declared[] } | null,
 *   ledger?: Line[], setNames?: string[], usesCoreKey?: boolean }} Source
 */

/**
 * @param {Source[]} sources — the core first (id `core`), then the elements
 * @param {{ coreSetNames?: string[] }} [opts] — the core's set names: an element's OpenAI call goes on the core's key
 */
function boardRows(sources, opts = {}) {
  const coreSet = new Set(opts.coreSetNames || [])
  /** @type {Map<string, any>} */
  const rows = new Map()
  const rowOf = (id, seed) => {
    const k = norm(id)
    if (!rows.has(k)) {
      const known = KNOWN[k]
      rows.set(k, {
        service: k, name: (seed && seed.name) || (known && known.name) || id, description: (seed && seed.description) || null,
        docs: (seed && seed.docs) || (known && known.docs) || null, users: new Map(),
        calls: 0, refused: 0, tokensIn: 0, tokensOut: 0, lastCall: null, lastError: null,
      })
    }
    const r = rows.get(k)
    if (seed && seed.name && r.name === id) r.name = seed.name
    if (seed && seed.description && !r.description) r.description = seed.description
    if (seed && seed.docs && !r.docs) r.docs = seed.docs
    return r
  }
  const userOf = (row, src) => {
    if (!row.users.has(src.id)) {
      row.users.set(src.id, { id: src.id, label: src.label, href: null, declared: false, example: false, keys: null, calls: 0, refused: 0, consumers: new Set(), lastAt: null })
    }
    return row.users.get(src.id)
  }

  for (const src of sources) {
    const set = new Set(src.setNames || [])
    const subs = src.subscriptions
    for (const s of (subs && Array.isArray(subs.services) ? subs.services : [])) {
      if (!s || !s.id) continue
      const row = rowOf(s.id, s)
      const u = userOf(row, src)
      u.declared = true
      u.example = subs.example !== false
      u.href = src.href ? `${src.href}/${encodeURIComponent(s.id)}` : null
      const names = (s.keys || []).map((k) => k && k.env).filter(Boolean)
      u.keys = !names.length ? null : names.every((n) => set.has(n)) ? 'set' : names.some((n) => set.has(n)) ? 'partial' : 'missing'
    }
    for (const l of src.ledger || []) {
      if (!l || !l.provider) continue
      const row = rowOf(l.provider)
      const u = userOf(row, src)
      const known = KNOWN[row.service]
      if (u.keys === null && known) u.keys = known.keys.every((n) => set.has(n) || coreSet.has(n)) ? 'set' : 'missing'
      u.calls++; row.calls++
      if (l.who) u.consumers.add(l.who)
      if (!u.lastAt || l.at > u.lastAt) u.lastAt = l.at
      row.tokensIn += l.tokensIn || 0
      row.tokensOut += l.tokensOut || 0
      row.lastCall = later(row.lastCall, { at: l.at, ok: l.ok === true, element: src.id, label: src.label, who: l.who || null })
      if (l.ok !== true) {
        u.refused++; row.refused++
        row.lastError = later(row.lastError, { at: l.at, element: src.id, label: src.label, who: l.who || null, reason: l.reason || null, code: l.code || null, message: l.message || null })
      }
    }
  }

  return [...rows.values()]
    .map((r) => {
      const users = [...r.users.values()].map((u) => ({ ...u, consumers: [...u.consumers] }))
        .sort((a, b) => b.calls - a.calls || a.label.localeCompare(b.label))
      const states = users.map((u) => u.keys).filter(Boolean)
      const keys = !states.length ? null : states.every((s) => s === 'set') ? 'set' : states.every((s) => s === 'missing') ? 'missing' : 'partial'
      return { ...r, users, keys, example: users.every((u) => u.example && !u.calls) }
    })
    .sort((a, b) => Number(a.example) - Number(b.example) || b.calls - a.calls || a.name.localeCompare(b.name))
}

module.exports = { boardRows, KNOWN }
