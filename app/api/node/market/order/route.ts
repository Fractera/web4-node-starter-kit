// @api ask the store the status of a marketplace order
import { NextRequest, NextResponse } from "next/server"
import { bodyOf, marketCaller, NO_STORE } from "@/lib/web4-items/market-door"
import { orderStatus } from "@/lib/web4-items/market-purchase.mjs"

// 862-3: POST { order } → { order, paid, items } — the node pulls; a closed laptop lid needs no open door. Another node's or an unknown
// order → 404 (standard v1.2, reconciled).
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const who = marketCaller(req.headers)
  if (who instanceof NextResponse) return who
  const b = await bodyOf(req)
  const out = await orderStatus(process.cwd(), typeof b?.order === "string" ? b.order : "")
  return NextResponse.json(out, { status: out.ok ? 200 : out.status ?? 502, headers: NO_STORE })
}
