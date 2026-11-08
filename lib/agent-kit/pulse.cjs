// ПУЛЬС СЕССИИ (686-2) — как закончился каждый ход агента, записанное кодом, а не моделью.
//   как хук (мост узла даёт его каждой сессии):  node pulse.cjs <id элемента> <turn-start|turn-end|turn-error|session-end>  < JSON хука
// Пишет `data/services/<id>/pulse.json`: последнее событие и двадцать прежних. Вход сессии — «own» (своя папка Claude Code элемента,
// 689: `CLAUDE_CONFIG_DIR` в окружении) или «node». 🛑 Хук никогда не роняет сессию: любая ошибка — молча, код выхода 0.
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', '..')
const [element, event] = process.argv.slice(2)
const SHAPE = /^[a-z][a-z0-9-]{0,39}$/

function main(raw) {
  if (!SHAPE.test(String(element)) || !['turn-start', 'turn-end', 'turn-error', 'session-end'].includes(event)) return
  let input = {}
  try { input = JSON.parse(raw || '{}') } catch { /* не JSON — пишем без него */ }
  const dir = path.join(ROOT, 'data', 'services', element)
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'pulse.json')
  let prev = {}
  try { prev = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { /* первый раз */ }
  const now = {
    at: new Date().toISOString(),
    event,
    session: typeof input.session_id === 'string' ? input.session_id : null,
    login: process.env.CLAUDE_CONFIG_DIR ? 'own' : 'node',
    ...(event === 'turn-error' ? { error: input.error ?? 'unknown', details: String(input.error_details ?? '').slice(0, 300) } : {}),
    ...(event === 'turn-error' || event === 'turn-end' ? { last: String(input.last_assistant_message ?? '').slice(0, 300) } : {}),
    ...(event === 'session-end' && input.reason ? { reason: String(input.reason) } : {}),
  }
  const history = [now, ...(Array.isArray(prev.history) ? prev.history : [])].slice(0, 20)
  fs.writeFileSync(file + '.tmp', JSON.stringify({ last: now, history }, null, 2))
  fs.renameSync(file + '.tmp', file)
  if (event === 'turn-error' && now.error === 'rate_limit') resumeAtReset(now)
  // 686-6: конец сессии элемента, шедшей на одолженной подписке узла, — долг возвращён (запись снята, журнал со счётом).
  if (event === 'session-end') {
    try {
      const lending = require(path.join(ROOT, 'lib', 'agent-kit', 'lending.cjs'))
      // Только сессия, которая шла на входе узла после начала долга: перезапуск прежней сессии на своей подписке долг не гасит.
      const rec = lending.active(ROOT).find((r) => r.element === element)
      const ranOnLoan = rec && now.login === 'node' && history.some((h) => h.event === 'turn-start' && h.session === now.session && h.at >= rec.since)
      if (ranOnLoan) lending.giveBack(ROOT, element, 'returned at session end')
    } catch { /* хук не роняет сессию */ }
  }
}

// 686-5 (владелец 2026-11-08: «он может просто выключиться. Передаст агенту регистратору таймер на пробуждение и будет пробу жден к
// моменту возобновления лимита подписки после чего продолжит работу»; его постоянное «да» — в плане 686). Ход оборван лимитом подписки —
// ОДНА запись `agent-task` в часах главного агента (`data/main-agent/data/cron.json`, вне git, видна в его календаре) на минуту сброса
// лимита + 2: часы будят главного агента, он смотрит `npm run where` и будит элемент «продолжи по своей записи». Код будит только агента
// ядра — элемент будит агент (CLAUDE.md §6). Время сброса — из записи лимитов этого входа (`data/node/limits/`, строка состояния, 686-2):
// окно, израсходованное на 100 %, иначе ближайший будущий сброс; неизвестно — записи нет, `where` назовёт остановку.
function resumeAtReset(now) {
  const login = now.login === 'own' ? `own-${element}` : 'node'
  let lim = null
  try { lim = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'node', 'limits', `${login}.json`), 'utf8')) } catch { /* замера нет */ }
  const reset = resetOf(now, lim, Date.now())
  if (!reset) return
  const when = new Date(reset + 2 * 60_000)
  const pad = (n) => String(n).padStart(2, '0')
  const start = `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}`
  const time = `${pad(when.getHours())}:${pad(when.getMinutes())}`
  const file = path.join(ROOT, 'data', 'main-agent', 'data', 'cron.json')
  let plan = { repeatsPaused: false, schedules: [] }
  try { plan = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { /* расписания ещё нет */ }
  const schedules = Array.isArray(plan.schedules) ? plan.schedules : []
  const id = `resume-${element}-${start}T${time.replace(':', '')}`
  if (schedules.some((s) => s.id === id)) return
  const stopped = new Date(now.at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  const message = element === 'build'
    ? `The subscription limit stopped your turn at ${stopped}; it has reset. Continue from your record (current-steps.md) where you stopped (step 686-5).`
    : `The subscription limit stopped the turn of element ${element} at ${stopped}; it has reset. Run npm run where, then wake it: npm run task -- ${element} "Continue from your record (development-docs/current-step.md): your last turn was stopped by the subscription limit." (step 686-5, the owner's standing yes).`
  plan.schedules = [...schedules, { id, event: 'agent-task', name: `Resume ${element} after the limit`, message, saidAt: now.at, time, repeat: 'once', start, enabled: true, from: element }]
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file + '.tmp', JSON.stringify(plan, null, 2) + '\n')
  fs.renameSync(file + '.tmp', file)
}

// 686-10 (✗ показ владельцу 2026-11-08 19:05: замер root был в 18:36, его пятичасовой сброс 19:00 уже прошёл — код взял недельное окно и
// поставил пробуждение на 13 ноября вместо сегодняшнего вечера). Время сброса — по порядку: из текста ошибки самого Claude Code
// («… reset at 7pm», «… at 19:00», ISO); окно, израсходованное на 100 % (будущий сброс); пятичасовое с будущим сбросом; прошедший
// пятичасовой сброс — значит, идёт НОВОЕ пятичасовое окно: сейчас + 5 ч. Недельное — только когда само на 100 %.
function resetOf(now, lim, nowMs) {
  const d = String(now.details ?? '')
  const iso = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/.exec(d)
  if (iso && Date.parse(iso[1]) > nowMs) return Date.parse(iso[1])
  const at = /reset[s]?\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i.exec(d)
  if (at) {
    let h = Number(at[1]) % 24
    if (at[3]) h = (h % 12) + (at[3].toLowerCase() === 'pm' ? 12 : 0)
    const n = new Date(nowMs)
    let t = new Date(n.getFullYear(), n.getMonth(), n.getDate(), h, Number(at[2] ?? 0)).getTime()
    if (t <= nowMs) t += 24 * 3600_000
    return t
  }
  const future = (w) => w && w.resetsAt && Date.parse(w.resetsAt) > nowMs
  const full = [lim?.fiveHour, lim?.sevenDay].filter((w) => future(w) && w.used >= 100)
  if (full.length) return Math.max(...full.map((w) => Date.parse(w.resetsAt)))
  if (future(lim?.fiveHour)) return Date.parse(lim.fiveHour.resetsAt)
  return nowMs + 5 * 3600_000
}

let raw = ''
process.stdin.on('data', (d) => { raw += d })
process.stdin.on('end', () => { try { main(raw) } catch { /* хук не роняет сессию */ } process.exit(0) })
setTimeout(() => { try { main(raw) } catch { /* — */ } process.exit(0) }, 3000).unref()
