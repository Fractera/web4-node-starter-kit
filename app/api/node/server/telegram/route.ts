// @api set up the dedicated server's own Telegram bot from here
import { spawn, spawnSync } from "node:child_process"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { patchMove, readMove, roadOf, settle } from "@/lib/hosting/move-state.mjs"
import phase from "@/lib/hosting/phase.cjs"

// THE SERVER'S OWN BOT, FROM THE TAB «ВЫДЕЛЕННЫЙ СЕРВЕР» (node step 737-11a). The owner, 2026-11-13: «вызываем процедуру создание нового
// телеграмм бота прямо в этом окне как опциональное решение размещённое в аккордеоне. После подтверждения сервер сразу стартует
// установленный на него Telegram».
// 🔒 ONE SET-UP OF A BOT IN THE WHOLE NODE: the tab shows the agent kit's own `TelegramChannel` with this door instead of its own; every
// action goes to the SERVER's channel door of its main agent over SSH (`scripts/dedicated-server/telegram.mjs`) — the server checks the
// token with Telegram, keeps it in its own folder and admits the person by the link. Nothing of the bot is kept on this computer except
// the choice and the handle in `move.json` (no token, ever).
// 🔒 THE ARCHITECT ONLY, NEVER ON A PUBLIC ADDRESS, ONLY BETWEEN THE REHEARSAL AND THE MOVE: the server's core must run (it runs silent
// after the rehearsal), and after the move the server's own panel connects bots. Actions: `token`, `activation-link`, `messages`.
// 🔒 THE SUGGESTED HANDLE IS THE SERVER'S: the move keeps the node's code, so the server would suggest this computer's own bot handle —
// «_srv» is added (BotFather refuses a handle that is taken).
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const RELAY = join(ROOT, "scripts", "dedicated-server", "telegram.mjs")
const noStore = { headers: { "Cache-Control": "no-store" } }
/** The part of `move.json` these doors write (the module is JavaScript: its record is typed here). */
type MoveRecord = { telegram?: Record<string, unknown>; road?: string; welcome?: Record<string, unknown>; rungs: Record<string, Record<string, unknown> | undefined> }
const ACTIONS = new Set(["token", "activation-link", "messages"])
type Answer = { ok?: boolean; error?: string; configured?: boolean; botUsername?: string | null; allowed?: number; username?: string; suggestion?: { name: string; username: string } } & Record<string, unknown>

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403, ...noStore })
  return requireRoles(req, ["architect"] as const)
}

/** The moment this door works: a server connected and rehearsed here, the move not started, this node not a server itself. */
function closed(): string | null {
  if (phase.nodePhase(ROOT)) return "on-server"
  const s = settle(readMove(ROOT))
  if (!s.server?.host) return "no-server"
  // The server's core must run: after the rehearsal (the move), after its start (737-11b, an independent server).
  if (roadOf(s) === "new" ? s.rungs?.start?.state !== "done" : s.rungs?.rehearse?.state !== "done") return "not-started"
  // A move that rolled back leaves the choice open again; a running or finished one closes it.
  if (s.rungs?.move?.state === "running" || s.rungs?.move?.state === "done") return "moved"
  return null
}

/** The core's `NEXT_*` and `PORT` must not reach a child (ANTI-PATTERNS «All systems»). */
function cleanEnv(): NodeJS.ProcessEnv {
  return Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("NEXT_") && k !== "PORT" && k !== "__NEXT_PROCESSED_ENV")) as NodeJS.ProcessEnv
}

function relay(input: { method: "GET" | "POST"; lang: string; body?: unknown }): Promise<Answer> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [RELAY], { cwd: ROOT, env: cleanEnv(), stdio: ["pipe", "pipe", "ignore"], windowsHide: true })
    let out = ""
    const timer = setTimeout(() => child.kill(), 60_000)
    child.stdout.on("data", (d: Buffer) => { if (out.length < 200_000) out += d.toString() })
    child.on("close", () => {
      clearTimeout(timer)
      try { resolve(JSON.parse(out.trim().split("\n").pop() ?? "") as Answer) } catch { resolve({ ok: false, error: "server-unreachable" }) }
    })
    child.on("error", () => { clearTimeout(timer); resolve({ ok: false, error: "server-unreachable" }) })
    child.stdin.end(JSON.stringify(input))
  })
}

const langOf = (req: NextRequest) => {
  const l = req.nextUrl.searchParams.get("lang") ?? ""
  return /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/.test(l) ? l : "en"
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const why = closed()
  if (why) return NextResponse.json({ ok: false, error: why }, { status: 409, ...noStore })
  const a = await relay({ method: "GET", lang: langOf(req) })
  if (a.suggestion?.username) a.suggestion = { name: `${a.suggestion.name} server`, username: a.suggestion.username.replace(/_bot$/i, "_srv_bot").slice(0, 32) }
  // Admitted on the server → the rung is done: the choice and the handle are recorded here, the token stays there.
  if (a.ok && a.configured && a.botUsername && (a.allowed ?? 0) > 0) {
    const at = new Date().toISOString()
    let greet = false
    patchMove(ROOT, (s: MoveRecord) => {
      s.telegram = { choice: "new", bot: a.botUsername, allowed: a.allowed, at }
      if (s.rungs.telegram?.state !== "done") s.rungs.telegram = { state: "done", startedAt: at, endedAt: at, detail: `@${a.botUsername}` }
      // 737-11b: an independent server is already live — its main agent greets the person now, once (the move greets after its own start).
      if (s.road === "new" && !s.welcome) { s.welcome = { state: "running", at }; greet = true }
    })
    if (greet) spawnSync(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), join(ROOT, "scripts", "dedicated-server", "move.mjs"), "greet"], { cwd: ROOT, env: cleanEnv(), stdio: "ignore", timeout: 10_000, windowsHide: true })
  }
  return NextResponse.json(a, noStore)
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const why = closed()
  if (why) return NextResponse.json({ ok: false, error: why }, { status: 409, ...noStore })
  const body = (await req.json().catch(() => null)) as { action?: unknown } | null
  if (typeof body?.action !== "string" || !ACTIONS.has(body.action)) return NextResponse.json({ ok: false, error: "unknown-action" }, { status: 400, ...noStore })
  const a = await relay({ method: "POST", lang: langOf(req), body })
  // The server took a bot of its own: every later copy leaves its folder there untouched (`serverKeeps`), whatever happens next.
  if (body.action === "token" && a.ok && a.username) {
    patchMove(ROOT, (s: MoveRecord) => { s.telegram = { choice: "new", bot: a.username, at: new Date().toISOString() } })
  }
  return NextResponse.json(a, noStore)
}
