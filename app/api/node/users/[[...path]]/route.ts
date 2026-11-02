// @api list, edit and anonymize node users through the auth element
import { NextRequest, NextResponse } from "next/server"

import { getSession } from "@/lib/auth/get-session"
import { serviceUrl } from "@/lib/microservices/registry"
import { withAppNames } from "@/lib/web4-items/app-names"

// ВКЛАДКА «ПОЛЬЗОВАТЕЛИ» ЭЛЕМЕНТА ВХОДА (узел, шаг 559-4). Люди узла живут в базе элемента входа — ядро их не хранит и не открывает
// их файл: дверь проверяет вход и роль (architect · admin), а дальше пересылает запрос двери элемента `/api/node-users/*` по петле
// машины ключом архитектора (`ARCHITECT_TOKEN` — общий только у ядра и элемента входа) и называет, кто действует. Метод, путь, запрос
// и тело уходят как есть, ответ элемента приходит как есть. Правила (кто кого правит) — у элемента: он владелец людей.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"]
type Ctx = { params: Promise<{ path?: string[] }> }

async function forward(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const session = await getSession(req)
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  if (!session.roles.some((r) => ROLES.includes(r))) return NextResponse.json({ ok: false, error: "Forbidden", requires: ROLES }, { status: 403 })
  const base = serviceUrl("auth")
  const token = process.env.ARCHITECT_TOKEN?.trim()
  if (!base) return NextResponse.json({ ok: false, error: "no-auth-element" }, { status: 503 })
  if (!token) return NextResponse.json({ ok: false, error: "no-architect-token" }, { status: 503 })
  const path = ((await ctx.params).path ?? []).map(encodeURIComponent).join("/")
  // Хозяин за этой машиной входа не проходил — у него нет записи; так его и называем в истории.
  const actor = session.viaMachine ? "owner-at-machine" : session.userId
  try {
    const res = await fetch(`${base.replace(/\/+$/, "")}/api/node-users${path ? `/${path}` : ""}${req.nextUrl.search}`, {
      method: req.method,
      headers: {
        "x-architect-token": token,
        "x-node-actor": actor,
        "x-node-actor-roles": session.roles.join(","),
        "content-type": "application/json",
      },
      body: req.method === "POST" ? await req.text() : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    })
    // 554-1: организация-приложение элемента завода называется живым `short_name` его настроек.
    const body = withAppNames(await res.json().catch(() => ({ ok: false, error: "bad-answer" })))
    return NextResponse.json(body, { status: res.status, headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ ok: false, error: "auth-not-answering" }, { status: 502 })
  }
}

export const GET = forward
export const POST = forward
