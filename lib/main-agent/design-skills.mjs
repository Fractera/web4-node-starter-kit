// НАВЫКИ ДИЗАЙНА ДЛЯ ВКЛАДКИ «СТРОИТЕЛЬСТВО → ДИЗАЙН» ЭЛЕМЕНТА (узел, шаг 711-1). Владелец 2026-11-09: «Мне нужен нормальный поиск …
// когда пользователь будут добавлять туда свои навыки или когда будет обновляться этот граф мне надо чтобы … появлялись новые навыки а
// не те которые ты щас хард кодом вытащишь».
// 🔒 СПИСКА НАВЫКОВ ЗДЕСЬ НЕТ И НЕ БУДЕТ. Каждый вызов — живой поиск тем же двигателем, что у `skills_find`: коллекция человека
// (`data/node/skills/own/`, первой), база узла в графе (`graph-query`), проверенный каталог Fractera (`data/node/skills-catalog`). Что
// человек сохранил словами боту («смотри, интересный навык») или что пришло с обновлением графа и каталога, появляется само.
// Слова запроса — человека; без них — запрос о дизайне облика страниц, который он может переписать.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { findSkills } from '../agent-kit/skills/find.mjs'
import { findInCatalogFile } from '../agent-kit/skills/catalog-index.mjs'

// 715-1 (владелец 2026-11-10: «прямо написать что Fractera на текущий момент имеет в своем хранилище икс навыков созданных сторонними
// разработчиками … в каждом навыке сделать ссылку на репозитории GitHub чтобы пользователи могли открыть и изучить этот навык название
// ничего не дает»). Библиотека без запроса — найденное по смыслу дизайна первым, затем раздел «Design & UI» проверенного каталога целиком
// (без карточек «не для узла») по установкам самого навыка: звёзды — у репозитория, и большой чужой репозиторий поднимал наверх навык не
// о дизайне (замерено 2026-11-10: первым шёл grill-with-docs). Число — размер этого списка, посчитанный из тех же файлов, а не в коде. Репозиторий: у каталога — `source` (владелец/репозиторий), у
// базы узла — `url` её манифеста; у своей коллекции — ссылка, если она есть.
const LIBRARY_SECTION = 'Design & UI'
const libraries = new Map()
function library(root) {
  if (libraries.has(root)) return libraries.get(root)
  const dir = join(root, 'lib', 'agent-kit', 'skills', 'catalog')
  let skip = new Set()
  try { skip = new Set((JSON.parse(readFileSync(join(dir, 'skip.json'), 'utf8')).skills ?? []).map((x) => String(x.id))) } catch { /* no short list */ }
  const list = []
  try {
    for (const line of readFileSync(join(dir, 'cards.jsonl'), 'utf8').split('\n')) {
      if (!line) continue
      const c = JSON.parse(line)
      if (c.subsection === LIBRARY_SECTION && !skip.has(String(c.id))) list.push(c)
    }
  } catch { /* the catalog is not on this node yet */ }
  list.sort((a, b) => (b.installs ?? -1) - (a.installs ?? -1) || (b.stars ?? -1) - (a.stars ?? -1))
  const out = list.map((c) => fromCard(c, 'catalog'))
  libraries.set(root, out)
  return out
}

let baseManifest = null
/** Репозиторий навыка на GitHub или `null`, когда его не знает ни карточка, ни манифест базы. */
export function githubOf(root, origin, source, name, url = null) {
  if (typeof url === 'string' && /^https:\/\/github\.com\//.test(url)) return url
  if (origin === 'catalog' && /^[\w.-]+\/[\w.-]+$/.test(String(source ?? ''))) return `https://github.com/${source}`
  if (origin === 'base') {
    try { baseManifest ??= JSON.parse(readFileSync(join(root, 'lib', 'agent-kit', 'skills', 'base', 'manifest.json'), 'utf8')).skills ?? [] } catch { baseManifest = [] }
    const hit = baseManifest.find((x) => x.source === source && x.skill === name)
    if (hit?.url) return String(hit.url)
  }
  return null
}

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
    github: githubOf(null, origin, c.source, c.skill ?? c.id, c.url),
  }
}

/**
 * Живой поиск навыков дизайна: { own, base, catalog, notes }. `own` — коллекция человека, `base` — база узла (граф), `catalog` —
 * проверенный каталог. Ни один источник не обязателен: молчит — пустой список и строка в `notes`.
 */
export async function searchDesignSkills(root, query) {
  const asked = String(query ?? '').replace(/\s+/g, ' ').trim().slice(0, 300)
  const q = asked || DEFAULT_QUERY
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
  const relevant = found.filter((c) => !c.own).map((c) => fromCard(c, 'catalog'))
  // Без слов человека — вся библиотека, подходящее по смыслу первым; со словами — поиск по смыслу, как прежде.
  const seen = new Set(relevant.map((c) => c.mark))
  const cat = asked ? relevant : [...relevant, ...library(root).filter((c) => !seen.has(c.mark))]
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
    github: githubOf(root, 'base', String(f.source ?? ''), String(f.skill)),
  }))
  return { query: asked, own, base, catalog: cat, library: asked ? null : cat.length + base.length, notes }
}
