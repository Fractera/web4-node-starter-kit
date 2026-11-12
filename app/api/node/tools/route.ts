// @api list the tools of the core or one element
import { NextRequest, NextResponse } from "next/server"

import { onNode, ownerState } from "@/lib/agent-kit/system-part.cjs"
import { requireRoles } from "@/lib/auth/require-roles"
import { readTools } from "@/lib/parts/tools-catalog"
import { elementDir } from "@/lib/web4-items/element-github"
import { idOfAddress } from "@/lib/web4-items/element-address"

// THE TOOLS OF THE «TOOLS» TAB (node step 725-8). The tab is prerendered, an agent adds a tool at any minute — so the island asks here
// when the page opens. `item=build` — the core's own tools (the main agent's tab); otherwise the element by its address.
// 🔒 Only the two generated maps of that folder are read (`_tools/TOOLS.json`, `lib/parts/PARTS.json`), never a path from the request.
// 🔒 Behind the gate and the role, like `/api/node/element-docs`: the tools are facts about the person's machine.
// 733-8: `editable` — may this tab start an agent on these tools? An element's own tools — always (they are its own code). The core's
// tools on a person's node — never: the core is Fractera's (CLAUDE.md §6), the tab shows them and offers «take into an element» only;
// on the owner's node (his GitHub key may push to Fractera, `ownerState`, cached an hour) and in the workshop the core is open.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const HEADERS = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const item = req.nextUrl.searchParams.get("item") ?? ""
  const dir = item === "build" ? process.cwd() : (() => { const id = idOfAddress(item); return id ? elementDir(id) : null })()
  if (!dir) return NextResponse.json({ ok: false, error: "unknown element" }, { status: 404, headers: HEADERS })
  const tools = readTools(dir, process.cwd())
  if (!tools) return NextResponse.json({ ok: false, error: "no tools map" }, { status: 404, headers: HEADERS })
  const root = process.cwd()
  const editable = item !== "build" || !onNode(root) || (await ownerState(root)).owner === true
  return NextResponse.json({ ok: true, tools, editable }, { headers: HEADERS })
}
