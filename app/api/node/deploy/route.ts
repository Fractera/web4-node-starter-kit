// @api list node elements with pending changes and start their deployment
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import paths from "@/lib/web4-items/paths.cjs"
import rollback from "@/lib/deploy/previous-version.cjs"
import deployLock from "@/lib/deploy/deploy-lock.cjs"
import previewLock from "@/lib/deploy/preview-lock.cjs"
import liveLog from "@/lib/deploy/live-log.cjs"
import { elementCodeState } from "@/lib/web4-items/element-code-state"
import elementProps from "@/lib/web4-items/element-props.cjs"

// ДАШБОРД РАЗВЁРТЫВАНИЙ — ДВЕРЬ (280-11b).
//
// 🔒 «ЕСТЬ НЕПРИМЕНЁННЫЕ ИЗМЕНЕНИЯ» ИЗМЕРЯЕТСЯ, А НЕ ПОМНИТСЯ: файл настроек элемента (его паспорт
// называет их в `settings.owns`) новее его последней сборки (`.install-stamp.json` → `at`). Сохранение в
// редакторе «Дизайн» пишет файл, сборка — отметку; сравнение двух времён и есть ответ.
//
// 🔒 ЯДРО — В СПИСКЕ, НО БЕЗ КНОПКИ. Его пересборка перезапускает тот самый сервер, что отдаёт эту дверь,
// и идёт в ту же папку с простоем; сборка ядра без простоя — отдельная работа.
//
// 🛑 ОДНО РАЗВЁРТЫВАНИЕ ЗА РАЗ: пока `logs/deploy-state.json` говорит `running`, второе получает 409.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const ROOT = process.cwd()

// 337-1: скрипт запускается ВНЕ дерева процессов ядра (`scripts/spawn-free.mjs`): перезапуск ядра его больше не убивает.
function startFree(script: string, args: string[]): void {
  spawnSync(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), join(ROOT, "scripts", script), ...args], {
    cwd: ROOT,
    windowsHide: true,
    stdio: "ignore",
    timeout: 10_000,
  })
}

type Entry = { id: string; version?: string; port?: number; kind?: string }

// 555: сборка ядра по кнопке — итог последней (`scripts/core-deploy.mjs`). `running` без живого процесса — прервана (машина выключилась).
type CoreDeploy = { state: "running" | "done" | "failed" | "interrupted"; startedAt?: string; finishedAt?: string; rc?: number | null; pid?: number }
const CORE_DEPLOY = join(ROOT, "data", "node", "core-deploy.json")
function readCoreDeploy(): CoreDeploy | null {
  const s = readJson<CoreDeploy>(CORE_DEPLOY)
  if (!s) return null
  if (s.state === "running" && s.pid) {
    try { process.kill(s.pid, 0) } catch { return { ...s, state: "interrupted" } }
  }
  return s
}
const coreLogTail = (): string[] => {
  try {
    return readFileSync(join(ROOT, "logs", "core-deploy.log"), "utf8").replace(/\r/g, "").split("\n").filter(Boolean).slice(-12)
  } catch {
    return []
  }
}

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T
  } catch {
    return null
  }
}

function mtime(file: string): number | null {
  try {
    return statSync(file).mtimeMs
  } catch {
    return null
  }
}

function elements() {
  const registry = readJson<{ services?: Entry[] }>(paths.REGISTRY_FILE)
  return (registry?.services ?? []).map((s) => {
    const dir = paths.entryDir(s)
    const stamp = readJson<{ at?: string; version?: string }>(join(dir, ".install-stamp.json"))
    const passport = elementProps.readElementProps(dir) as { settings?: { owns?: string[] } } | null // 417: обе раскладки
    const owns = passport?.settings?.owns ?? []
    const builtAt = stamp?.at ?? null
    let settingsChangedAt: number | null = null
    for (const folder of owns) {
      const f = join(dir, folder)
      for (const name of existsSync(f) ? ["design-config.json", "app-config.json", "platform-config.json"] : []) {
        const m = mtime(join(f, name))
        if (m && (!settingsChangedAt || m > settingsChangedAt)) settingsChangedAt = m
      }
    }
    // 337-2: правки кода и «последний коммит ≠ работающий» — тоже ожидание развёртывания, а не только настройки.
    const code = stamp ? elementCodeState(dir) : null
    return {
      id: s.id,
      version: s.version ?? null,
      port: s.port ?? null,
      installed: !!stamp,
      builtAt,
      takesSettings: owns.length > 0,
      pending: !!(settingsChangedAt && builtAt && settingsChangedAt > Date.parse(builtAt)) || !!code?.pending,
      code,
      settingsChangedAt: settingsChangedAt ? new Date(settingsChangedAt).toISOString() : null,
      // 287: предыдущая рабочая версия — для кнопки «Вернуть»; `source: git` — успех той версии не записан.
      previous: stamp ? rollback.previousVersion(s.id) : null,
    }
  })
}

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const logParam = req.nextUrl.searchParams.get("log")
  const logId = logParam && /^[a-z][a-z0-9-]{0,31}$/.test(logParam) ? logParam : null
  // 353-3: `?progress=1` — только ход и журнал, без состояния кода элементов (git на каждый элемент): страница спрашивает раз в
  // секунду, пока идёт работа, и не должна нагружать машину, которая в это время собирает.
  if (req.nextUrl.searchParams.get("progress")) {
    // 642-2: `&core=1` — итог и хвост журнала сборки ядра (страница читает его, пока ядро ещё отвечает, и после).
    const core = req.nextUrl.searchParams.get("core") ? { core: { deploy: readCoreDeploy(), log: liveLog.tail(join(ROOT, "logs", "core-deploy.log"), 200) } } : {}
    return NextResponse.json(
      { ok: true, deployment: deployLock.readState(), ...core, ...(logId ? { log: liveLog.tail(liveLog.logPath(ROOT, "deploy", logId)) } : {}) },
      { headers: { "Cache-Control": "no-store" } },
    )
  }
  return NextResponse.json(
    {
      ok: true,
      core: { commit: process.env.WEB4_COMMIT ?? null, builtAt: process.env.NEXT_PUBLIC_BUILT_AT ?? null, deploy: readCoreDeploy(), log: coreLogTail() },
      elements: elements(),
      // 337-1: осиротевшая запись (running, процесса нет) исправляется на «прервано» при этом же чтении.
      deployment: deployLock.readState(),
      // 353-3: `?log=<id>` — хвост журнала хода развёртывания этого элемента (страница читает его, пока идёт работа).
      ...(logId ? { log: liveLog.tail(liveLog.logPath(ROOT, "deploy", logId)) } : {}),
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}

// 642-4: «Разобрать с главным агентом» — слово человека главному агенту об упавшем развёртывании (как его сообщение в Telegram).
// Закон «только агенты говорят с агентами» (636): агента элемента эта дверь не будит — задачу ему даёт главный агент (`npm run task`).
// Тот же вход, что у часов главного агента (`confirmed`: человек уже решил, нажав кнопку).
type Wake = (service: string, opts: { text?: string; from?: string; about?: string; confirmed?: boolean }) => Promise<{ ok: boolean; reason?: string; already?: boolean; pending?: boolean }>
async function debugWithMainAgent(target: string) {
  const isCore = target === "core" || target === "update"
  if (!isCore && !/^[a-z][a-z0-9-]{0,31}$/.test(target)) return NextResponse.json({ ok: false, reason: "bad-target" }, { status: 400 })
  const wake = (globalThis as { __web4AgentWake?: Wake }).__web4AgentWake
  if (typeof wake !== "function") return NextResponse.json({ ok: false, reason: "agent kits are not mounted" }, { status: 503 })
  const lines = target === "core" ? liveLog.tail(join(ROOT, "logs", "core-deploy.log"), 60)
    : target === "update" ? liveLog.tail(join(ROOT, "logs", "node-update.log"), 60)
    : liveLog.tail(liveLog.logPath(ROOT, "deploy", target), 60)
  const result = isCore ? null : (deployLock.readState()?.results ?? []).filter((r: { id: string }) => r.id === target).pop() as { cause?: { kind: string; detail?: string }; previousUp?: boolean | null } | undefined
  const cause = target === "core" ? (readCoreDeploy() as { cause?: { kind: string; detail?: string } } | null)?.cause : result?.cause
  const what = target === "core" ? "the core's build" : target === "update" ? "the node update" : `the deployment of element «${target}»`
  const text = [
    `The person pressed «Разобрать с главным агентом» on the deploy board: ${what} failed.`,
    cause ? `Cause found by the node: ${cause.kind}${cause.detail ? ` — ${cause.detail}` : ""}.` : "No known cause was found.",
    result && result.previousUp !== undefined ? `The element's previous version ${result.previousUp ? "answers" : "does NOT answer"}.` : "",
    "The last lines of its log:",
    "```",
    ...lines,
    "```",
    isCore
      ? "Find the cause and tell the person in plain words. The core's own code is fixed upstream by Fractera, not here; the node stays on its previous build."
      : `Find the cause. A fault in the element's code is its own agent's work: give it the task with npm run task -- ${target} "<what to fix, with these lines>" — never edit its code yourself. When it reports the fix, tell the person to press «Развернуть» again. Tell the person in plain words what you found.`,
  ].filter(Boolean).join("\n")
  const r = await wake("build", { text, from: "deploy board", about: `${what} failed`, confirmed: true })
  return NextResponse.json({ ok: r.ok, ...(r.pending ? { pending: true } : {}), ...(r.ok ? {} : { reason: r.reason }) }, { status: r.ok ? 200 : 503 })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  let body: { ids?: unknown; rollback?: unknown; core?: unknown; debug?: unknown } = {}
  try {
    body = (await req.json()) as { ids?: unknown; rollback?: unknown; core?: unknown; debug?: unknown }
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-json" }, { status: 400 })
  }
  // Разбор — и во время другого развёртывания; всё остальное — одно развёртывание за раз.
  if (typeof body.debug === "string") return debugWithMainAgent(body.debug)
  if (deployLock.isRunning()) return NextResponse.json({ ok: false, reason: "already-running" }, { status: 409 })
  // 555: «Развернуть» ядра — `serve:rebuild` при закрытой крышке, вне дерева процессов ядра. Сборка остановит и этот сервер: ответ
  // уходит сразу, итог страница прочтёт, когда ядро поднимется (`core.deploy`). Подсказку об открытых терминалах показывает окно кнопки.
  if (body.core === true) {
    if (readCoreDeploy()?.state === "running") return NextResponse.json({ ok: false, reason: "core-running" }, { status: 409 })
    startFree("core-deploy.mjs", [])
    return NextResponse.json({ ok: true, core: "started" })
  }
  const known = new Set(elements().filter((e) => e.installed).map((e) => e.id))
  // 287: откат — та же команда, что с машины (`npm run deploy:rollback -- <id>`), отдельным процессом.
  if (typeof body.rollback === "string") {
    if (!known.has(body.rollback)) return NextResponse.json({ ok: false, reason: "no-elements" }, { status: 400 })
    if (previewLock.pendingPreview(ROOT, body.rollback)) return NextResponse.json({ ok: false, reason: "preview-pending", ids: [body.rollback] }, { status: 409 })
    if (!rollback.previousVersion(body.rollback)) return NextResponse.json({ ok: false, reason: "no-previous" }, { status: 409 })
    startFree("deploy-rollback.mjs", [body.rollback])
    return NextResponse.json({ ok: true, rollback: body.rollback })
  }
  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string" && known.has(x)) : []
  if (ids.length === 0) return NextResponse.json({ ok: false, reason: "no-elements" }, { status: 400 })
  // 353-1: предпросмотр, ждущий «Принять»/«Отклонить», держит соседнюю папку — развёртывание этого элемента запрещено.
  const waiting = ids.filter((x) => previewLock.pendingPreview(ROOT, x))
  if (waiting.length > 0) return NextResponse.json({ ok: false, reason: "preview-pending", ids: waiting }, { status: 409 })
  startFree("deploy-elements.mjs", ids)
  return NextResponse.json({ ok: true, started: ids })
}
