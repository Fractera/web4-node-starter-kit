// @api tell an element which key opens one neighbour's doors
import { NextRequest, NextResponse } from "next/server"
import { callerElement, callerOf, refusal } from "@/lib/node/caller"
import { keyToCall } from "@/lib/node/element-call-key.cjs"

// THE KEY FOR ONE NEIGHBOUR (node step 818-7d, the red team's H6; the owner, Telegram 284: «взаимодействие элементов у нас
// запланировано по двум протоколом i2i и апи»). Two agents agree an API over i2i, then the caller's CODE calls the neighbour's door
// directly — before 818-7 with the node key every element held, so any element could call any door. Now the caller asks here, with its
// own key, what to present at ONE neighbour's doors: `GET ?to=<id>` → `{ ok, to, port, key }` — `lib/neighbour.mjs` of every template.
// An element calling a custom element gets the pair key (it names the caller to that callee only, checked offline with the callee's own
// key — `pairCallerOf`); a native calling a custom element gets that element's own key; anyone calling a native gets `key: null` — its own
// key. The rule and its tests: `keyToCall` (lib/node/element-call-key.cjs, scripts/node-key-split.test.mjs T5).
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const caller = callerOf(req.headers)
  if (!caller) {
    const r = refusal(caller, "a key for a neighbour only for an element or a native of this node")
    return NextResponse.json({ ok: false, reason: r.reason }, { status: r.status, headers: HEADERS })
  }
  const to = (req.nextUrl.searchParams.get("to") ?? "").trim()
  const { status, body } = keyToCall(caller, to) as { status: number; body: { ok: boolean; key?: string | null } }
  if (status === 200 && body.key) console.log(`[node/pair-key] ${callerElement(caller) ?? "node"} → ${to}`)
  return NextResponse.json(body, { status, headers: HEADERS })
}
