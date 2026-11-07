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

/** Поставить запись поручения сессии `key` (`<id>--work` или `<id>` у элемента без групп). */
function set(key, { about = '', skill = null } = {}, root) {
  const j = read(root)
  j[key] = { at: new Date().toISOString(), about: String(about).slice(0, 300), ...(skill ? { skill } : {}) }
  write(root, j)
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

module.exports = { set, take, wakeText, file }
