// @api check a site's robots.txt and find its terms before analysis
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { siteRules, siteRulesText } from "@/lib/site-rules.mjs"

// ПРАВИЛА САЙТА ДЛЯ ЭЛЕМЕНТА (шаг 556-1). Квиз элемента прежде чем просить разбор чужого сайта спрашивает узел, разрешает ли сайт
// автоматический доступ (владелец 2026-10-22: запрещённый сайт — серия скриншотов от человека; похожие сайты, чьи правила разрешают, —
// разбор по одному). Логика одна — `lib/site-rules.mjs`, та же, что у команды главного агента `npm run site-rules`; ответ несёт и
// готовые строки (`text`), чтобы команда элемента печатала их как есть. Частные и свои адреса дверь не проверяет.
// Кто вправе: элемент узла с ключом узла (`X-Node-Key`) или архитектор/админ.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    const denied = await requireRoles(req, ["architect", "admin"])
    if (denied) return denied
  }
  const url = req.nextUrl.searchParams.get("url") ?? ""
  const result = await siteRules(url)
  return NextResponse.json({ ...result, text: siteRulesText(result) }, { status: result.ok ? 200 : 400, headers: HEADERS })
}
