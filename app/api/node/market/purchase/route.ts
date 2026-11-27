// @api buy a marketplace cart for the client element
import { NextRequest, NextResponse } from "next/server"
import { bodyOf, marketCaller, NO_STORE } from "@/lib/web4-items/market-door"
import { purchase } from "@/lib/web4-items/market-purchase.mjs"

// 862-3: POST { cart: [{ slug }], consent: { immediateDelivery: true, noRefund: true }, lang? } → { state: paid | awaiting-payer |
// already-ordered, order, items, total, window? }. A free cart is paid at once; a priced one puts the payer's window with Fractera's
// Checkout link — the payer's «Готово» wakes the client's agent, which asks POST /api/node/market/order. The node never holds money.
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const who = marketCaller(req.headers)
  if (who instanceof NextResponse) return who
  const b = await bodyOf(req)
  const out = await purchase(process.cwd(), { cart: b?.cart, consent: b?.consent as { immediateDelivery?: boolean; noRefund?: boolean } | undefined, by: who.by, lang: b?.lang === "en" ? "en" : "ru" })
  return NextResponse.json(out, { status: out.ok ? 200 : out.status ?? 502, headers: NO_STORE })
}
