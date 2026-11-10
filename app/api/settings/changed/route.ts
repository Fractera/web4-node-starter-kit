// @api redraw the core pages on the node's settings signal
// POST /api/settings/changed — сигнал узла «настройки сменились», ключ узла в `X-Settings-Key`. Его шлют конец сборки ядра
// (`lib/deploy/quiet-build.cjs`) и каталог элементов (`lib/web4-items/catalog-push.ts`): собранные страницы ядра перерисовываются без
// пересборки. 716 (владелец 2026-11-10: элементов «Дизайн» и «Блоки» у узла нет): прежде дверь ещё забирала оформление у элемента
// «Дизайн» (шаг 309); теперь оформление ядра — его DESIGN-CONFIG, засеянный темой сайта перед сборкой (`scripts/sync-site-design.mjs`).
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { timingSafeEqual } from "node:crypto"

/** Сигнал пришёл с ключом узла? Сравнение постоянного времени — ключ не угадывается по задержке ответа. */
function signalKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  const g = given ?? ""
  if (!expected || g.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(g), Buffer.from(expected))
}

export async function POST(req: NextRequest) {
  if (!signalKeyOk(req.headers.get("x-settings-key"))) return NextResponse.json({ ok: false, reason: "bad-key" }, { status: 401 })
  revalidatePath("/", "layout")
  console.log("[settings] сигнал узла: страницы ядра перерисованы")
  return NextResponse.json({ ok: true, changed: true })
}
