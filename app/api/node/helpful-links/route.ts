// @api give the node's checked helpful links that fit a need
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { findLinks, present } from "@/lib/helpful-links.cjs"

// ПОЛЕЗНЫЕ ССЫЛКИ УЗЛА (шаг 726-6): GET ?q=<нужда человека>&lang=<язык> — проверенные ссылки, подходящие к нужде, из ОДНОГО файла
// ядра `lib/helpful-links.json`. Элемент спрашивает своей командой `npm run recommend` с ключом узла (`X-Node-Key`); архитектор — из
// панели. Без модели и без сети: обновление списка живёт в одном месте, и узел приносит его всем элементам. Партнёрская ссылка
// приходит со строкой раскрытия (FTC 16 CFR 255.5) — агент пересказывает её рядом со ссылкой, никогда не прячет.

export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

type Link = Parameters<typeof present>[0]

export async function GET(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    const denied = await requireRoles(req, ["architect"])
    if (denied) return denied
  }
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 300)
  const lang = (req.nextUrl.searchParams.get("lang") ?? "en").slice(0, 8)
  const links = (findLinks(q) as Link[]).map((l) => present(l, lang))
  return NextResponse.json({ ok: true, query: q, links }, { headers: HEADERS })
}
