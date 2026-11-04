// @api an element finds checked catalog skills by a request's meaning
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { findInCatalogFile } from "@/lib/agent-kit/skills/catalog-index.mjs"

// THE SKILLS CATALOG FOR THE ELEMENTS (node step 627-4). The node's deep memory looks here for a skill when no service handles a request
// — the agreed door instead of reading the core's files (law «Only agents talk to agents»: code calls an agreed API). POST
// `{ query, n?, terms?, rephrasings? }` with the node key → the closest checked cards (summary, the verdict for the node, licence, stars, installs, scripts,
// link) and the skip-cards the request names. The file and the cards are read once per process; a query costs one vector. The person's
// own skills (640-2) come first, marked `own: true`.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, error: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  const body = (await req.json().catch(() => null)) as { query?: unknown; n?: unknown; terms?: unknown; rephrasings?: unknown } | null
  const query = typeof body?.query === "string" ? body.query.trim().slice(0, 1000) : ""
  if (!query) return NextResponse.json({ ok: false, error: "query must be a non-empty string" }, { status: 400, headers: HEADERS })
  const n = Number.isInteger(body?.n) && (body!.n as number) > 0 && (body!.n as number) <= 10 ? (body!.n as number) : 7
  // 640-5: the caller's short terms and rephrasings, as the main agent's skills_find gives them.
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string").slice(0, 10) : [])
  const r = await findInCatalogFile(process.cwd(), { query, n, terms: strings(body?.terms), rephrasings: strings(body?.rephrasings) })
  const found = r.ok ? r.found.map((c) => ({ id: c.id, skill: c.skill, source: c.source, summary: c.summary, value: c.value, use: c.use, why: c.why, licence: c.licence, stars: c.stars, installs: c.installs, scripts: Array.isArray(c.scripts) ? c.scripts.length : 0, url: c.url, score: c.score, ...(c.own ? { own: true, keptAt: c.keptAt } : {}) })) : []
  return NextResponse.json({ ok: r.ok, ...(r.ok ? {} : { error: r.error }), found, skipped: r.ok ? r.skipped : [] }, { status: r.ok ? 200 : 503, headers: HEADERS })
}
