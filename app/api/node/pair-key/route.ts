// @api give an element the pair key for one neighbour's door
import { NextRequest, NextResponse } from "next/server"
import { callerElement, callerOf, refusal } from "@/lib/node/caller"
import { entryOf, isCustom, keyFor } from "@/lib/node/element-call-key.cjs"
import { isElementId, pairKeyOf } from "@/lib/element-key.cjs"

// THE PAIR KEY OF THE API BETWEEN ELEMENTS (node step 818-7d, the red team's H6; the owner, Telegram 284: «взаимодействие элементов у
// нас запланировано по двум протоколом i2i и апи»). Two agents agree an API over i2i, then the caller's CODE calls the neighbour's door
// directly — before 818-7 with the node key every element held, so any element could call any door. Now an element asks here, with its
// own key, for the key of ONE neighbour: `GET ?to=<id>` → `{ ok, to, port, key }`. The key names the caller to the callee, which checks it
// offline with its own key (`lib/element-key.cjs` → `pairCallerOf`); neither side sees the other's key, and the pair key opens nothing
// else. Only an element asks (the node calls an element with that element's own key), only for a custom neighbour (a native takes the
// caller's own key itself), never for itself.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const caller = callerOf(req.headers)
  const me = callerElement(caller)
  if (!me) {
    const r = refusal(caller, "a pair key only for an element calling a neighbour")
    return NextResponse.json({ ok: false, reason: r.reason }, { status: r.status, headers: HEADERS })
  }
  const to = (req.nextUrl.searchParams.get("to") ?? "").trim()
  if (!isElementId(to) || to === me) {
    return NextResponse.json({ ok: false, reason: "to: the id of another element of this node" }, { status: 400, headers: HEADERS })
  }
  const entry = entryOf(to) as { port?: unknown; kind?: unknown } | null
  if (!entry || !Number.isInteger(entry.port)) {
    return NextResponse.json({ ok: false, reason: `no element «${to}» on this node` }, { status: 404, headers: HEADERS })
  }
  if (!isCustom(entry)) {
    return NextResponse.json({ ok: false, reason: `«${to}» is a native element: call it with your own key` }, { status: 409, headers: HEADERS })
  }
  const key = pairKeyOf(me, keyFor(to))
  if (!key) return NextResponse.json({ ok: false, reason: "the node has no data secret to make the key" }, { status: 503, headers: HEADERS })
  console.log(`[node/pair-key] ${me} → ${to}`)
  return NextResponse.json({ ok: true, to, port: entry.port, key }, { headers: HEADERS })
}
