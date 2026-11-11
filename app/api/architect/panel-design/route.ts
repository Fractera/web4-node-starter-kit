// @api read and change the look of the core panel itself
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { clearPanelDesign, readPanelDesign, readSiteCopy, writePanelDesign } from "@/lib/panel-design"

// «НАСТРОЙКИ → ДИЗАЙН ПАНЕЛИ» (шаг 718). GET — оформление панели и то, своё ли оно; POST `{ patch }` — правка (первая начинается с
// оформления сайта); DELETE — панель снова берёт оформление сайта. Страницы панели перерисовываются без сборки: макет `[lang]` живёт
// под ISR и читает файл на отрисовке (`config/design-config.ts`).
const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const own = readPanelDesign()
  return NextResponse.json({ ok: true, own: !!own, config: own ?? readSiteCopy() }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { patch?: unknown } | null
  const r = writePanelDesign(body?.patch)
  if (!r.ok) return NextResponse.json(r, { status: 400 })
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}

export async function DELETE(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  clearPanelDesign()
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}
