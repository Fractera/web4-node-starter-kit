// @api run a walled element session's hook as the node (relay)
import { NextRequest, NextResponse } from "next/server"

import { elementOf } from "@/lib/element-key.cjs"
import { EDGE_HEADER } from "@/lib/hosting/edge.mjs"
import { NAMES, runRelayed } from "@/lib/agent-kit/hook-relay-run.cjs"
import { elementDir } from "@/lib/web4-items/element-github"

// THE HOOK RELAY'S DOOR (node step 811-5a). On a dedicated server a custom element's agent runs as its own Linux user and reads nothing
// of the core; its session's hooks are `lib/agent-kit/hook-relay.cjs`, which posts each event here with the element's own key
// (`X-Element-Key`). The core runs the real hook as the node's user for THAT element (`lib/agent-kit/hook-relay-run.cjs`, a fixed list)
// and answers its output and exit code. 🔒 THE KEY NAMES THE ELEMENT: the id given to the hook is the caller's, never a word of the body.
// Loopback only: a request carrying Cloudflare's or the server edge's headers came from the internet and is refused.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }
const MAX_STDIN = 1024 * 1024

export async function POST(req: NextRequest) {
  if (req.headers.get("cf-connecting-ip") || req.headers.get("cf-ray") || req.headers.get(EDGE_HEADER)) {
    return NextResponse.json({ ok: false, error: "loopback only" }, { status: 403, headers: HEADERS })
  }
  const caller = elementOf(req.headers.get("x-element-key") ?? "", process.env.DATA_SECRET ?? "")
  if (!caller) return NextResponse.json({ ok: false, error: "the element's own key is required (X-Element-Key)" }, { status: 401, headers: HEADERS })
  let body: { name?: unknown; arg?: unknown; stdin?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: "body is not JSON" }, { status: 400, headers: HEADERS }) }
  const name = typeof body.name === "string" && (NAMES as string[]).includes(body.name) ? body.name : null
  if (!name) return NextResponse.json({ ok: false, error: "name: one of the relayed hooks" }, { status: 400, headers: HEADERS })
  const stdin = typeof body.stdin === "string" ? body.stdin : ""
  if (stdin.length > MAX_STDIN) return NextResponse.json({ ok: false, error: "stdin too long" }, { status: 413, headers: HEADERS })
  const arg = typeof body.arg === "string" ? body.arg : null
  const dir = elementDir(caller)
  if (!dir) return NextResponse.json({ ok: false, error: `no folder of the element «${caller}»` }, { status: 404, headers: HEADERS })
  const r = await runRelayed({ root: process.cwd(), id: caller, dir, name, arg, stdin, timeoutMs: name.startsWith("mcp:") ? 110_000 : 55_000 })
  return NextResponse.json(r, { status: r.ok ? 200 : 400, headers: HEADERS })
}
