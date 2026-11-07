// @api the stamp of the node's elements for the live menu
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { menuStamp } from "@/lib/web4-items/menu-stamp"

// 678-3: ЖИВОЕ ЛЕВОЕ МЕНЮ. GET — отпечаток состава узла и имена элементов (островок `MenuLive` спрашивает его, пока вкладка архитектора
// видна); POST — отпечаток сменился: слой перерисовывается, как после любой двери, что пишет (`revalidatePath("/[lang]", "layout")`).
// 🔒 ЗАКРЫТА ВОРОТАМИ И РОЛЬЮ, как `/api/node/catalog`: состав узла — сведения о машине человека. POST ничего не пишет, только сбрасывает
// кеш страниц слоя, поэтому открыт и на временном адресе, где панель только читает.
export const dynamic = "force-dynamic"
const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json({ ok: true, ...menuStamp() }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  revalidatePath("/[lang]", "layout")
  return NextResponse.json({ ok: true, stamp: menuStamp().stamp }, { headers: NO_STORE })
}
