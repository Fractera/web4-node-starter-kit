// ОФОРМЛЕНИЕ ЯДРА — ТО ЖЕ, ЧТО У САЙТА (шаг 285-1).
//
// Слово владельца 2026-09-24: «Ядро у меня имеет зелёную тему тёмную, корень у меня имеет голубую тему тёмную,
// презентационной страницы авторизации у меня имеет белую тему голубую. Что за калейдоскоп». Оформление —
// настройка САЙТА (закон направления потока, 280-6), а ядро читало свой отдельный файл и оставалось зелёным.
//
// 🔒 ПЕРЕД КАЖДОЙ СБОРКОЙ ЯДРО БЕРЁТ ОФОРМЛЕНИЕ ПРОЕКТА (с 734-3b — у поставщика `project-settings`, CONFIG) и кладёт его в
// `DESIGN-CONFIG/design-config.json`.
// Файл ядра — производная копия, у неё один писатель (этот скрипт); руками его не править.
// 🛑 Поставщик не ответил — файл остаётся прежним, и это ПЕЧАТАЕТСЯ: молчаливый откат уже стоил нам «калейдоскопа».
import { readFileSync, writeFileSync, renameSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const FILE = join(ROOT, 'DESIGN-CONFIG', 'design-config.json')

// 734-3b (владелец 2026-11-12: «ядро — особая сущность, все элементы равны»; выбор B): оформление проекта — у элемента, который даёт
// `project-settings` (CONFIG), его собственная дверь `/api/settings/design` ключом узла. ✗ До 734-3b ядро брало его у сайта root.
const { projectDesign } = await import('../lib/web4-items/project-settings-source.mjs')
const warn = (why) => {
  console.warn(`[sync-site-design] ${why} — ядро соберётся со своим прежним оформлением`)
  process.exit(0)
}

let registry = null
try { registry = JSON.parse(readFileSync(join(ROOT, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8')) } catch { warn('реестр узла не прочитан') }

let config = null
let from = ''
for (let attempt = 0; attempt < 3 && !config; attempt++) {
  const r = await projectDesign({ root: ROOT, registry })
  if (r.ok) { config = r.config; from = r.provider; break }
  if (r.reason === 'no-provider') warn('в реестре нет элемента, который даёт настройки проекта')
  if (r.reason === 'no-settings-key') warn('нет SETTINGS_SECRET')
  if (attempt === 2) warn(`«настройки проекта» не ответили (${r.reason})`)
  await new Promise((res) => setTimeout(res, 1000))
}

const next = JSON.stringify(config, null, 2) + '\n'
let prev = ''
try { prev = readFileSync(FILE, 'utf8') } catch { /* файла не было */ }

// 🛑 ПУСТОЙ ОТВЕТ НЕ ЗАТИРАЕТ НАСТРОЕННОЕ (2026-09-25). ✗ Измерено: в 01:21 сайт только что поднялся после
// простоя, дверь ответила `{ ok: true, config: {} }` (её читатель при ЛЮБОЙ ошибке чтения отдаёт `{}` —
// тот же ответ, что «владелец ещё ничего не настраивал»), скрипт записал `{}` поверх голубой палитры, и
// страницы архитектора собрались чёрно-белыми, пока остальные элементы оставались голубыми.
// Отличить «сбросили» от «не смогли прочитать» по пустому объекту нельзя, поэтому пустота сюда не проходит.
const hasColors = (c) => !!c && typeof c === 'object' && !!c.colors && Object.keys(c.colors).length > 0
let prevConfig = null
try { prevConfig = JSON.parse(prev) } catch { /* прежний файл пуст или битый */ }
if (!hasColors(config) && hasColors(prevConfig)) {
  console.warn(`[sync-site-design] ⚠ «${from}» отдал ПУСТОЕ оформление, а у ядра оно настроено — оставляю прежнее. Проверь его дверь /api/settings/design.`)
  process.exit(0)
}
if (prev.replace(/\r\n/g, '\n') === next) {
  console.log(`[sync-site-design] оформление ядра уже совпадает с оформлением проекта («${from}»)`)
} else {
  const tmp = `${FILE}.${process.pid}.tmp`
  writeFileSync(tmp, next, 'utf8')
  renameSync(tmp, FILE)
  console.log(`[sync-site-design] оформление ядра взято у оформления проекта («${from}»)`)
}
