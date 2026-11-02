// ЭЛЕМЕНТ В СЕТИ WEB4 (узел, шаг 567-6). Владелец 2026-10-22: «Похожее решение связанные с подключением и отключением веб четыре внутри узла
// нужно реализовать похожим образом» (как включение элемента, 567). Признак — поле паспорта элемента `visibility`: `network` — в сети Web4 (его
// находят агенты других узлов, визитка A2A отвечает снаружи), `node` — только внутри узла. Его уже читают визитка и поиск соседей (406).
// Пишет узел — кнопкой «Настройки сайта», командой `npm run element:web4`, главным агентом после «да»; без коммита и сборки (рабочий
// процесс, как тариф первого контакта 528): файл паспорта висит незакоммиченным до следующего строительного коммита элемента.
// Вне сети меню элемента прячет «A2A: ваши заказы», «A2A: ваша работа» и «Отзывы» (выбор владельца «Только A2A и «Отзывы»»); данные не удаляются.
const fs = require('node:fs')
const path = require('node:path')
const paths = require('./paths.cjs')
const { PASSPORT, OLD } = require('./element-props.cjs')

function passportFile(dir) {
  for (const rel of [PASSPORT, OLD]) {
    const f = path.join(dir, rel)
    if (fs.existsSync(f)) return f
  }
  return null
}

function entryOf(id, root) {
  const reg = JSON.parse(fs.readFileSync(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8'))
  return (reg.services || []).find((s) => s.id === id) || null
}

/** `network` | `node` | null (нет паспорта или поля). */
function visibilityOf(id, root = process.cwd()) {
  try {
    const e = entryOf(id, root)
    const f = e && passportFile(paths.entryDir(e))
    const v = f ? JSON.parse(fs.readFileSync(f, 'utf8')).visibility : null
    return v === 'network' || v === 'node' ? v : null
  } catch {
    return null
  }
}

/** Записать `visibility` в паспорт элемента, сохранив остальное и концы строк. Возвращает прежнее значение. */
function setVisibility(id, value, root = process.cwd()) {
  if (value !== 'network' && value !== 'node') throw new Error('visibility must be network or node')
  const e = entryOf(id, root)
  if (!e) throw new Error(`unknown-element:${id}`)
  const f = passportFile(paths.entryDir(e))
  if (!f) throw new Error(`no-passport:${id}`)
  const raw = fs.readFileSync(f, 'utf8')
  const nl = raw.includes('\r\n') ? '\r\n' : '\n'
  const p = JSON.parse(raw)
  const before = p.visibility ?? null
  p.visibility = value
  const tmp = `${f}.${process.pid}.tmp`
  fs.writeFileSync(tmp, (JSON.stringify(p, null, 2) + '\n').replace(/\n/g, nl), 'utf8')
  fs.renameSync(tmp, f)
  return before
}

module.exports = { visibilityOf, setVisibility }
