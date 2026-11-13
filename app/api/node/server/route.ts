// @api read the move ladder and start its next rung
import { spawn, spawnSync } from "node:child_process"
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { mayStart, readMove, RUNGS, settle } from "@/lib/hosting/move-state.mjs"
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

function view() {
  return { ok: true, state: settle(readMove(ROOT)), rungs: RUNGS, phase: phase.nodePhase(ROOT), moved: existsSync(join(ROOT, "data", "node", "moved.json")) }
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
  const body = (await req.json().catch(() => null)) as { rung?: unknown; host?: unknown; port?: unknown; password?: unknown; code?: unknown } | null
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

  if (!RUNGS.includes(rung) || rung === "connect") return NextResponse.json({ ok: false, reason: "unknown-rung", allowed: RUNGS }, { status: 400, ...noStore })
  if (!mayStart(settle(readMove(ROOT)), rung)) return NextResponse.json({ ok: false, reason: "order" }, { status: 409, ...noStore })
  spawnSync(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), RUNNER, rung], { cwd: ROOT, env: cleanEnv(), stdio: "ignore", timeout: 10_000, windowsHide: true })
  return NextResponse.json({ ...view(), started: rung }, { status: 202, ...noStore })
}
