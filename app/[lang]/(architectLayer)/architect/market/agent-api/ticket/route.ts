// @api issue a one-minute single-use ticket for the market agent terminal socket
import { NextRequest, NextResponse } from "next/server"

import { kitAccess } from "@/lib/agent-kit/kit-access"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { mintTicket } from "../../_agent-kit/server/ticket.cjs"
import { isBornItem } from "../../_agent-kit/server/workspace.cjs"
import elementAgentRoles from "@/lib/auth/element-agent-roles.cjs"

// БИЛЕТ НА ТЕРМИНАЛ СЛУЖБЫ (267-1).
// 🔒 ДВЕРЬ КОПИИ КОМПЛЕКТА АГЕНТА (271): шаблон `kits/_agent-kit/api/*/route.ts.tpl`, установщик подставил
// имя службы вместо `market`. Живёт в маршруте службы — удалили папку службы, ушла и дверь.
//
// 🔒 РОЛЬ ПРОВЕРЯЕТСЯ ЗДЕСЬ И ТОЛЬКО ЗДЕСЬ. Сокет `/pty/<служба>` принимает `server.js` до Next, замок слоя его не
// видит — сокет верит лишь билету, который выдала эта дверь.
// 🛑 ОТКАЗ НА ВРЕМЕННОМ АДРЕСЕ: терминал — это командная строка машины человека, и открыть её всякому,
// кому переслали ссылку быстрого туннеля, нельзя.
export const dynamic = "force-dynamic"

const INSTALLED: string = "market"
// Параметры маршрута — словарь строк: у обычной копии там только `lang`, у общей — ещё и `item`.
type Ctx = { params: Promise<Record<string, string>> }
async function serviceOf(ctx: Ctx): Promise<string | null> {
  if (INSTALLED !== "__BORN__") return INSTALLED
  const id = (await ctx.params)?.item ?? ""
  return isBornItem(id) ? id : null
}

export async function POST(req: NextRequest, ctx: Ctx) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403 })
  const service = await serviceOf(ctx)
  if (!service) return NextResponse.json({ ok: false, reason: "unknown-service" }, { status: 404 })
  // 834-3: the architect, the node's admin, or THIS element's own admin (`lib/auth/element-agent-roles.cjs`)
  // 836-1: or the element itself, by its own key, for the person its own sign-in admitted (`lib/agent-kit/kit-access.ts`)
  const access = await kitAccess(req, service, elementAgentRoles.agentRoles(process.cwd(), service))
  if (access.denied) return access.denied
  // 834-2: the ticket names its element — another element's socket refuses it
  // 834-7: an element's own admin (not the architect, not the node's admin) — its socket runs only on the element's OWN account
  const { ticket, expiresInMs } = mintTicket(access.who ?? "architect@node", service, { ownOnly: !access.panel })
  return NextResponse.json({ ok: true, ticket, expiresInMs }, { headers: { "Cache-Control": "no-store" } })
}
