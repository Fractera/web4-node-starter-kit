// ЗАПУСК СЕРВЕРА ЯДРА. Оформление ядра — его собственный DESIGN-CONFIG: его засевает `scripts/sync-site-design.mjs` перед каждой сборкой
// темой сайта (716: элемента «Дизайн», за которым ядро следило с шага 309, у узла больше нет — владелец 2026-11-10). Таймеров нет.
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
  await checkCutBuild()
  await checkLostSessions()
}

// 707-2 (владелец 2026-11-09: подниматься и после неудачи): старт ядра — один из концов сборки. Осталась запись сборки
// (`data/node/agent-return.json`), чей процесс умер, — сборку оборвало, и записанных агентов возвращает ждун вне дерева ядра.
async function checkCutBuild() {
  const fs = await import("node:fs")
  const path = await import("node:path")
  const root = process.cwd()
  if (!fs.existsSync(path.join(root, "data", "node", "agent-return.json"))) return
  await spawnFree(root, ["agent-return.mjs", "--cut-off"], "[agent-return] старт ядра при записи сборки — проверяю, не оборвана ли она")
}

// 708 (владелец 2026-11-09: «разрядился компьютер … выключился из сети»; выбор «b»): сессии, чья запись осталась `running: true`, умерли
// вместе с ядром — они помечаются `lost` (страница терминала и /on предложат продолжить тот же разговор), а главный агент возвращается
// в него сам. Пока есть запись сборки ядра, их возвращает сама сборка (675, 707) — тогда ничего не помечается.
async function checkLostSessions() {
  const { createRequire } = await import("node:module")
  const path = await import("node:path")
  const root = process.cwd()
  let lost: string[] = []
  try { lost = createRequire(path.join(root, "package.json"))("./lib/agent-kit/resume.cjs").markLost(root) } catch { return }
  if (!lost.length) return
  console.log(`[resume] сессии, умершие с ядром: ${lost.join(", ")} — помечены, их разговоры можно продолжить`)
  if (lost.includes("build")) await spawnFree(root, ["agent-return.mjs", "--lost"], "[resume] главный агент возвращается в тот же разговор")
}

async function startMemoryByFree() {
  await spawnFree(
    process.cwd(),
    ["load-rule.mjs", "--settle", "60", "--why", "start"],
    "[load] через 60 с узел измерит свободную память: больше 1 ГБ — ничего, 1–0,5 ГБ — предложение, меньше 0,5 ГБ — усыпит выключаемые (663-3)",
  )
}

/** Скрипт `scripts/<args[0]>` — вне дерева процессов ядра (`spawn-free.mjs`) и с чистым окружением. */
async function spawnFree(root: string, args: string[], line: string) {
  const { spawn } = await import("node:child_process")
  const path = await import("node:path")
  // 🛑 Окружение — без меток Next: процесс, запущенный из сервера Next, иначе не читает свой `.env` (ANTI-PATTERNS, «Процесс, запущенный из сервера Next…»).
  // NODE_ENV не передаётся намеренно (его ставит себе каждый процесс сам), поэтому тип — простая таблица, а не ProcessEnv.
  const env: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (/^(__NEXT|NEXT_|AGI_)/.test(k) || ["PORT", "HOSTNAME", "NODE_ENV"].includes(k)) continue
    env[k] = v
  }
  try {
    const [script, ...rest] = args
    const child = spawn(
      process.execPath,
      [path.join(root, "scripts", "spawn-free.mjs"), path.join(root, "scripts", script), ...rest],
      { cwd: root, env: env as NodeJS.ProcessEnv, detached: true, windowsHide: true, stdio: "ignore" },
    )
    child.unref()
    console.log(line)
  } catch (e) {
    console.warn(`${line.split(" ")[0]} не запущен: ${e instanceof Error ? e.message : String(e)}`)
  }
}
