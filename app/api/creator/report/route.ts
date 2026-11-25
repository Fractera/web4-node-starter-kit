// @api nodes report systemic errors to Fractera's developer chat
import { NextRequest, NextResponse } from "next/server"

import inbox from "@/lib/node/creator-inbox.cjs"

// THE CREATOR CHANNEL'S DOOR (node step 855-4; lib/node/creator-inbox.cjs). Public — nodes everywhere post here — and INERT (404) on every
// node without `data/node/creator-inbox.json`, i.e. everywhere but Fractera's own node. The lock is the report's own signature; the door
// never acts on a report's words, it only forwards them to the creator's chat (one way).
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" }
const MAX = 32 * 1024

export async function POST(req: NextRequest) {
  const cfg = inbox.config(ROOT) as { token: string; chat: string } | null
  if (!cfg) return new NextResponse(null, { status: 404, headers: HEADERS })
  const raw = await req.text().catch(() => "")
  if (!raw || raw.length > MAX) return NextResponse.json({ ok: false, reason: "size" }, { status: 413, headers: HEADERS })
  let envelope: unknown = null
  try { envelope = JSON.parse(raw) } catch { return NextResponse.json({ ok: false, reason: "json" }, { status: 400, headers: HEADERS }) }
  const out = inbox.accept(ROOT, envelope) as { status: number; reason?: string; forward?: string }
  if (out.status !== 202) return NextResponse.json({ ok: out.status === 200, reason: out.reason }, { status: out.status, headers: HEADERS })
  const sent = await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, { // 639: остаётся — a report the developer works from
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: Number(cfg.chat), text: out.forward, disable_web_page_preview: true }), signal: AbortSignal.timeout(10_000),
  }).then((r) => r.json() as Promise<{ ok?: boolean }>).catch(() => ({ ok: false }))
  console.log(`[creator/report] accepted → ${sent.ok ? "forwarded" : "NOT forwarded (kept in the inbox log)"}`)
  return NextResponse.json({ ok: true, forwarded: sent.ok === true }, { status: 202, headers: HEADERS })
}
