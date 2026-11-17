// @api read where this node stands as the node detects it
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { readPlace } from "@/lib/node-state/place"
import { readLaunched } from "@/lib/hosting/launched.mjs"
import bases from "@/lib/auth/sign-in-bases.cjs"

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
  // 741-6, D36: the live servers this computer launched — domain and time only (the browser needs no IP).
  const launched = readLaunched(process.cwd()).map(({ domain, readyAt }) => ({ domain, readyAt }))
  // 776 (the owner, 2026-11-17: «PC-local | PC-web | VPS … кнопку перейти в web»): where the panel lives on the node's own domain,
  // read from the activation record; no main domain — `null`, and the band offers «Настройте домен» instead.
  // 777: the same bases give the browser its one «sign in as the architect» link (`lib/auth/sign-in-link.cjs`).
  const b = bases.signInBases(process.cwd())
  // 776: how this visitor came — over this computer's loopback (PC-local) or from the web (the own domain or the temporary address,
  // PC-web). The node sees it in the request; the browser's widgets do not decide it from the address bar (741-7, check:place-readers).
  const host = (req.headers.get("host") ?? "").replace(/:\d+$/, "").replace(/^\[|\]$/g, "")
  const via = host === "localhost" || host === "127.0.0.1" || host === "::1" ? "local" : "web"
  return NextResponse.json({ ok: true, place: readPlace(), launched, via, web: b.web, signIn: { web: b.web, webAuth: b.webAuth, localAuth: b.localAuth } }, noStore)
}

// 737-18: the place is detected (`lib/hosting/place.mjs`), never declared — a declaration is refused with the reason.
export async function POST() {
  return NextResponse.json({ ok: false, reason: "detected-not-declared", place: readPlace() }, { status: 410, ...noStore })
}
