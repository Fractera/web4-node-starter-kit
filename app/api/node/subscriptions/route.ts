// @api list outside services with their elements, keys and last refusal
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { subscriptionsBoard } from "@/lib/web4-items/subscriptions-board"

// «ВСЕ ПОДПИСКИ» (726-3). The Dashboard page is prerendered, so the services, the ledger and the key state are read here, on request.
// 🔒 CLOSED BY THE GATE AND A ROLE (like `/api/node/projects`): which services the node pays for and who calls them is the person's
// business. Keys leave as a state only («set», «missing»), never a value.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const lang = req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en"
  return NextResponse.json({ ok: true, ...subscriptionsBoard(lang) }, { headers: { "Cache-Control": "no-store" } })
}
