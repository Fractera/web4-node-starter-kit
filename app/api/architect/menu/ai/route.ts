// @api find the architect's element by meaning from spoken or typed words
import { execFile } from "node:child_process"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { openAiKey } from "@/lib/openai-key"
import { readMenuMode } from "@/lib/node-menu-mode"
import { elementLabel } from "@/lib/web4-items/element-name"
import { addressOf } from "@/lib/web4-items/element-address"
import { menuStates, stateWord } from "@/lib/web4-items/menu-page"
import { web4DraftsUi } from "@/app/[lang]/(architectLayer)/_i18n/web4-drafts.i18n"
import { menuSearchWords } from "@/components/architect/menu-search.i18n"

// 722-4 (владелец 2026-11-11: «Кнопка искусственный интеллект выводит: Если модель OpenAI отсутствует переадресация на добавление ключа.
// Если ключ присутствует то интерфейс для голосового ввода … расскажите какой компонент вы ищете … После получения результата модель в
// этом окне показывает результаты какие совпадают может быть дают комментарии может быть оставляют просто кнопки»).
// GET — есть ли ключ OpenAI (он нужен голосу; состояние машины — спрашивает браузер, в сборку не запекается). POST `{ text, lang }` —
// элементы по смыслу: та же команда, что `npm run find` главного агента (`find --json`, свои векторы узла — элемент embeddings, без ключа),
// отдельным процессом: поиск и его порог — один код. Ответ — кнопки: имя, страница, состояние и почему он подошёл.
// 🔒 Слова идут аргументом процесса, без оболочки; не длиннее 300 знаков; не больше 25 с.
const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }
type Hit = { id: string; score: number; kind: string; text: string; on: boolean }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json({ ok: true, key: Boolean(openAiKey()) }, { headers: NO_STORE })
}

function findByMeaning(text: string): Promise<Hit[] | null> {
  return new Promise((resolve) => {
    execFile(process.execPath, [join(process.cwd(), "scripts", "main-agent-cli.mjs"), "find", "--json", text], { cwd: process.cwd(), timeout: 25_000, maxBuffer: 1 << 20 }, (err, out) => {
      if (err) return resolve(null)
      try { resolve((JSON.parse(String(out).trim().split("\n").pop() ?? "") as { hits: Hit[] | null }).hits) } catch { resolve(null) }
    })
  })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { text?: unknown; lang?: unknown } | null
  const text = typeof body?.text === "string" ? body.text.replace(/\s+/g, " ").trim().slice(0, 300) : ""
  const lang = typeof body?.lang === "string" && /^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(body.lang) ? body.lang : "en"
  if (!text) return NextResponse.json({ ok: false, reason: "empty" }, { status: 400, headers: NO_STORE })
  const hits = await findByMeaning(text)
  if (hits === null) return NextResponse.json({ ok: false, reason: "no-vectors" }, { status: 503, headers: NO_STORE })
  const ui = web4DraftsUi(lang)
  const sw = menuSearchWords(lang)
  const states = menuStates()
  const compact = readMenuMode() === "compact"
  const why = (k: string) => (k === "skill" ? sw.whySkill : k === "area" ? sw.whyArea : k === "name" ? sw.whyName : sw.whyDescription)
  const rows = hits.map((h) => {
    const kind = states.get(h.id) ?? (h.on ? "running" : "off")
    const custom = states.has(h.id)
    return {
      id: h.id,
      label: elementLabel(h.id, lang),
      href: `/${lang}/architect/${addressOf(h.id)}${compact && custom ? "/preview" : ""}`,
      state: { kind, label: stateWord(kind, ui) },
      why: why(h.kind),
      said: h.text,
      score: h.score,
    }
  })
  return NextResponse.json({ ok: true, rows }, { headers: NO_STORE })
}
