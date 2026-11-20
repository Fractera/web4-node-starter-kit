// @api update this node from its synced fork: state, check, start
import { spawn } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"

// ОБНОВЛЕНИЕ УЗЛА ИЗ ФОРКА — ДВЕРЬ ПОЛОСЫ «ВЕРСИЯ УСТАРЕЛА» (узел, шаг 632-4). Владелец 2026-11-03: «синхронизацию я уже выполнил
// наверно было бы логично здесь поставить вторую кнопку запустить развёртывание? И убрать кнопку открыть Fork?»
// GET — без сети: отставание форка от оригинала (отметка `check-origin`, `logs/origin.json`), отставание узла от форка (`git rev-list`
// по последней выборке), итог обновления (`data/node/node-update.json`, `running` без живого процесса — прервано).
// POST { action: "check" } — «Проверить снова»: `check-origin` и `git fetch origin` (сеть — только по кнопке человека).
// POST { action: "update" } — «Обновить узел»: stage 0 (`scripts/node-update-stage0.mjs`, 743-2: обновляет версия, до которой
// обновляемся) через `spawn-free` (сборка ядра остановит само ядро).
// POST { action: "preflight" } — 743-4: пробное слияние во временной копии, только вердикт (`--preflight`): ничего не пишет, никого не
// будит; отказ, пока идёт обновление. Спрашивает полоса один раз при открытии, когда узел отстаёт; таймеров нет.
// 815-2 (владелец 2026-11-20, Telegram 239: «Первые три раза кнопка не нажалась спустя 1 минуту»): ✗ полоса спрашивала пробное слияние на
// КАЖДОЙ открытой странице, и каждое шло заново (fetch, копия, слияние — до двух минут нагрузки на сервер). Теперь вердикт один на цель —
// пару (HEAD узла, origin/main): та же пара отвечается из памяти процесса без слияния; идущее слияние делят все, кто спросил, второе не
// начинается. Ответ несёт `cached` — сколько секунд вердикту.
// 815-6: «Обновить» отвечает без синхронного вызова — ✗ spawnSync держал процесс Next до 10 с, и все страницы узла ждали.
// 🛑 Окружение детей очищается (ANTI-PATTERNS: дочерний процесс сервера Next иначе не читает свой `.env.local`); ожидание — без
// синхронного вызова, сайт не замирает.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const ROOT = process.cwd()
const STATE = join(ROOT, "data", "node", "node-update.json")
const LOG = join(ROOT, "logs", "node-update.log")

type UpdateState = { state: string; stage?: string; pid?: number; startedAt?: string; finishedAt?: string; summary?: string; reason?: string; changes?: number }

const readJson = <T,>(file: string): T | null => { try { return JSON.parse(readFileSync(file, "utf8")) as T } catch { return null } }

function childEnv(): NodeJS.ProcessEnv {
  const env: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(process.env)) if (!/^(__NEXT|NEXT_|AGI_)/.test(k) && !["PORT", "HOSTNAME", "NODE_ENV"].includes(k)) env[k] = v
  return env as NodeJS.ProcessEnv
}

function sh(cmd: string, args: string[], ms: number): Promise<{ code: number | null; out: string }> {
  return new Promise((resolve) => {
    let out = ""
    const child = spawn(cmd, args, { cwd: ROOT, env: childEnv(), windowsHide: true })
    child.stdout.on("data", (b: Buffer) => { out = (out + b.toString()).slice(-8000) })
    child.stderr.on("data", (b: Buffer) => { out = (out + b.toString()).slice(-8000) })
    const timer = setTimeout(() => child.kill(), ms)
    child.on("exit", (code) => { clearTimeout(timer); resolve({ code, out }) })
    child.on("error", (e) => { clearTimeout(timer); resolve({ code: null, out: String(e) }) })
  })
}

type Verdict = { ok: boolean; conflicts?: string[]; reason?: string }
/** 815-2: one trial merge per target, shared by every page that asks; kept in this process only (a restart asks again). */
const verdict: { last: { key: string; preflight: Verdict; at: number } | null; pending: Promise<{ preflight: Verdict | null; detail: string }> | null } = { last: null, pending: null }

/** The target of an update: this node's HEAD and the fork's main as last fetched — no network. */
async function target(): Promise<string> {
  const r = await sh("git", ["rev-parse", "HEAD", "origin/main"], 15_000)
  return r.out.trim().split("\n").join(" ")
}

async function runPreflight(): Promise<{ preflight: Verdict | null; detail: string }> {
  const r = await sh(process.execPath, [join(ROOT, "scripts", "node-update-stage0.mjs"), "--preflight"], 120_000)
  const line = r.out.split("\n").reverse().find((l) => l.startsWith("===NODE_UPDATE_PREFLIGHT=== "))
  let preflight: Verdict | null = null
  try { if (line) preflight = JSON.parse(line.slice("===NODE_UPDATE_PREFLIGHT=== ".length)) as Verdict } catch { /* an unreadable verdict is no verdict */ }
  // the key after the run: stage 0 fetched the fork, so origin/main is the one this verdict was made for
  if (preflight) verdict.last = { key: await target(), preflight, at: Date.now() }
  return { preflight, detail: r.out.slice(-400) }
}

function update(): UpdateState | null {
  const s = readJson<UpdateState>(STATE)
  if (s?.state === "running" && s.pid) { try { process.kill(s.pid, 0) } catch { return { ...s, state: "interrupted" } } }
  return s
}

async function body(lines = 8) {
  const rec = readJson<{ verdict?: string; url?: string; version?: { behindBy?: number; checkedAt?: string } }>(join(ROOT, "logs", "origin.json"))
  const fork = rec?.verdict === "fork"
  const nodeBehind = fork ? Number((await sh("git", ["rev-list", "--count", "HEAD..origin/main"], 15_000)).out.trim()) || 0 : 0
  let log: string[] = []
  try { log = readFileSync(LOG, "utf8").replace(/\r/g, "").split("\n").filter(Boolean).slice(-lines) } catch { /* обновления ещё не было */ }
  return {
    ok: true,
    fork,
    behindBy: fork ? Number(rec?.version?.behindBy) || 0 : 0,
    nodeBehind,
    checkedAt: rec?.version?.checkedAt ?? null,
    repo: typeof rec?.url === "string" ? rec.url.replace(/\.git$/, "") : null,
    update: update(),
    log,
  }
}

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  // 642-3: `?tail=1` — 200 строк журнала для терминала доски развёртываний.
  return NextResponse.json(await body(req.nextUrl.searchParams.get("tail") ? 200 : 8), { headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  let action = ""
  try { action = String(((await req.json()) as { action?: unknown })?.action ?? "") } catch { /* тела нет */ }
  if (action === "check") {
    await sh(process.execPath, [join(ROOT, "scripts", "check-origin.mjs")], 60_000)
    await sh("git", ["fetch", "--quiet", "origin"], 120_000)
    return NextResponse.json(await body(), { headers: { "Cache-Control": "no-store" } })
  }
  if (action === "update") {
    if (update()?.state === "running") return NextResponse.json({ ok: false, error: "running" }, { status: 409 })
    // a trial merge in flight fetches the same fork: the start waits for it rather than racing its git locks
    if (verdict.pending) await verdict.pending.catch(() => null)
    await sh(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), join(ROOT, "scripts", "node-update-run.mjs")], 10_000)
    verdict.last = null
    return NextResponse.json({ ok: true, started: true })
  }
  if (action === "preflight") {
    if (update()?.state === "running") return NextResponse.json({ ok: false, error: "running" }, { status: 409 })
    const key = await target()
    if (verdict.last && verdict.last.key === key) {
      return NextResponse.json({ ok: true, preflight: verdict.last.preflight, cached: Math.round((Date.now() - verdict.last.at) / 1000) }, { headers: { "Cache-Control": "no-store" } })
    }
    verdict.pending ??= runPreflight().finally(() => { verdict.pending = null })
    const v = await verdict.pending
    if (v.preflight) return NextResponse.json({ ok: true, preflight: v.preflight, cached: 0 }, { headers: { "Cache-Control": "no-store" } })
    return NextResponse.json({ ok: false, error: "no-verdict", detail: v.detail }, { status: 502 })
  }
  return NextResponse.json({ ok: false, error: "unknown-action" }, { status: 400 })
}
