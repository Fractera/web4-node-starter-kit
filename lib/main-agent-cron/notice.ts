import { appendFileSync, mkdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { noticeWords, type NoticeKind } from "./notice.i18n"

// УВЕДОМЛЕНИЕ В ГЛАВНЫЙ ЧАТ — ДОГОВОРЁННЫЙ API ВСЕХ ЭЛЕМЕНТОВ (узел, шаг 636-8).
// 🎯 Владелец 2026-11-03: «события крон должны приходить не затрагивая искусственный интеллект независимо от происходящих процессов оно
// просто должно всплыть по расписанию и всё»; «верхняя часть должна сообщать о том какой агент отвечает этим событием»; выбор — «Дверь
// ядра «уведомление» (Рекомендую)» и «Цитата + значок + шапка (Рекомендую)».
// 🔒 Без модели: часы элемента в свою минуту зовут дверь `/api/node/notice` (часы ядра — эту функцию прямо), ядро шлёт сообщение ботом
// главного агента каждому, кого бот допустил (`access.json`). Это API, о котором агенты договорились один раз (закон «Only agents talk to
// agents», инструкция ядра, раздел 6): код зовёт его напрямую, ни один агент в эту минуту не участвует.
// Вид: шапка — значок рода и имя агента, чей это календарь; слова — цитатой (`<blockquote>`). Сообщение не удаляется — в отличие от
// размышлений 🧠. Цвет фона на сообщение Telegram не задаёт (Bot API, «Formatting options», прочитано 2026-11-03): род различают значок
// и шапка. Журнал — `data/node/notices.jsonl`, без самих слов (они в календаре элемента).

const MAX = 1500
const tgDir = (root: string) => join(root, "data", "services", "build", "channel", "telegram")
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** Язык человека главного чата — `person.json` бота главного агента (411), иначе язык узла. */
export function noticeLang(root: string): "ru" | "en" {
  try {
    const p = JSON.parse(readFileSync(join(tgDir(root), "person.json"), "utf8")) as { lang?: unknown }
    if (typeof p.lang === "string") return p.lang.startsWith("ru") ? "ru" : "en"
  } catch { /* нет файла */ }
  return (process.env.NEXT_PUBLIC_LANG ?? "").startsWith("ru") ? "ru" : "en"
}

export function noticeHtml(kind: NoticeKind, who: string, text: string, lang: string): string {
  const w = noticeWords(lang)
  return `${w.mark[kind]} <b>${esc(w.title[kind])} · ${esc(who)}</b>\n<blockquote>${esc(text.trim().slice(0, MAX))}</blockquote>`
}

function journal(root: string, rec: Record<string, unknown>) {
  try {
    mkdirSync(join(root, "data", "node"), { recursive: true })
    appendFileSync(join(root, "data", "node", "notices.jsonl"), JSON.stringify({ at: new Date().toISOString(), ...rec }) + "\n")
  } catch { /* журнал — не условие отправки */ }
}

/** Отправить уведомление в главный чат. `who` — имя агента на языке человека (дверь берёт его из дерева ядра). */
export async function sendNotice(root: string, n: { kind: NoticeKind; from: string; who: string; text: string }): Promise<{ ok: boolean; sent: number; detail: string }> {
  const text = n.text.trim()
  if (!text) return { ok: false, sent: 0, detail: "no text" }
  let token = ""
  let chats: string[] = []
  try { token = (readFileSync(join(tgDir(root), ".env"), "utf8").match(/^TELEGRAM_BOT_TOKEN=(.+)$/m)?.[1] ?? "").trim() } catch { /* бот не подключён */ }
  try { chats = ((JSON.parse(readFileSync(join(tgDir(root), "access.json"), "utf8")) as { allowFrom?: unknown[] }).allowFrom ?? []).map(String) } catch { /* никого */ }
  if (!token || !chats.length) {
    journal(root, { from: n.from, kind: n.kind, ok: false, detail: "no-main-bot" })
    return { ok: false, sent: 0, detail: "the main agent's Telegram bot is not connected" }
  }
  const html = noticeHtml(n.kind, n.who, text, noticeLang(root))
  let sent = 0
  let why = ""
  for (const chat of chats) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text: html, parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
        signal: AbortSignal.timeout(10_000),
      })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; description?: string } | null
      if (j?.ok) sent += 1
      else why = j?.description ?? `HTTP ${r.status}`
    } catch (e) {
      why = (e as Error).message
    }
  }
  journal(root, { from: n.from, kind: n.kind, ok: sent > 0, sent, ...(why ? { detail: why.slice(0, 200) } : {}) })
  return sent ? { ok: true, sent, detail: `sent to ${sent} chat(s)` } : { ok: false, sent, detail: `Telegram did not take it: ${why}` }
}
