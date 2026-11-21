// @api tell the memory agent page whose Claude subscription it runs on, and switch it to its own person's subscription
import { mkdirSync, rmSync } from "node:fs"
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/get-session"
import elementAgentRoles from "@/lib/auth/element-agent-roles.cjs"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { claudeAuthState, claudeOwnLogout } from "../../_agent-kit/server/claude-cli.cjs"
import { status } from "../../_agent-kit/server/session.cjs"
import { isBornItem, ownClaudeDir, ownClaudeHome } from "../../_agent-kit/server/workspace.cjs"
import modes from "@/lib/agent-kit/modes.cjs"
import claudeAccount from "@/lib/agent-kit/claude-account.cjs"

// СОСТОЯНИЕ ПОДПИСКИ CLAUDE CODE (267-2) И СВОЯ ПОДПИСКА ЭЛЕМЕНТА (689). По умолчанию подписка одна на машину — у всех служб ответ
// одинаковый. 689 (владелец 2026-11-08: «if user need personal claude subscribtion , then can add to own element»): у элемента может
// быть своя папка Claude Code (`data/services/<id>/claude/`, `workspace.cjs` `ownClaudeHome`) — тогда ответ о ЕГО входе, а вход на его
// странице идёт в его папку (мост: `CLAUDE_CONFIG_DIR`). У агента узла и главного агента своей подписки не бывает — `canOwn: false`.
// 🔒 ДВЕРЬ КОПИИ КОМПЛЕКТА АГЕНТА (271): шаблон `kits/_agent-kit/api/*/route.ts.tpl`, установщик подставил имя службы вместо
// `memory`; у общей копии рождённых (326) — метка `__BORN__`, и имя берётся из адреса, только рождённого элемента.
//
// 🔒 ОТВЕЧАЕТ САМ `claude auth status`, А НЕ НАША ПАМЯТЬ О ТОМ, ЧТО ЧЕЛОВЕК ВХОДИЛ: вход живёт в папке настроек Claude Code и меняется
// без нашего ведома (выход в другом терминале, истёкший токен).
// 🛑 Почта учётной записи — сведения о человеке: дверь закрыта ролью архитектора и отказывает на временном адресе. Почта СВОЕЙ подписки
// элемента — чужого человека — отдаётся скрытой («bo…@gmail.com»).
// 🛑 Переключить можно только при выключенном агенте элемента: его сессия живёт в папке той подписки, с которой запущена.
export const dynamic = "force-dynamic"

const INSTALLED: string = "memory"
const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }
type Ctx = { params: Promise<Record<string, string>> }

/** Имя службы этой двери: подставленное установщиком, а у общей копии — из адреса, только рождённого элемента. */
async function serviceOf(ctx: Ctx): Promise<string | null> {
  if (INSTALLED !== "__BORN__") return INSTALLED
  const id = (await ctx.params)?.item ?? ""
  return isBornItem(id) ? id : null
}

async function guard(req: NextRequest, ctx: Ctx) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403 })
  // 834-3: the architect, the node's admin, or THIS element's own admin (`lib/auth/element-agent-roles.cjs`) — never a neighbour's
  const service = await serviceOf(ctx)
  return requireRoles(req, service ? elementAgentRoles.agentRoles(process.cwd(), service) : ROLES)
}

const masked = (email: string | null) => {
  if (!email) return null
  const [user, host] = email.split("@")
  return host ? `${user.slice(0, 2)}…@${host}` : `${email.slice(0, 2)}…`
}

const running = (service: string) =>
  Boolean(status(service)?.running) || Boolean(status(modes.sessionKey(service, "work"))?.running)

export async function GET(req: NextRequest, ctx: Ctx) {
  const denied = await guard(req, ctx)
  if (denied) return denied
  const service = await serviceOf(ctx)
  const own = service ? ownClaudeDir(service) : null
  // 833-3 (the server's main agent, handoff 2026-11-21: «архитектор увидел аккаунт узла с полной почтой и решил, что Марина вошла»): on a
  // dedicated server a walled element runs ONLY on its own account (811-5b) — without one the node's login is not its login: the page
  // hears «not signed in» and `walledNone`, never the node's e-mail.
  // 834-7: an element's own admin sees and uses only the element's OWN account — the node's login (its e-mail, «Войти заново») is never theirs
  const panel = ((await getSession(req))?.roles ?? []).some((r) => r === "architect" || r === "admin")
  if (service && (claudeAccount.accountOf(process.cwd(), service) === "none" || (!panel && !own))) {
    return NextResponse.json({ ok: true, canOwn: Boolean(ownClaudeHome(service)), own: false, walledNone: true, loggedIn: false, method: null, email: null, plan: null }, noStore)
  }
  const state = claudeAuthState(own)
  return NextResponse.json(
    { ok: true, canOwn: Boolean(service && ownClaudeHome(service)), own: Boolean(own), ...state, email: own ? masked(state.email) : state.email },
    noStore,
  )
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const denied = await guard(req, ctx)
  if (denied) return denied
  const service = await serviceOf(ctx)
  const home = service ? ownClaudeHome(service) : null
  if (!service || !home) return NextResponse.json({ ok: false, reason: "no-own-subscription" }, { status: 404, ...noStore })
  const body = (await req.json().catch(() => null)) as { own?: unknown } | null
  if (typeof body?.own !== "boolean") return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400, ...noStore })
  if (running(service)) return NextResponse.json({ ok: false, reason: "agent-running" }, { status: 409, ...noStore })
  // 834-7: the element's own admin may take its own subscription, never hand the element back to the node's
  const panel = ((await getSession(req))?.roles ?? []).some((r) => r === "architect" || r === "admin")
  if (!body.own && !panel) return NextResponse.json({ ok: false, reason: "own-only" }, { status: 403, ...noStore })
  if (body.own) {
    mkdirSync(home, { recursive: true })
  } else if (ownClaudeDir(service)) {
    claudeOwnLogout(home)
    rmSync(home, { recursive: true, force: true })
  }
  return NextResponse.json({ ok: true, own: Boolean(ownClaudeDir(service)) }, noStore)
}
