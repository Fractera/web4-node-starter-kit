// @api an element sends its own folder to its GitHub repository
import { NextRequest, NextResponse } from "next/server"

import { actsFor, callerOf, refusal } from "@/lib/node/caller"
import { elementGithubState, pushElement } from "@/lib/web4-items/element-github"

// ОТПРАВКА ЭЛЕМЕНТА В GITHUB ЕГО СОБСТВЕННЫМ КЛЮЧОМ (шаг 861-6; lidt5 через Рому 2026-11-27, «for-mac-push-boundary»: правило 374 звало
// скрипт ядра по абсолютному пути, сторож границы спрашивал главного агента, тот был занят — дважды отказ, коммиты копились). Теперь
// элемент зовёт эту дверь из своей папки (`npm run github:self`): тот же `pushElement`, что кнопка «Отправить», ключ (X-Node-Key) — свой
// ключ элемента, и только для себя; чужой id — 403, неверный ключ — 401. Незакоммиченный остаток коммитит узел, как кнопка с `commit`.
export const dynamic = "force-dynamic"

const noStore = { headers: { "Cache-Control": "no-store" } }

export async function POST(req: NextRequest) {
  const caller = callerOf(req.headers)
  const body = (await req.json().catch(() => null)) as { id?: unknown } | null
  const id = typeof body?.id === "string" ? body.id.trim() : ""
  if (!caller || !actsFor(caller, id)) {
    const r = refusal(caller, "its own GitHub push only")
    return NextResponse.json({ ok: false, reason: r.reason }, { status: r.status })
  }
  const r = pushElement(id, true)
  if (!r.ok) return NextResponse.json({ ...r, ...elementGithubState(id) }, { status: r.error === "not-born" ? 404 : 409, ...noStore })
  return NextResponse.json({ ok: true, ...elementGithubState(id) }, noStore)
}
