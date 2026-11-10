// @api turn an element's sync with CONFIG on or off
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { isBornElement } from "@/lib/web4-items/element-delete"
import { setLink, type LinkKind } from "@/lib/web4-items/element-links"

// СВЯЗЬ ЭЛЕМЕНТА С CONFIG (324-7; 716 — единственная, элементов «Дизайн» и «Блоки» у узла нет). PATCH `{ kind: "config", on }`.
// Только рождённые элементы; ворота architect/admin; на временном публичном адресе — отказ.
export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  if (!isBornElement(id)) return NextResponse.json({ ok: false, error: "not-a-born-element" }, { status: 404 })
  let body: { kind?: unknown; on?: unknown } = {}
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 }) }
  if (typeof body.on !== "boolean" || body.kind !== "config") {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 })
  }
  const r = await setLink(id, body.kind as LinkKind, body.on)
  return NextResponse.json(r, { status: r.ok ? 200 : 400, headers: { "Cache-Control": "no-store" } })
}
