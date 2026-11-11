"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import VoiceInput from "@/_tools/voice-input/client/voice-input.client"
import { StateDot, type MenuStateKind } from "@/components/workspace/menu-state-dot"
import type { MenuSearchWords } from "@/components/architect/menu-search.i18n"

// КНОПКА «ИИ» ПОИСКА МЕНЮ (722-4). Слово владельца 2026-11-11: «Если модель OpenAI отсутствует переадресация на добавление ключа. Если
// ключ присутствует то интерфейс для голосового ввода с комментарием расскажите какой компонент вы ищете … После получения результата
// модель в этом окне показывает результаты какие совпадают может быть дают комментарии может быть оставляют просто кнопки».
// Нажатие спрашивает узел, есть ли ключ (GET `/api/architect/menu/ai`): нет — переход на страницу ключа OpenAI; есть — одно окно проекта
// (`AppDialog`) с полем, голосовым вводом ядра (`_tools/voice-input`, расшифровка ключом узла) и кнопками найденных элементов: имя,
// состояние, почему подошёл. Подбирает модель OpenAI, когда она отвечает; не ответила — векторы узла (закон двери, строка «кто подобрал»).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Row = { id: string; label: string; href: string; state: { kind: MenuStateKind; label: string }; why: string; said: string }

export function MenuAi({ lang, words, dialogUi }: { lang: string; words: MenuSearchWords; dialogUi: AppDialogUi }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [rows, setRows] = useState<Row[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [by, setBy] = useState<"model" | "vectors" | null>(null)
  const field = useRef<HTMLTextAreaElement>(null)

  async function start() {
    const r = await fetch(`${BASE}/api/architect/menu/ai`, { cache: "no-store" }).then((x) => x.json()).catch(() => null) as { ok?: boolean; key?: boolean } | null
    if (r?.ok && !r.key) { window.location.href = `${BASE}/${lang}/architect/build/environment#OPENAI_API_KEY`; return }
    setOpen(true)
  }

  async function search() {
    const t = text.trim()
    if (!t || busy) return
    setBusy(true)
    setNote(null)
    try {
      const r = await fetch(`${BASE}/api/architect/menu/ai`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t, lang }) })
      const j = (await r.json()) as { ok?: boolean; rows?: Row[]; reason?: string; by?: "model" | "vectors" }
      if (!r.ok || !j.ok || !Array.isArray(j.rows)) { setRows(null); setNote(j?.reason === "no-vectors" ? words.aiNoVectors : words.failed); return }
      setRows(j.rows)
      setBy(j.by ?? null)
      if (!j.rows.length) setNote(words.aiNone)
    } catch {
      setNote(words.failed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => void start()} data-menu-ai>{words.ai}</Button>
      <AppDialog open={open} onOpenChange={setOpen} title={words.aiTitle} description={words.aiLead} ui={dialogUi} size="md">
        <form data-block="menu-ai" className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); void search() }}>
          <div className="flex items-start gap-2">
            <Textarea ref={field} value={text} onChange={(e) => setText(e.target.value)} placeholder={words.aiPlaceholder} rows={3} className="min-w-0 flex-1" />
            <VoiceInput targetRef={field} value={text} onChange={setText} lang={lang} disabled={busy} />
          </div>
          <Button type="submit" disabled={busy || !text.trim()} className="self-end">{words.aiFind}</Button>
        </form>
        {note && <p className="mt-3 text-sm text-muted-foreground" role="status">{note}</p>}
        {rows && by && <p className="mt-3 text-xs text-muted-foreground" data-menu-ai-by={by}>{by === "model" ? words.byModel : words.byVectors}</p>}
        {rows && rows.length > 0 && (
          <ul data-block="menu-ai-result" className="mt-3 flex flex-col gap-2">
            {rows.map((r) => (
              <li key={r.id}>
                <a href={r.href} className="flex flex-col gap-0.5 rounded-lg border border-border px-3 py-2 hover:bg-muted/60">
                  <span className="flex items-center gap-2 font-medium text-foreground"><StateDot state={r.state} />{r.label}</span>
                  <span className="text-xs text-muted-foreground">{r.why}{r.said ? ` — «${r.said}»` : ""}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </AppDialog>
    </>
  )
}
