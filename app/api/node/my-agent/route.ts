// @api an element's own agent card and context window
import { NextRequest, NextResponse } from "next/server"
import { callerOf, refusal } from "@/lib/node/caller"
import { listServices } from "@/lib/microservices/registry"
import { ownAgentOf } from "@/lib/node/tg-app/state"

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
  return NextResponse.json({ ok: true, service: id, ...ownAgentOf(id) }, { headers: HEADERS })
}
