// @api read one part of the super node server through its operator API
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { remote, type RemotePart } from "@/lib/web4-items/super-node"

// ДАННЫЕ СЕРВЕРА СУПЕР-УЗЛА (531): `?part=status|hardware|notices|payouts|declaration` — узел спрашивает API оператора v1 (документ
// Lagrix 15, раздел 15.7) с ключом оператора и отдаёт ответ без ключа. Не подключён — 409 `not-connected`; сервер отказал — 502 с родом.
// Спрашивается при открытии страницы, опроса нет. Только архитектор.
export const dynamic = "force-dynamic"

const PARTS: RemotePart[] = ["status", "hardware", "notices", "payouts", "declaration"]

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ["architect"])
  if (denied) return denied
  const part = req.nextUrl.searchParams.get("part") as RemotePart
  if (!PARTS.includes(part)) return NextResponse.json({ ok: false, error: "bad-part" }, { status: 400 })
  const r = await remote(part)
  return r.ok
    ? NextResponse.json({ ok: true, data: r.data }, { headers: { "Cache-Control": "no-store" } })
    : NextResponse.json({ ok: false, error: r.error }, { status: r.status, headers: { "Cache-Control": "no-store" } })
}
