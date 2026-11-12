// @api list the tools of the core or one element
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { readTools } from "@/lib/parts/tools-catalog"
import { elementDir } from "@/lib/web4-items/element-github"
import { idOfAddress } from "@/lib/web4-items/element-address"

// THE TOOLS OF THE «TOOLS» TAB (node step 725-8). The tab is prerendered, an agent adds a tool at any minute — so the island asks here
// when the page opens. `item=build` — the core's own tools (the main agent's tab); otherwise the element by its address.
// 🔒 Only the two generated maps of that folder are read (`_tools/TOOLS.json`, `lib/parts/PARTS.json`), never a path from the request.
// 🔒 Behind the gate and the role, like `/api/node/element-docs`: the tools are facts about the person's machine.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const HEADERS = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const item = req.nextUrl.searchParams.get("item") ?? ""
  const dir = item === "build" ? process.cwd() : (() => { const id = idOfAddress(item); return id ? elementDir(id) : null })()
  if (!dir) return NextResponse.json({ ok: false, error: "unknown element" }, { status: 404, headers: HEADERS })
  const tools = readTools(dir)
  if (!tools) return NextResponse.json({ ok: false, error: "no tools map" }, { status: 404, headers: HEADERS })
  return NextResponse.json({ ok: true, tools }, { headers: HEADERS })
}
