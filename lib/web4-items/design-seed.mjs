// ТЕМА ПРОЕКТА — В «ДИЗАЙН» С РОЖДЕНИЯ УЗЛА (шаг 668).
//
// ✗ Измерено 2026-11-06 на узле владельца: после первого обновления все 13 элементов стали чёрно-белыми, ядро осталось голубым. Элемент
// «Дизайн» хранит только решения владельца (`data/settings/design.json`), а установщик его ни разу не засеял — посев «тема = тема сайта»
// (`scripts/seed-from-site.mjs` элемента, шаг 299-2) никто не звал. Элемент, спросив «Дизайн» (`lib/design-follow.ts`, при старте и при
// прогреве новой сборки), по своему правилу убирает из своего файла ветки, которых владелец «не решал», — и голубая тема шаблона
// стиралась до `{}`. Владелец: «как только проект встал у него была выбрана голубая тема после последнего обновления проект стал
// чёрно-белый почему это произошло мы что-то сломали? Если я изменю тему она сохранится? Исследуй».
//
// Что делает: у «Дизайна» нет `design.json` — засеять его темой проекта: у сайта (root), а если там пусто — у ядра (ядро не берёт пустое
// оформление сайта и держит последнее настоящее, `scripts/sync-site-design.mjs`). Сразу после посева — вернуть эту тему файлам элементов,
// у которых ни одной решённой ветки не осталось. Решения владельца не трогаются никогда: есть `design.json` — ничего не делается.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const BRANCHES = ['colors', 'fonts', 'type', 'shape', 'blocks']
const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
/** Есть ли в значении хоть один лист — `{ light: {}, dark: {} }` решением не считается. */
const decided = (v) => (isObj(v) ? Object.values(v).some(decided) : v !== undefined && v !== null && v !== '')
const readJson = (f) => { try { const v = JSON.parse(readFileSync(f, 'utf8')); return isObj(v) ? v : null } catch { return null } }
const branchesOf = (v) => Object.fromEntries(BRANCHES.filter((b) => decided(v?.[b])).map((b) => [b, v[b]]))
function writeAtomic(file, value) {
  mkdirSync(dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', 'utf8')
  renameSync(tmp, file)
}

/** Папка хранилища «Дизайна»: его `SETTINGS_DATA_DIR` из `.env.local`, иначе `data/settings` элемента. */
function storeDir(dir) {
  try {
    const m = readFileSync(join(dir, '.env.local'), 'utf8').match(/^SETTINGS_DATA_DIR=(.+)$/m)
    if (m && m[1].trim()) return m[1].trim()
  } catch { /* файла окружения нет */ }
  return join(dir, 'data', 'settings')
}

/**
 * @param {{ coreRoot: string, services: { id: string }[], dirOf: (entry: object) => string, say?: (s: string) => void }} o
 * @returns {{ seeded: false, why: string } | { seeded: true, from: string, branches: string[], healed: string[] }}
 */
export function seedProjectDesign({ coreRoot, services, dirOf, say = () => {} }) {
  const design = services.find((s) => s.id === 'design')
  if (!design) return { seeded: false, why: 'no-design-element' }
  const ddir = dirOf(design)
  if (!existsSync(ddir)) return { seeded: false, why: 'design-not-installed' }
  const store = join(storeDir(ddir), 'design.json')
  if (existsSync(store)) return { seeded: false, why: 'owner-decisions-kept' }
  const site = services.find((s) => s.id === 'root')
  const sources = [
    ...(site ? [['сайт', join(dirOf(site), 'DESIGN-CONFIG', 'design-config.json')]] : []),
    ['ядро', join(coreRoot, 'DESIGN-CONFIG', 'design-config.json')],
  ]
  let picked = null
  for (const [name, file] of sources) {
    const v = branchesOf(readJson(file))
    if (Object.keys(v).length) { picked = { name, value: v }; break }
  }
  if (!picked) return { seeded: false, why: 'no-project-theme' }
  writeAtomic(store, picked.value)
  say(`  оформление: «Дизайн» засеян темой проекта (взята: ${picked.name}; ветки ${Object.keys(picked.value).join(', ')})`)
  const healed = []
  for (const s of services) {
    const file = join(dirOf(s), 'DESIGN-CONFIG', 'design-config.json')
    const cur = readJson(file)
    if (!cur || Object.keys(branchesOf(cur)).length) continue
    writeAtomic(file, { ...cur, ...picked.value })
    healed.push(s.id)
  }
  if (healed.length) say(`  оформление: тема проекта возвращена элементам, у которых её стёрло: ${healed.join(', ')}`)
  return { seeded: true, from: picked.name, branches: Object.keys(picked.value), healed }
}
