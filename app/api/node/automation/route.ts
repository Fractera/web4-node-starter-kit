// @api read and switch the cron automation of an element in its passport
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { parseAutomation, readAutomation, saveAutomation } from "@/lib/web4-items/element-automation"

// АВТОМАТИЗАЦИЯ ЭЛЕМЕНТА (551-3): GET `?item=<адрес|id>` — `{ cron }` из паспорта (поля нет — включено); POST `{ item, cron: true|false }`
// — запись поля `automation` в паспорт элемента. Неверное тело — 400 `bad-switch`, файл не меняется. Страница предрендерена — состояние
// спрашивает островок при открытии. Закрыта ролью: выключить работу элемента может только его хозяин.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const id = idOfAddress(req.nextUrl.searchParams.get("item") ?? "")
  const got = id ? await readAutomation(id) : null
  if (!got) return NextResponse.json({ ok: false, error: "no-passport" }, { status: 404, headers: NO_STORE })
  return NextResponse.json({ ok: true, ...got }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { item?: unknown } | null
  const id = typeof body?.item === "string" ? idOfAddress(body.item) : null
  if (!id) return NextResponse.json({ ok: false, error: "no-passport" }, { status: 404, headers: NO_STORE })
  const parsed = parseAutomation(body)
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400, headers: NO_STORE })
  const saved = await saveAutomation(id, parsed.value)
  if (!saved) return NextResponse.json({ ok: false, error: "no-passport" }, { status: 404, headers: NO_STORE })
  return NextResponse.json({ ok: true, automation: parsed.value, saved: true }, { headers: NO_STORE })
}
