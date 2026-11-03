// @api a scheduled notice of an element into the main chat
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

import { listServices } from "@/lib/microservices/registry"
import { elementName } from "@/lib/web4-items/dashboard-rows"
import { noticeLang, sendNotice } from "@/lib/main-agent-cron/notice"
import { NOTICE_KINDS, type NoticeKind } from "@/lib/main-agent-cron/notice.i18n"

// УВЕДОМЛЕНИЕ ЭЛЕМЕНТА В ГЛАВНЫЙ ЧАТ (узел, шаг 636-8; владелец 2026-11-03 — «Дверь ядра «уведомление» (Рекомендую)»). POST
// `{ from, kind?, text }` с ключом узла: часы элемента в свою минуту — без модели; ядро шлёт ботом главного агента «⏰ Напоминание ·
// <имя агента>» и слова цитатой (`lib/main-agent-cron/notice.ts`). `from` — id элемента реестра (или `build`): шапка называет его.
// Договорённый API всех элементов — закон «Only agents talk to agents» (инструкция ядра, раздел 6).
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, reason: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  let body: { from?: unknown; kind?: unknown; text?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, reason: "invalid JSON" }, { status: 400, headers: HEADERS })
  }
  const from = typeof body.from === "string" ? body.from.trim() : ""
  const known = from === "build" || (listServices() as unknown as { id: string }[]).some((s) => s.id === from)
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(from) || !known) {
    return NextResponse.json({ ok: false, reason: "from must be an element of this node" }, { status: 400, headers: HEADERS })
  }
  const kind = (typeof body.kind === "string" ? body.kind : "reminder") as NoticeKind
  if (!NOTICE_KINDS.includes(kind)) return NextResponse.json({ ok: false, reason: `kind is one of: ${NOTICE_KINDS.join(", ")}` }, { status: 400, headers: HEADERS })
  const text = typeof body.text === "string" ? body.text.trim() : ""
  if (!text || text.length > 1500) return NextResponse.json({ ok: false, reason: "text is 1–1500 characters" }, { status: 400, headers: HEADERS })
  const root = process.cwd()
  const out = await sendNotice(root, { kind, from, who: elementName(from, noticeLang(root)), text })
  console.log(`[node/notice] ${from} ${kind} → ${out.ok ? out.detail : `failed: ${out.detail}`}`)
  return NextResponse.json(out, { status: out.ok ? 200 : 502, headers: HEADERS })
}
