// @api the core's left menu mode: compact or full
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { readMenuMode, writeMenuMode } from "@/lib/node-menu-mode"

// 657-1: РЕЖИМ ЛЕВОГО МЕНЮ ЯДРА — компактный (по умолчанию) или полный (`lib/node-menu-mode.ts`). Меняет его архитектор строкой
// «Настройка» в «Основном»; ворота — те же, что у типа узла (`/api/node/type`). На временном адресе панель только читает (CLAUDE.md
// §2): запись отвечает 403, файл не трогается.
export const dynamic = "force-dynamic"
const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json({ ok: true, mode: readMenuMode() }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403, headers: NO_STORE })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  let mode: unknown
  try { mode = ((await req.json()) as { mode?: unknown })?.mode } catch { /* нет тела */ }
  if (mode !== "compact" && mode !== "full") {
    return NextResponse.json({ ok: false, reason: "mode must be compact or full" }, { status: 400, headers: NO_STORE })
  }
  writeMenuMode(mode)
  // Меню рисуется на каждой странице слоя — перерисовывается весь слой.
  revalidatePath("/[lang]", "layout")
  return NextResponse.json({ ok: true, mode }, { headers: NO_STORE })
}
