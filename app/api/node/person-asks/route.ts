// @api list the main agent action requests and confirm one done
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { listServices } from "@/lib/microservices/registry"
import { elementName } from "@/lib/web4-items/dashboard-rows"
import asks from "@/lib/node/person-asks.cjs"
import nodeLine from "@/lib/agent-kit/node-line.cjs"

// ДЕЙСТВИЕ ЧЕЛОВЕКА (узел, шаг 761-16). GET — открытые запросы (главного агента — `npm run ask-person` ядра; агента элемента — его
// `npm run ask-person`, 761-16d), их показывает окно внизу каждой страницы пульта с именем элемента; POST `{ id }` — человек нажал
// «Готово»: запрос закрывается один раз, просыпается ТОТ, кто просил (главный агент или агент элемента), строкой узла `person-done`.
// Ворота человека — architect/admin; на временном адресе — пусто и отказ. Агент элемента приходит с ключом узла (`X-Node-Key`, как
// `tell-core`): POST `{ from, text, href?, why?, hint? }` ставит запрос, `{ from, drop }` снимает свой, `{ from, list: true }` — свои.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const noStore = { headers: { "Cache-Control": "no-store" } }
type Ask = { id: string; text: string; href: string | null; why: string | null; hint?: string | null; by?: string; at: string }
type Wake = (service: string, opts: { text?: string; from?: string; confirmed?: boolean }) => Promise<Record<string, unknown> & { ok: boolean }>

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
const known = (id: string) => /^[a-z][a-z0-9-]{0,39}$/.test(id) && (listServices() as unknown as { id: string }[]).some((s) => s.id === id)
const str = (v: unknown): string | null => (typeof v === "string" ? v : null)
const lang2 = (req: NextRequest): "en" | "ru" => (req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en")

export async function GET(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: true, asks: [] }, noStore)
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  const lang = lang2(req)
  const list = (asks.open(ROOT) as Ask[]).map(({ id, text, href, why, hint, by, at }) => ({
    id, text, href, why, hint: hint ?? null, at, by: by ?? "build", byName: by && by !== "build" ? elementName(by, lang) : null,
  }))
  return NextResponse.json({ ok: true, asks: list }, noStore)
}

/** An element agent's own requests: put, drop or list — with the node key and its id (761-16d). */
async function fromElement(req: NextRequest) {
  let body: { from?: unknown; text?: unknown; href?: unknown; why?: unknown; hint?: unknown; drop?: unknown; list?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, reason: "invalid JSON" }, { status: 400, ...noStore }) }
  const from = typeof body.from === "string" ? body.from.trim() : ""
  if (from === "build" || !known(from)) return NextResponse.json({ ok: false, reason: "from must be an element of this node" }, { status: 400, ...noStore })
  if (body.list === true) return NextResponse.json({ ok: true, asks: (asks.open(ROOT) as Ask[]).filter((a) => a.by === from) }, noStore)
  if (typeof body.drop === "string") {
    const mine = (asks.open(ROOT) as Ask[]).some((a) => a.id === body.drop && a.by === from)
    const out = mine ? asks.drop(ROOT, body.drop) : null
    return NextResponse.json({ ok: !!out, ...(out ? {} : { reason: "no open request of yours with this id" }) }, { status: out ? 200 : 404, ...noStore })
  }
  try {
    const a = asks.add(ROOT, { text: body.text, href: str(body.href), why: str(body.why), hint: str(body.hint), by: from }) as Ask
    console.log(`[node/person-asks] ${from} put ${a.id}`)
    return NextResponse.json({ ok: true, id: a.id }, noStore)
  } catch (e) {
    return NextResponse.json({ ok: false, reason: e instanceof Error ? e.message : String(e) }, { status: 400, ...noStore })
  }
}

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-node-key")
  if (key) {
    if (!nodeKeyOk(key)) return NextResponse.json({ ok: false, reason: "node key required (X-Node-Key)" }, { status: 401, ...noStore })
    return fromElement(req)
  }
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary address" }, { status: 403, ...noStore })
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  let body: { id?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, reason: "invalid JSON" }, { status: 400, ...noStore }) }
  const id = typeof body.id === "string" && /^[a-f0-9]{8}$/.test(body.id) ? body.id : null
  if (!id) return NextResponse.json({ ok: false, reason: "id required" }, { status: 400, ...noStore })
  const a = asks.done(ROOT, id) as Ask | null
  if (!a) return NextResponse.json({ ok: true, already: true }, noStore)
  // the one who asked wakes: the main agent (`build`) or the element whose agent put the request
  const who = a.by && a.by !== "build" && known(a.by) ? a.by : "build"
  const wake = (globalThis as { __web4AgentWake?: Wake }).__web4AgentWake
  let woke: string = "no-agent-kit"
  if (typeof wake === "function") {
    const out = await wake(who, { text: `${nodeLine.head("person-done", who)}${asks.doneText(a)}`, from: "node", confirmed: true })
    woke = out.ok ? "ok" : String(out.reason ?? "refused")
  }
  console.log(`[node/person-asks] ${id} done → ${who}: ${woke}`)
  return NextResponse.json({ ok: true, woke, who }, noStore)
}
