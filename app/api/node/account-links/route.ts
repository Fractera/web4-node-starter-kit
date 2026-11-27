// @api give an element the shared entries of its account drawer
import { NextRequest, NextResponse } from "next/server"
import { callerElement, callerOf, isNode, refusal } from "@/lib/node/caller"
import { marketLinkWords } from "@/lib/menu/market-links.i18n"
import { MARKET_PAGES, marketClientId, marketLinkPath, type MarketPage } from "@/lib/web4-items/market-client"

// 862-12 (Roma 2026-11-27, Telegram 1670: «Разве наше меню не универсальное? … распространяться на все элементы»): the entries every drawer
// «Личный кабинет» of the project shows, asked by an element's server with its OWN key (`X-Node-Key` = its ELEMENT_KEY) or the node key.
// GET ?lang= → { ok, links: [{ key, label, path }] }: `path` is relative to the core — the element puts its own known core origin before
// it, and the core's door `market-link` picks the client's address by the person's host. The client itself gets none of the marketplace
// entries (it has its own). The element pulls when its drawer opens; the core never pushes (CLAUDE.md §6).
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const caller = callerOf(req.headers)
  const asker = callerElement(caller)
  if (!isNode(caller) && !asker) {
    const r = refusal(caller, "the shared drawer entries for an element of this node")
    return NextResponse.json({ ok: false, reason: r.reason }, { status: r.status, headers: NO_STORE })
  }
  const lang = (req.nextUrl.searchParams.get("lang") ?? "en").replace(/[^a-zA-Z-]/g, "").slice(0, 12) || "en"
  const client = marketClientId()
  const words = marketLinkWords(lang)
  const links = client && client !== asker
    ? (Object.keys(MARKET_PAGES) as MarketPage[]).map((key) => ({ key: `market-${key}`, label: words[key], path: marketLinkPath(key, lang) }))
    : []
  return NextResponse.json({ ok: true, links }, { headers: NO_STORE })
}
