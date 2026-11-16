// @api the node panel Telegram opens from the main bot's menu
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import asks from "@/lib/node/person-asks.cjs"
import asksTg from "@/lib/node/person-asks-telegram.cjs"
import webapp from "@/lib/node/telegram-webapp.cjs"
import page from "@/lib/node/tg-app/page.cjs"
import { tgState } from "@/lib/node/tg-app/state"
import { closeAsk, saveSecret, type Ask } from "@/lib/node/person-secret-save"
import { powerState, runElementPower } from "@/lib/web4-items/run-element-power"

// ПУЛЬТ УЗЛА В TELEGRAM (узел, шаг 771). Владелец, 2026-11-16: «раз уже я больше большую часть времени собираюсь проводить в Telegram»;
// 23:13 — «Хорошо продолжай работать до конца». Кнопка меню бота главного агента (771-3) открывает GET — страницу; страница зовёт POST
// с подписанными Telegram данными запуска (`initData`) при КАЖДОМ вызове: сессии нет, вход — сама подпись бота (771-1).
// 🔒 Дверь публичная (её открывает телефон по HTTPS-адресу узла), поэтому замок один и обязательный: подпись токеном бота главного
// агента, человек — из его разрешённых чатов (архитектор), данные не старше суток. Пароль сервера здесь не вводится никогда.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const DAY_S = 24 * 3600
const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" }
const langOf = (req: NextRequest): "en" | "ru" => (req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en")
const no = (reason: string, status: number) => NextResponse.json({ ok: false, reason }, { status, headers: HEADERS })

export async function GET(req: NextRequest) {
  return new NextResponse(page.html(langOf(req)), { headers: { ...HEADERS, "Content-Type": "text/html; charset=utf-8" } })
}

export async function POST(req: NextRequest) {
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return no("json-only", 415)
  const body = (await req.json().catch(() => null)) as { initData?: unknown; action?: unknown; id?: unknown; secret?: unknown; power?: unknown; reason?: unknown } | null
  const bot = asksTg.bot(ROOT, "build")
  if (!bot) return no("no-bot", 409)
  const signed = webapp.check(typeof body?.initData === "string" ? body.initData : "", bot.token, { allow: bot.chats, maxAgeS: DAY_S })
  if (!signed.ok) {
    console.log(`[node/tg-app] refused — ${signed.reason}`)
    return no(signed.reason ?? "refused", 401)
  }
  const lang = langOf(req)
  const action = typeof body?.action === "string" ? body.action : ""
  if (action === "state") return NextResponse.json({ ok: true, state: tgState(lang) }, { headers: HEADERS })

  const id = typeof body?.id === "string" ? body.id : ""
  if (action === "done" || action === "secret") {
    const ask = (asks.open(ROOT) as Ask[]).find((a) => a.id === id) ?? null
    if (!ask) return no("gone", 410)
    if (action === "done") {
      if (ask.secret) return no("secret-needs-a-value", 400)
      await closeAsk(id, { via: "telegram" })
      return NextResponse.json({ ok: true }, { headers: HEADERS })
    }
    if (ask.secret?.kind !== "env" && ask.secret?.kind !== "openai") return no("computer-only", 400)
    const r = await saveSecret(ask, body?.secret)
    if (!r.ok) return no(r.reason, r.status)
    await closeAsk(id, { saved: r.saved, via: "telegram" })
    return NextResponse.json({ ok: true, tail: r.saved.tail }, { headers: HEADERS })
  }

  if (action === "power") {
    const s = powerState(id, lang)
    if (!s) return no("unknown-element", 404)
    if (s.required) return no("required", 400)
    const want = body?.power === "off" ? "off" : body?.power === "on" ? "on" : null
    if (!want) return no("power-on-or-off", 400)
    const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 200) : ""
    if (want === "off" && !reason) return no("reason-1-200", 400)
    const { done, line } = await runElementPower(id, want, reason)
    console.log(`[node/tg-app] power ${id} ${want} from Telegram: ${line ?? "no line"}`)
    revalidatePath("/[lang]", "layout")
    return NextResponse.json({ ok: done, ...(done ? {} : { reason: line ?? "power-failed" }) }, { status: done ? 200 : 500, headers: HEADERS })
  }
  return no("unknown-action", 400)
}
