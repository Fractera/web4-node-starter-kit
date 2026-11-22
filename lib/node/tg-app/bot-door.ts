// AN ELEMENT'S BOT FROM THE PULT — THE DOOR'S HALF (node step 839; the window — lib/node/tg-app/bot-setup.cjs). Called by the Pult's door
// (app/api/node/tg-app/route.ts) after Telegram's signature proved the architect. Everything a bot needs is the element's own «Telegram-бот»
// page logic (`_agent-kit/server/telegram.cjs` of the born-element copy): the name rule, the token from the token or BotFather's whole
// message, getMe, the activation link, the idle reader. Nothing is written twice; the token never leaves the node and is never answered.
// Custom elements only: a built-in element keeps its own «Telegram-бот» page (its reader is the installed copy's).
// The guide file: a short-lived link signed with the main bot's token (HMAC), so Telegram's downloader can fetch it without a session; it
// holds no secret — the names to type and where the answer goes.
import { createHmac, timingSafeEqual } from "node:crypto"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { activationLink, channelState, isService, saveToken, startIdlePoller } from "@/app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/telegram.cjs"
import * as slots from "@/app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/telegram-slots.cjs"
import { writePassportField } from "@/lib/web4-items/passport-file"
import { elementName } from "@/lib/web4-items/dashboard-rows"
import botSetup from "@/lib/node/tg-app/bot-setup.cjs"
import { metaForLang } from "@/config/app-config"

type Lang = "en" | "ru"
type Out = { ok: true; [k: string]: unknown } | { ok: false; reason: string; status: number }
const GUIDE_TTL_MS = 60 * 60 * 1000

function customElement(root: string, id: string): boolean {
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(id)) return false
  try {
    const reg = JSON.parse(readFileSync(join(root, "WEB4-ITEMS-REGISTRY", "web4-items.json"), "utf8")) as { services?: { id?: string; kind?: string }[] }
    return (reg.services ?? []).some((s) => s.id === id && s.kind === "user")
  } catch { return false }
}

function nodeName(lang: Lang): string | null {
  try { return metaForLang(lang).siteName.trim() || null } catch { return null } // the Pult's own title source (state.ts nodeOf)
}

const sign = (key: string, id: string, lang: Lang, exp: number) => createHmac("sha256", key).update(`bot-guide|${id}|${lang}|${exp}`).digest("hex")

function guideOf(root: string, id: string, lang: Lang): string {
  const s = channelState(id) as { suggestion?: { name?: string; username?: string } }
  return botSetup.guideText(lang, { element: elementName(id, lang), node: nodeName(lang), name: s.suggestion?.name ?? "", username: s.suggestion?.username ?? "" })
}

/** POST {action:'bot', id, do: 'state'|'token'|'activate'|'guide', token?} — `signKey` is the main bot's token (the guide link's HMAC). */
export async function botAction(root: string, id: string, what: unknown, token: unknown, lang: Lang, signKey: string): Promise<Out> {
  if (!customElement(root, id) || !isService(id)) return { ok: false, reason: "not-custom", status: 400 }
  if (what === "state") {
    const s = channelState(id) as { suggestion?: { name?: string; username?: string }; botUsername?: string | null; allowed?: number }
    return { ok: true, name: s.suggestion?.name ?? "", username: s.suggestion?.username ?? "", botUsername: s.botUsername ?? null, allowed: s.allowed ?? 0, guide: guideOf(root, id, lang) }
  }
  if (what === "token") {
    const saved = (await saveToken(id, typeof token === "string" ? token : "")) as { ok: boolean; error?: string; username?: string }
    if (!saved.ok) return { ok: false, reason: saved.error ?? "token-rejected", status: 400 }
    startIdlePoller(id) // the born copy's reader starts on the person's act — the same as the element's page (326); a second call is harmless
    if (slots.grouped(id)) {
      const bots = Object.fromEntries(Object.entries(slots.bots(id)).map(([slot, b]) => [slot, { username: b.username, name: b.name }]))
      await writePassportField(id, "telegramBots", bots).catch(() => false)
    }
    console.log(`[node/tg-app] bot of ${id} connected from the Pult: @${saved.username}`)
    return { ok: true, username: saved.username }
  }
  if (what === "activate") {
    const a = activationLink(id) as { ok: boolean; url?: string; error?: string }
    return a.ok ? { ok: true, url: a.url } : { ok: false, reason: a.error ?? "no-bot-username", status: 409 }
  }
  if (what === "guide") {
    const exp = Date.now() + GUIDE_TTL_MS
    const q = new URLSearchParams({ guide: id, lang, exp: String(exp), sig: sign(signKey, id, lang, exp) })
    return { ok: true, url: `/api/node/tg-app?${q}`, file: lang === "ru" ? `bot-${id}-instrukciya.txt` : `bot-${id}-guide.txt` }
  }
  return { ok: false, reason: "unknown-action", status: 400 }
}

/** GET ?guide=<id>&lang&exp&sig — the guide as a text file, while its signed link lives. */
export function guideFile(root: string, q: URLSearchParams, signKey: string): { ok: true; text: string; file: string } | { ok: false; status: number } {
  const id = q.get("guide") ?? ""
  const lang: Lang = q.get("lang") === "ru" ? "ru" : "en"
  const exp = Number(q.get("exp"))
  const sig = q.get("sig") ?? ""
  if (!Number.isFinite(exp) || exp < Date.now() || !/^[0-9a-f]{64}$/.test(sig)) return { ok: false, status: 410 }
  const want = Buffer.from(sign(signKey, id, lang, exp), "hex")
  if (!timingSafeEqual(want, Buffer.from(sig, "hex"))) return { ok: false, status: 403 }
  if (!customElement(root, id) || !isService(id)) return { ok: false, status: 404 }
  return { ok: true, text: `${guideOf(root, id, lang)}\n`, file: lang === "ru" ? `bot-${id}-instrukciya.txt` : `bot-${id}-guide.txt` }
}
