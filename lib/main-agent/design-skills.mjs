// НАВЫКИ ДИЗАЙНА ДЛЯ ВКЛАДКИ «СТРОИТЕЛЬСТВО → ДИЗАЙН» ЭЛЕМЕНТА (узел, шаг 711-1). Владелец 2026-11-09: «Мне нужен нормальный поиск …
// когда пользователь будут добавлять туда свои навыки или когда будет обновляться этот граф мне надо чтобы … появлялись новые навыки а
// не те которые ты щас хард кодом вытащишь».
// 🔒 СПИСКА НАВЫКОВ ЗДЕСЬ НЕТ И НЕ БУДЕТ. Каждый вызов — живой поиск тем же двигателем, что у `skills_find`: коллекция человека
// (`data/node/skills/own/`, первой), база узла в графе (`graph-query`), проверенный каталог Fractera (`data/node/skills-catalog`). Что
// человек сохранил словами боту («смотри, интересный навык») или что пришло с обновлением графа и каталога, появляется само.
// Слова запроса — человека; без них — запрос о дизайне облика страниц, который он может переписать.
import { findSkills } from '../agent-kit/skills/find.mjs'
import { findInCatalogFile } from '../agent-kit/skills/catalog-index.mjs'

export const DEFAULT_QUERY = 'design the look of web pages and interfaces: visual direction, typography, colour, layout, motion and polish'
const REPHRASINGS = [
  'build a distinctive visual style for a landing page or a site from a brief',
  'choose fonts, colours and spacing and write them as design tokens',
]

/** Один навык в ответе вкладки: метка, по которой его потом передают элементу, и то, что о нём знает источник. */
function fromCard(c, origin) {
  return {
    mark: String(c.id),
    name: String(c.skill ?? c.id),
    origin,
    source: String(c.source ?? ''),
    summary: String(c.summary ?? '').slice(0, 600),
    why: String(c.why ?? '').slice(0, 400),
    licence: c.licence ?? null,
    stars: typeof c.stars === 'number' ? c.stars : null,
    installs: typeof c.installs === 'number' ? c.installs : null,
    scripts: Array.isArray(c.scripts) ? c.scripts.length : 0,
    url: c.url ?? null,
  }
}

/**
 * Живой поиск навыков дизайна: { own, base, catalog, notes }. `own` — коллекция человека, `base` — база узла (граф), `catalog` —
 * проверенный каталог. Ни один источник не обязателен: молчит — пустой список и строка в `notes`.
 */
export async function searchDesignSkills(root, query) {
  const q = String(query ?? '').replace(/\s+/g, ' ').trim().slice(0, 300) || DEFAULT_QUERY
  const words = q.split(' ').filter((w) => w.length > 3).slice(0, 8)
  const [graph, catalog] = await Promise.all([
    // Слова человека уточняют поиск ДИЗАЙНА, а не заменяют его: его фраза — главная, цель вкладки — переформулировка рядом (так же
    // `skills_find` складывает фразу и переформулировки). Замерено 2026-11-09: одна русская фраза о портфолио без цели дала каталогу
    // «media-use, image-generation».
    findSkills(root, { query: q === DEFAULT_QUERY ? q : `${q}. ${DEFAULT_QUERY}`, terms: words, maxSkills: 40 }).catch((e) => ({ found: false, error: String(e?.message ?? e), fragments: [] })),
    findInCatalogFile(root, { query: q, rephrasings: q === DEFAULT_QUERY ? REPHRASINGS : [DEFAULT_QUERY, REPHRASINGS[0]], n: 30, ownN: 30 }).catch((e) => ({ ok: false, error: String(e?.message ?? e), found: [] })),
  ])
  const notes = []
  if (graph.error) notes.push(`graph: ${graph.error}`)
  if (graph.notice) notes.push(graph.notice)
  if (catalog.error) notes.push(`catalog: ${catalog.error}`)
  if (catalog.ownNote) notes.push(catalog.ownNote)
  const found = Array.isArray(catalog.found) ? catalog.found : []
  const own = found.filter((c) => c.own).map((c) => fromCard(c, 'own'))
  const cat = found.filter((c) => !c.own).map((c) => fromCard(c, 'catalog'))
  const base = (graph.fragments ?? []).map((f) => ({
    mark: String(f.mark ?? `skill:${f.source}:${f.skill}`),
    name: String(f.skill),
    origin: 'base',
    source: String(f.source ?? ''),
    summary: String(f.description || (f.sections ?? []).slice(0, 3).join(' · ')).slice(0, 600),
    why: '',
    licence: f.licence ?? null,
    stars: null,
    installs: null,
    scripts: 0,
    url: null,
  }))
  return { query: q, own, base, catalog: cat, notes }
}
