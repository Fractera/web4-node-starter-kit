// @api the element settings tabs read and patch its own config
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { callElementDoor, patchElementSettings, stateOf } from "@/lib/web4-items/element-settings-door"
import settingsSchema from "@/lib/web4-items/element-settings-schema.cjs"

// ПУЛЬТ ЯДРА К НАСТРОЙКАМ ЭЛЕМЕНТА (узел, шаг 712-2). Владелец 2026-11-09: «для CONFIG и для дизайна мы должны избавиться от внешних
// страниц которые уводят нас из вкладки работы с элементом» · «ядро всего лишь навсего представляет доступ к … настройкам которые сейчас
// существуют в элементе. То есть это удалённый пульт управления».
//
// Вкладки «Строительство → Дизайн» и «Строительство → Настройки сайта» читают и правят файлы элемента через эту дверь, а она — через
// двери самого элемента по ключу узла (`/api/settings/{design,app,features,brief}`; меню — его публичная оболочка `/api/shell/<язык>`).
// 🔒 ЯДРО НИЧЕГО НЕ ХРАНИТ: ответ — значения элемента и его объявление полей, разложенное в «путь → тип»
// (`lib/web4-items/element-settings-schema.cjs`); редактор ядра рисует только поля, которые знает и которые элемент объявляет тем же типом.
// 🔒 СОСТОЯНИЕ, А НЕ ОШИБКА: элемент на шаблоне старше (двери нет или она не отдаёт объявление), не отвечает или связан с CONFIG — это
// `ok: false` с причиной, и вкладка говорит её словами; пустой редактор поверх настоящих настроек не рисуется никогда.
// 🔒 ЗАКРЫТА РОЛЬЮ: архитектор и администратор. Ключ узла в браузер не уходит.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }
const DOORS = { design: "/api/settings/design", app: "/api/settings/app", features: "/api/settings/features", brief: "/api/settings/brief" } as const
type File = keyof typeof DOORS
const LANG = /^[a-z]{2}(?:-[A-Za-z]{2,4})?$/

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE })
const isFile = (v: unknown): v is File => typeof v === "string" && Object.hasOwn(DOORS, v)
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const q = req.nextUrl.searchParams
  const element = idOfAddress(q.get("item") ?? "")
  if (!element) return json({ ok: false, reason: "unknown-element" }, 404)
  const file = q.get("file")
  if (file === "shell") {
    const lang = q.get("lang") ?? ""
    if (!LANG.test(lang)) return json({ ok: false, reason: "bad-lang" }, 400)
    const a = await callElementDoor(element, `/api/shell/${lang}`)
    if ("unavailable" in a) return json({ ok: false, reason: a.unavailable })
    return a.status === 200 && isObj(a.body) ? json({ ok: true, shell: a.body }) : json({ ok: false, reason: `element-${a.status}` })
  }
  if (!isFile(file)) return json({ ok: false, reason: "bad-file" }, 400)
  const a = await callElementDoor(element, DOORS[file])
  const bad = stateOf(a)
  if (bad) return json(bad)
  const body = (a as { body: Record<string, unknown> }).body
  // Дверь без объявления — шаблон старше 712: показать нечего, что было бы правдой.
  if (!isObj(body.schema)) return json({ ok: false, reason: "template-older" })
  return json({
    ok: true,
    linked: body.linked === true,
    config: isObj(body.config) ? body.config : {},
    fields: settingsSchema.declaredFields(body.schema),
    built: isObj(body.built) ? body.built : null,
  })
}

/**
 * Запись. Два вида тела: `{ item, file, patch }` — пульт вкладки; `?item=&file=` в адресе и сама заплата телом — редакторы, перенесённые
 * из шаблона, шлют её так же, как своей двери элемента.
 * 🔒 ОТСЕЧЕНИЕ ЗДЕСЬ, НА СЕРВЕРЕ: перед записью ядро спрашивает объявление элемента и пропускает в его файл только объявленные пути
 * верного типа (`prunePatch`) — что бы ни прислал браузер. Пустая после отсечения заплата не уходит.
 */
export async function PATCH(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  let body: unknown
  try { body = await req.json() } catch { return json({ ok: false, reason: "bad-body" }, 400) }
  const q = req.nextUrl.searchParams
  const byQuery = q.has("item") && q.has("file")
  const target = byQuery ? { item: q.get("item"), file: q.get("file"), patch: body } : isObj(body) ? body : {}
  const element = idOfAddress(typeof target.item === "string" ? target.item : "")
  if (!element) return json({ ok: false, reason: "unknown-element" }, 404)
  if (!isFile(target.file) || !isObj(target.patch)) return json({ ok: false, reason: "bad-body" }, 400)
  const r = await patchElementSettings(element, DOORS[target.file], target.patch)
  if (!r.ok) return json({ ok: false, reason: r.reason, ...(r.key ? { key: r.key } : {}) }, r.status)
  return json({ ok: true, config: r.config, ...(r.pruned ? { pruned: true } : {}) })
}
