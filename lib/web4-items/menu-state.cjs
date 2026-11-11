// СОСТАВ МЕНЮ С СОСТОЯНИЕМ ЭЛЕМЕНТОВ — МГНОВЕННО (узел, шаг 722-1). Слово владельца 2026-11-11: «если мы говорим о том что у нас есть
// 1000 элементов … нужно показывать … текущее состояние спит или активная? … они должны быть готовы максимально мгновенно чтобы меню
// отрисовывать молниеносно»; «активный — процесс работает».
//
// 🔒 ОДНО ЧТЕНИЕ РЕЕСТРА И ЧЕРНОВИКОВ, НИ ОДНОГО ПРОЦЕССА И НИ ОДНОЙ МОДЕЛИ. Состояние — признак записи реестра (`element-power.cjs`):
//   running — признака выключения нет: процесс узла держит его запущенным;
//   asleep  — `off.byRule`: уложило правило нагрузки (663-3), проснётся само по вызову или перед записью календаря;
//   off     — `off` без `byRule`: выключил человек;
//   draft   — черновик, ещё не родился (записи в реестре нет).
// 🛑 СКАЗАНО ВСЛУХ: «running» — это «узел держит процесс запущенным», а не опрос процесса. Упавший процесс поднимает сторож здоровья;
// живой опрос тысячи процессов стоил бы секунды на каждую отрисовку.
// 🔒 ИМЯ — то же правило, что у меню (678-1): имя ядра `data/services/<id>/name.json` → `name` паспорта, если это не id и не адрес →
// адрес. Паспорт читается только у элемента без имени ядра — одним файлом, без визитки и контракта (`readElementProps` читает пять).
// Порядок — как в левом меню: root первым, затем черновики от новых к старым.
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const power = require('./element-power.cjs')
const nameFile = require('./name-file.cjs')

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return null } }

function addressOf(id, root) {
  const a = readJson(path.join(root, 'data', 'services', id, 'address.json'))?.address
  return typeof a === 'string' && LABEL.test(a) ? a : id
}

function passportOf(id, address, kind, root) {
  const base = path.join(root, 'WEB4-ITEMS', kind === 'user' ? 'user' : 'core')
  for (const dir of address !== id ? [address, id] : [id]) {
    const p = readJson(path.join(base, dir, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json'))
    if (p) return p
  }
  return null
}

/** Состояние записи реестра (нет записи — черновик). */
function stateOf(entry) {
  if (!entry) return 'draft'
  const off = power.offOf(entry)
  return off ? (off.byRule ? 'asleep' : 'off') : 'running'
}

/** Строки реестра и черновиков в порядке меню — только состояние, без имён: одно чтение двух файлов. */
function menuRows(root) {
  const registry = readJson(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'))?.services ?? []
  const byId = new Map(registry.map((s) => [s.id, s]))
  const drafts = (readJson(path.join(root, 'data', 'web4-drafts.json'))?.drafts ?? [])
    .filter((d) => typeof d?.id === 'string' && typeof d?.createdAt === 'string')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const rows = [...(byId.has('root') ? [{ id: 'root', native: false }] : []), ...drafts.map((d) => ({ id: d.id, native: d.native === true }))]
  return rows.map(({ id, native }) => {
    const entry = byId.get(id)
    return { id, kind: entry?.kind, native: native || entry?.kind === 'core', state: stateOf(entry) }
  })
}

/** Имя и адрес одной строки (три маленьких файла — поэтому только для тех, кого показывают или ищут). */
function named(r, root, { description = false } = {}) {
  const address = addressOf(r.id, root)
  const own = nameFile.ownName(r.id, root)
  const passport = !own || description ? passportOf(r.id, address, r.kind, root) : null
  const pname = typeof passport?.name === 'string' ? passport.name : null
  const name = own ?? nameFile.displayName(r.id, { root, passportName: pname, address })
  const text = description && typeof passport?.shortDescription === 'string' ? passport.shortDescription.slice(0, 200) : undefined
  return { id: r.id, address, name, native: r.native, state: r.state, ...(text ? { description: text } : {}) }
}

/**
 * 722-2: порция меню — `{ rows, total, next }`. `from`/`limit` — порция (по 12, слово владельца); `active` — только работающие
 * (переключатель архитектора); `custom` — только кастомные; `withRoot: false` — без root (у меню он своей строкой); `q` — совпадение в названии (имена тогда читаются у всех — это нажатие
 * кнопки «Найти», не отрисовка). `match(name, q)` — сравнение; по умолчанию без регистра. `description` — короткое описание паспорта
 * у строк порции (карточки верхнего меню).
 * У root без своего имени `name` — его id: подпись на языке человека даёт обёртка ядра (`elementLabel`).
 */
function menuPage(root = process.cwd(), { from = 0, limit = 12, active = false, custom = true, withRoot = true, q = '', match, description = false } = {}) {
  let rows = menuRows(root).filter((r) => (!custom || !r.native) && (withRoot || r.id !== 'root') && (!active || r.state === 'running'))
  const needle = String(q ?? '').trim().toLocaleLowerCase()
  if (needle) {
    const hit = match ?? ((name, n) => name.toLocaleLowerCase().includes(n))
    const all = rows.map((r) => named(r, root)).filter((r) => hit(r.name, needle) || r.address.includes(needle))
    return { rows: all.slice(from, from + limit), total: all.length, next: from + limit < all.length ? from + limit : null }
  }
  const slice = rows.slice(from, from + limit).map((r) => named(r, root, { description }))
  return { rows: slice, total: rows.length, next: from + limit < rows.length ? from + limit : null }
}

/** Все элементы с именами (для статического списка сборки, 722-5). */
function menuElements(root = process.cwd()) {
  return menuRows(root).map((r) => named(r, root))
}

module.exports = { menuRows, menuPage, menuElements, stateOf }
