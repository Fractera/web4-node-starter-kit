// @api list each element's subdomain on the main domain and whether it answers
import { NextRequest, NextResponse } from "next/server"
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { primaryDomain, zoneRootElement } from "@/lib/domain/node-domains"
import { listServices, serviceUrl } from "@/lib/microservices/registry"
import { addressOf } from "@/lib/web4-items/address-file.mjs"
import { elementName } from "@/lib/web4-items/dashboard-rows"

// ПОДДОМЕНЫ ЭЛЕМЕНТОВ — ЧЕТВЁРТЫЙ ШАГ ОСНОВНОГО ДОМЕНА (775, the owner 2026-11-17: «не хватает четвёртого шага который показывает
// активацию субдоменов для каждого элемента»). GET — every element with a server: its readable name, its address on the main domain
// (`<address>.<zone>`) and whether that address answers from the internet now (one request each, 6 s, in parallel; any answer below 500
// counts — a page behind sign-in is still a working address). By the person's press only; nothing is remembered.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

async function answers(host: string): Promise<boolean> {
  try {
    const r = await fetch(`https://${host}/`, { method: "GET", redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(6000) })
    return r.status < 500
  } catch { return false }
}

export async function GET(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const g = await requireRoles(req, ROLES)
  if (g) return g
  const primary = primaryDomain()
  if (!primary) return NextResponse.json({ ok: false, error: "no-primary" }, { status: 409, ...noStore })
  const lang = req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en"
  // 775: the element on the domain's root answers on the zone itself, without a prefix.
  const rootId = zoneRootElement(serviceUrl)
  const rows = listServices().filter((s) => serviceUrl(s.id)).map((s) => ({ id: s.id, name: elementName(s.id, lang), host: s.id === rootId ? primary.name : `${addressOf(s.id) ?? s.id}.${primary.name}` }))
  const checked = await Promise.all(rows.map(async (r) => ({ ...r, answers: await answers(r.host) })))
  // 775 (the owner, 2026-11-17: «кнопка перейти в web … появляется только тогда, когда четвёртый пункт поддомены полностью завершён»):
  // the verdict of the last check is kept for the place door (`webReady`) — only by this press, never measured behind the person's back.
  try {
    mkdirSync(join(process.cwd(), "logs"), { recursive: true })
    writeFileSync(join(process.cwd(), "logs", "domain-subdomains.json"), `${JSON.stringify({ zone: primary.name, all: checked.every((c) => c.answers), at: new Date().toISOString() })}\n`)
  } catch { /* the record is a courtesy: without it the band keeps «Настройте домен» */ }
  return NextResponse.json({ ok: true, zone: primary.name, elements: checked, at: new Date().toISOString() }, noStore)
}
