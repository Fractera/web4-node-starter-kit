// @api take a copy of a tool into the asking element
import { appendFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { elementOf } from "@/lib/element-key.cjs"
import { doTake, planTake } from "@/lib/parts/take.mjs"
import { elementDir } from "@/lib/web4-items/element-github"
import nodeType from "@/lib/web4-items/node-type.cjs"

// TAKE A TOOL (node step 733-5). The element's command `npm run tool:take -- <tool> [--from <element>] [--dry]` calls this door over the
// machine's loopback with its own key `X-Element-Key` (`<id>.<mac>`, written by the installer). 🔒 THE KEY NAMES THE ELEMENT: the files go
// into the folder of the element the key proves — never of a name in the body, so no element writes into a neighbour.
// Model-free: the work is `lib/parts/take.mjs`; the element's agent commits what was written. Every take goes into the node's journal.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }
const ID = /^[a-z0-9][a-z0-9-]{0,62}$/

export async function POST(req: NextRequest) {
  const caller = elementOf(req.headers.get("x-element-key") ?? "", process.env.DATA_SECRET ?? "")
  if (!caller) return NextResponse.json({ ok: false, error: "the element's own key is required (X-Element-Key)" }, { status: 401, headers: HEADERS })
  let body: { tool?: unknown; from?: unknown; dry?: unknown; update?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: "body is not JSON" }, { status: 400, headers: HEADERS }) }
  const tool = typeof body.tool === "string" && ID.test(body.tool) ? body.tool : null
  if (!tool) return NextResponse.json({ ok: false, error: "tool: the id from parts_find" }, { status: 400, headers: HEADERS })
  const from = typeof body.from === "string" && ID.test(body.from) ? body.from : "core"
  const receiver = elementDir(caller)
  if (!receiver) return NextResponse.json({ ok: false, error: `no folder of the element «${caller}»` }, { status: 404, headers: HEADERS })
  let source = process.cwd()
  if (from !== "core") {
    // A neighbour's tool only on a single project: between owners of an app factory nothing is exchanged in this step.
    if (nodeType.readNodeType(process.cwd()) !== "project") return NextResponse.json({ ok: false, error: "an app factory: tools are taken from the core only" }, { status: 403, headers: HEADERS })
    const dir = from === caller ? null : elementDir(from)
    if (!dir) return NextResponse.json({ ok: false, error: `no element «${from}» to take from` }, { status: 404, headers: HEADERS })
    source = dir
  }
  // 733-9-2: `update: true` replaces an older copy that is still its source's body — never a fork, never the element's own.
  const plan = planTake({ source, from, receiver, tool, update: body.update === true })
  const written = plan.ok && body.dry !== true ? doTake({ source, from, receiver, plan }) : []
  if (written.length) {
    try {
      mkdirSync(join(process.cwd(), "data", "node"), { recursive: true })
      appendFileSync(join(process.cwd(), "data", "node", "tools-take.jsonl"), JSON.stringify({ at: new Date().toISOString(), element: caller, tool: plan.tool ?? tool, from, copies: plan.copies.map((c) => `${c.id}@${c.version}${c.replaces ? ` (was ${c.replaces})` : ""}`) }) + "\n")
    } catch { /* the journal is a record, not a condition */ }
  }
  return NextResponse.json({ ok: plan.ok, element: caller, from, tool: plan.tool ?? tool, copies: plan.copies.map((c) => ({ id: c.id, version: c.version, ...(c.replaces ? { replaces: c.replaces } : {}) })), skipped: plan.skipped, refused: plan.refused, written }, { status: plan.ok ? 200 : 409, headers: HEADERS })
}
