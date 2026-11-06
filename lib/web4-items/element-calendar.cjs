// КАЛЕНДАРЬ ЭЛЕМЕНТА ГЛАЗАМИ ЯДРА (узел, шаг 663). Часы элемента идут внутри его же сервера (`lib/cron/` шаблона, раз в минуту по
// `<папка элемента>/data/cron.json`) — уснувший элемент свой календарь не исполнит. Ядро читает тот же файл: `npm run load` называет
// ближайшую запись (цена сна, 663-2), минутные часы ядра будят элемент за 2 минуты до неё (663-4; владелец 2026-11-06: «пробудить нужный
// элемент чтобы в нём отработало Krohn события и сделать это например за 2 минуты»).
// 🔒 Правило «бывает ли в этот день» — то же, что у главного агента (`lib/main-agent-cron/due.ts`) и у шаблона (`lib/cron/due.ts`);
// времена — местные часы компьютера. Разойдутся правила — элемент проснётся не к своей записи.
const fs = require('node:fs')
const path = require('node:path')

const REPEATS = new Set(['once', 'daily', 'weekdays', 'weekly', 'monthly', 'yearly'])
const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const hm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

/** Расписание элемента из `<dir>/data/cron.json` или null (нет файла — нет календаря). */
function readPlan(dir) {
  let own
  try { own = JSON.parse(fs.readFileSync(path.join(dir, 'data', 'cron.json'), 'utf8')) } catch { return null }
  const schedules = (Array.isArray(own?.schedules) ? own.schedules : [])
    .filter((s) => s && typeof s.id === 'string' && /^\d{2}:\d{2}$/.test(s.time) && REPEATS.has(s.repeat) && /^\d{4}-\d{2}-\d{2}$/.test(s.start))
  return { repeatsPaused: own?.repeatsPaused === true, schedules }
}

function occursOn(s, day) {
  const key = ymd(day)
  if (key < s.start || (s.until && key > s.until)) return false
  const [y, m, d] = s.start.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const dow = day.getDay()
  switch (s.repeat) {
    case 'once': return key === s.start
    case 'daily': return true
    case 'weekdays': return dow >= 1 && dow <= 5
    case 'weekly': return dow === start.getDay()
    case 'monthly': return day.getDate() === start.getDate()
    case 'yearly': return day.getDate() === start.getDate() && day.getMonth() === start.getMonth()
  }
  return false
}

const isOff = (plan, s) => s.enabled === false || (plan.repeatsPaused && s.repeat !== 'once')

/** Ближайший момент записи не раньше `from` в пределах `days` суток: { at: Date, schedule } или null. */
function nextDue(plan, from = new Date(), days = 8) {
  if (!plan) return null
  let best = null
  for (let i = 0; i <= days; i++) {
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
    for (const s of plan.schedules) {
      if (isOff(plan, s) || !occursOn(s, day)) continue
      const [h, mi] = s.time.split(':').map(Number)
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, mi)
      if (at < from) continue
      if (!best || at < best.at) best = { at, schedule: s }
    }
    if (best) return best
  }
  return best
}

module.exports = { readPlan, occursOn, nextDue, ymd, hm }
