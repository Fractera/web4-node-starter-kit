// @api the node type: a single project or an app factory
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import nodeType from "@/lib/web4-items/node-type.cjs"
import { serviceUrl } from "@/lib/microservices/registry"
import { elementLabel } from "@/lib/web4-items/element-name"

// 553: ТИП УЗЛА (`lib/web4-items/node-type.cjs`). Меняет его только человек — этой дверью, командой `npm run node-type` или словом
// главному агенту. Тип задаёт облик НОВЫХ кастомных элементов; существующие перечисляются (`mismatches`) и переключаются по одному.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

// 564: где человек меняет режим — страница настроек элемента config (переключатель в красной карточке, слово владельца 2026-10-21:
// «в этом конфигураторе и нужно сделать ещё один механический переключатель … в паспорте … будет просто показывать»). Адрес — о
// машине (свой домен или петля), поэтому отдаётся дверью, а не запекается в страницу «Паспорта». Правило имени — как у `/api/node/reach`.
function settingsUrl(): string | null {
  let zone: string | undefined
  try { zone = (JSON.parse(readFileSync(join(process.cwd(), "logs", "domain.json"), "utf8")) as { zone?: string }).zone } catch { /* домена нет */ }
  const base = zone ? `https://config.${zone}` : serviceUrl("config")
  return base ? `${base}/{lang}/architect` : null
}

// 782-1: `elements` — рождённые кастомные элементы с именем для людей и их связью с CONFIG: окно переключения в «Паспорте» называет их
// («прежние элементы сохранят своё состояние»). Имя — на языке страницы (`?lang=`), идентификатор человеку не показывается.
function state(lang: string) {
  const root = process.cwd()
  const type = nodeType.readNodeType(root) as "project" | "factory"
  const elements = (nodeType.bornCustom(root) as { id: string; config: boolean }[]).map((e) => ({ id: e.id, name: elementLabel(e.id, lang), config: e.config }))
  return { ok: true, type, mismatches: nodeType.mismatches(type, root), elements, settingsUrl: settingsUrl() }
}

const langOf = (req: NextRequest) => (req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en")

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json(state(langOf(req)), { headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  let type: unknown
  try { type = ((await req.json()) as { type?: unknown })?.type } catch { /* нет тела */ }
  if (type !== "project" && type !== "factory") return NextResponse.json({ ok: false, reason: "type must be project or factory" }, { status: 400 })
  nodeType.writeNodeType(type, process.cwd())
  // Окно рождения подставляет облик по типу — страницы элементов перерисовываются (команда из терминала этого не делает).
  revalidatePath("/[lang]", "layout")
  return NextResponse.json(state(langOf(req)), { headers: { "Cache-Control": "no-store" } })
}
