// @api list every WEB4 ITEM with its state and last commit
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { projectRows } from "@/lib/web4-items/dashboard-rows"

// ТАБЛИЦА «Dashboard → Проекты» (339). Страница предрендерена, поэтому состав узла, порты, коммиты и состояние спрашиваются
// здесь, на запрос, — запечённые в HTML они врали бы с первой же правки.
// 🔒 ДВЕРЬ ЗАКРЫТА ВОРОТАМИ И РОЛЬЮ (как `/api/node/state`): адреса, коммиты и состояние — сведения о машине человека.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const lang = req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en"
  const rows = await projectRows(lang)
  // 804-3: типа узла больше нет — каждая строка говорит, чем стал её элемент (`app`); агент элемента читает свою (`passport -- me`).
  return NextResponse.json({ ok: true, rows }, { headers: { "Cache-Control": "no-store" } })
}
