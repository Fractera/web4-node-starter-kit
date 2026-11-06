// ЗАПУСК СЕРВЕРА ЯДРА — оформление проекта из элемента «Дизайн» и подписка на его сигнал (шаг 309). Элемента нет у узла —
// ядро живёт своим DESIGN-CONFIG (его засевает `scripts/sync-site-design.mjs` перед сборкой). Таймеров нет: дальше — только
// по сигналу, то есть в ответ на сохранение человеком.
// 558-3: одно исключение, заказанное владельцем 2026-10-21 (план 558 подтверждён с названной ценой) — часы «Автоматизированного
// управления» главного агента раз в минуту по `data/main-agent/data/cron.json`; без записей они ничего не делают.
// 601 (владелец 2026-10-26: «Если свободной памяти больше чем 1 ГБ я хочу чтобы навык глубокой памяти был включён всегда»; когда мерить —
// «При запуске узла и после сборки»): ядро стартует ровно в эти моменты (`pm2 resurrect` при входе, `serve start`, конец пересборки), и
// при старте один раз зовёт правило нагрузки `scripts/load-rule.mjs` (663-3, владелец 2026-11-06: пороги 1 ГБ и 0,5 ГБ; прежнее правило
// одной глубокой памяти `memory-by-free.mjs` вошло в него) — вне своего дерева процессов (`spawn-free.mjs`) и с чистым окружением.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  const { startMainAgentCron } = await import("./lib/main-agent-cron/runner")
  startMainAgentCron()
  await startMemoryByFree()
  const { hasDesignElement, pullDesign, subscribeToDesign } = await import("./lib/design-follow")
  if (!hasDesignElement()) return
  const r = await pullDesign()
  if (r.ok) console.log(`[design] оформление: ${r.changed ? "получено" : "актуально"}`)
  else console.warn(`[design] оформление не получено: ${r.reason} — работаю по своему DESIGN-CONFIG`)
  const s = await subscribeToDesign("core")
  if (s.ok) console.log(`[design] подписан на сигнал элемента «Дизайн»: ${s.url}`)
  else console.warn(`[design] подписка не удалась: ${s.reason}`)
}

async function startMemoryByFree() {
  const { spawn } = await import("node:child_process")
  const path = await import("node:path")
  const root = process.cwd()
  // 🛑 Окружение — без меток Next: процесс, запущенный из сервера Next, иначе не читает свой `.env` (ANTI-PATTERNS, «Процесс, запущенный из сервера Next…»).
  // NODE_ENV не передаётся намеренно (его ставит себе каждый процесс сам), поэтому тип — простая таблица, а не ProcessEnv.
  const env: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (/^(__NEXT|NEXT_|AGI_)/.test(k) || ["PORT", "HOSTNAME", "NODE_ENV"].includes(k)) continue
    env[k] = v
  }
  try {
    const child = spawn(
      process.execPath,
      [path.join(root, "scripts", "spawn-free.mjs"), path.join(root, "scripts", "load-rule.mjs"), "--settle", "60", "--why", "start"],
      { cwd: root, env: env as NodeJS.ProcessEnv, detached: true, windowsHide: true, stdio: "ignore" },
    )
    child.unref()
    console.log("[load] через 60 с узел измерит свободную память: больше 1 ГБ — ничего, 1–0,5 ГБ — предложение, меньше 0,5 ГБ — усыпит выключаемые (663-3)")
  } catch (e) {
    console.warn(`[load] замер свободной памяти не запущен: ${e instanceof Error ? e.message : String(e)}`)
  }
}
