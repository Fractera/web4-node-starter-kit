// @api read and keep the marketplace application of an own native element
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { treeContextOf } from "@/lib/web4-items/tree-context"
import { lastOffer, parseOffer, saveOffer } from "@/lib/web4-items/market-offer.mjs"

// «ПРЕДЛОЖИТЬ В МАРКЕТПЛЕЙСЕ» (854): GET `?item=<адрес|id>` — последняя заявка элемента или null; POST `{ item, market: web2|web4,
// summary, price?, per?, note? }` — заявка хранится на узле (data/node/f2f/offers.jsonl) и никуда не отправляется: у маркетплейса Fractera
// ещё нет двери приёма, Lagrix не запущен. Только свой нативный элемент (рождённый на узле): у другого — 404 `not-own-native`.
// 🔒 ЗАКРЫТА РОЛЬЮ: решение предложить элемент — слово архитектора.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }
const DIR = () => join(process.cwd(), "data", "node", "f2f")

function ownNative(raw: unknown): string | null {
  const id = typeof raw === "string" ? idOfAddress(raw) : null
  return id && treeContextOf(id).ownNative ? id : null
}

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const id = ownNative(req.nextUrl.searchParams.get("item"))
  if (!id) return NextResponse.json({ ok: false, error: "not-own-native" }, { status: 404, headers: NO_STORE })
  return NextResponse.json({ ok: true, offer: lastOffer(DIR(), id) }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { item?: unknown } | null
  const id = ownNative(body?.item)
  if (!id) return NextResponse.json({ ok: false, error: "not-own-native" }, { status: 404, headers: NO_STORE })
  const parsed = parseOffer(body)
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400, headers: NO_STORE })
  return NextResponse.json({ ok: true, offer: saveOffer(DIR(), id, parsed.value) }, { headers: NO_STORE })
}
