// @api start a draft's birth into an element and report its progress
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { getDraft } from "@/lib/web4-items/drafts"
import { checkRepoOwner } from "@/lib/web4-items/repo-owner.mjs"
import { BIRTH_APPS, birthState, isRepoUrl, markRevalidated, startBirth, wasRevalidated } from "@/lib/web4-items/birth"
import { getService } from "@/lib/microservices/registry"

// РОЖДЕНИЕ ЧЕРНОВИКА (319-3). POST — запустить `scripts/item-birth.mjs <id>` отдельным процессом (только кнопкой человека);
// GET — ход по журналу. Черновика нет — 404; элемент уже есть в реестре — 409 `born`; рождение уже идёт — 409 `running`
// (второй процесс не стартует). Когда GET впервые видит `done`, слой архитектора перерисовывается: меню и карточки
// читают реестр при рендере, а страницы кэшированы.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  const draft = getDraft(id)
  if (!draft) return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 })
  if (getService(id)) return NextResponse.json({ ok: false, reason: "born" }, { status: 409 })
  // 582: черновик нативного элемента рождается из нативного шаблона; вопрос и репозиторий у него не спрашиваются — он часть проекта.
  if (draft.native) {
    const n = startBirth(id, { native: true })
    if (!n.ok) return NextResponse.json({ ok: false, reason: n.reason }, { status: n.reason === "running" ? 409 : 500 })
    return NextResponse.json({ ok: true, state: "running" }, { status: 202 })
  }
  // 804-2 (367 before): what the element will be — the person's answer in the birth window (`app`; an older page sends `look`, the
  // same two values); a closed list, else 400 and nothing starts.
  const body = (await req.json().catch(() => null)) as { app?: unknown; look?: unknown; source?: unknown; repo?: unknown } | null
  const app = BIRTH_APPS.find((l) => l === (body?.app ?? body?.look))
  if (!app) return NextResponse.json({ ok: false, reason: "bad-app" }, { status: 400 })
  // 367-3: самостоятельный элемент рождается из стартера Fractera или из репозитория человека (https-адрес Git; проверка формы).
  const source = app === "own" && body?.source === "repo" ? "repo" : "starter"
  const repo = source === "repo" ? String(body?.repo ?? "").trim() : ""
  if (source === "repo" && !isRepoUrl(repo)) return NextResponse.json({ ok: false, reason: "bad-repo" }, { status: 400 })
  // 367-5: только ваш репозиторий — владелец совпадает с аккаунтом узла; отказ показывается в окне, ничего не клонируется.
  if (source === "repo") {
    const own = checkRepoOwner(repo)
    if (!own.ok) return NextResponse.json({ ok: false, reason: own.reason, message: own.message }, { status: 400 })
  }
  const r = startBirth(id, { app, repo: source === "repo" ? repo : null })
  if (!r.ok) return NextResponse.json({ ok: false, reason: r.reason }, { status: r.reason === "running" ? 409 : 500 })
  return NextResponse.json({ ok: true, state: "running" }, { status: 202 })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  if (!getDraft(id)) return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 })
  const s = birthState(id)
  if (s.state === "done" && !wasRevalidated(id)) {
    revalidatePath("/[lang]", "layout")
    markRevalidated(id)
  }
  return NextResponse.json({ ok: true, ...s }, { headers: { "Cache-Control": "no-store" } })
}
