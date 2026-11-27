// @api install a paid marketplace starter and read its state
import { NextRequest, NextResponse } from "next/server"
import { bodyOf, marketCaller, NO_STORE } from "@/lib/web4-items/market-door"
import { installState, orderStatus, startInstall } from "@/lib/web4-items/market-purchase.mjs"

// 862-3/862-4: POST { order, slug, again? } — the order is asked from the store first (paid, the starter in it), then the install runs
// detached from the core (`npm run market -- install`); GET ?order&slug → running | installed (element) | failed (reason) | none.
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const who = marketCaller(req.headers)
  if (who instanceof NextResponse) return who
  const q = req.nextUrl.searchParams
  return NextResponse.json({ ok: true, ...installState(process.cwd(), q.get("order") ?? "", q.get("slug") ?? "") }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  const who = marketCaller(req.headers)
  if (who instanceof NextResponse) return who
  const b = await bodyOf(req)
  const order = typeof b?.order === "string" ? b.order : ""
  const slug = typeof b?.slug === "string" ? b.slug : ""
  const again = b?.again === true
  if (!again) {
    const st = await orderStatus(process.cwd(), order)
    if (!st.ok) return NextResponse.json(st, { status: st.status ?? 502, headers: NO_STORE })
    if (!st.paid) return NextResponse.json({ ok: false, reason: "the order is not paid yet" }, { status: 402, headers: NO_STORE })
    if (!st.items.some((x: { slug: string }) => x.slug === slug)) return NextResponse.json({ ok: false, reason: "the starter is not in this order" }, { status: 400, headers: NO_STORE })
  }
  const out = startInstall(process.cwd(), { order, slug, again })
  return NextResponse.json(out, { status: out.ok ? 202 : out.status ?? 400, headers: NO_STORE })
}
