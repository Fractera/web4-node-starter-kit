// @api the node elements catalog for the All projects tab
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { catalogEntries } from "@/lib/web4-items/dashboard-rows"
import { refreshCatalog } from "@/lib/web4-items/catalog-push"

// 553: КАТАЛОГ «ВСЕ ПРОЕКТЫ». GET — карточки на языке (островок шапки страниц архитектора спрашивает их в браузере: состав узла не
// запекается в сборку ядра — закон 264 «число о машине — спрашивать в браузере»). POST — пересчитать и положить в CONFIG (скрипты узла
// после рождения, «Принять», «Развернуть», установки; `npm run catalog:refresh`).
// 🔒 ЗАКРЫТА ВОРОТАМИ И РОЛЬЮ, как `/api/node/projects`: состав узла и порты — сведения о машине человека.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const lang = req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en"
  return NextResponse.json({ ok: true, entries: await catalogEntries(lang) }, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  let reason = "manual"
  try {
    const b = (await req.json()) as { reason?: unknown }
    if (typeof b?.reason === "string" && /^[a-z0-9-]{1,32}$/.test(b.reason)) reason = b.reason
  } catch { /* тела нет — ручной вызов */ }
  const r = await refreshCatalog(reason)
  return NextResponse.json(r, { status: r.ok ? 200 : 502, headers: { "Cache-Control": "no-store" } })
}
