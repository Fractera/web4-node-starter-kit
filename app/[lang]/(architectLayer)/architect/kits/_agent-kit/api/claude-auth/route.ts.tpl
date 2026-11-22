// @api tell the __SERVICE__ agent page whose Claude subscription it runs on, and switch it to its own person's subscription
import { mkdirSync, rmSync } from "node:fs"
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/get-session"
import elementAgentRoles from "@/lib/auth/element-agent-roles.cjs"

import { kitAccess } from "@/lib/agent-kit/kit-access"
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
// `__SERVICE__`; у общей копии рождённых (326) — метка `__BORN__`, и имя берётся из адреса, только рождённого элемента.
//
// 🔒 ОТВЕЧАЕТ САМ `claude auth status`, А НЕ НАША ПАМЯТЬ О ТОМ, ЧТО ЧЕЛОВЕК ВХОДИЛ: вход живёт в папке настроек Claude Code и меняется
// без нашего ведома (выход в другом терминале, истёкший токен).
// 🛑 Почта учётной записи — сведения о человеке: дверь закрыта ролью архитектора и отказывает на временном адресе. Почта СВОЕЙ подписки
// элемента — чужого человека — отдаётся скрытой («bo…@gmail.com»).
// 🛑 Переключить можно только при выключенном агенте элемента: его сессия живёт в папке той подписки, с которой запущена.
export const dynamic = "force-dynamic"

const INSTALLED: string = "__SERVICE__"
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
  return (await kitAccess(req, service, service ? elementAgentRoles.agentRoles(process.cwd(), service) : ROLES)).denied // 836-1: or the element's own key — never «the panel» (no session → own account only)
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
  // 837-0e (the owner, Telegram 843: «самостоятельный … ему нельзя давать выбор»): an element that may run only on its own account — walled on
  // a server or an app of its own — has no choice: its own folder is made here, `canOwn: false` hides the choice island, `own: true` gives
  // the one button «Войти». Signed in is read from the files its own user wrote (existence), never by running `claude` as the node.
  if (service && claudeAccount.ownOnly(process.cwd(), service)) {
    const made = claudeAccount.ensureOwnHome(process.cwd(), service)
    if (!made.ok) {
      return NextResponse.json({ ok: true, canOwn: false, own: false, walledNone: true, loggedIn: false, method: null, email: null, plan: null, ownError: made.reason }, noStore)
    }
    const signedIn = claudeAccount.ownSignedIn(process.cwd(), service)
    return NextResponse.json(
      { ok: true, canOwn: false, own: true, walledNone: false, loggedIn: signedIn, method: signedIn ? "claude.ai" : null, email: signedIn ? masked(claudeAccount.ownEmail(process.cwd(), service)) : null, plan: null },
      noStore,
    )
  }
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
  // 837-0e: an own-only element has no switch — never the node's login; «own» only makes sure its folder exists
  if (claudeAccount.ownOnly(process.cwd(), service)) {
    if (!body.own) return NextResponse.json({ ok: false, reason: "own-only" }, { status: 403, ...noStore })
    const made = claudeAccount.ensureOwnHome(process.cwd(), service)
    return NextResponse.json(made.ok ? { ok: true, own: true } : { ok: false, reason: made.reason }, { status: made.ok ? 200 : 500, ...noStore })
  }
  if (running(service)) return NextResponse.json({ ok: false, reason: "agent-running" }, { status: 409, ...noStore })
  // 834-7: the element's own admin may take its own subscription, never hand the element back to the node's
  const panel = ((await getSession(req))?.roles ?? []).some((r) => r === "architect" || r === "admin")
  if (!body.own && !panel) return NextResponse.json({ ok: false, reason: "own-only" }, { status: 403, ...noStore })
  // 837-0e: a failure answers its reason, never an empty 500 (✗ the page could only say «Переключить не удалось»)
  try {
    if (body.own) {
      mkdirSync(home, { recursive: true })
    } else if (ownClaudeDir(service)) {
      claudeOwnLogout(home)
      rmSync(home, { recursive: true, force: true })
    }
  } catch (e) {
    return NextResponse.json({ ok: false, reason: (e as NodeJS.ErrnoException)?.code ?? "switch-failed" }, { status: 500, ...noStore })
  }
  return NextResponse.json({ ok: true, own: Boolean(ownClaudeDir(service)) }, noStore)
}
