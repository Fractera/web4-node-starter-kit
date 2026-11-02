// @api read save or drop the node's official mark application draft
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { readWallet } from "@/lib/web4-items/node-wallet"
import { parseOfficial, readOfficial, removeOfficial, saveOfficial } from "@/lib/web4-items/node-official"

// ОФИЦИАЛЬНЫЙ АККАУНТ (530-2): GET — подготовленная заявка и есть ли кошелёк узла; POST `{ name, knownFor, sources[] }` — проверка (≥ 3
// источника https на разных площадках) и запись на узле; без кошелька — 409; DELETE — убрать. В сеть Lagrix ничего не уходит.
// Только архитектор: имя и источники — сведения о человеке.
export const dynamic = "force-dynamic"

const ROLES = ["architect"] as const
const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json({ ok: true, draft: readOfficial(), wallet: readWallet()?.address ?? null }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const parsed = parseOfficial(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400, headers: NO_STORE })
  const saved = saveOfficial(parsed.value)
  if (saved === "no-wallet") return NextResponse.json({ ok: false, error: "no-wallet" }, { status: 409, headers: NO_STORE })
  return NextResponse.json({ ok: true, draft: saved, wallet: saved.wallet }, { headers: NO_STORE })
}

export async function DELETE(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  removeOfficial()
  return NextResponse.json({ ok: true, draft: null, wallet: readWallet()?.address ?? null }, { headers: NO_STORE })
}
