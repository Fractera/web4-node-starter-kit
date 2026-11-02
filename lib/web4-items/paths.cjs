// ГДЕ ЛЕЖАТ ЭЛЕМЕНТЫ WEB4 И ИХ РЕЕСТР — ОДНО МЕСТО НА ВЕСЬ УЗЕЛ (272).
//
// 🎯 Слово владельца 2026-09-22: «можем заменить название микросервиса на WEB4-ITEMS, а внутри сделать две
// папки — встроенные (core) и пользовательские; а также MICROSERVICES.json положить в
// WEB4-ITEMS-REGISTRY/web4-items.json».
//
// 🔒 ПУТЬ СТРОИТСЯ ИЗ `kind` ЗАПИСИ РЕЕСТРА, А НЕ УГАДЫВАЕТСЯ ПО ИМЕНИ: `core` ставит узел, `user`
// подключает человек. Знание «где лежит элемент» живёт здесь ОДИН раз — его читают и сборка (`.ts`), и
// скрипты (`.mjs`), и диспетчер процессов (`ecosystem.config.cjs`).
// 🛑 ВТОРАЯ КОПИЯ ЭТОГО ЗНАНИЯ ЕСТЬ, И ОНА НАЗВАНА ВСЛУХ: `_agent-kit/server/workspace.cjs` комплекта
// агента. Копия комплекта обязана быть самодостаточной — она уезжает в папку службы целиком, — поэтому
// импортировать отсюда не может. Расхождение ловит `npm run check:agent-kits` через отпечаток мастера.
// 🪦 До 272: реестр `MICROSERVICES.json` в корне, папка `microservices/<id>` без деления на встроенные и
// пользовательские.

const path = require('node:path')

// 🛑 КОРЕНЬ — `process.cwd()`, как у всего узла: и сервер, и скрипты запускаются из корня проекта.
const ROOT = process.cwd()

/** Папка всех элементов узла. Целиком в `.gitignore`: у каждого элемента свой репозиторий. */
const ITEMS_DIR = path.join(ROOT, 'WEB4-ITEMS')

/** Реестр состава узла. */
const REGISTRY_FILE = path.join(ROOT, 'WEB4-ITEMS-REGISTRY', 'web4-items.json')

const KINDS = ['core', 'user']

// 343: ПАПКА СЛЕДУЕТ АДРЕСУ ЭЛЕМЕНТА (слово владельца 2026-09-30: «Папка = адрес»). Адрес — `data/services/<id>/address.json`
// (325-3); переименование переносит папку `WEB4-ITEMS/<kind>/<id>` → `<адрес>` (`scripts/element-move.mjs`). id остаётся внутри:
// процесс pm2, данные `data/services/<id>`, реестр. Папки по адресу ещё нет (перенос не прошёл или идёт) — папка по id: читатель
// находит элемент в любой момент переезда. Форма адреса — метка DNS, поэтому имя папки допустимо на любой ОС.
const fs = require('node:fs')
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
function addressOf(id) {
  try {
    const a = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'services', id, 'address.json'), 'utf8')).address
    return typeof a === 'string' && LABEL.test(a) ? a : null
  } catch {
    return null
  }
}

/** Папка одного элемента: `WEB4-ITEMS/<kind>/<адрес>`, если перенесена, иначе `<id>`. Неизвестный род — `core`, как у встроенных. */
function itemDir(id, kind) {
  const base = path.join(ITEMS_DIR, KINDS.includes(kind) ? kind : 'core')
  const a = addressOf(id)
  if (a && a !== id && fs.existsSync(path.join(base, a))) return path.join(base, a)
  return path.join(base, id)
}

/** Папка элемента по записи реестра. */
function entryDir(entry) {
  return itemDir(entry.id, entry.kind)
}

module.exports = { ITEMS_DIR, REGISTRY_FILE, KINDS, itemDir, entryDir, addressOf }
