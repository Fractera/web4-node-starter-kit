// @api keep the capability requests of the node elements
import { NextRequest, NextResponse } from "next/server"
import { actsFor, callerElement, callerOf, isNode, refusal } from "@/lib/node/caller"
import { requireRoles } from "@/lib/auth/require-roles"
import { createNeed, listNeeds, readNeed } from "@/lib/web4-items/needs.mjs"

// ЗАПРОСЫ ВОЗМОЖНОСТИ (шаг 589-2): POST — элемент своей командой `npm run need` с ключом узла (`X-Node-Key`) кладёт запрос «мне нужно
// то, чего у меня нет»; запись — `data/node/needs/<id>.json`, без модели. GET — запросы одного элемента (`?from=`) или один (`?id=`):
// узел (ключ) или архитектор. Будит главного агента не дверь, а команда элемента — тем же путём, что `ask-core`.

export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

export async function POST(req: NextRequest) {
  const caller = callerOf(req.headers)
  if (!caller) {
    return NextResponse.json({ ok: false, error: refusal(null).reason }, { status: 401, headers: HEADERS })
  }
  const body = (await req.json().catch(() => null)) as { from?: unknown; need?: unknown; use?: unknown } | null
  // 818-7a (817 H6): an element's own key asks only in its own name; the node key — in any.
  if (!isNode(caller) && body && body.from === undefined) body.from = callerElement(caller)
  if (!actsFor(caller, body?.from)) {
    const r = refusal(caller)
    return NextResponse.json({ ok: false, error: r.reason }, { status: r.status, headers: HEADERS })
  }
  try {
    const need = createNeed(process.cwd(), { from: body?.from, need: body?.need, use: body?.use })
    return NextResponse.json({ ok: true, need }, { headers: HEADERS })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400, headers: HEADERS })
  }
}

export async function GET(req: NextRequest) {
  const caller = callerOf(req.headers)
  if (!caller) {
    const denied = await requireRoles(req, ["architect"])
    if (denied) return denied
  }
  // 818-7a: an element reads only its own needs.
  const own = caller && !isNode(caller) ? callerElement(caller) : null
  const id = req.nextUrl.searchParams.get("id")
  if (id) {
    const found = readNeed(process.cwd(), id) as { from?: unknown } | null
    const need = own && found?.from !== own ? null : found
    return need
      ? NextResponse.json({ ok: true, need }, { headers: HEADERS })
      : NextResponse.json({ ok: false, error: "no such need" }, { status: 404, headers: HEADERS })
  }
  const from = own ?? req.nextUrl.searchParams.get("from")
  return NextResponse.json({ ok: true, needs: listNeeds(process.cwd(), { from: from || null }) }, { headers: HEADERS })
}
