// THE NODE'S HELPFUL LINKS (step 726-6) — a checked list of services, each with what it is for, our honest verdict and its link, offered
// when a person is about to need a service of that kind. One file, `lib/helpful-links.json`, for every reader: the main agent (skill
// `helpful-links`, `npm run recommend`), every element through the core's door `GET /api/node/helpful-links` (its command
// `npm run recommend`). So an edit lives in one place and a node update brings it to every node and every element.
//
// The owner, 2026-11-12: «Реши как элементы будут действовать с получением реферальных ссылок ? Они спросят к ядра а тот возьмет а
// навыке? Тогда все обновления в одном месте, нет?»
//
// 🔒 A PARTNER LINK SAYS SO. `referral: true` adds the disclosure line next to the link — US FTC 16 CFR 255.5: a material connection,
// a monetary payment included, «must be disclosed clearly and conspicuously» (ecfr.gov, read 2026-11-12). A plain link carries none.
// 🔒 MERIT FIRST. A link is matched by the person's need (its `kind` or its words); a need no link fits gets nothing — never a link
// pushed against the need.
// 🔒 NO MODEL, NO NETWORK: the list is read from the file; a node without the core's door simply recommends nothing.
//
// CommonJS: the door (TypeScript), the scripts (.mjs) and the tests read the same module.

const LIST = require('./helpful-links.json')

const norm = (s) => String(s ?? '').toLowerCase().replace(/ё/g, 'е')

/** The links that fit a need: its `kind` named exactly, or one of its words starting a word of the person's phrase — the ending is
 *  free, because Russian and other languages inflect («на сервере» is «сервер»), the start is not («observer» is not «server»). */
function findLinks(query, list = LIST) {
  const q = norm(query).trim()
  if (!q) return []
  return (list.links ?? []).filter((l) => norm(l.kind) === q || (l.words ?? []).some((w) => {
    const word = norm(w)
    return word.length > 2 && new RegExp(`(^|[^\\p{L}\\p{N}])${word.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}`, 'u').test(q)
  }))
}

/** The disclosure in the person's language (English when the list has no such language); empty for a plain link. */
function disclosureOf(link, lang = 'en', list = LIST) {
  if (!link.referral) return ''
  const d = list.disclosure ?? {}
  return d[lang] ?? d[String(lang).slice(0, 2)] ?? d.en ?? ''
}

/** What a reader gets: the link's public fields and its disclosure — never the internal `words`. */
function present(link, lang = 'en', list = LIST) {
  return { id: link.id, kind: link.kind, name: link.name, url: link.url, for: link.for, verdict: link.verdict, referral: !!link.referral, disclosure: disclosureOf(link, lang, list) }
}

/** One line for an agent to retell in the person's words. */
function lineOf(p) {
  return `${p.name} — ${p.for} ${p.verdict} ${p.url}${p.disclosure ? ` (${p.disclosure})` : ''}`
}

module.exports = { LIST, findLinks, disclosureOf, present, lineOf }
