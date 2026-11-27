// @api the marketplace search for the client element, signed by the node
import { NextRequest, NextResponse } from "next/server"
import { bodyOf, marketCaller, NO_STORE } from "@/lib/web4-items/market-door"
import { storeCall } from "@/lib/web4-items/store-call.mjs"

// 862-2: POST { request, lang?, history?, limit? } → the store's search v2 answer as it is, signed by the node with the client's id.
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const who = marketCaller(req.headers)
  if (who instanceof NextResponse) return who
  const b = await bodyOf(req)
  const request = typeof b?.request === "string" ? b.request.trim() : ""
  if (!request || request.length > 500) return NextResponse.json({ ok: false, reason: "request is 1–500 characters" }, { status: 400, headers: NO_STORE })
  const lang = b?.lang === "en" ? "en" : "ru"
  const limit = Number.isInteger(b?.limit) ? Math.min(Math.max(Number(b?.limit), 1), 10) : 5
  const history = Array.isArray(b?.history) ? b.history.slice(0, 20) : undefined
  const r = await storeCall(process.cwd(), "search", { element: who.by === "build" ? "market" : who.by, request, lang, limit, ...(history ? { history } : {}) })
  return NextResponse.json(r.body ?? { ok: false, reason: "the store did not answer" }, { status: r.status || 502, headers: NO_STORE })
}
