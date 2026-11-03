// НАПОМИНАНИЯ ПО ВРЕМЕНИ (узел, шаг 630). Владелец 2026-11-03: «я могу сказать напомни мне через неделю про день рождения мамы. И это
// должно вызвать соответствующий процессорный и всё остальное». Напоминание — запись в расписании главного агента
// (`data/main-agent/data/cron.json`, вне git, данные — без сборки) с событием `telegram-message`: в свою минуту часы ядра присылают её
// текст архитектору от бота главного агента, агент не будится, токенов ноль (`lib/main-agent-cron/runner.ts`).
//   npm run reminder -- add "<YYYY-MM-DD HH:MM>" "<текст>" [--repeat once|daily|weekdays|weekly|monthly|yearly]
//   npm run reminder -- list
//   npm run reminder -- cancel <id>
// 🔒 Урок прежнего Telegram Desk (схема `tgdesk_calendar`): модель, переводя «завтра в десять» в дату, ошибается примерно раз в
// двадцать — поэтому дату и время считает агент, а эта команда печатает их словами, и агент называет их человеку квитанцией.
// Компьютер выключен в минуту срабатывания — пропуск не догоняется (закон часов ядра).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const FILE = join(ROOT, 'data', 'main-agent', 'data', 'cron.json')
const REPEATS = ['once', 'daily', 'weekdays', 'weekly', 'monthly', 'yearly']
const [cmd, ...args] = process.argv.slice(2)
const flag = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null }
const read = () => { try { return JSON.parse(readFileSync(FILE, 'utf8')) } catch { return { repeatsPaused: false, schedules: [] } } }
const save = (plan) => { mkdirSync(dirname(FILE), { recursive: true }); writeFileSync(FILE, JSON.stringify(plan, null, 2) + '\n') }
const fail = (why) => { console.log(`===REMINDER_FAIL=== ${why}`); process.exit(1) }
const reminders = (plan) => (plan.schedules ?? []).filter((s) => s.event === 'telegram-message')

if (cmd === 'add') {
  const [when, text] = args
  const m = String(when ?? '').match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})$/)
  if (!m) fail('the time is «YYYY-MM-DD HH:MM» in this computer\'s local time')
  if (!String(text ?? '').trim()) fail('no text of the reminder')
  const repeat = flag('--repeat') ?? 'once'
  if (!REPEATS.includes(repeat)) fail(`repeat is one of: ${REPEATS.join(', ')}`)
  const [y, mo, d] = m[1].split('-').map(Number)
  const [h, mi] = m[2].split(':').map(Number)
  const at = new Date(y, mo - 1, d, h, mi)
  if (repeat === 'once' && at.getTime() <= Date.now()) fail(`${m[1]} ${m[2]} has already passed on this computer`)
  const plan = read()
  const id = `reminder-${Date.now().toString(36)}`
  plan.schedules = [...(plan.schedules ?? []), { id, event: 'telegram-message', name: String(text).trim().slice(0, 60), message: String(text).trim(), saidAt: new Date().toISOString(), time: m[2], repeat, start: m[1], enabled: true }]
  save(plan)
  const words = at.toLocaleString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  // 630 (владелец 2026-11-03: «я не хочу чтобы напоминания где-то вслепую оставались которые нельзя было увидеть без интерфейса»): каждое
  // напоминание видно в календаре главного агента — адрес идёт в квитанцию.
  let port = 24680
  try { port = JSON.parse(readFileSync(join(ROOT, 'logs', 'runtime.json'), 'utf8')).port ?? port } catch { /* порт по умолчанию */ }
  console.log(`===REMINDER_SET=== ${id} · ${m[1]} ${m[2]} (${words}) · ${repeat} · «${String(text).trim()}»`)
  console.log(`in the calendar: http://localhost:${port}/ru/architect/build/automation/cron (Главный агент → Автоматизированное управление → Крон события)`)
} else if (cmd === 'list') {
  const list = reminders(read())
  for (const s of list) console.log(`${s.id} · ${s.start} ${s.time} · ${s.repeat}${s.enabled ? '' : ' · off'} · «${s.message}»`)
  console.log(`===REMINDERS=== ${list.length}`)
} else if (cmd === 'cancel') {
  const plan = read()
  const id = args[0]
  if (!reminders(plan).some((s) => s.id === id)) fail(`no reminder ${id ?? ''} — npm run reminder -- list`)
  plan.schedules = plan.schedules.filter((s) => s.id !== id)
  save(plan)
  console.log(`===REMINDER_CANCELLED=== ${id}`)
} else {
  fail(`commands: add "<YYYY-MM-DD HH:MM>" "<text>" [--repeat ${REPEATS.join('|')}] · list · cancel <id>${existsSync(FILE) ? '' : ''}`)
}
