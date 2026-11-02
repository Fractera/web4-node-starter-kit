// @api read and save an element's messenger settings in its passport
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { parseMessengerSettings, readMessengerSettings, saveMessengerSettings } from "@/lib/web4-items/messenger-settings"

// НАСТРОЙКИ MESSENGER ЭЛЕМЕНТА (528-2): GET `?item=<адрес|id>` — сохранённое или умолчание ($1, включено); POST `{ item,
// firstContact: { enabled, usd }, agentRules: { forbidden[], interests[] } }` — запись в паспорт элемента (поле `messengerSettings`).
// Неверное тело — 400 с родом отказа, файл не меняется. Страница предрендерена — значения спрашивает островок при открытии.
// 🔒 ЗАКРЫТА РОЛЬЮ: правила агента — слова человека о себе.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const id = idOfAddress(req.nextUrl.searchParams.get("item") ?? "")
  const got = id ? await readMessengerSettings(id) : null
  if (!got) return NextResponse.json({ ok: false, error: "no-passport" }, { status: 404, headers: NO_STORE })
  return NextResponse.json({ ok: true, ...got }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { item?: unknown } | null
  const id = typeof body?.item === "string" ? idOfAddress(body.item) : null
  if (!id) return NextResponse.json({ ok: false, error: "no-passport" }, { status: 404, headers: NO_STORE })
  const parsed = parseMessengerSettings(body)
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400, headers: NO_STORE })
  const saved = await saveMessengerSettings(id, parsed.value)
  if (!saved) return NextResponse.json({ ok: false, error: "no-passport" }, { status: 404, headers: NO_STORE })
  return NextResponse.json({ ok: true, settings: parsed.value, saved: true }, { headers: NO_STORE })
}
