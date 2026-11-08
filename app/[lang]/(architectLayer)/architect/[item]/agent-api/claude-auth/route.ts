// @api tell the born WEB4 element agent page whose Claude subscription it runs on, and switch it to its own person's subscription
import { mkdirSync, rmSync } from "node:fs"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { claudeAuthState, claudeOwnLogout } from "../../_agent-kit/server/claude-cli.cjs"
import { status } from "../../_agent-kit/server/session.cjs"
import { isBornItem, ownClaudeDir, ownClaudeHome } from "../../_agent-kit/server/workspace.cjs"
import modes from "@/lib/agent-kit/modes.cjs"

// СОСТОЯНИЕ ПОДПИСКИ CLAUDE CODE (267-2) И СВОЯ ПОДПИСКА ЭЛЕМЕНТА (689). По умолчанию подписка одна на машину — у всех служб ответ
// одинаковый. 689 (владелец 2026-11-08: «if user need personal claude subscribtion , then can add to own element»): у элемента может
// быть своя папка Claude Code (`data/services/<id>/claude/`, `workspace.cjs` `ownClaudeHome`) — тогда ответ о ЕГО входе, а вход на его
// странице идёт в его папку (мост: `CLAUDE_CONFIG_DIR`). У агента узла и главного агента своей подписки не бывает — `canOwn: false`.
// 🔒 ДВЕРЬ КОПИИ КОМПЛЕКТА АГЕНТА (271): шаблон `kits/_agent-kit/api/*/route.ts.tpl`, установщик подставил имя службы вместо
// `born WEB4 element`; у общей копии рождённых (326) — метка `__BORN__`, и имя берётся из адреса, только рождённого элемента.
//
// 🔒 ОТВЕЧАЕТ САМ `claude auth status`, А НЕ НАША ПАМЯТЬ О ТОМ, ЧТО ЧЕЛОВЕК ВХОДИЛ: вход живёт в папке настроек Claude Code и меняется
// без нашего ведома (выход в другом терминале, истёкший токен).
// 🛑 Почта учётной записи — сведения о человеке: дверь закрыта ролью архитектора и отказывает на временном адресе. Почта СВОЕЙ подписки
// элемента — чужого человека — отдаётся скрытой («bo…@gmail.com»).
// 🛑 Переключить можно только при выключенном агенте элемента: его сессия живёт в папке той подписки, с которой запущена.
export const dynamic = "force-dynamic"

const INSTALLED: string = "__BORN__"
const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }
type Ctx = { params: Promise<Record<string, string>> }

/** Имя службы этой двери: подставленное установщиком, а у общей копии — из адреса, только рождённого элемента. */
async function serviceOf(ctx: Ctx): Promise<string | null> {
  if (INSTALLED !== "__BORN__") return INSTALLED
  const id = (await ctx.params)?.item ?? ""
  return isBornItem(id) ? id : null
}

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403 })
  return requireRoles(req, ROLES)
}

const masked = (email: string | null) => {
  if (!email) return null
  const [user, host] = email.split("@")
  return host ? `${user.slice(0, 2)}…@${host}` : `${email.slice(0, 2)}…`
}

const running = (service: string) =>
  Boolean(status(service)?.running) || Boolean(status(modes.sessionKey(service, "work"))?.running)

export async function GET(req: NextRequest, ctx: Ctx) {
  const denied = await guard(req)
  if (denied) return denied
  const service = await serviceOf(ctx)
  const own = service ? ownClaudeDir(service) : null
  const state = claudeAuthState(own)
  return NextResponse.json(
    { ok: true, canOwn: Boolean(service && ownClaudeHome(service)), own: Boolean(own), ...state, email: own ? masked(state.email) : state.email },
    noStore,
  )
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const denied = await guard(req)
  if (denied) return denied
  const service = await serviceOf(ctx)
  const home = service ? ownClaudeHome(service) : null
  if (!service || !home) return NextResponse.json({ ok: false, reason: "no-own-subscription" }, { status: 404, ...noStore })
  const body = (await req.json().catch(() => null)) as { own?: unknown } | null
  if (typeof body?.own !== "boolean") return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400, ...noStore })
  if (running(service)) return NextResponse.json({ ok: false, reason: "agent-running" }, { status: 409, ...noStore })
  if (body.own) {
    mkdirSync(home, { recursive: true })
  } else if (ownClaudeDir(service)) {
    claudeOwnLogout(home)
    rmSync(home, { recursive: true, force: true })
  }
  return NextResponse.json({ ok: true, own: Boolean(ownClaudeDir(service)) }, noStore)
}
