// @api list outside services with their elements, keys and last refusal
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
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
  const board = subscriptionsBoard(lang)
  const balances = req.nextUrl.searchParams.get("balances") === "1" ? await subscriptionBalances(board.rows.map((r) => r.service)) : null
  return NextResponse.json({ ok: true, ...board, balances }, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { service?: unknown; calls?: unknown } | null
  const ok = setBudget(String(body?.service ?? ""), Number(body?.calls ?? 0))
  return NextResponse.json({ ok }, { status: ok ? 200 : 400, headers: { "Cache-Control": "no-store" } })
}
