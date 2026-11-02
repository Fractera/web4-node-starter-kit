// ТИП УЗЛА — ЕДИНЫЙ ПРОЕКТ ИЛИ ЗАВОД ПРИЛОЖЕНИЙ (553-1).
//
// 🎯 Слово владельца 2026-10-21: «эти два вектора должны сохраняться в каком-то общем Джейсон файл то есть самый который
// аккумулирует у нас знание о всех элементах». Отсюда место — поле верхнего уровня `nodeType` реестра
// `WEB4-ITEMS-REGISTRY/web4-items.json`:
//   - `project` — «Единый проект»: один хозяин, все элементы под CONFIG ядра (одна шапка и один подвал);
//   - `factory` — «Завод приложений»: ядро — хостинг проектов разных хозяев; новые кастомные элементы рождаются самостоятельными.
// Нет поля — `project` (владелец: «for default need Тип 1 — «Единый проект»»).
//
// 🔒 ТИП ЗАДАЁТ ТОЛЬКО ОБЛИК НОВЫХ КАСТОМНЫХ ЭЛЕМЕНТОВ. Существующие сами не переключаются: отключение CONFIG у чужого сайта меняет
// его шапку, подвал, языки и страницы политик — это решение по каждому сайту. `mismatches` называет их, переключает человек.
// 🔒 Меняет тип только человек (команда `npm run node-type -- set`, дверь ядра) — агент по своей инициативе не меняет.
// Файл без зависимостей: его читают скрипты узла (`item-birth.mjs`, `main-agent-cli.mjs`) и сервер ядра.

const fs = require('node:fs')
const path = require('node:path')

const TYPES = ['project', 'factory']

const registryFile = (root) => path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json')

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

/** Тип узла: `project` | `factory`. Нет файла, нет поля или чужое значение — `project`. */
function readNodeType(root = process.cwd()) {
  const t = readJson(registryFile(root), null)?.nodeType
  return TYPES.includes(t) ? t : 'project'
}

/** Записать тип. Порядок ключей `{ _, nodeType, ...остальные }`, перевод строки файла сохраняется, запись атомарная. */
function writeNodeType(type, root = process.cwd()) {
  if (!TYPES.includes(type)) throw new Error('bad-type')
  const file = registryFile(root)
  const raw = fs.readFileSync(file, 'utf8')
  const nl = raw.includes('\r\n') ? '\r\n' : '\n'
  const { _: comment, nodeType: _old, ...rest } = JSON.parse(raw)
  const next = comment === undefined ? { nodeType: type, ...rest } : { _: comment, nodeType: type, ...rest }
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, (JSON.stringify(next, null, 2) + '\n').replace(/\n/g, nl), 'utf8')
  fs.renameSync(tmp, file)
  return type
}

/** Облик рождения КАСТОМНОГО элемента по типу узла. Нативный и платёжный служат узлу — «как проект» всегда (553 D2). */
function birthLook({ native = false, payment = false } = {}, root = process.cwd()) {
  if (native || payment) return 'project'
  return readNodeType(root) === 'factory' ? 'own' : 'project'
}

/** Рождённые кастомные (не платёжные) элементы, чья связь с CONFIG не совпадает с умолчанием типа: `[{ id, address, config }]`. */
function mismatches(type = readNodeType(process.cwd()), root = process.cwd()) {
  const want = type !== 'factory'
  const out = []
  for (const s of readJson(registryFile(root), { services: [] }).services ?? []) {
    if (!s || s.kind !== 'user' || !s.born) continue
    const data = path.join(root, 'data', 'services', s.id)
    const address = readJson(path.join(data, 'address.json'), null)?.address ?? s.id
    // Папка — по адресу, если перенесена (343), иначе по id; паспорт — папкой (417) или прежним файлом в корне.
    const byAddress = path.join(root, 'WEB4-ITEMS', 'user', address)
    const dir = fs.existsSync(byAddress) ? byAddress : path.join(root, 'WEB4-ITEMS', 'user', s.id)
    const props = readJson(path.join(dir, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json'), null) ?? readJson(path.join(dir, 'OWN-SERVICE-PROPS.json'), {})
    // Нативный и платёжный (551-5, паспорт `payment`) служат узлу — «как проект» при любом типе, переключать их не советуем.
    if (props?.elementType === 'native' || props?.payment) continue
    const config = readJson(path.join(data, 'links.json'), {})?.config !== false
    if (config !== want) out.push({ id: s.id, address, config })
  }
  return out
}

/** 553-6: рождённые элементы со своим кошельком (`data/services/<id>/wallet/wallet.json`). На едином проекте кошелёк один — их
 *  называют человеку; ключи узел не стирает никогда. */
function ownWallets(root = process.cwd()) {
  return (readJson(registryFile(root), { services: [] }).services ?? [])
    .filter((s) => s && s.born && fs.existsSync(path.join(root, 'data', 'services', s.id, 'wallet', 'wallet.json')))
    .map((s) => s.id)
}

module.exports = { TYPES, readNodeType, writeNodeType, birthLook, mismatches, ownWallets }
