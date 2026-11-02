// @api delete a born WEB4 element after its address is typed back
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { draftAddress } from "@/lib/web4-items/drafts"
import { deleteElement, deletionRisk, isBornElement } from "@/lib/web4-items/element-delete"
import { refreshCatalog } from "@/lib/web4-items/catalog-push"

// УДАЛЕНИЕ РОЖДЁННОГО WEB4 ЭЛЕМЕНТА (325-5, «Удалить насовсем»). GET — что потеряется (коммиты, которых нет в GitHub); DELETE
// `{ confirm }` — адрес `<id>.<зона>` буква в букву, иначе 409 и ничего не снято. Только рождённые элементы: встроенные
// службы — 404. Ворота architect/admin; на временном публичном адресе — отказ.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

async function gate(req: NextRequest, id: string) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  if (!isBornElement(id)) return NextResponse.json({ ok: false, error: "not-a-born-element" }, { status: 404 })
  return null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = await gate(req, id)
  if (g) return g
  return NextResponse.json({ ok: true, address: draftAddress(id), ...deletionRisk(id) }, noStore)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = await gate(req, id)
  if (g) return g
  const body = (await req.json().catch(() => null)) as { confirm?: unknown } | null
  if (typeof body?.confirm !== "string" || body.confirm.trim() !== draftAddress(id)) {
    return NextResponse.json({ ok: false, error: "confirm-mismatch" }, { status: 409, ...noStore })
  }
  const r = await deleteElement(id)
  revalidatePath("/[lang]", "layout")
  // 553: каталог «Все проекты» — без удалённого элемента; ответ двери его не ждёт.
  if (r.ok) void refreshCatalog("delete")
  return NextResponse.json(r, { status: r.ok ? 200 : 500, ...noStore })
}
