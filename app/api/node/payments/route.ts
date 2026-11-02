// @api read and save the payment settings of an element in its passport
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { parseCard, parseConnect, readPayments, saveCard, saveConnect } from "@/lib/web4-items/element-payments"
import { listPaymentElements, paymentLinks, paymentOf } from "@/lib/web4-items/payment-elements"

// ПЛАТЕЖИ ЭЛЕМЕНТА (551-4, 551-5): GET `?item=<адрес|id>` — поле `payments` паспорта, карточка-образец поверх умолчаний, платёжные элементы
// узла (подключён ли каждый и что построено для связи) и платёжная запись самого элемента (`self`). POST `{ item, card: { name, consultation,
// usage, commission, web2? } }` — цены карточки возможностей в `payments.web3["a2a-card"].<name>` и её «оплата картой»; POST `{ item,
// connect: { tool, on } }` — подключить платёжный элемент узла или снять. Неверное тело — 400 с родом отказа, файл не меняется. Закрыта
// ролью: цены и подключения — решение хозяина элемента. Подключение — только запись: агенты не будятся, i2i само не начинается.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const id = idOfAddress(req.nextUrl.searchParams.get("item") ?? "")
  const got = id ? await readPayments(id) : null
  if (!id || !got) return NextResponse.json({ ok: false, error: "no-passport" }, { status: 404, headers: NO_STORE })
  const connected = got.payments.web2 ?? {}
  const paymentElements = listPaymentElements().filter((e) => e.id !== id).map((e) => ({
    ...e,
    connected: connected[e.tool]?.element === e.id,
    links: paymentLinks(id, e.id),
  }))
  return NextResponse.json({ ok: true, ...got, paymentElements, self: paymentOf(id) }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { item?: unknown } | null
  const id = typeof body?.item === "string" ? idOfAddress(body.item) : null
  if (!id) return NextResponse.json({ ok: false, error: "no-passport" }, { status: 404, headers: NO_STORE })
  if ((body as { connect?: unknown }).connect !== undefined) {
    const c = parseConnect(body)
    if (!c.ok) return NextResponse.json({ ok: false, error: c.error }, { status: 400, headers: NO_STORE })
    const target = listPaymentElements().find((e) => e.tool === c.value.tool)
    if (!target) return NextResponse.json({ ok: false, error: "no-payment-element" }, { status: 400, headers: NO_STORE })
    if (target.id === id) return NextResponse.json({ ok: false, error: "self" }, { status: 400, headers: NO_STORE })
    const done = await saveConnect(id, c.value, target.id)
    if (!done) return NextResponse.json({ ok: false, error: "no-passport" }, { status: 404, headers: NO_STORE })
    return NextResponse.json({ ok: true, connect: c.value, element: target.id }, { headers: NO_STORE })
  }
  const parsed = parseCard(body)
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400, headers: NO_STORE })
  const saved = await saveCard(id, parsed.value)
  if (saved === "no-passport") return NextResponse.json({ ok: false, error: "no-passport" }, { status: 404, headers: NO_STORE })
  if (saved === "not-connected") return NextResponse.json({ ok: false, error: "not-connected" }, { status: 400, headers: NO_STORE })
  return NextResponse.json({ ok: true, card: parsed.value, saved: true }, { headers: NO_STORE })
}
