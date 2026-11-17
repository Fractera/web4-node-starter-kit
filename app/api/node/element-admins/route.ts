// @api the node's element-admin roles by element name, for the Users tab
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { listServices } from "@/lib/microservices/registry"
import { elementName } from "@/lib/web4-items/dashboard-rows"
import elementAdmin from "@/lib/web4-items/element-admin-role.cjs"

// АДМИНЫ ЭЛЕМЕНТОВ ПО НАЗВАНИЯМ (узел, шаг 778-3). Владелец 2026-11-17 («1 да» на карточку вкладки «Пользователи»): в списках и фишках
// роль элемента видна как «Админ: <название>», а не elementAdmin001; 980 ролей нигде не показываются. GET — только ЗАНЯТЫЕ номера реестра
// (свои элементы с `adminRole`), каждый с названием элемента для людей. Людей дверь не знает: их держит элемент входа.
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  const lang = req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en"
  const admins = (listServices() as unknown as { id: string; kind?: string; adminRole?: string }[])
    .filter((s) => s.kind === "user" && typeof s.adminRole === "string" && elementAdmin.isRole(s.adminRole))
    .map((s) => ({ role: s.adminRole as string, element: s.id, name: elementName(s.id, lang) }))
    .sort((a, b) => a.role.localeCompare(b.role))
  return NextResponse.json({ ok: true, admins }, { headers: { "Cache-Control": "no-store" } })
}
