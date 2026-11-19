// @api let an element bring a page of the person's browser forward
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

import { listServices } from "@/lib/microservices/registry"
import browser from "@/lib/node/browser.cjs"

// БРАУЗЕР ЧЕЛОВЕКА ИЗ TELEGRAM — ДВЕРЬ ЭЛЕМЕНТОВ (узел, шаг 767). Владелец 2026-11-16: «если пользуйтесь с ним разговаривать на предмет
// управления браузером то соотносится ли это с возможностями его элемента». Агент элемента делает работу своего поля в браузере сам
// (расширение Claude), а вывести вкладку человеку на экран умеет только macOS — эту часть ядро отдаёт всем элементам без модели:
// POST `{ from, focus: <адрес или хост> }` — вкладка выходит вперёд; `{ from, open: <https://…>, profile?: <имя профиля Chrome> }` —
// страница открывается перед глазами. С ключом узла (`X-Node-Key`), как `tell-core`.
// 🔒 Элементу не отдаётся список вкладок, ни заголовок, ни адрес: ответ — только «нашлась / открыта» или причина. Поиск — по адресу или
// хосту, не по словам: слова заголовков чужих вкладок — данные человека.
// 🔒 Браузер этого компьютера — архитектора: элемент на подписке своего человека (689) и самостоятельное приложение (804-3) —
// отказ с причиной (`elementMay`).
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const HEADERS = { "Cache-Control": "no-store" }

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

type Result = { ok: boolean; reason?: string; host?: string; profile?: string; front?: string }

export async function POST(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, reason: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  let body: { from?: unknown; focus?: unknown; open?: unknown; profile?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, reason: "invalid JSON" }, { status: 400, headers: HEADERS })
  }
  const from = typeof body.from === "string" ? body.from.trim() : ""
  const known = (listServices() as unknown as { id: string }[]).some((s) => s.id === from)
  if (from === "build" || !/^[a-z][a-z0-9-]{0,39}$/.test(from) || !known) {
    return NextResponse.json({ ok: false, reason: "from must be an element of this node" }, { status: 400, headers: HEADERS })
  }
  const denied = browser.elementMay(ROOT, from) as string | null
  if (denied) {
    console.log(`[node/browser] ${from} refused: ${denied}`)
    return NextResponse.json({ ok: false, reason: denied }, { status: 403, headers: HEADERS })
  }
  let out: Result
  if (typeof body.focus === "string") {
    const target = body.focus.trim()
    const address = browser.cleanUrl(target) as string | null
    const host = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(target) ? target : null
    if (!address && !host) return NextResponse.json({ ok: false, reason: "focus takes an address (https://…) or a host" }, { status: 400, headers: HEADERS })
    const r = (await browser.focus(address ?? host)) as Result & { tab?: unknown }
    out = r.ok ? { ok: true } : { ok: false, reason: r.reason }
  } else if (typeof body.open === "string") {
    const profile = typeof body.profile === "string" && body.profile.trim() ? body.profile.trim().slice(0, 80) : null
    const r = (await browser.open(body.open, { profile })) as Result
    out = r.ok ? { ok: true, host: r.host, ...(r.profile ? { profile: r.profile } : {}), ...(r.front ? { front: r.front } : {}) } : { ok: false, reason: r.reason }
  } else {
    return NextResponse.json({ ok: false, reason: "focus or open is required" }, { status: 400, headers: HEADERS })
  }
  console.log(`[node/browser] ${from} ${typeof body.focus === "string" ? "focus" : "open"} → ${out.ok ? "ok" : out.reason}`)
  return NextResponse.json(out, { status: out.ok ? 200 : out.reason === "not-found" ? 404 : 409, headers: HEADERS })
}
