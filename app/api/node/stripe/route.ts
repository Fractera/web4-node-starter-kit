// @api read which Stripe keys are set and save checked new ones
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { getService } from "@/lib/microservices/registry"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { modeOf, parseStripe, probeStripe, saveStripe, stripeState, syncStripeMcp } from "@/lib/stripe-keys"
import { paymentOf } from "@/lib/web4-items/payment-elements"

// КЛЮЧИ STRIPE (530-1): адрес/id платёжного элемента Stripe узла. 551-5 (владелец 2026-10-20: «Web два … не должен как скопировать
// только на страйп а вместо этого должен … показывать с какими платёжными элементами он интегрирован»): ключи живут в самом элементе
// Stripe (паспорт `payment.tool = "stripe"`); 🪦 цель «ядро» и любой другой элемент сняты — их ключи никто не читал.
// 573-4: элемент Stripe — НАТИВНЫЙ (`kind: core`, шаг 573-2), поэтому цель узнаётся по реестру и паспорту, а не по признаку «рождён»:
// ✗ после 573-2 дверь отвечала ему `404 unknown-target`, и ключи Stripe ввести было негде (замер 2026-10-23).
//   GET  — какие ключи заданы и режим (test/live). Значений в ответе нет никогда.
//   POST `{ target, secretKey?, publishableKey?, webhookSecret?, agentKey? }` — формат каждого, один режим у секретного, публикуемого
//        и ключа агента (и с уже записанным секретным), секретный ключ и ключ агента — настоящим вызовом Stripe; отказ — 400/422/502
//        с родом, `.env.local` не тронут. Записан ключ агента — элемент пишет свой `.mcp.json` (`mcp` в ответе: on · off · failed · no-script).
// Ворота architect/admin; на временном публичном адресе — отказ: ключ, вписанный через чужой туннель, — утечка.
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }

function targetOf(raw: string): string | null {
  const id = idOfAddress(raw)
  return id && getService(id) && paymentOf(id)?.tool === "stripe" ? id : null
}

async function gate(req: NextRequest): Promise<NextResponse | null> {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  return requireRoles(req, ["architect", "admin"])
}

const refuse = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status, headers: NO_STORE })

export async function GET(req: NextRequest) {
  const denied = await gate(req)
  if (denied) return denied
  const target = targetOf(req.nextUrl.searchParams.get("target") ?? "")
  if (!target) return refuse("unknown-target", 404)
  return NextResponse.json({ ok: true, ...stripeState(target) }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  const denied = await gate(req)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { target?: unknown } | null
  const target = targetOf(typeof body?.target === "string" ? body.target : "")
  if (!target) return refuse("unknown-target", 404)
  const parsed = parseStripe(body)
  if (!parsed.ok) return refuse(parsed.error, 400)
  const v = parsed.value
  // Ключ агента без секретного в том же запросе — режим сверяется с уже записанным секретным: агент и двери работают с одним режимом.
  const stored = stripeState(target).mode
  if (v.agentKey && !v.secretKey && stored && stored !== modeOf(v.agentKey)) return refuse("agent-mode-mismatch", 400)
  for (const [key, rejected] of [[v.secretKey, "key-rejected"], [v.agentKey, "agent-rejected"]] as const) {
    if (!key) continue
    const probe = await probeStripe(key)
    if (probe === "key-rejected") return refuse(rejected, 422)
    if (probe === "probe-failed") return refuse("probe-failed", 502)
  }
  if (!saveStripe(target, v)) return refuse("not-saved", 500)
  const mcp = v.agentKey ? syncStripeMcp(target) : undefined
  return NextResponse.json({ ok: true, ...stripeState(target), ...(mcp ? { mcp } : {}) }, { headers: NO_STORE })
}
