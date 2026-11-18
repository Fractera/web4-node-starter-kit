// @api keep the node bot factory and make bots by one tap
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import factory from "@/lib/node/bot-factory.cjs"
import { factoryWait, startCreate } from "@/lib/node/bot-factory-create"

// 798-2 (the owner, 2026-11-18, Telegram 786–790): every node keeps its own factory (`lib/node/bot-factory.cjs`); the core's bot page
// sets it up once, then any bot page makes its bot by one tap in Telegram's own window. The token comes in once and never goes back —
// the answers carry the bot's username and the token's last 4. Architects only; the temporary address sees nothing.

const ROOT = process.cwd()
const noStore = { headers: { "Cache-Control": "no-store" } }

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
  const wait = factoryWait()
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
    const r = startCreate(String(body.service ?? ""), body.lang === "ru" ? "ru" : "en")
    return r.ok ? NextResponse.json(r, noStore) : NextResponse.json({ ok: false, error: r.error }, { status: r.status, ...noStore })
  }
  return NextResponse.json({ ok: false, error: "unknown-action" }, { status: 400, ...noStore })
}
