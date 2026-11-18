// @api keep the node bot factory and make bots by one tap
import { spawn } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { createHash, randomBytes } from "node:crypto"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { elementName } from "@/lib/web4-items/dashboard-rows"
import { addressOf } from "@/lib/web4-items/element-address"
import factory from "@/lib/node/bot-factory.cjs"

// 798-2 (the owner, 2026-11-18, Telegram 786–790): every node keeps its own factory (`lib/node/bot-factory.cjs`); the core's bot page
// sets it up once, then any bot page makes its bot by one tap in Telegram's own window. The token comes in once and never goes back —
// the answers carry the bot's username and the token's last 4. Architects only; the temporary address sees nothing.

const ROOT = process.cwd()
const noStore = { headers: { "Cache-Control": "no-store" } }
const WAIT = join(ROOT, "data", "node", "bot-factory-wait.json")
const SERVICE = /^[a-z0-9][a-z0-9-]{0,40}$/

const readWait = () => { try { return JSON.parse(readFileSync(WAIT, "utf8")) as Record<string, unknown> } catch { return null } }
const alive = (pid: unknown) => { try { process.kill(Number(pid), 0); return true } catch { return false } }
const hasKit = (s: string) =>
  existsSync(join(ROOT, "app", "[lang]", "(architectLayer)", "architect", s, "_agent-kit")) || existsSync(join(ROOT, "data", "services", s))

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403, ...noStore })
  return requireRoles(req, ["architect", "admin"])
}

function zone(): string {
  try { return String((JSON.parse(readFileSync(join(ROOT, "logs", "domain.json"), "utf8")) as { zone?: unknown }).zone ?? "") } catch { return "" }
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const live = req.nextUrl.searchParams.get("live") === "1"
  const w = readWait()
  const wait = w ? { ...w, state: w.state === "waiting" && !alive(w.pid) ? "stopped" : w.state, pid: undefined } : null
  const f = await factory.state(ROOT, { live })
  // the factory's own name and address for @BotFather — stable per node (a hash of its folder), editable there
  const z = zone()
  const salt = createHash("sha256").update(ROOT).digest("hex").slice(0, 4)
  const suggestion = f.ready ? null : { name: z ? `Fractera · ${z} · factory` : "Fractera · factory", username: factory.suggestUsername(z ? `${z.split(".")[0]}_factory` : "fractera_factory", salt) }
  return NextResponse.json({ ok: true, factory: f, suggestion, wait }, noStore)
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const body = (await req.json().catch(() => ({}))) as { action?: string; token?: string; service?: string; lang?: string }
  if (body.action === "save") return NextResponse.json(await factory.save(ROOT, body.token), noStore)
  if (body.action === "forget") return NextResponse.json({ ok: factory.forget(ROOT) }, noStore)
  if (body.action === "create") {
    const service = String(body.service ?? "")
    if (!SERVICE.test(service) || !hasKit(service)) return NextResponse.json({ ok: false, error: "unknown-service" }, { status: 400, ...noStore })
    const w = readWait()
    if (w?.state === "waiting" && alive(w.pid)) return NextResponse.json({ ok: false, error: "already-waiting", service: w.service }, { status: 409, ...noStore })
    const lang = body.lang === "ru" ? "ru" : "en"
    const z = zone().split(".")[0]
    const base = service === "build" ? (z ? `${z}_fractera` : "fractera_node") : `${addressOf(service)}`
    const name = service === "build" ? (zone() ? `Fractera · ${zone()}` : "Fractera") : elementName(service, lang)
    const username = factory.suggestUsername(base, randomBytes(3).toString("hex").slice(0, 4))
    const link = factory.createLink(ROOT, { username, name })
    if (!link.ok) return NextResponse.json(link, { status: 409, ...noStore })
    spawn(process.execPath, [join(ROOT, "scripts", "bot-factory-wait.mjs"), service, username], { cwd: ROOT, detached: true, windowsHide: true, stdio: "ignore" }).unref()
    return NextResponse.json({ ok: true, url: link.url, username, name }, noStore)
  }
  return NextResponse.json({ ok: false, error: "unknown-action" }, { status: 400, ...noStore })
}
