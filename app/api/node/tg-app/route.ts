// @api the node panel Telegram opens from the main bot's menu
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import asks from "@/lib/node/person-asks.cjs"
import asksTg from "@/lib/node/person-asks-telegram.cjs"
import webapp from "@/lib/node/telegram-webapp.cjs"
import page from "@/lib/node/tg-app/page.cjs"
import choice from "@/lib/node/tg-app/model-choice.cjs"
import nodeLine from "@/lib/agent-kit/node-line.cjs"
import { tgState } from "@/lib/node/tg-app/state"
import { closeAsk, saveSecret, type Ask } from "@/lib/node/person-secret-save"
import { powerState, runElementPower } from "@/lib/web4-items/run-element-power"
import autostartLib from "@/lib/node/autostart.cjs"
import { botAction, guideFile } from "@/lib/node/tg-app/bot-door"

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
  // 839: the bot guide a person forwards — a text file behind a signed link that lives an hour (lib/node/tg-app/bot-door.ts)
  if (req.nextUrl.searchParams.has("guide")) {
    const bot = asksTg.bot(ROOT, "build")
    if (!bot) return no("no-bot", 409)
    const g = guideFile(ROOT, req.nextUrl.searchParams, bot.token)
    if (!g.ok) return new NextResponse(null, { status: g.status, headers: HEADERS })
    return new NextResponse(g.text, { headers: { ...HEADERS, "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="${g.file}"` } })
  }
  return new NextResponse(page.html(langOf(req)), { headers: { ...HEADERS, "Content-Type": "text/html; charset=utf-8" } })
}

export async function POST(req: NextRequest) {
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return no("json-only", 415)
  const body = (await req.json().catch(() => null)) as { initData?: unknown; action?: unknown; id?: unknown; secret?: unknown; admin?: unknown; skip?: unknown; power?: unknown; reason?: unknown; model?: unknown; effort?: unknown; ultracode?: unknown; confirmed?: unknown; text?: unknown } | null
  const bot = asksTg.bot(ROOT, "build")
  if (!bot) return no("no-bot", 409)
  const signed = webapp.check(typeof body?.initData === "string" ? body.initData : "", bot.token, { allow: bot.chats, maxAgeS: DAY_S })
  if (!signed.ok) {
    console.log(`[node/tg-app] refused — ${signed.reason}`)
    return no(signed.reason ?? "refused", 401)
  }
  const lang = langOf(req)
  const action = typeof body?.action === "string" ? body.action : ""
  if (action === "state") return NextResponse.json({ ok: true, state: await tgState(lang) }, { headers: HEADERS })

  const id = typeof body?.id === "string" ? body.id : ""
  if (action === "done" || action === "secret") {
    const ask = (asks.open(ROOT) as Ask[]).find((a) => a.id === id) ?? null
    if (!ask) return no("gone", 410)
    if (action === "done") {
      if (ask.secret) return no("secret-needs-a-value", 400)
      const closed = await closeAsk(id, { via: "telegram" })
      if (closed?.notYet) return no(closed.notYet, 409)
      return NextResponse.json({ ok: true }, { headers: HEADERS })
    }
    if (!ask.secret?.kind || !asks.TELEGRAM_FORM.has(ask.secret.kind)) return no("computer-only", 400)
    // 778-3: a newborn element's admin — `admin: { email, password? }` or `skip: true` (the Pult is the architect's own: his bot's signature)
    const admin = ask.secret?.kind === "element-admin"
    const r = await saveSecret(ask, admin ? body?.admin : body?.secret, { skip: admin && body?.skip === true })
    if (!r.ok) return no(r.reason, r.status)
    await closeAsk(id, { saved: r.saved, via: "telegram" })
    return NextResponse.json({ ok: true, tail: r.saved.tail, ...(r.saved.admin ? { admin: r.saved.admin } : {}) }, { headers: HEADERS })
  }

  // 779-2 (the owner, 2026-11-17, Telegram 462): the main agent's model and effort from the Pult's card. Opus takes the chosen effort,
  // Sonnet and Haiku run on medium (as the bot gives them, 666); Ultracode only with the person's «Включить» in its warning
  // (`confirmed: true`) — the Telegram confirmation CLAUDE.md §6 asks before subagents; always Opus · max. The bridge switches when the
  // current turn ends and the same conversation goes on; nobody is woken by a line — the person writes next.
  if (action === "model") {
    const picked = choice.modelChoice(body)
    if (!picked.ok) return no(picked.reason, 400)
    const { model, effort, ultracode } = picked
    const command = (globalThis as { __web4AgentSession?: (service: string, opts: Record<string, unknown>) => Record<string, unknown> & { ok: boolean } }).__web4AgentSession
    if (typeof command !== "function") return no("no-agent-kit", 503)
    const out = command("build", { action: "model", model, effort, ...(ultracode ? { ultracode: true } : {}) })
    console.log(`[node/tg-app] model ${model} · ${effort}${ultracode ? " · ultracode (confirmed)" : ""} from Telegram → ${out.ok ? `scheduled${out.joined ? ", joined" : ""}` : out.reason}`)
    if (!out.ok) return no(String(out.reason ?? "refused"), out.reason === "no-session" ? 409 : 400)
    return NextResponse.json({ ok: true, model, effort, ultracode }, { headers: HEADERS })
  }

  // 780 (the owner, 2026-11-17, Telegram 538 → «Да» 540 to variant A): «+ Новый элемент» — the person's words about a new element go to
  // the main agent as their request (the node's head `pult-request`); the agent shapes it and answers in Telegram, the Pult creates nothing.
  if (action === "newElement") {
    const words = typeof body?.text === "string" ? body.text.replace(/\s+/g, " ").trim() : ""
    if (words.length < 3 || words.length > 1000) return no("text-3-1000", 400)
    const wake = (globalThis as { __web4AgentWake?: (service: string, opts: Record<string, unknown>) => Promise<Record<string, unknown> & { ok: boolean }> }).__web4AgentWake
    if (typeof wake !== "function") return no("no-agent-kit", 503)
    const line = `${nodeLine.head("pult-request", "build")}The person wrote in the Pult's «+ Новый элемент»: «${words}». It is their request for a new element: follow the order of a request (skills_find, shape-the-need, npm run find), answer them in Telegram with the variants and your pick; create nothing before their yes.`
    const out = await wake("build", { text: line, confirmed: true })
    console.log(`[node/tg-app] new element asked from Telegram (${words.length} chars) → ${out.ok ? (out.already ? "into the running session" : "the main agent started") : out.reason}`)
    if (!out.ok) return no(String(out.reason ?? "refused"), out.reason === "memory" ? 503 : 400)
    return NextResponse.json({ ok: true }, { headers: HEADERS })
  }

  // 781-4 (the owner, 2026-11-18: «в пульте телеграмма … сейчас бот спит. Разбудить бота нужно это сделать?»): the main agent's card —
  // «Разбудить» (asleep, or closed after the channel failed twice) and «Переподключить сейчас» (a live session whose Telegram does not hear).
  // The bridge's `channelAction` through the same global as the panel's red band; the Pult's lock — the bot token's signature above.
  // 781-5: «Включить автозапуск» from the Pult — the core writes the node's LaunchAgent (no sudo); the request it answers is closed after.
  if (action === "autostart") {
    const out = autostartLib.enable(ROOT)
    console.log(`[node/tg-app] autostart from Telegram → ${out.ok ? `on (${out.file})` : out.reason}`)
    return NextResponse.json(out, { status: out.ok ? 200 : 409, headers: HEADERS })
  }
  if (action === "channel") {
    const want = (body as { do?: unknown } | null)?.do
    const what = want === "wake" || want === "reconnect" ? want : null
    if (!what) return no("do-wake-or-reconnect", 400)
    const run = (globalThis as { __web4AgentChannel?: (service: string, action: string) => Promise<{ ok: boolean; did?: string; reason?: string }> }).__web4AgentChannel
    if (typeof run !== "function") return no("no-agent-kit", 503)
    const out = await run("build", what)
    console.log(`[node/tg-app] channel ${what} from Telegram → ${out.ok ? out.did : out.reason}`)
    return NextResponse.json(out, { status: out.ok ? 200 : 500, headers: HEADERS })
  }
  // 839 (the owner, 2026-11-22, Telegram 901): an element without a bot gets one from the Pult — state, token, activation, the guide
  if (action === "bot") {
    const b = body as { do?: unknown; token?: unknown } | null
    const out = await botAction(ROOT, id, b?.do, b?.token, lang, bot.token)
    if (!out.ok) return no(out.reason, out.status)
    return NextResponse.json(out, { headers: HEADERS })
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
