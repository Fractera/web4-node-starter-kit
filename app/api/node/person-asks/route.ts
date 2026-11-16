// @api list the main agent action requests and confirm one done
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import asks from "@/lib/node/person-asks.cjs"
import nodeLine from "@/lib/agent-kit/node-line.cjs"

// ДЕЙСТВИЕ ЧЕЛОВЕКА (узел, шаг 761-16). GET — открытые запросы главного агента (`npm run ask-person`), их показывает окно внизу каждой
// страницы пульта; POST `{ id }` — человек нажал «Готово»: запрос закрывается один раз, главный агент просыпается в том же разговоре
// строкой узла `person-done` (сам проверяет результат). Ворота architect/admin; на временном адресе — пусто и отказ.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const noStore = { headers: { "Cache-Control": "no-store" } }
type Ask = { id: string; text: string; href: string | null; why: string | null; at: string }
type Wake = (service: string, opts: { text?: string; from?: string; confirmed?: boolean }) => Promise<Record<string, unknown> & { ok: boolean }>

export async function GET(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: true, asks: [] }, noStore)
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  const list = (asks.open(ROOT) as Ask[]).map(({ id, text, href, why, at }) => ({ id, text, href, why, at }))
  return NextResponse.json({ ok: true, asks: list }, noStore)
}

export async function POST(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary address" }, { status: 403, ...noStore })
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  let body: { id?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, reason: "invalid JSON" }, { status: 400, ...noStore }) }
  const id = typeof body.id === "string" && /^[a-f0-9]{8}$/.test(body.id) ? body.id : null
  if (!id) return NextResponse.json({ ok: false, reason: "id required" }, { status: 400, ...noStore })
  const a = asks.done(ROOT, id) as Ask | null
  if (!a) return NextResponse.json({ ok: true, already: true }, noStore)
  const wake = (globalThis as { __web4AgentWake?: Wake }).__web4AgentWake
  let woke: string = "no-agent-kit"
  if (typeof wake === "function") {
    const out = await wake("build", { text: `${nodeLine.head("person-done", "build")}${asks.doneText(a)}`, from: "node", confirmed: true })
    woke = out.ok ? "ok" : String(out.reason ?? "refused")
  }
  console.log(`[node/person-asks] ${id} done → main agent: ${woke}`)
  return NextResponse.json({ ok: true, woke }, noStore)
}
