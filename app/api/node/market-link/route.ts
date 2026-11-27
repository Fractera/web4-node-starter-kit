// @api lead a drawer link to a page of the marketplace client
import { NextRequest, NextResponse } from "next/server"
import { isOwnerAtMachine } from "@/lib/auth/owner-at-machine"
import { isMarketPage, MARKET_PAGES, marketClientBase, marketClientId } from "@/lib/web4-items/market-client"

// 862-12 (Roma 2026-11-27, Telegram 1670/1672): «Рекомендованные элементы · Корзина · Купленные» stand in every drawer of the project;
// each link goes through this door, which knows where the client lives for this caller — the loopback port on this computer, its address
// on the node's own domain otherwise — so no prebuilt page carries an address and a new domain needs no rebuild. GET ?to=<page>&lang=
// → 302 to the client's page. No client in this project → 404; a temporary address (no element has a public name there) → the core's
// own page of the client. The client's pages hold their own lock: this door only points the way.
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to") ?? ""
  if (!isMarketPage(to)) return NextResponse.json({ ok: false, reason: "to: recommendations | cart | purchases" }, { status: 400 })
  const lang = (req.nextUrl.searchParams.get("lang") ?? "en").replace(/[^a-zA-Z-]/g, "").slice(0, 12) || "en"
  const id = marketClientId()
  if (!id) return NextResponse.json({ ok: false, reason: "this project has no marketplace client" }, { status: 404 })
  const base = marketClientBase(id, isOwnerAtMachine(req))
  // A relative Location for the core's own page: behind the tunnel `req.nextUrl.origin` is the loopback, not the address the person sees.
  const target = base ? `${base}/${lang}${MARKET_PAGES[to]}` : `/${lang}/architect/${id}`
  return new NextResponse(null, { status: 302, headers: { Location: target, "Cache-Control": "no-store" } })
}
