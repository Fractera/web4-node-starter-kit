// @api cut an element's icon set from one square picture
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { dataUrl } from "@/lib/microservices/urls"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { patchElementSettings } from "@/lib/web4-items/element-settings-door"

// НАБОР ЗНАЧКОВ ЭЛЕМЕНТА (узел, шаг 844; 845 класс A1 — дверь была названа в `lib/site-settings/fields.ts`, но не построена, и на
// сайте оставался знак Fractera). Поле «Набор значков» вкладки «Настройки сайта» — не значение, а действие: человек даёт одну
// квадратную картинку, восемь файлов (favicon.ico, 16, 32, apple-touch, 192, 512, og, manifest) режет слой данных.
//   POST multipart `{ item, file }` — картинка уходит в хранилище (`/media/upload`), из неё набор (`/media/generate-icons`), набор
//        `{ id, files }` ложится в `iconSet` настроек элемента той же записью, что у пульта (`patchElementSettings`, отсечение по
//        объявлению элемента). Ответ — `{ ok, iconSet }`.
//   DELETE `?item=` — `iconSet: null`: элемент снова режет значки из своего логотипа (шаблон, шаг 413).
// 🔒 КЛЮЧ — УЗЛА (`X-Data-Secret`): набор принадлежит узлу (`owner 'node'`), и элемент читает его СВОИМ ключом — хранилище отказывает
// только набору чужого элемента (ответ хранилища 2026-11-23, media.mjs:523). Ключ узла в браузер не уходит.
// 🔒 Ворота architect/admin, как у пульта; на временном публичном адресе — отказ: панель там только для чтения.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }
const MAX_BYTES = 8 * 1024 * 1024
const DATA_SECRET = process.env.DATA_SECRET || process.env.DATA_API_KEY || ""

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE })
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

async function gate(req: NextRequest): Promise<NextResponse | null> {
  if (isTemporaryPublicAddress(req)) return json({ ok: false, reason: "temporary-address" }, 403)
  return requireRoles(req, ROLES)
}

/** Позвать слой данных ключом узла; ответ — тело или причина. */
async function data(path: string, init: RequestInit): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; reason: string }> {
  const base = dataUrl()
  if (!base || !DATA_SECRET) return { ok: false, reason: "no-data-layer" }
  try {
    const r = await fetch(`${base}${path}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
      headers: { ...(init.headers ?? {}), "X-Data-Secret": DATA_SECRET },
    })
    const body = (await r.json().catch(() => null)) as Record<string, unknown> | null
    if (!r.ok || !body || body.ok !== true) return { ok: false, reason: String(body?.error ?? `data-${r.status}`) }
    return { ok: true, body }
  } catch {
    return { ok: false, reason: "data-not-answering" }
  }
}

export async function POST(req: NextRequest) {
  const denied = await gate(req)
  if (denied) return denied
  let form: FormData
  try { form = await req.formData() } catch { return json({ ok: false, reason: "bad-body" }, 400) }
  const element = idOfAddress(String(form.get("item") ?? ""))
  if (!element) return json({ ok: false, reason: "unknown-element" }, 404)
  const file = form.get("file")
  if (!(file instanceof File) || !file.type.startsWith("image/")) return json({ ok: false, reason: "not-an-image" }, 400)
  if (file.size > MAX_BYTES) return json({ ok: false, reason: "too-large" }, 413)

  const upload = new FormData()
  upload.append("file", file, file.name || "icon-source.png")
  const up = await data("/media/upload", { method: "POST", body: upload })
  if (!up.ok) return json({ ok: false, reason: up.reason }, 502)
  const mediaId = isObj(up.body.item) ? up.body.item.id : null
  if (typeof mediaId !== "string" || !mediaId) return json({ ok: false, reason: "upload-no-id" }, 502)

  const made = await data("/media/generate-icons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ media_id: mediaId }),
  })
  if (!made.ok) return json({ ok: false, reason: made.reason }, 502)
  const { id, files } = made.body
  if (typeof id !== "string" || !isObj(files)) return json({ ok: false, reason: "generate-bad-answer" }, 502)
  const iconSet = { id, files: Object.fromEntries(Object.entries(files).filter(([, v]) => typeof v === "string")) as Record<string, string> }

  const saved = await patchElementSettings(element, "/api/settings/app", { iconSet })
  if (!saved.ok) return json({ ok: false, reason: saved.reason }, saved.status === 200 ? 409 : saved.status)
  // Отсечено целиком — элемент не объявляет `iconSet` (шаблон старше): набор сделан, но лечь ему некуда — сказать честно.
  if (saved.pruned) return json({ ok: false, reason: "not-declared" }, 409)
  return json({ ok: true, iconSet })
}

export async function DELETE(req: NextRequest) {
  const denied = await gate(req)
  if (denied) return denied
  const element = idOfAddress(req.nextUrl.searchParams.get("item") ?? "")
  if (!element) return json({ ok: false, reason: "unknown-element" }, 404)
  const saved = await patchElementSettings(element, "/api/settings/app", { iconSet: null })
  if (!saved.ok) return json({ ok: false, reason: saved.reason }, saved.status === 200 ? 409 : saved.status)
  return json({ ok: true, iconSet: null })
}
