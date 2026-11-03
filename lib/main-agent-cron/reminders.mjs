// НАПОМИНАНИЯ ЧЕЛОВЕКА — ОДНО МЕСТО (узел, шаг 630). Запись в расписании главного агента (`data/main-agent/data/cron.json`, вне git) с
// событием `telegram-message`: в свою минуту часы ядра присылают текст архитектору от бота главного агента (`runner.ts`), а сама
// запись видна в его календаре «Главный агент → Автоматизированное управление → Крон события».
// Владелец 2026-11-03: «я не хочу чтобы напоминания где-то вслепую оставались которые нельзя было увидеть без интерфейса»; «Все ваши
// напоминания видны в одном месте. Элемент (и память) передаёт просьбу ядру и отвечает квитанцией со ссылкой. Календари элементов — для
// их собственных автоматизаций». Здесь одна логика на двух зовущих: `npm run reminder` (главный агент) и дверь `/api/node/reminder`
// (элементы, ключ узла).
// Три времени оригинального календаря (Telegram Desk, шаг 148-1): когда сказано (`saidAt`), когда должно (`start` + `time`), когда
// сработало (журнал часов `cron-runs.jsonl`). Дату из «через неделю» считает агент; квитанция называет её словами — там человек ловит
// ошибку модели (примерно раз в двадцать, по прежнему календарю).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const REPEATS = ['once', 'daily', 'weekdays', 'weekly', 'monthly', 'yearly']
const file = (root) => join(root, 'data', 'main-agent', 'data', 'cron.json')
const read = (root) => { try { return JSON.parse(readFileSync(file(root), 'utf8')) } catch { return { repeatsPaused: false, schedules: [] } } }
const save = (root, plan) => { mkdirSync(dirname(file(root)), { recursive: true }); writeFileSync(file(root), JSON.stringify(plan, null, 2) + '\n') }

/** Адрес календаря главного агента на этом компьютере — порт спрашивается у узла (`logs/runtime.json`). */
export function calendarLink(root, lang = 'ru') {
  let port = 24680
  try { port = JSON.parse(readFileSync(join(root, 'logs', 'runtime.json'), 'utf8')).port ?? port } catch { /* порт ядра по умолчанию */ }
  return `http://localhost:${port}/${lang}/build/automation/cron` // без слова architect: `/ru/architect/…` уводит сюда же (2026-11-03)
}

/** { at: «YYYY-MM-DD HH:MM» по местным часам, text, repeat?, from? } → { ok, id, start, time, repeat, words, link } | { ok:false, why } */
export function addReminder(root, { at, text, repeat = 'once', from = null, lang = 'ru' }) {
  const m = String(at ?? '').match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})$/)
  if (!m) return { ok: false, why: 'the time is «YYYY-MM-DD HH:MM» in this computer\'s local time' }
  const body = String(text ?? '').trim()
  if (!body) return { ok: false, why: 'no text of the reminder' }
  if (!REPEATS.includes(repeat)) return { ok: false, why: `repeat is one of: ${REPEATS.join(', ')}` }
  const [y, mo, d] = m[1].split('-').map(Number)
  const [h, mi] = m[2].split(':').map(Number)
  const when = new Date(y, mo - 1, d, h, mi)
  if (repeat === 'once' && when.getTime() <= Date.now()) return { ok: false, why: `${m[1]} ${m[2]} has already passed on this computer` }
  const plan = read(root)
  const id = `reminder-${Date.now().toString(36)}`
  const entry = { id, event: 'telegram-message', name: body.slice(0, 60), message: body, saidAt: new Date().toISOString(), time: m[2], repeat, start: m[1], enabled: true }
  if (from) entry.from = String(from).slice(0, 64)
  plan.schedules = [...(Array.isArray(plan.schedules) ? plan.schedules : []), entry]
  save(root, plan)
  const words = when.toLocaleString(lang === 'en' ? 'en-GB' : 'ru-RU', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  return { ok: true, id, start: m[1], time: m[2], repeat, words, text: body, link: calendarLink(root, lang) }
}

export const listReminders = (root) => (read(root).schedules ?? []).filter((s) => s.event === 'telegram-message')

export function cancelReminder(root, id) {
  const plan = read(root)
  if (!listReminders(root).some((s) => s.id === id)) return { ok: false, why: `no reminder ${id ?? ''}` }
  plan.schedules = plan.schedules.filter((s) => s.id !== id)
  save(root, plan)
  return { ok: true, id }
}
