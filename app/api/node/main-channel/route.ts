// @api the main agent Telegram channel state and its reconnect
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import mainChannel from "@/lib/node/main-channel.cjs"

// TELEGRAM ГЛАВНОГО АГЕНТА (узел, шаг 781-4). GET — слышит ли бот (`lib/node/main-channel.cjs`: файл состояния моста, сверенный с живым
// плагином); POST `{ action: "reconnect" | "wake" }` — кнопка красной полосы: живая сессия перезапускает тот же разговор сейчас, закрытая —
// просыпается (мост комплекта, `channelAction`, через `globalThis.__web4AgentChannel` — один процесс с сервером узла). Ворота — architect
// и admin; на временном адресе — только чтение состояния, без кнопки. Пульт Telegram зовёт то же действие своей подписанной дверью.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const noStore = { headers: { "Cache-Control": "no-store" } }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  return NextResponse.json({ ok: true, channel: mainChannel.health(ROOT, "build") }, noStore)
}

export async function POST(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "read-only address" }, { status: 403, ...noStore })
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { action?: unknown } | null
  const action = body?.action === "reconnect" || body?.action === "wake" ? body.action : null
  if (!action) return NextResponse.json({ ok: false, reason: "action must be reconnect or wake" }, { status: 400, ...noStore })
  const run = (globalThis as { __web4AgentChannel?: (service: string, action: string) => Promise<{ ok: boolean; did?: string; reason?: string }> }).__web4AgentChannel
  if (typeof run !== "function") return NextResponse.json({ ok: false, reason: "no-agent-kit" }, { status: 503, ...noStore })
  const out = await run("build", action)
  console.log(`[node/main-channel] ${action} from the panel → ${out.ok ? out.did : out.reason}`)
  return NextResponse.json(out, { status: out.ok ? 200 : 500, ...noStore })
}
