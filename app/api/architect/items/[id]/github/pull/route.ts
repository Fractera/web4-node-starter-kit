// @api compare an element with its GitHub repository and take new commits
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { checkElementRemote, pullElement } from "@/lib/web4-items/element-github"

// ЗАБРАТЬ КОММИТЫ ИЗ GITHUB КНОПКОЙ (842). Слово владельца 2026-11-23 (Telegram 1154): «такой же баннер который существует на главной
// странице которая анализирует наличие доступных версий». GET — где элемент относительно своего репозитория по последнему вопросу;
// `?check=1` — сначала спросить GitHub (только по кнопке человека). POST — перемотка вперёд, от имени элемента за стеной сервера.
// Вывод git наружу не отдаётся — только машинное слово причины.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  const ask = req.nextUrl.searchParams.get("check") === "1"
  if (ask && isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403, ...noStore })
  const s = checkElementRemote(id, ask)
  return NextResponse.json(s, { status: s.ok ? 200 : s.error === "not-born" ? 404 : 200, ...noStore })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  const r = pullElement(id)
  return NextResponse.json(r, { status: r.ok ? 200 : r.error === "not-born" ? 404 : 409, ...noStore })
}
