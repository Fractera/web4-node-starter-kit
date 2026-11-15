// @api delete a microservice draft after its name is typed back
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { deleteDraft, getDraft } from "@/lib/web4-items/drafts"
import { elementDisplayName } from "@/lib/web4-items/element-name"
import { sameName } from "@/lib/web4-items/name-match.mjs"
import { getService } from "@/lib/microservices/registry"

// УДАЛЕНИЕ ЧЕРНОВИКА (314-1). Тело `{ confirm }` обязано назвать черновик — его название для людей (749-1: имя ядра, данное при
// создании; у старого черновика без имени — его адрес), сверенное тем же `sameName`, что и в окне, но здесь проверка не обходится
// запросом мимо окна. Не совпало — 409, ничего не удалено.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  if (!getDraft(id)) return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 })
  // 319-3: РОДИВШИЙСЯ ЭЛЕМЕНТ ЧЕРНОВИКОМ НЕ УДАЛЯЕТСЯ. Снять запись черновика значило бы оставить работающий элемент (pm2,
  // порт, реестр, папка) без страницы в ядре. Удаление элемента целиком — отдельный шаг.
  if (getService(id)) return NextResponse.json({ ok: false, reason: "born" }, { status: 409 })
  const body = (await req.json().catch(() => null)) as { confirm?: unknown } | null
  if (!sameName(body?.confirm, elementDisplayName(id))) {
    return NextResponse.json({ ok: false, reason: "confirm-mismatch" }, { status: 409 })
  }
  if (!deleteDraft(id)) return NextResponse.json({ ok: false, reason: "write-failed" }, { status: 500 })
  revalidatePath("/[lang]", "layout")
  return NextResponse.json({ ok: true, id })
}
