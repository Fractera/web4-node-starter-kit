// @api turn an element of the node on or off
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { powerState as stateOf, runElementPower } from "@/lib/web4-items/run-element-power"

// 567: ВКЛЮЧИТЬ И ВЫКЛЮЧИТЬ ЭЛЕМЕНТ — кнопка «Опасной зоны» (выбор владельца 2026-10-22: «Кнопка в «Опасной зоне»»). Работу делает та же
// команда, что у человека в терминале и у главного агента (`scripts/element-power.mjs`), — через `lib/web4-items/run-element-power.ts`
// (771-2: её же зовёт пульт в Telegram).
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const id = req.nextUrl.searchParams.get("id") ?? ""
  const s = stateOf(id, req.nextUrl.searchParams.get("lang") ?? "en")
  return s ? NextResponse.json(s, { headers: { "Cache-Control": "no-store" } }) : NextResponse.json({ ok: false, reason: "unknown-element" }, { status: 404 })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { id?: unknown; action?: unknown; reason?: unknown; lang?: unknown } | null
  const id = typeof body?.id === "string" ? body.id : ""
  const action = body?.action
  const lang = typeof body?.lang === "string" ? body.lang : "en"
  if (!stateOf(id, lang)) return NextResponse.json({ ok: false, reason: "unknown-element" }, { status: 404 })
  if (action !== "on" && action !== "off") return NextResponse.json({ ok: false, reason: "action must be on or off" }, { status: 400 })
  const reason = typeof body?.reason === "string" ? body.reason.trim() : ""
  if (action === "off" && (!reason || reason.length > 200)) return NextResponse.json({ ok: false, reason: "reason-1-200" }, { status: 400 })
  const { done, line } = await runElementPower(id, action, reason)
  // Меню, «Проекты» и страница элемента рисуются на сервере — перерисовать, чтобы новое состояние было видно сразу.
  revalidatePath("/[lang]", "layout")
  const s = stateOf(id, lang)
  return NextResponse.json({ ...s, ok: done, line }, { status: done ? 200 : 500, headers: { "Cache-Control": "no-store" } })
}
