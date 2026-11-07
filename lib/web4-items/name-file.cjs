// ИМЯ WEB4 ЭЛЕМЕНТА — ОДНО МЕСТО ЧТЕНИЯ И ЗАПИСИ (678-1). Слово владельца 2026-11-07: «каждый раз когда ты создаёшь новый элемент
// или меняешь его название левое меню обновлялось бы». Имя — для людей: левое меню, шапка «Кастомные элементы», уведомления, `card`.
// Порядок: имя ядра `data/services/<id>/name.json` (его пишет главный агент — `create --name`, `rename`) → `name` паспорта элемента,
// если это не id и не адрес → адрес элемента.
//
// 🔒 ИМЯ ЛЕЖИТ В ДАННЫХ ЯДРА, КАК АДРЕС (`address-file.mjs`): папку элемента ядро не правит (CLAUDE.md §6), а удаление элемента стирает
// `data/services/<id>` — имя уходит вместе с ним. Имя — не адрес: id и адрес (DNS-метка) не меняются от смены имени.
// ✗ Замерено 2026-11-07 на узле владельца: девять новых элементов в меню звались `Jfi92`, `Hairn` …; имя в паспорте записали 2 из 9
// агентов, а меню паспорт не читало вовсе.
// `.cjs` — читают и CommonJS (`self-description.cjs`), и скрипты `.mjs`, и TypeScript ядра.

const fs = require('node:fs')
const path = require('node:path')

const NAME_MAX = 60
const ID = /^[a-z0-9][a-z0-9-]{0,62}$/

const fileOf = (id, root) => path.join(root, 'data', 'services', id, 'name.json')
const clean = (s) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX) : '')

/** Имя, данное ядром; нет — null. */
function ownName(id, root = process.cwd()) {
  if (!ID.test(String(id))) return null
  try {
    return clean(JSON.parse(fs.readFileSync(fileOf(id, root), 'utf8')).name) || null
  } catch {
    return null
  }
}

/**
 * Имя для людей: имя ядра → имя паспорта (не id и не адрес) → адрес.
 * @param {string} id
 * @param {{ root?: string, passportName?: string | null, address?: string }} [opts]
 * @returns {string}
 */
function displayName(id, { root = process.cwd(), passportName = null, address = id } = {}) {
  const own = ownName(id, root)
  if (own) return own
  const p = clean(passportName)
  if (p && p.toLowerCase() !== String(id).toLowerCase() && p.toLowerCase() !== String(address).toLowerCase()) return p
  return address
}

/** Записать имя; пустое — снять (меню снова покажет паспорт или адрес). Возвращает записанное имя или null. */
function writeName(id, name, root = process.cwd()) {
  if (!ID.test(String(id))) throw new Error(`bad element id: ${id}`)
  const n = clean(name)
  const file = fileOf(id, root)
  if (!n) {
    fs.rmSync(file, { force: true })
    return null
  }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify({ name: n, at: new Date().toISOString() }, null, 2) + '\n', 'utf8')
  return n
}

module.exports = { ownName, displayName, writeName, NAME_MAX }
