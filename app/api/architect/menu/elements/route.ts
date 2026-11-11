// @api give the architect's menu the next twelve custom elements with state
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { menuPortion } from "@/lib/web4-items/menu-page"
import { readMenuMode } from "@/lib/node-menu-mode"

// 722-2 (владелец 2026-11-11: «ленивые загрузка то есть ты подгружает по 12 элементов предварительно отрисовывает сначала скелетрон, а
// затем запрашиваем очередные 12 элементов»). GET `?lang=ru&from=12&limit=12&active=1&q=…` → `{ rows, total, next }`. Только архитектор:
// это свежие данные узла — обычному посетителю меню отдаёт статическая сборка (722-5). Чтение двух файлов и имён порции, ни процесса, ни модели.
const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const p = req.nextUrl.searchParams
  const num = (k: string, d: number, max: number) => Math.min(max, Math.max(0, Number.parseInt(p.get(k) ?? "", 10) || d))
  const lang = /^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(p.get("lang") ?? "") ? (p.get("lang") as string) : "en"
  const page = menuPortion(lang, {
    from: num("from", 0, 1_000_000),
    limit: num("limit", 12, 24) || 12,
    q: (p.get("q") ?? "").slice(0, 80),
    active: p.get("active") === "1",
    compact: readMenuMode() === "compact",
  })
  return NextResponse.json({ ok: true, ...page }, { headers: NO_STORE })
}
