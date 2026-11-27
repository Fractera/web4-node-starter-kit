// @api keep a wish for an element's quiz and wake the main agent
import { existsSync, readFileSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { elementDir } from "@/lib/web4-items/element-github"
import { checkWish, stampOf, wishAgentText } from "@/lib/web4-items/quiz-feedback.mjs"

// ПОЖЕЛАНИЕ К ПРОДУКТОВОМУ КВИЗУ (шаг 861-1; Рома 2026-11-27, Telegram 1467: «добавляю задание и не вижу его ожидания»). POST JSON
// { item, text } с роли архитектора или админа: слова ложатся в папку данных элемента `data/services/<id>/quiz-feedback/<UTC>/wish.md`
// (ядро в элемент не пишет), затем будится главный агент ядра (закон 636: агента элемента дверь не будит — задачу даёт главный агент).
// Ответ называет, где разговор продолжится: бот элемента (`chat`) или null — тогда его терминал. Отказ — 400: empty · too-long;
// неизвестный элемент — 404.
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }
type Wake = (service: string, opts: { text?: string; from?: string; about?: string; confirmed?: boolean }) => Promise<{ ok: boolean; reason?: string }>

/** The element's own Telegram bot, as the Pult reads it (`lib/node/tg-app/state.ts`); null — no bot yet. */
function chatOf(id: string): string | null {
  const file = join(process.cwd(), "data", "services", id, "channel", "telegram", "bot.json")
  try {
    const name = existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as { username?: unknown }).username : null
    return typeof name === "string" && /^[A-Za-z0-9_]{3,64}$/.test(name) ? `https://t.me/${name}` : null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { item?: unknown; text?: unknown } | null
  const id = idOfAddress(String(body?.item ?? ""))
  if (!id || !elementDir(id)) return NextResponse.json({ ok: false, error: "unknown-element" }, { status: 404, headers: NO_STORE })
  const wish = checkWish(body?.text)
  if (!wish.ok || !wish.value) return NextResponse.json({ ok: false, error: wish.error }, { status: 400, headers: NO_STORE })

  const rel = join("data", "services", id, "quiz-feedback", stampOf())
  await mkdir(join(process.cwd(), rel), { recursive: true })
  await writeFile(join(process.cwd(), rel, "wish.md"), wish.value + "\n", "utf8")
  const saved = join(rel, "wish.md")

  const wake = (globalThis as { __web4AgentWake?: Wake }).__web4AgentWake
  const woke = typeof wake === "function"
    ? await wake("build", { text: wishAgentText({ id, rel: saved, text: wish.value }), from: "quiz page", about: `a wish for the quiz of ${id}`, confirmed: true }).catch(() => ({ ok: false }))
    : { ok: false }
  return NextResponse.json({ ok: true, saved, woke: woke.ok, chat: chatOf(id) }, { headers: NO_STORE })
}
