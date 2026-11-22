// @api an element's own agent card, context window, limits and model switch
import { NextRequest, NextResponse } from "next/server"
import { callerOf, refusal } from "@/lib/node/caller"
import { listServices } from "@/lib/microservices/registry"
import { ownAgentOf } from "@/lib/node/tg-app/state"
import choice from "@/lib/node/tg-app/model-choice.cjs"

// СВОЙ АГЕНТ ЭЛЕМЕНТА (узел, шаг 821; владелец 2026-11-21, макет v2 — «идеально», Telegram 438): Mini App элемента показывает карточку
// своего агента — работает, ждёт или спит, модель и усилие, своя подписка или узла, бот — и заполнение его контекстного окна. GET с
// ключом элемента (`X-Element-Key`): только о себе, id берётся из ключа; ключ узла может спросить о любом элементе (`?service=<id>`).
// Ни состава узла, ни чужого агента, ни e-mail подписки узла (это архитектор) — `ownAgentOf` в lib/node/tg-app/state.ts.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const caller = callerOf(req.headers)
  if (!caller) return NextResponse.json({ ok: false, reason: refusal(null).reason }, { status: 401, headers: HEADERS })
  const id = "element" in caller ? caller.element : (req.nextUrl.searchParams.get("service") ?? "").trim()
  const known = (listServices() as unknown as { id: string }[]).some((s) => s.id === id)
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(id) || !known) {
    return NextResponse.json({ ok: false, reason: "service must be an element of this node" }, { status: 400, headers: HEADERS })
  }
  const lang = req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en"
  return NextResponse.json({ ok: true, service: id, ...ownAgentOf(id, lang) }, { headers: HEADERS })
}

// 840-1 (the owner, Telegram 954: «выбор модели … тоже появится»): the element's own Mini App switches its OWN agent's model — Opus with
// its effort, Sonnet or Haiku on medium (`model-choice.cjs`); Ultracode stays the bot's, behind its Telegram confirmation. Only the
// element's key, only itself; the bridge switches when the current turn ends. Asleep → 409 `no-session`: there is nothing to switch.
export async function POST(req: NextRequest) {
  const caller = callerOf(req.headers)
  if (!caller || !("element" in caller)) return NextResponse.json({ ok: false, reason: "element-key-only" }, { status: 401, headers: HEADERS })
  const body = (await req.json().catch(() => null)) as { model?: unknown; effort?: unknown } | null
  const picked = choice.modelChoice({ model: body?.model, effort: body?.effort })
  if (!picked.ok) return NextResponse.json({ ok: false, reason: picked.reason }, { status: 400, headers: HEADERS })
  const command = (globalThis as { __web4AgentSession?: (service: string, opts: Record<string, unknown>) => Record<string, unknown> & { ok: boolean } }).__web4AgentSession
  if (typeof command !== "function") return NextResponse.json({ ok: false, reason: "no-agent-kit" }, { status: 503, headers: HEADERS })
  const out = command(caller.element, { action: "model", model: picked.model, effort: picked.effort })
  console.log(`[node/my-agent] ${caller.element} model ${picked.model} · ${picked.effort} from its Mini App → ${out.ok ? "scheduled" : out.reason}`)
  if (!out.ok) return NextResponse.json({ ok: false, reason: String(out.reason ?? "refused") }, { status: out.reason === "no-session" ? 409 : 400, headers: HEADERS })
  return NextResponse.json({ ok: true, model: picked.model, effort: picked.effort }, { headers: HEADERS })
}
