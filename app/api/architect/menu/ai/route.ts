// @api find the architect's element by meaning from spoken or typed words
import { execFile } from "node:child_process"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import { z } from "zod"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { openAiKey } from "@/lib/openai-key"
import { textModelId } from "@/lib/openai-text-model"
import { readOpenAiSdkError, logOpenAiError } from "@/lib/openai-error.cjs"
import { recordOk, recordRefusal } from "@/lib/usage-ledger.cjs"
import { readMenuMode } from "@/lib/node-menu-mode"
import { elementLabel } from "@/lib/web4-items/element-name"
import { addressOf } from "@/lib/web4-items/element-address"
import { menuStates, stateWord } from "@/lib/web4-items/menu-page"
import { web4DraftsUi } from "@/app/[lang]/(architectLayer)/_i18n/web4-drafts.i18n"
import { menuSearchWords } from "@/components/architect/menu-search.i18n"

// 722-4 (владелец 2026-11-11: «Кнопка искусственный интеллект выводит: Если модель OpenAI отсутствует переадресация на добавление ключа.
// Если ключ присутствует то интерфейс для голосового ввода … расскажите какой компонент вы ищете … После получения результата модель в
// этом окне показывает результаты какие совпадают может быть дают комментарии может быть оставляют просто кнопки»).
// GET — есть ли ключ OpenAI (он нужен голосу и выбору; состояние машины — спрашивает браузер, в сборку не запекается). POST `{ text, lang }`
// — элементы. Слово владельца 2026-11-11: «во всех случаях когда модель доступна и возвращает ответ вместо ошибки нужно использовать
// OpenAI в противном случае возвращайся к использованию вектора»:
//   1. своя команда главного агента `find --json --shortlist 30` (векторы узла, без ключа) — пороговые совпадения и 30 ближайших;
//   2. есть ключ — модель (`textModelId()`, AI SDK) выбирает из этих 30 до пяти и пишет к каждому строку на языке человека; ответ
//      проверяет ядро: id не из списка — выбрасывается (модель предлагает, ядро проверяет); ошибка, пустой ответ или нет ключа —
//   3. пороговые совпадения векторов с причиной (навык · область · имя · описание). Ответ говорит, кто подобрал (`by`).
// Цена названа: один вызов модели текста на поиск, около 2–4 тыс. входных токенов (30 коротких описаний); расшифровка голоса — отдельно.
// 🔒 Слова идут аргументом процесса, без оболочки; не длиннее 300 знаков; поиск не дольше 25 с, модель — 12 с с одним повтором.
const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }
type Hit = { id: string; score: number; kind: string; text: string; on: boolean }
type Short = { id: string; name: string; short: string; on: boolean; score?: number }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json({ ok: true, key: Boolean(openAiKey()) }, { headers: NO_STORE })
}

function findByMeaning(text: string): Promise<{ hits: Hit[] | null; shortlist: Short[] } | null> {
  return new Promise((resolve) => {
    execFile(process.execPath, [join(process.cwd(), "scripts", "main-agent-cli.mjs"), "find", "--json", "--shortlist", "30", text], { cwd: process.cwd(), timeout: 25_000, maxBuffer: 1 << 20 }, (err, out) => {
      if (err) return resolve(null)
      try { resolve(JSON.parse(String(out).trim().split("\n").pop() ?? "") as { hits: Hit[] | null; shortlist: Short[] }) } catch { resolve(null) }
    })
  })
}

/** Выбор моделью из короткого списка; null — модели нет или она не ответила как надо (тогда векторы). */
async function pickByModel(text: string, lang: string, list: Short[]): Promise<{ id: string; comment: string }[] | null> {
  const apiKey = openAiKey()
  if (!apiKey || list.length === 0) return null
  // 726-0/726-1: through the AI SDK too — a refusal is read by the node's one reader (`readOpenAiSdkError`: AI_RetryError →
  // AI_APICallError), and every call writes one line of the ledger (`npm run money`) — no prompt, no key.
  const call = { who: "menu/ai", endpoint: "chat/completions", model: textModelId(), started: Date.now() }
  try {
    const { output, totalUsage } = await generateText({
      model: createOpenAI({ apiKey })(textModelId()),
      output: Output.object({ schema: z.object({ matches: z.array(z.object({ id: z.string(), comment: z.string() })).max(5) }) }),
      system: "You help a person find a component (an element) of their node. Choose from the given list only the elements that fit the request, best first, at most five; for each write one short comment in the person's language (" + lang + ") — what it does for this request. Use only ids from the list. None fits — return an empty list.",
      prompt: `Request: ${text}\n\nElements:\n${list.map((e) => `- id: ${e.id} · name: ${e.name} · ${e.short || "no description"}${e.on ? "" : " · turned off"}`).join("\n")}`,
      // 722-7: один повтор, не больше 12 с. ✗ Замерено на узле владельца 2026-11-11: OpenAI ответил 429 (предел запросов), AI SDK по
      // умолчанию повторял с паузами, и поиск ждал 20,9 с, прежде чем отдать векторы.
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(12_000),
    })
    recordOk({ ...call, usage: totalUsage })
    const known = new Set(list.map((e) => e.id))
    return output.matches.filter((m) => known.has(m.id)).map((m) => ({ id: m.id, comment: m.comment.replace(/\s+/g, " ").trim().slice(0, 200) }))
  } catch (e) {
    const info = readOpenAiSdkError(e)
    logOpenAiError("menu/ai", info)
    recordRefusal({ ...call, info })
    return null
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { text?: unknown; lang?: unknown } | null
  const text = typeof body?.text === "string" ? body.text.replace(/\s+/g, " ").trim().slice(0, 300) : ""
  const lang = typeof body?.lang === "string" && /^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(body.lang) ? body.lang : "en"
  if (!text) return NextResponse.json({ ok: false, reason: "empty" }, { status: 400, headers: NO_STORE })
  const found = await findByMeaning(text)
  const picked = await pickByModel(text, lang, found?.shortlist ?? [])
  const hits = found?.hits ?? null
  if (picked === null && hits === null) return NextResponse.json({ ok: false, reason: "no-vectors" }, { status: 503, headers: NO_STORE })
  const ui = web4DraftsUi(lang)
  const sw = menuSearchWords(lang)
  const states = menuStates()
  const compact = readMenuMode() === "compact"
  const why = (k: string) => (k === "skill" ? sw.whySkill : k === "area" ? sw.whyArea : k === "name" ? sw.whyName : sw.whyDescription)
  const onOf = (id: string) => found?.shortlist.find((e) => e.id === id)?.on ?? hits?.find((h) => h.id === id)?.on ?? true
  const row = (id: string, whyText: string, said: string) => {
    const kind = states.get(id) ?? (onOf(id) ? "running" : "off")
    return {
      id,
      label: elementLabel(id, lang),
      href: `/${lang}/architect/${addressOf(id)}${compact && states.has(id) ? "/preview" : ""}`,
      state: { kind, label: stateWord(kind, ui) },
      why: whyText,
      said,
    }
  }
  const rows = picked !== null ? picked.map((m) => row(m.id, m.comment, "")) : (hits ?? []).map((h) => row(h.id, why(h.kind), h.text))
  return NextResponse.json({ ok: true, by: picked !== null ? "model" : "vectors", rows }, { headers: NO_STORE })
}
