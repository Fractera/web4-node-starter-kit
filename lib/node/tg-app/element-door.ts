// A NATIVE ELEMENT'S MINI APP — THE DOOR'S HALF (node step 853; the page — lib/node/tg-app/element-page.cjs). Called by the Pult's door
// `/api/node/tg-app?el=<id>`: the same public address the phone already reaches, so the proxy's lists stay as they are. The lock is THIS
// element's bot: the launch data signed with its token, the person among the chats it admitted, data not older than a day. Three actions:
// `state` — the element's name, site, agent and token use (`elementAppOf`, natives only); `chat` — the bot writes the person one line and
// the core's `came-from` hook tells the agent where they came from (`data/services/<id>/tg-context.json`, as a custom element's door does).
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import asksTg from "@/lib/node/person-asks-telegram.cjs"
import webapp from "@/lib/node/telegram-webapp.cjs"
import elementPage from "@/lib/node/tg-app/element-page.cjs"
import choice from "@/lib/node/tg-app/model-choice.cjs"
import { elementAppOf } from "@/lib/node/tg-app/state"

type Lang = "en" | "ru"
type Out = { ok: true; status?: never; [k: string]: unknown } | { ok: false; reason: string; status: number }
const DAY_S = 24 * 3600
const ID = /^[a-z0-9][a-z0-9-]{0,39}$/

export const elementIdOk = (id: string | null): id is string => typeof id === "string" && ID.test(id) && id !== "build"

/** The page for the element's bot button; a custom element or an unknown id gets null (its Mini App is its own `/tg`). */
export function elementHtml(id: string, lang: Lang): string | null {
  return elementAppOf(id, lang) ? elementPage.html(lang, id) : null
}

export async function elementAction(root: string, id: string, lang: Lang, body: { initData?: unknown; action?: unknown; model?: unknown; effort?: unknown } | null): Promise<Out> {
  const bot = asksTg.bot(root, id) as { token: string; chats: string[] } | null
  if (!bot) return { ok: false, reason: "no-bot", status: 409 }
  const signed = webapp.check(typeof body?.initData === "string" ? body.initData : "", bot.token, { allow: bot.chats, maxAgeS: DAY_S }) as { ok: boolean; user?: string; reason?: string }
  if (!signed.ok) {
    console.log(`[node/tg-app] ${id} refused — ${signed.reason}`)
    return { ok: false, reason: signed.reason ?? "refused", status: 401 }
  }
  const app = elementAppOf(id, lang)
  if (!app) return { ok: false, reason: "not-native", status: 404 }
  if (body?.action === "state") return { ok: true, app }
  if (body?.action === "chat") {
    try {
      mkdirSync(join(root, "data", "services", id), { recursive: true })
      const title = (elementPage.WORDS as Record<string, { title: string }>)[lang]?.title ?? "Mini App"
      writeFileSync(join(root, "data", "services", id, "tg-context.json"), JSON.stringify({ path: [title], href: null, at: new Date().toISOString() }) + "\n")
    } catch { /* the agent's hint is a courtesy */ }
    const line = (elementPage.CHAT_LINE as Record<string, string>)[lang] ?? elementPage.CHAT_LINE.en
    const r = await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, { // 639: остаётся — the person's mark of where they came from, like a custom element's
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: Number(signed.user), text: line }), signal: AbortSignal.timeout(10_000),
    }).then((x) => x.json() as Promise<{ ok?: boolean; description?: string }>).catch((e) => ({ ok: false, description: String(e) }))
    if (!r.ok) console.log(`[node/tg-app] ${id} chat line not sent — ${r.description ?? "?"}`)
    return { ok: true, line: r.ok === true }
  }
  // 861-5 (Roma 2026-11-27, Telegram 1475: «нету верхней карточки … на какой подписке … на какой модели с каким усилием»): the card switches
  // THIS element's agent — Opus with its effort, Sonnet or Haiku on medium (`model-choice.cjs`), the act `npm run session -- model` does;
  // Ultracode stays the bot's, behind its Telegram confirmation (as the custom element's own Mini App, 840-1). The bridge switches when
  // the current turn ends and the conversation goes on; asleep → 409 `no-session`, the page says how to wake it.
  if (body?.action === "model") {
    const picked = choice.modelChoice({ model: body.model, effort: body.effort })
    if (!picked.ok) return { ok: false, reason: picked.reason, status: 400 }
    const command = (globalThis as { __web4AgentSession?: (service: string, opts: Record<string, unknown>) => Record<string, unknown> & { ok: boolean } }).__web4AgentSession
    if (typeof command !== "function") return { ok: false, reason: "no-agent-kit", status: 503 }
    const out = command(id, { action: "model", model: picked.model, effort: picked.effort })
    console.log(`[node/tg-app] ${id} model ${picked.model} · ${picked.effort} from its Mini App → ${out.ok ? "scheduled" : out.reason}`)
    if (!out.ok) return { ok: false, reason: String(out.reason ?? "refused"), status: out.reason === "no-session" ? 409 : 400 }
    return { ok: true, model: picked.model, effort: picked.effort }
  }
  return { ok: false, reason: "unknown-action", status: 400 }
}
