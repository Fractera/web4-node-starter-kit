// @api put an element into the Web4 network or take it out
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import web4 from "@/lib/web4-items/element-web4.cjs"

// 567-6: ЭЛЕМЕНТ В СЕТИ WEB4 — карточки «Настроек сайта» элемента (по образцу «Включения элемента» 567). Признак — паспорт `visibility`
// (`lib/web4-items/element-web4.cjs`); запись — небольшой файл, без коммита и сборки; визитка элемента читает его на каждый запрос.
// Меню и Паспорт рисуются на сервере — перерисовать, чтобы A2A и «Отзывы» появились или исчезли сразу.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const id = req.nextUrl.searchParams.get("id") ?? ""
  const v = web4.visibilityOf(id, process.cwd())
  return NextResponse.json({ ok: v !== null, id, on: v === "network" }, { status: v === null ? 404 : 200, headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { id?: unknown; on?: unknown } | null
  const id = typeof body?.id === "string" ? body.id : ""
  if (typeof body?.on !== "boolean") return NextResponse.json({ ok: false, reason: "on must be true or false" }, { status: 400 })
  try {
    web4.setVisibility(id, body.on ? "network" : "node", process.cwd())
  } catch (e) {
    return NextResponse.json({ ok: false, reason: e instanceof Error ? e.message : String(e) }, { status: 404 })
  }
  revalidatePath("/[lang]", "layout")
  return NextResponse.json({ ok: true, id, on: web4.visibilityOf(id, process.cwd()) === "network" }, { headers: { "Cache-Control": "no-store" } })
}
