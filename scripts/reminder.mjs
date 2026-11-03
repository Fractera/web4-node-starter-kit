// НАПОМИНАНИЯ ПО ВРЕМЕНИ — КОМАНДА ГЛАВНОГО АГЕНТА (узел, шаг 630). Логика — одна, `lib/main-agent-cron/reminders.mjs` (её же зовёт
// дверь элементов `/api/node/reminder`); напоминание видно в календаре главного агента, ссылка — в квитанции.
//   npm run reminder -- add "<YYYY-MM-DD HH:MM>" "<текст>" [--repeat once|daily|weekdays|weekly|monthly|yearly]
//   npm run reminder -- list
//   npm run reminder -- cancel <id>
// Компьютер выключен в минуту срабатывания — пропуск не догоняется (закон часов ядра), но виден в календаре.
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { addReminder, calendarLink, cancelReminder, listReminders, REPEATS } from '../lib/main-agent-cron/reminders.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const [cmd, ...args] = process.argv.slice(2)
const flag = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null }
const fail = (why) => { console.log(`===REMINDER_FAIL=== ${why}`); process.exit(1) }

if (cmd === 'add') {
  const r = addReminder(ROOT, { at: args[0], text: args[1], repeat: flag('--repeat') ?? 'once' })
  if (!r.ok) fail(r.why)
  console.log(`===REMINDER_SET=== ${r.id} · ${r.start} ${r.time} (${r.words}) · ${r.repeat} · «${r.text}»`)
  console.log(`in the calendar: ${r.link} (Главный агент → Автоматизированное управление → Крон события)`)
} else if (cmd === 'list') {
  const list = listReminders(ROOT)
  for (const s of list) console.log(`${s.id} · ${s.start} ${s.time} · ${s.repeat}${s.enabled ? '' : ' · off'}${s.from ? ` · from ${s.from}` : ''} · «${s.message}»`)
  console.log(`===REMINDERS=== ${list.length} · ${calendarLink(ROOT)}`)
} else if (cmd === 'cancel') {
  const r = cancelReminder(ROOT, args[0])
  if (!r.ok) fail(`${r.why} — npm run reminder -- list`)
  console.log(`===REMINDER_CANCELLED=== ${r.id}`)
} else {
  fail(`commands: add "<YYYY-MM-DD HH:MM>" "<text>" [--repeat ${REPEATS.join('|')}] · list · cancel <id>`)
}
