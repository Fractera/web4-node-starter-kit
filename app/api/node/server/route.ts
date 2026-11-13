// @api read the move ladder and start its next rung
import { spawn, spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { ALL_RUNGS, mayCancel, mayChooseRoad, mayClear, mayStart, moveFile, patchMove, readMove, roadOf, rungsOf, settle } from "@/lib/hosting/move-state.mjs"
import phase from "@/lib/hosting/phase.cjs"

// THE MOVE TO A DEDICATED SERVER — THE DOOR OF ITS LADDER (node step 737-7). The owner, 2026-11-13: «настройка которая принимает
// IP-адрес сервера и которая принимает пароль с сервера а затем создают процесс при котором шаг за шагом автоматически … весь проект
// переносится на сервер».
// 🔒 THE ARCHITECT ONLY, NEVER ON A PUBLIC ADDRESS: the state names the server; a stranger with the temporary link must not start a move.
// 🔒 THE PASSWORD GOES TO THE RUNNER BY STDIN and nowhere else — not argv (visible in the process list), not the environment, not a file;
// this door waits for the runner (seconds) and returns its rung. Every other rung runs detached (`spawn-free`: a core rebuild or the
// move's own stop of the core does not kill it) and the screen follows `data/node/server/move.json`.
// 🔒 ON THE SERVER ITSELF THE LADDER IS CLOSED: a node that already lives on its server (or rehearses there) does not move again from here.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const RUNNER = join(ROOT, "scripts", "dedicated-server", "move.mjs")
const noStore = { headers: { "Cache-Control": "no-store" } }
/** The part of `move.json` these doors write (the module is JavaScript: its record is typed here). */
type MoveRecord = { telegram?: Record<string, unknown>; road?: string; copyPlan?: { variant: string; data: boolean }; rungs: Record<string, Record<string, unknown> | undefined> }
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/
const HOST = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403, ...noStore })
  return requireRoles(req, ["architect"] as const)
}

/** The core's `NEXT_*` and `PORT` must not reach a child (ANTI-PATTERNS «All systems»). */
function cleanEnv(): NodeJS.ProcessEnv {
  return Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("NEXT_") && k !== "PORT" && k !== "__NEXT_PROCESSED_ENV")) as NodeJS.ProcessEnv
}

const readJson = (file: string): Record<string, unknown> | null => { try { return JSON.parse(readFileSync(file, "utf8")) } catch { return null } }

/**
 * 737-11a: this node's main bot as the rung «Telegram» needs it — its handle and how many people it admits; never the token. Connected =
 * a token and at least one admitted person (the same definition as `connected()` of the agent kit's telegram.cjs).
 */
function homeBot(): { username: string; allowed: number } | null {
  const dir = join(ROOT, "data", "services", "build", "channel", "telegram")
  const username = readJson(join(dir, "bot.json"))?.username
  const allow = readJson(join(dir, "access.json"))?.allowFrom
  const allowed = Array.isArray(allow) ? allow.length : 0
  return typeof username === "string" && username && allowed > 0 && existsSync(join(dir, ".env")) ? { username, allowed } : null
}

/** Where the server's panel will answer after the move — the links in the server bot's own status lines start there. */
function serverOrigin(host: string | undefined): string | null {
  const zone = readJson(join(ROOT, "logs", "domain.json"))?.zone
  if (typeof zone === "string" && zone) return `https://architect.${zone}`
  return host ? `http://${host}` : null
}

function view() {
  const state = settle(readMove(ROOT))
  return { ok: true, state, road: roadOf(state), rungs: rungsOf(state), phase: phase.nodePhase(ROOT), moved: existsSync(join(ROOT, "data", "node", "moved.json")), homeBot: homeBot(), serverOrigin: serverOrigin(state.server?.host) }
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  return NextResponse.json(view(), noStore)
}

function connect(host: string, port: number, password: string): Promise<number | null> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [RUNNER, "connect", "--host", host, "--port", String(port)], { cwd: ROOT, env: cleanEnv(), stdio: ["pipe", "ignore", "ignore"], windowsHide: true })
    const timer = setTimeout(() => child.kill(), 90_000)
    child.on("close", (code) => { clearTimeout(timer); resolve(code) })
    child.on("error", () => { clearTimeout(timer); resolve(null) })
    child.stdin.end(`${password}\n`)
  })
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  if (phase.nodePhase(ROOT)) return NextResponse.json({ ok: false, reason: "on-server" }, { status: 409, ...noStore })
  const body = (await req.json().catch(() => null)) as { rung?: unknown; host?: unknown; port?: unknown; password?: unknown; code?: unknown; confirm?: unknown; choice?: unknown; road?: unknown; variant?: unknown; data?: unknown } | null
  const rung = typeof body?.rung === "string" ? body.rung : ""

  if (rung === "connect") {
    const host = typeof body?.host === "string" ? body.host.trim().toLowerCase() : ""
    const port = typeof body?.port === "number" ? body.port : Number(body?.port ?? 22)
    const password = typeof body?.password === "string" ? body.password : ""
    if (!(IPV4.test(host) || HOST.test(host)) || !Number.isInteger(port) || port < 1 || port > 65535) {
      return NextResponse.json({ ok: false, reason: "bad-address" }, { status: 400, ...noStore })
    }
    if (!password || password.length > 512 || /[\r\n]/.test(password)) return NextResponse.json({ ok: false, reason: "bad-password" }, { status: 400, ...noStore })
    await connect(host, port, password)
    return NextResponse.json(view(), noStore)
  }

  if (rung === "claude-code") {
    // The one-time code of Claude's sign-in, pasted by the person: handed to the runner that holds the server's login terminal, which
    // reads and deletes it within a second.
    const code = typeof body?.code === "string" ? body.code.trim() : ""
    if (!/^[A-Za-z0-9_#.-]{8,400}$/.test(code)) return NextResponse.json({ ok: false, reason: "bad-code" }, { status: 400, ...noStore })
    if (readMove(ROOT).rungs?.claude?.state !== "running") return NextResponse.json({ ok: false, reason: "not-waiting" }, { status: 409, ...noStore })
    mkdirSync(join(ROOT, "data", "node", "server"), { recursive: true, mode: 0o700 })
    writeFileSync(join(ROOT, "data", "node", "server", "claude-code.txt"), code, { mode: 0o600 })
    return NextResponse.json({ ok: true }, noStore)
  }

  if (rung === "clear" || rung === "cancel") {
    // 🔒 A BUSY SERVER (737-7, the owner 2026-11-13: «очистить должно иметь подтверждающий диалог»): the dialog sends back the server's
    // address the person saw in it — a stray call without it frees nothing.
    const state = settle(readMove(ROOT))
    if (rung === "clear" && (body?.confirm !== state.server?.host || !mayClear(state))) return NextResponse.json({ ok: false, reason: body?.confirm !== state.server?.host ? "not-confirmed" : "order" }, { status: 409, ...noStore })
    if (rung === "cancel" && !mayCancel(state)) return NextResponse.json({ ok: false, reason: "order" }, { status: 409, ...noStore })
    spawnSync(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), RUNNER, rung], { cwd: ROOT, env: cleanEnv(), stdio: "ignore", timeout: 10_000, windowsHide: true })
    return NextResponse.json({ ...view(), started: rung }, { status: 202, ...noStore })
  }

  if (rung === "road") {
    // 737-11b: the move of this node, or a new independent server — chosen before anything is done on the server.
    const state = settle(readMove(ROOT))
    if (!mayChooseRoad(state)) return NextResponse.json({ ok: false, reason: "order" }, { status: 409, ...noStore })
    patchMove(ROOT, (s: MoveRecord) => { s.road = body?.road === "new" ? "new" : "move" })
    return NextResponse.json(view(), noStore)
  }

  if (rung === "forget") {
    // 737-11b: an independent server that runs is left to live on its own; its record is kept aside and the tab is free for another
    // server. The node's key stays on that server (a copy again is a new road to the same address).
    const state = settle(readMove(ROOT))
    if (roadOf(state) !== "new" || state.rungs?.start?.state !== "done" || ALL_RUNGS.some((r) => state.rungs?.[r]?.state === "running")) {
      return NextResponse.json({ ok: false, reason: "order" }, { status: 409, ...noStore })
    }
    const kept = join(ROOT, "data", "node", "server", "done")
    mkdirSync(kept, { recursive: true, mode: 0o700 })
    renameSync(moveFile(ROOT), join(kept, `${String(state.server?.host ?? "server").replace(/[^a-z0-9.-]/gi, "_")}-${Date.now()}.json`))
    return NextResponse.json(view(), noStore)
  }

  if (rung === "telegram") {
    // 737-11a: the rung has no runner — the person's choice is the whole act. «move» needs this node's connected bot; «new» is done by the
    // server's own channel (`/api/node/server/telegram` records it when the person is admitted there); «reset» reopens the choice until
    // the move starts.
    const state = settle(readMove(ROOT))
    const choice = typeof body?.choice === "string" ? body.choice : ""
    const at = new Date().toISOString()
    if (choice === "reset") {
      if (state.rungs?.move?.state === "done" || ALL_RUNGS.some((r: string) => state.rungs?.[r]?.state === "running")) return NextResponse.json({ ok: false, reason: "order" }, { status: 409, ...noStore })
      patchMove(ROOT, (s: MoveRecord) => { delete s.telegram; delete s.rungs.telegram })
      return NextResponse.json(view(), noStore)
    }
    if (choice !== "move" && choice !== "later") return NextResponse.json({ ok: false, reason: "bad-choice" }, { status: 400, ...noStore })
    if (!mayStart(state, "telegram")) return NextResponse.json({ ok: false, reason: "order" }, { status: 409, ...noStore })
    const bot = homeBot()
    if (choice === "move" && !bot) return NextResponse.json({ ok: false, reason: "no-bot" }, { status: 409, ...noStore })
    // An independent server never takes this node's bot: two readers of one bot split the person's messages (409).
    if (choice === "move" && roadOf(state) === "new") return NextResponse.json({ ok: false, reason: "not-on-this-road" }, { status: 409, ...noStore })
    patchMove(ROOT, (s: MoveRecord) => {
      s.telegram = { choice, bot: choice === "move" ? bot?.username ?? null : null, at }
      s.rungs.telegram = { state: "done", startedAt: at, endedAt: at, detail: choice === "move" ? `@${bot?.username}` : "later" }
    })
    return NextResponse.json(view(), noStore)
  }

  if (!ALL_RUNGS.includes(rung) || rung === "connect") return NextResponse.json({ ok: false, reason: "unknown-rung", allowed: ALL_RUNGS }, { status: 400, ...noStore })
  if (!mayStart(settle(readMove(ROOT)), rung)) return NextResponse.json({ ok: false, reason: "order" }, { status: 409, ...noStore })
  if (rung === "copy" && roadOf(readMove(ROOT)) === "new") {
    // 737-11b, D5 (the owner): «both variant for choose. and if it will clon need second question - replace data or not».
    const variant = body?.variant === "fresh" ? "fresh" : body?.variant === "clone" ? "clone" : null
    if (!variant) return NextResponse.json({ ok: false, reason: "no-plan" }, { status: 400, ...noStore })
    patchMove(ROOT, (s: MoveRecord) => { s.copyPlan = { variant, data: variant === "clone" && body?.data === true } })
  }
  spawnSync(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), RUNNER, rung], { cwd: ROOT, env: cleanEnv(), stdio: "ignore", timeout: 10_000, windowsHide: true })
  return NextResponse.json({ ...view(), started: rung }, { status: 202, ...noStore })
}
