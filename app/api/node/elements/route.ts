// @api list every element of the node with its role and power
import { timingSafeEqual } from "node:crypto"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { listServices } from "@/lib/microservices/registry"
import power from "@/lib/web4-items/element-power.cjs"

// ВЕСЬ УЗЕЛ ОДНИМ СПИСКОМ ДЛЯ ПРОДУКТОВОГО КВИЗА (шаг 563-4). Квиз элемента прежде чем планировать читает узел: что уже построено и
// кем, чтобы не планировать заново то, что делает сосед (владелец 2026-10-22: квиз «должен понимать архитектуру проекта а значит умеет
// читать узел и все существующие элементы»). В отличие от реестра A2A (`/api/node/a2a`, выключенных там нет — закон 567) здесь есть и
// выключенные — с причиной: встроенный инструмент, который узел включает на задачу (`reverse`), — тоже способность узла.
// Кто вправе: элемент узла с ключом узла (`X-Node-Key`) или архитектор/админ. Портов нет: квизу они не нужны.
export const dynamic = "force-dynamic"

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function nodeRoles(): Record<string, string> {
  // Те же два файла, что читают поиск A2A и сводка проектов: умолчания служб в git и назначенные на узле.
  const read = (p: string) => { try { return JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown> } catch { return {} } }
  const all = { ...read(join(process.cwd(), "WEB4-ITEMS-REGISTRY", "roles.json")), ...read(join(process.cwd(), "data", "node", "roles.json")) }
  return Object.fromEntries(Object.entries(all).filter(([k, v]) => !k.startsWith("_") && typeof v === "string" && v.trim()).map(([k, v]) => [k, String(v).trim()]))
}

type Row = { id: string; kind?: string; address?: string; summary?: string; a2a?: { address?: string; description?: string } }

export async function GET(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    const denied = await requireRoles(req, ["architect", "admin"])
    if (denied) return denied
  }
  const lang = req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en"
  const roles = nodeRoles()
  const elements = (listServices() as unknown as Row[]).map((s) => {
    const off = power.offOf(s)
    return {
      id: s.id,
      address: s.a2a?.address ?? s.address ?? s.id,
      kind: s.kind === "user" ? "custom" : "native",
      role: roles[s.id] ?? null,
      does: s.a2a?.description ?? s.summary ?? null,
      on: !off,
      offReason: off ? power.reasonIn(off, lang) : null,
    }
  })
  return NextResponse.json({ ok: true, elements }, { headers: { "Cache-Control": "no-store" } })
}
