// @api list outside services with their elements, keys and last refusal
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { setBudget, subscriptionBalances, subscriptionsBoard } from "@/lib/web4-items/subscriptions-board"

// «ВСЕ ПОДПИСКИ» (726-3). The Dashboard page is prerendered, so the services, the ledger and the key state are read here, on request.
// 🔒 CLOSED BY THE GATE AND A ROLE (like `/api/node/projects`): which services the node pays for and who calls them is the person's
// business. Keys leave as a state only («set», «missing»), never a value.
// 726-4: `?balances=1` asks the providers what they tell about money — only when the person presses «Проверить балансы» (a few HTTP
// calls, no model, free at both providers; no timer). POST `{ service, calls }` sets the daily budget in calls (0 removes it).
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const lang = req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en"
  const asked = req.nextUrl.searchParams.get("balances") === "1"
  // 726-4 fix (measured 2026-11-12 on the owner's node): the temporary address gives the panel READ-ONLY to anyone with the link
  // (CLAUDE.md §2) — but «Check balances» is an act: the node calls the providers with ITS keys and shows a balance. Like a write, it
  // works only on this computer or the own domain (the same answer the proxy gives a write there).
  if (asked && isTemporaryPublicAddress(req)) {
    return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403, headers: { "Cache-Control": "no-store" } })
  }
  const board = subscriptionsBoard(lang)
  const balances = asked ? await subscriptionBalances(board.rows.map((r) => r.service)) : null
  return NextResponse.json({ ok: true, ...board, balances }, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { service?: unknown; calls?: unknown } | null
  const ok = setBudget(String(body?.service ?? ""), Number(body?.calls ?? 0))
  return NextResponse.json({ ok }, { status: ok ? 200 : 400, headers: { "Cache-Control": "no-store" } })
}
