// ПРОБУЖДЕНИЕ ПО КАЛЕНДАРЮ (узел, шаг 663-4). Владелец 2026-11-06: «если например кастомные элементы имеют Krohn события, то при их
// отключений крон событий не сработает это означает что главный агент должен … пробудить нужный элемент чтобы в нём отработало Krohn
// события и сделать это например за 2 минуты».
// Зовётся минутными часами ядра (`lib/main-agent-cron/runner.ts`, тот же тик — нового таймера нет). Будит только элемент, усыплённый
// правилом нагрузки (`off.byRule`); выключенный человеком — его выбор, его не будим. За 2 минуты до записи `<папка>/data/cron.json`
// — `element-power on --by-rule`; через 5 минут после записи — правило нагрузки (`load-rule.mjs --why calendar`) решает, усыпить ли
// снова (только если памяти по-прежнему меньше 0,5 ГБ). Всё вне дерева процессов ядра (`spawn-free.mjs`), с чистым окружением.
const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')
const power = require('./element-power.cjs')
const paths = require('./paths.cjs')
const calendar = require('./element-calendar.cjs')

const AHEAD_MS = 2 * 60_000
const GRACE_MS = 5 * 60_000

function childEnv() {
  const env = {}
  for (const [k, v] of Object.entries(process.env)) if (!/^(__NEXT|NEXT_|AGI_)/.test(k) && !['PORT', 'HOSTNAME', 'NODE_ENV'].includes(k)) env[k] = v
  return env
}
function runFree(root, script, args) {
  const child = spawn(process.execPath, [path.join(root, 'scripts', 'spawn-free.mjs'), path.join(root, 'scripts', script), ...args], { cwd: root, env: childEnv(), detached: true, stdio: 'ignore', windowsHide: true })
  child.unref()
}
const stateFile = (root) => path.join(root, 'data', 'node', 'calendar-wake.json')
const readState = (root) => { try { return JSON.parse(fs.readFileSync(stateFile(root), 'utf8')) } catch { return { woken: [] } } }
function writeState(root, s) {
  try { fs.mkdirSync(path.dirname(stateFile(root)), { recursive: true }); fs.writeFileSync(stateFile(root), JSON.stringify(s, null, 2) + '\n') } catch { /* состояние — не условие */ }
}

/** Одна минута часов ядра. `run` подменяется прибором (по умолчанию — запуск вне дерева процессов). Возвращает сделанное. */
function calendarWakeTick(root = process.cwd(), now = new Date(), run = runFree) {
  const state = readState(root)
  const did = []
  let services = []
  try { services = power.readRegistry(root).services || [] } catch { return did }
  for (const s of services) {
    const off = power.offOf(s)
    if (!off || !off.byRule) continue
    const next = calendar.nextDue(calendar.readPlan(paths.entryDir(s)), now)
    if (!next || next.at - now > AHEAD_MS) continue
    const key = `${s.id}@${next.at.toISOString()}`
    if (state.woken.some((w) => w.key === key)) continue
    run(root, 'element-power.mjs', [s.id, 'on', '--by-rule'])
    state.woken.push({ key, id: s.id, entryAt: next.at.toISOString(), wokeAt: now.toISOString(), settled: false })
    did.push(`wake:${s.id}`)
  }
  const due = state.woken.filter((w) => !w.settled && now - Date.parse(w.entryAt) > GRACE_MS)
  if (due.length) {
    run(root, 'load-rule.mjs', ['--why', 'calendar'])
    for (const w of due) w.settled = true
    did.push(`rule:${due.map((w) => w.id).join(',')}`)
  }
  state.woken = state.woken.filter((w) => now - Date.parse(w.entryAt) < 24 * 3600_000)
  if (did.length) writeState(root, state)
  return did
}

module.exports = { calendarWakeTick, AHEAD_MS, GRACE_MS }
