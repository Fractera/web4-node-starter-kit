// @api write and read the log of agent-to-agent calls between node elements
import { NextRequest, NextResponse } from "next/server"
import { actsFor, callerElement, callerOf, isNode, refusal } from "@/lib/node/caller"
import { requireRoles } from "@/lib/auth/require-roles"
import { readLog, writeLog, type LogRecord } from "@/lib/a2a/conversation-log"

// ЖУРНАЛ ОБЩЕНИЯ АГЕНТОВ УЗЛА (шаг 408). POST — запись одного вызова A2A от принимающего элемента: только ключ узла
// (`X-Node-Key`). GET — лента: ключ узла или архитектор/админ; отбор `after` (новее записи — опрос ленты), `before`,
// `element`, `pair=a,b`, `task`, `limit` (≤ 200). Логика — `lib/a2a/conversation-log.ts`.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

export async function POST(req: NextRequest) {
  const caller = callerOf(req.headers)
  if (!caller) {
    return NextResponse.json({ ok: false, error: refusal(null).reason }, { status: 401, headers: HEADERS })
  }
  let rec: LogRecord
  try { rec = (await req.json()) as LogRecord } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400, headers: HEADERS })
  }
  // 818-7a (817 H6): an element writes only the calls it answered (`to` is itself, `lib/a2a/log.ts` of the templates); the node — any.
  if (!actsFor(caller, rec?.to)) {
    const r = refusal(caller)
    return NextResponse.json({ ok: false, error: r.reason }, { status: r.status, headers: HEADERS })
  }
  const out = await writeLog(rec)
  return NextResponse.json(out, { status: out.ok ? 200 : 400, headers: HEADERS })
}

export async function GET(req: NextRequest) {
  const caller = callerOf(req.headers)
  if (!caller) {
    const denied = await requireRoles(req, ["architect", "admin"])
    if (denied) return denied
  }
  // 818-7a: an element reads only the conversations it took part in — the filter `element` is its own, whatever it asked.
  const params = new URLSearchParams(req.nextUrl.searchParams)
  const own = caller && !isNode(caller) ? callerElement(caller) : null
  if (own) { params.set("element", own); params.delete("pair") }
  const out = await readLog(params)
  return NextResponse.json(out, { status: out.ok ? 200 : 502, headers: HEADERS })
}
