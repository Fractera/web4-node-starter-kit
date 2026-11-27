// @api read the product quiz of a WEB4 ITEM
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { actsFor, callerOf, refusal } from "@/lib/node/caller"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { elementDir } from "@/lib/web4-items/element-github"
import { readProductQuiz } from "@/lib/web4-items/product-quiz"
import { quizVersions } from "@/lib/web4-items/product-quiz-pdf"

// PRODUCT QUIZ FOR THE PAGE «Building → Product design → Product quiz» (node step 536). The page is prerendered, and the element's
// agent rewrites its quiz in any minute of a conversation — the island asks here when the page opens, as the documents do (412-2).
// 🔒 The folder is fixed (`development-docs/product/` of the element), never taken from the request.
// 🔒 Closed by the gate and the role, like `/api/node/element-docs`: the quiz describes work on the person's machine.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  // 861-3 (fractera.ai via Roma 1471, need-20261127-3d1637): an element reads ITS OWN quiz with its own key (X-Node-Key) — to check what
  // its person downloads before it says «done»; another element's quiz 403, a bogus key 401; the node key — the core and the natives.
  // No key — the panel's roles, as before.
  if (req.headers.get("x-node-key")) {
    const caller = callerOf(req.headers)
    const asked = idOfAddress(req.nextUrl.searchParams.get("item") ?? "")
    if (!caller || !actsFor(caller, asked)) {
      const r = refusal(caller, "its own product quiz only")
      return NextResponse.json({ ok: false, reason: r.reason }, { status: r.status })
    }
  } else {
    const denied = await requireRoles(req, ROLES)
    if (denied) return denied
  }
  const id = idOfAddress(req.nextUrl.searchParams.get("item") ?? "")
  const dir = id ? elementDir(id) : null
  if (!id || !dir) return NextResponse.json({ ok: false, error: "unknown element" }, { status: 404 })
  // 852-5: the approved versions — the element's tags quiz-v<N>, newest first.
  return NextResponse.json({ ok: true, ...readProductQuiz(id), versions: await quizVersions(dir) }, { headers: { "Cache-Control": "no-store" } })
}
