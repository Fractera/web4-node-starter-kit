// ПЕРВАЯ СЕССИЯ РОЖДЁННОГО ЭЛЕМЕНТА ЗАКРЫВАЕТСЯ САМА (узел, шаг 682). Владелец 2026-11-08: «ты рождаешь их строго по одному сначала
// создаешь его, затем прописываешь его нормальное имя … прописываешь стартовые задания … Когда элемент создан ты закрываешь свой под шаг
// … Затем ты его выключаешь и после этого переходишь к созданию нового». ✗ Замерено 2026-11-07 (разбор экзамена, D8): чтобы выключать
// элемент после первой сессии, главный агент опрашивал `npm run state` каждые 20 с и искал строку шаблона — у узла не было события.
// 🔒 Событие, не таймер: `npm run create -- … --close-after-first-session` ставит запись `data/node/first-session-close.json`; «закончил»
// строителя этого элемента (`lib/agent-kit/mount.cjs`) забирает её ОДИН раз, закрывает его сессию и будит главного агента одной строкой.
// Запись старше суток не действует: человек мог сам вести элемент дальше.

const { mkdirSync, readFileSync, writeFileSync } = require('node:fs')
const path = require('node:path')

const DAY_MS = 24 * 60 * 60 * 1000

function file(root) { return path.join(root || process.cwd(), 'data', 'node', 'first-session-close.json') }

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

/** Отметить: первую сессию элемента `id` закрыть по её «закончил». */
function set(id, { name = '' } = {}, root) {
  const j = read(root)
  j[id] = { at: new Date().toISOString(), name: String(name).slice(0, 60) }
  write(root, j)
}

/** Забрать отметку один раз: свежая — вернуть, иначе `null`; удаляется в любом случае. */
function take(id, root) {
  const j = read(root)
  const rec = j[id]
  if (!rec) return null
  delete j[id]
  write(root, j)
  const at = Date.parse(rec.at)
  return Number.isFinite(at) && Date.now() - at <= DAY_MS ? rec : null
}

/** Что услышит главный агент: элемент выключен, можно рождать следующий. */
function wakeText(id, rec) {
  return `Узел: первая сессия рождённого элемента ${rec.name ? `«${rec.name}» (${id})` : id} закончилась — узел выключил его агента (create --close-after-first-session). Посмотри одной командой, что он записал (npm run state -- ${id}: первый вопрос квиза, паспорт), закрой подшаг его рождения в current-steps.md и переходи к следующему элементу; человеку — одна строка, не отчёт.`
}

module.exports = { set, take, wakeText, file }
