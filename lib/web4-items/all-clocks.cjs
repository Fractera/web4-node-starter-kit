// ВСЕ ЧАСЫ УЗЛА ГЛАЗАМИ ЯДРА (узел, шаг 697). Владелец 2026-11-08: «Б, только сообщать»; «проверить что все возможные задачи из
// элементов переносится на главный холст Cron событий». Записи живут в элементе (`<папка>/data/cron.json`, его сервер их исполняет и
// пишет журнал `data/cron-runs.jsonl`) — элемент живёт и без ядра (CLAUDE.md §3); ядро их только ЧИТАЕТ: один холст, сводка, и слово
// человеку, когда запись не сработала. Никого не будит и модель не зовёт: часы будят только своего агента (§6).
// Один модуль на трёх читателей: холст главного агента (`main-agent-automation.tsx`), `npm run clocks` и сторож минутного тика ядра
// (`lib/main-agent-cron/runner.ts`, тот же тик — нового таймера нет).
const fs = require('node:fs')
const path = require('node:path')
const power = require('./element-power.cjs')
const paths = require('./paths.cjs')
const calendar = require('./element-calendar.cjs')
const names = require('./name-file.cjs')

const LATE_MS = 3 * 60_000 // запись считается несработавшей через 3 минуты после своего времени (минутный тик элемента + запас)
const LOOK_BACK_MS = 60 * 60_000 // смотрим час назад: ядро, поднявшееся после сборки, видит недавние пропуски
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return null } }

/** Журнал срабатываний элемента: множество `schedule@slot`. */
function runsOf(dir) {
  const set = new Set()
  try {
    for (const l of fs.readFileSync(path.join(dir, 'data', 'cron-runs.jsonl'), 'utf8').split(/\r?\n/).slice(-2000)) {
      try { const r = JSON.parse(l); if (r && r.schedule && r.slot) set.add(`${r.schedule}@${r.slot}`) } catch { /* строка не JSON */ }
    }
  } catch { /* журнала ещё нет */ }
  return set
}

/** Каждый элемент с настоящим расписанием (не заготовкой шаблона): его записи, состояние и журнал. */
function elementClocks(root = process.cwd()) {
  let services = []
  try { services = power.readRegistry(root).services || [] } catch { return [] }
  const out = []
  for (const s of services) {
    if (!s || s.id === 'build') continue
    const dir = paths.entryDir(s)
    if (!dir || !fs.existsSync(dir)) continue
    const plan = calendar.readPlan(dir)
    if (!plan || !plan.schedules.length) continue
    const off = power.offOf(s)
    const passport = readJson(path.join(dir, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json')) || {}
    const catalog = readJson(path.join(dir, 'OWN-SERVICE-PROPS', 'CRON.json')) || {}
    out.push({
      id: s.id,
      name: names.displayName(s.id, { root, passportName: passport.name || null }),
      dir,
      plan,
      events: Array.isArray(catalog.events) ? catalog.events : [],
      automationOff: passport.automation && passport.automation.cron === false,
      sleep: off ? (off.byRule ? 'by-rule' : 'off') : null,
      offReason: off ? power.reasonIn(off, 'en') : '',
    })
  }
  return out
}

const isOff = (plan, s) => s.enabled === false || (plan.repeatsPaused && s.repeat !== 'once')

/** Моменты записи в окне [from, to]: { schedule, at, slot }. */
function dueBetween(plan, from, to) {
  const res = []
  for (let d = new Date(from.getFullYear(), from.getMonth(), from.getDate()); d <= to; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    for (const s of plan.schedules) {
      if (isOff(plan, s) || !calendar.occursOn(s, d)) continue
      const [h, mi] = s.time.split(':').map(Number)
      const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, mi)
      if (at >= from && at <= to) res.push({ schedule: s, at, slot: `${calendar.ymd(d)}T${s.time}` })
    }
  }
  return res
}

/** Почему запись элемента могла не сработать — словами для человека. */
function reasonOf(c, lang = 'ru') {
  const ru = lang === 'ru'
  if (c.sleep === 'off') return ru ? `элемент выключен тобой${c.offReason ? ` («${c.offReason}»)` : ''}` : `the element is turned off by you${c.offReason ? ` («${c.offReason}»)` : ''}`
  if (c.sleep === 'by-rule') return ru ? 'элемент спал по правилу нагрузки и не проснулся к записи' : 'the element slept by the load rule and did not wake for the entry'
  return ru ? 'элемент не ответил: его процесс не работал (упал, или компьютер был выключен)' : 'the element did not answer: its process was not running (it fell, or the computer was off)'
}

/** Пропуски: записи, время которых прошло 3–60 минут назад, а строки в журнале элемента нет. Элемент с выключенной автоматизацией — его выбор. */
function missed(root = process.cwd(), now = new Date()) {
  const res = []
  for (const c of elementClocks(root)) {
    if (c.automationOff) continue
    const runs = runsOf(c.dir)
    for (const d of dueBetween(c.plan, new Date(now - LOOK_BACK_MS), new Date(now - LATE_MS))) {
      if (!runs.has(`${d.schedule.id}@${d.slot}`)) res.push({ clock: c, ...d })
    }
  }
  return res
}

const stateFile = (root) => path.join(root, 'data', 'node', 'clock-watch.json')

/**
 * Один тик сторожа (минутные часы ядра). `send({ from, who, text })` — дверь уведомлений ядра. Каждый пропуск — одно слово человеку,
 * один раз (ключ `id@schedule@slot` в `data/node/clock-watch.json`, вне git, сутки). Возвращает сказанное.
 */
async function watchTick(root = process.cwd(), now = new Date(), send, lang = 'ru') {
  let state = readJson(stateFile(root)) || { told: [] }
  const told = new Set((state.told || []).map((t) => t.key))
  const said = []
  for (const m of missed(root, now)) {
    const key = `${m.clock.id}@${m.schedule.id}@${m.slot}`
    if (told.has(key)) continue
    const what = m.schedule.name || m.schedule.message || m.schedule.event
    const text = lang === 'ru'
      ? `Запись «${what}» в ${m.schedule.time} не сработала: ${reasonOf(m.clock, 'ru')}. Ядро только сообщает и никого не будит.`
      : `The entry «${what}» at ${m.schedule.time} did not run: ${reasonOf(m.clock, 'en')}. The core only tells and wakes nobody.`
    // Нет бота главного агента — сказать некуда: отмечаем сказанным, чтобы не стучать каждую минуту; пропуск виден на холсте и в
    // `npm run clocks`. Дверь ответила иначе — скажем в следующую минуту.
    let r = null
    try { r = await send({ from: m.clock.id, who: m.clock.name, text }) } catch { /* дверь молчит */ }
    if (!(r && (r.ok || /not connected|no-main-bot/.test(String(r.detail ?? ''))))) continue
    told.add(key)
    state.told = [...(state.told || []), { key, at: now.toISOString() }]
    said.push(key)
  }
  if (said.length) {
    state.told = state.told.filter((t) => now - Date.parse(t.at) < 24 * 3600_000)
    try { fs.mkdirSync(path.dirname(stateFile(root)), { recursive: true }); fs.writeFileSync(stateFile(root), JSON.stringify(state, null, 2) + '\n') } catch { /* состояние — не условие */ }
  }
  return said
}

/** Для холста главного агента: записи элементов — тем же видом, что его собственные, с именем элемента и его журналом. */
function canvasPart(root = process.cwd()) {
  const events = []
  const schedules = []
  const runs = []
  for (const c of elementClocks(root)) {
    const tag = (x) => `${c.id}/${x}`
    for (const e of c.events) events.push({ ...e, id: tag(e.id), name: `${c.name} · ${e.name ?? e.id}` })
    const paused = c.automationOff || c.sleep === 'off'
    for (const s of c.plan.schedules) {
      const event = tag(s.event)
      if (!events.some((e) => e.id === event)) events.push({ id: event, name: `${c.name} · ${s.event}`, description: '' })
      schedules.push({ ...s, id: tag(s.id), event, name: `${c.name} · ${s.name ?? s.message ?? s.event}`, enabled: s.enabled !== false && !paused && !(c.plan.repeatsPaused && s.repeat !== 'once') })
    }
    try {
      for (const l of fs.readFileSync(path.join(c.dir, 'data', 'cron-runs.jsonl'), 'utf8').split(/\r?\n/).filter(Boolean).slice(-500)) {
        try { const r = JSON.parse(l); runs.push({ ...r, schedule: tag(r.schedule) }) } catch { /* — */ }
      }
    } catch { /* журнала нет */ }
  }
  return { events, schedules, runs }
}

module.exports = { elementClocks, dueBetween, missed, watchTick, canvasPart, reasonOf, LATE_MS, LOOK_BACK_MS }
