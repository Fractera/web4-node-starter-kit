// @api the node's own records of marketplace orders for the client's «Покупки»
import { NextRequest, NextResponse } from "next/server"
import { marketCaller, NO_STORE } from "@/lib/web4-items/market-door"
import { readOrders } from "@/lib/web4-items/market-purchase.mjs"
import { listServices } from "@/lib/microservices/registry"

// 862-3: GET → the orders this node made (newest first) and the elements born from each — the core's own records, read before the
// store's signed `orders` list (v1.2), which restores them after a fresh install.
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const who = marketCaller(req.headers)
  if (who instanceof NextResponse) return who
  const born = (listServices() as unknown as { id: string; born?: { from?: string; order?: string; slug?: string } }[]).filter((s) => s.born?.from === "starter")
  const orders = readOrders(process.cwd()).map((o) => ({ ...o, elements: born.filter((s) => s.born?.order === o.order).map((s) => ({ id: s.id, slug: s.born?.slug })) }))
  return NextResponse.json({ ok: true, orders }, { headers: NO_STORE })
}
