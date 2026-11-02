import { appendFileSync, mkdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { AGENT_TASK, dueAt, elementDir, hm, readPlan, ymd, type CronSchedule } from "./due"

// ЧАСЫ «АВТОМАТИЗИРОВАННОГО УПРАВЛЕНИЯ» ГЛАВНОГО АГЕНТА (узел, шаг 558-3). Слово владельца 2026-10-21: «в Аргенти это будет
// автоматизированное управление агентами или приложениями позволяет запускать агентов по определённому расписанию»; план 558 —
// «Подтвердить, строить (Рекомендую)», где цена названа: часы в сервере ядра раз в минуту, каждое срабатывание — сессия по подписке.
// У главного агента своего сервера нет, поэтому часы — здесь, тот же порядок, что у элемента (`lib/cron/runner.ts`, шаг 465):
// без повторов при ошибке, пропуск при выключенном компьютере не догоняется, два запуска в одну минуту невозможны (журнал).
// Каталог событий — `data/main-agent/OWN-SERVICE-PROPS/CRON.json` (из `lib/main-agent/`), расписание — `data/main-agent/data/cron.json`
// (вне git), журнал — `data/main-agent/data/cron-runs.jsonl`; календарь ядра рисует их в «Автоматизированное управление → Крон события».
// Встроенное `agent-task`: главный агент просыпается с текстом записи как задачей — тем же входом, что надзор (548-11, `confirmed`).

type Result = { ok: boolean; detail?: string }
type Wake = (service: string, opts: { text?: string; from?: string; confirmed?: boolean }) => Promise<{ ok: boolean; reason?: string; already?: boolean }>

const EVENTS: Record<string, (s: CronSchedule) => Promise<Result>> = {
  [AGENT_TASK]: async (s) => {
    const text = s.message?.trim()
    if (!text) return { ok: false, detail: "no message text" }
    // Вход пробуждения кладёт общее подключение комплектов (`lib/agent-kit/mount.cjs`) при старте сервера — тот же процесс.
    const wake = (globalThis as { __web4AgentWake?: Wake }).__web4AgentWake
    if (typeof wake !== "function") return { ok: false, detail: "agent kits are not mounted" }
    const r = await wake("build", { text, from: "cron", confirmed: true })
    return r.ok ? { ok: true, detail: r.already ? "pasted into the live session" : "woke up" } : { ok: false, detail: r.reason ?? "wake failed" }
  },
}

const MINUTE = 60_000
const CATCH_UP = 5

const logFile = () => join(elementDir(), "data", "cron-runs.jsonl")

function ranSlots(): Set<string> {
  try {
    return new Set(readFileSync(logFile(), "utf8").split(/\r?\n/).slice(-500).flatMap((l) => {
      try { const r = JSON.parse(l) as { schedule: string; slot: string }; return [`${r.schedule}@${r.slot}`] } catch { return [] }
    }))
  } catch {
    return new Set()
  }
}

function log(rec: Record<string, unknown>) {
  try {
    mkdirSync(join(elementDir(), "data"), { recursive: true })
    appendFileSync(logFile(), JSON.stringify(rec) + "\n")
  } catch (e) {
    console.warn(`[main-agent-cron] журнал не записан: ${(e as Error).message}`)
  }
}

async function checkMinute(minute: Date) {
  const plan = readPlan()
  if (!plan) return
  const ran = ranSlots()
  for (const s of dueAt(plan, minute)) {
    const slot = `${ymd(minute)}T${hm(minute)}`
    if (ran.has(`${s.id}@${slot}`)) continue
    const handler = EVENTS[s.event]
    let r: Result
    try {
      r = handler ? await handler(s) : { ok: false, detail: `no handler for event ${s.event}` }
    } catch (e) {
      r = { ok: false, detail: (e as Error).message }
    }
    log({ slot, at: new Date().toISOString(), schedule: s.id, event: s.event, ok: r.ok, detail: r.detail })
    console.log(`[main-agent-cron] ${slot} ${s.id} → ${r.ok ? "ok" : "ошибка"}${r.detail ? ` (${r.detail})` : ""}`)
  }
}

let started = false

export function startMainAgentCron() {
  if (started) return
  started = true
  const floor = (t: number) => t - (t % MINUTE)
  let last = floor(Date.now()) - MINUTE
  const tick = async () => {
    const now = floor(Date.now())
    const from = Math.max(last + MINUTE, now - (CATCH_UP - 1) * MINUTE)
    last = now
    for (let t = from; t <= now; t += MINUTE) await checkMinute(new Date(t))
  }
  const first = setTimeout(() => {
    void tick()
    setInterval(() => void tick(), MINUTE).unref()
  }, MINUTE - (Date.now() % MINUTE) + 1_000)
  first.unref()
  void tick()
  console.log("[main-agent-cron] расписание data/main-agent/data/cron.json: проверка раз в минуту")
}
