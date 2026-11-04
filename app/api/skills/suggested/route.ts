// @api element agent downloads a skill the person approved and the node checked
import { timingSafeEqual } from "node:crypto"
import { readFile } from "node:fs/promises"
import { NextRequest, NextResponse } from "next/server"
import { archivePathOf } from "@/lib/agent-kit/skills/suggested.mjs"

// A SKILL HANDED TO AN ELEMENT (node steps 628, 640). `npm run skills -- hand` packs the checked copy — a suggestion the person approved, one
// of the node's own kept skills, or a catalog skill from Fractera's store — with its SOURCE.md; the element's own agent takes it here
// with the node key and installs it in its own folder — the core never writes into an element. GET `?id=<owner>__<repo>/<skill>`; any other shape, a path walk included, is refused by
// `archivePathOf` before the disk is touched. The archive's sha256 travels in the task, and the agent checks it.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, error: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  const id = req.nextUrl.searchParams.get("id") ?? ""
  const file = archivePathOf(process.cwd(), id)
  if (!file) {
    return NextResponse.json({ ok: false, error: "id must be <owner>__<repo>/<skill>" }, { status: 400, headers: HEADERS })
  }
  let body: Buffer
  try { body = await readFile(file) } catch {
    return NextResponse.json({ ok: false, error: "no checked copy for this id — npm run skills -- hand" }, { status: 404, headers: HEADERS })
  }
  console.log(`[skills/suggested] ${id} → ${body.length} bytes`)
  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: { ...HEADERS, "Content-Type": "application/gzip", "Content-Disposition": `attachment; filename="${id.split("/")[1]}.tar.gz"` },
  })
}
