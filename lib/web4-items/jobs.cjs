// ПОРУЧЕНИЯ ГЛАВНОГО АГЕНТА РАБОЧЕМУ ПРОЦЕССУ ЭЛЕМЕНТА (узел, шаг 670-2).
//
// Владелец 2026-11-07: «i2i we can use just now». `npm run task -- <id> --work` будит рабочий процесс элемента (сессия `<id>--work`,
// 552-4). Его «закончил» закрывает сессию сам и до 670-2 никого не будил: отчёт лежал в `reply-core`, а главный агент о нём не знал
// (✗ найдено чтением 2026-11-07: `lib/agent-kit/mount.cjs` будил главного агента только на «закончил» строителя под надзором).
// 🔒 Событие, не таймер: запись `data/node/jobs-by-main.json` (данные узла, вне git) ставит `task --work`; «закончил» этой сессии
// (`mount.cjs`) забирает её ОДИН раз и будит главного агента текстом `wakeText`. Запись старше суток не будит никого — человек мог
// отказать в Telegram («Не сейчас»), и поздний чужой «закончил» той же сессии не должен поднимать старое поручение.
// 🔒 Только агенты говорят с агентами: текст — главному агенту узла (оркестратору), не человеку и не соседу.

const { mkdirSync, readFileSync, writeFileSync } = require('node:fs')
const path = require('node:path')

const DAY_MS = 24 * 60 * 60 * 1000

function file(root) { return path.join(root || process.cwd(), 'data', 'node', 'jobs-by-main.json') }

function read(root) {
  try {
    const j = JSON.parse(readFileSync(file(root), 'utf8'))
    return j && typeof j === 'object' && !Array.isArray(j) ? j : {}
  } catch { return {} }
}

function write(root, j) {
  const f = file(root)
  mkdirSync(path.dirname(f), { recursive: true })
  writeFileSync(f, JSON.stringify(j, null, 2) + '\n', 'utf8')
}

/** Поставить запись поручения сессии `key` (`<id>--work` или `<id>` у элемента без групп); `batch` — пачка, в которую она входит (681). */
function set(key, { about = '', skill = null, batch = null } = {}, root) {
  const j = read(root)
  j[key] = { at: new Date().toISOString(), about: String(about).slice(0, 300), ...(skill ? { skill } : {}), ...(batch ? { batch } : {}) }
  write(root, j)
}

// 681 (владелец 2026-11-07 о девяти одинаковых «отчёта нет»: «фатальная глупая ситуация которая сжигают огромное количество времени и
// наверно ещё и токенов»): ОДНО поручение нескольким элементам — ПАЧКА. Каждый «закончил» её участника только отмечается в
// `data/node/job-batches.json`; главного агента будит ПОСЛЕДНИЙ — одним текстом со строкой отчёта каждого. ✗ Замерено 2026-11-07 на узле
// владельца: девять рабочих процессов — девять пробуждений, девять ходов, девять сообщений человеку «отчёта нет».
function batchFile(root) { return path.join(root || process.cwd(), 'data', 'node', 'job-batches.json') }
function readBatches(root) {
  try {
    const j = JSON.parse(readFileSync(batchFile(root), 'utf8'))
    return j && typeof j === 'object' && !Array.isArray(j) ? j : {}
  } catch { return {} }
}
function writeBatches(root, j) {
  const f = batchFile(root)
  mkdirSync(path.dirname(f), { recursive: true })
  writeFileSync(f, JSON.stringify(j, null, 2) + '\n', 'utf8')
}

/** Открыть пачку для элементов `ids`; вернуть её имя. */
function openBatch(ids, { about = '', skill = null } = {}, root) {
  const b = readBatches(root)
  const name = `b${Date.now().toString(36)}`
  b[name] = { at: new Date().toISOString(), about: String(about).slice(0, 300), ...(skill ? { skill } : {}), ids: [...ids], done: {} }
  writeBatches(root, b)
  return name
}

/** Убрать элемент из пачки (его не удалось разбудить); пачка без участников исчезает. */
function dropFromBatch(name, id, root) {
  const b = readBatches(root)
  if (!b[name]) return
  b[name].ids = b[name].ids.filter((x) => x !== id)
  delete b[name].done[id]
  if (b[name].ids.length === 0) delete b[name]
  writeBatches(root, b)
}

/** Отчёт элемента для пачки: `reply-core` не раньше поручения — его строка, иначе «отчёта нет». */
function reportOf(id, since, root) {
  try {
    const r = JSON.parse(readFileSync(path.join(root || process.cwd(), 'data', 'services', id, 'core-report.json'), 'utf8'))
    if (r && typeof r.text === 'string' && r.text.trim() && Date.parse(r.at) >= Date.parse(since)) return r.text.trim().slice(0, 400)
  } catch { /* отчёта нет */ }
  return null
}

function nameOf(id, root) {
  try { return require('./name-file.cjs').displayName(id, { root: root || process.cwd() }) } catch { return id }
}

/** Что будит главного агента после «закончил» сессии `key` с записью `rec`: текст или `null` (пачка ещё не вся). */
function finish(key, rec, root) {
  if (!rec.batch) return wakeText(key, rec)
  const b = readBatches(root)
  const batch = b[rec.batch]
  if (!batch) return wakeText(key, rec)
  const id = String(key).replace(/--work$/, '')
  batch.done[id] = reportOf(id, rec.at, root) ?? ''
  const left = batch.ids.filter((x) => !(x in batch.done))
  if (left.length > 0) { writeBatches(root, b); return null }
  delete b[rec.batch]
  writeBatches(root, b)
  return batchText(batch, root)
}

/** Одно пробуждение на всю пачку: строка на элемент, одним сообщением человеку. */
function batchText(batch, root) {
  const rows = batch.ids.map((id) => `- ${nameOf(id, root)} (${id}): ${batch.done[id] ? `«${batch.done[id]}»` : 'отчёта нет'}`)
  const silent = batch.ids.filter((id) => !batch.done[id])
  return `Узел: рабочие процессы ${batch.ids.length} элементов закончили твоё поручение «${batch.about}»${batch.skill ? ` (навык ${batch.skill})` : ''} — пачка, одно пробуждение на всех:\n${rows.join('\n')}\nПередай человеку ОДНИМ сообщением итог по всем там, где он читает тебя (npm run person)${silent.length ? `; без отчёта ${silent.length} — проверь результат сам (npm run card -- <id> или глазами), один раз скажи, что подтвердилось, и спроси, повторить ли поручение им` : ''}. Поэлементно не отвечай.`
}

/** Забрать запись один раз: вернуть её (свежую) или `null`; запись удаляется в любом случае. */
function take(key, root) {
  const j = read(root)
  const rec = j[key]
  if (!rec) return null
  delete j[key]
  write(root, j)
  const at = Date.parse(rec.at)
  return Number.isFinite(at) && Date.now() - at <= DAY_MS ? rec : null
}

/** Что услышит главный агент, когда рабочий процесс элемента закончил его поручение. */
function wakeText(key, rec) {
  const id = String(key).replace(/--work$/, '')
  return `Узел: рабочий процесс элемента ${id} закончил твоё поручение «${rec.about}»${rec.skill ? ` (навык ${rec.skill})` : ''}. Его отчёт: npm run state -- ${id} («Report to you»). Передай результат человеку там, где он читает тебя (npm run person), назвав элемент; отчёта нет — так и скажи и спроси, повторить ли поручение.`
}

module.exports = { set, take, wakeText, file, openBatch, dropFromBatch, finish, batchText, batchFile }
