// @api create a new microservice draft with its own architect page group
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { createDraft, listDrafts } from "@/lib/web4-items/drafts"
import nameFile from "@/lib/web4-items/name-file.cjs"

// ЧЕРНОВИКИ ЭЛЕМЕНТОВ (314-1). POST — создать: имя из пяти знаков (буква + base36, сверено с занятыми), запись в `data/web4-drafts.json`, после записи слой
// архитектора перерисовывается по первому запросу — группа страниц появляется без пересборки. GET — список.
// Только архитектор и админ: черновик меняет меню слоя, закрытого воротами.
// 749-2 (владелец 2026-11-15: «вместо того чтобы показать его название ты показываешь его идентификатор»): ПЕРВЫМ — НАЗВАНИЕ. Тело
// `{ name, native? }`; название чистится правилом `name-file.cjs` (пробелы, до 60 знаков) и пишется туда же, где все имена элементов —
// меню, заголовок и окна с первой секунды зовут черновик им, а не случайным адресом. Пустое — 400 `name-required`, черновика нет.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json({ ok: true, drafts: listDrafts() })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  // 582: `{ native: true }` — черновик нативного элемента (кнопка в зоне нативных); без флага — кастомный, как прежде.
  const body = (await req.json().catch(() => null)) as { native?: unknown; name?: unknown } | null
  const name = nameFile.cleanName(body?.name)
  if (!name) return NextResponse.json({ ok: false, reason: "name-required" }, { status: 400 })
  const draft = createDraft(body?.native === true, name)
  if (!draft) return NextResponse.json({ ok: false, reason: "write-failed" }, { status: 500 })
  revalidatePath("/[lang]", "layout")
  return NextResponse.json({ ok: true, id: draft.id, createdAt: draft.createdAt, native: draft.native === true })
}
