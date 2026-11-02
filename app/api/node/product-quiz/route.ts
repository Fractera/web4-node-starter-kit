// @api read the product quiz of a WEB4 ITEM
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { elementDir } from "@/lib/web4-items/element-github"
import { readProductQuiz } from "@/lib/web4-items/product-quiz"

// PRODUCT QUIZ FOR THE PAGE «Building → Product design → Product quiz» (node step 536). The page is prerendered, and the element's
// agent rewrites its quiz in any minute of a conversation — the island asks here when the page opens, as the documents do (412-2).
// 🔒 The folder is fixed (`development-docs/product/` of the element), never taken from the request.
// 🔒 Closed by the gate and the role, like `/api/node/element-docs`: the quiz describes work on the person's machine.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const id = idOfAddress(req.nextUrl.searchParams.get("item") ?? "")
  if (!id || !elementDir(id)) return NextResponse.json({ ok: false, error: "unknown element" }, { status: 404 })
  return NextResponse.json({ ok: true, ...readProductQuiz(id) }, { headers: { "Cache-Control": "no-store" } })
}
