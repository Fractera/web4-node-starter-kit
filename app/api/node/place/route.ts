// @api read where this node stands as the node detects it
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { readPlace } from "@/lib/node-state/place"

// ГДЕ СТОИТ УЗЕЛ — ОБЪЯВЛЕНИЕ ЧЕЛОВЕКА (276-3).
//
// 🔒 ЕДИНСТВЕННОЕ СВЕДЕНИЕ ИНДИКАТОРА, КОТОРОЕ НЕ ИЗМЕРЯЕТСЯ. «Домашний компьютер» и «выделенный
// сервер» неразличимы ни по сети, ни по машине, и прибор, который взялся бы это угадывать, однажды
// уверенно соврал бы. Поэтому узел спрашивает, а ответ помечает как слова человека.
//
// 🛑 ТЕ ЖЕ ЗАМКИ, ЧТО У ПРОЧИХ ДВЕРЕЙ УЗЛА: роль архитектора и отказ на временном адресе. Второе не
// перестраховка: ссылку быстрого туннеля пересылают, и менять состояние чужого узла по ней нельзя.
//
// 🔒 GET ОТВЕЧАЕТ И ТОГДА, КОГДА НИКТО НИЧЕГО НЕ ГОВОРИЛ, — `kind: "unknown"`. Отсутствие ответа и
// ответ «не знаю» — разные вещи, и дверь обязана уметь сказать второе.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

// 652-2 (2026-11-05): ✗ замок временного адреса стоял и на чтении — пульт там открыт на просмотр, а виджет получал 403 и красную
// строку в консоли на каждой странице. Читать можно, менять — нет: `write`.
async function guard(req: NextRequest, write: boolean) {
  if (write && isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  return requireRoles(req, ROLES)
}

export async function GET(req: NextRequest) {
  const denied = await guard(req, false)
  if (denied) return denied
  return NextResponse.json({ ok: true, place: readPlace() }, noStore)
}

// 737-18: the place is detected (`lib/hosting/place.mjs`), never declared — a declaration is refused with the reason.
export async function POST() {
  return NextResponse.json({ ok: false, reason: "detected-not-declared", place: readPlace() }, { status: 410, ...noStore })
}
