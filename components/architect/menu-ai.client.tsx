"use client"

import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { VoiceControl } from "@/components/form/voice-control.client"
import { ElementRow } from "@/components/architect/element-row"
import type { MenuStateKind } from "@/components/workspace/menu-state-dot"
import type { MenuSearchWords } from "@/components/architect/menu-search.i18n"

// КНОПКА «ИИ» ПОИСКА МЕНЮ (722-4; окно пересобрано из готовых частей в 722-8). Слово владельца 2026-11-11: «Если модель OpenAI
// отсутствует переадресация на добавление ключа. Если ключ присутствует то интерфейс для голосового ввода с комментарием расскажите
// какой компонент вы ищете … модель в этом окне показывает результаты какие совпадают может быть дают комментарии может быть оставляют
// просто кнопки». Нажатие спрашивает узел, есть ли ключ: нет — страница ключа OpenAI; есть — одно окно проекта (`AppDialog`).
// ✗ 722-4 собрало тело окна руками (`Textarea` и голая кнопка микрофона в одну строку) — на узле владельца поле сжалось до одной буквы;
// владелец: «ты по какой-то причине полез создавать новый и создал говно». Теперь только готовые части: область с голосом —
// `VoiceControl variant="textarea"` (как в «Реверс-инжиниринге»: микрофон под областью во всю ширину, подсказка про ключ), состояния —
// `Spinner` и `EmptyState`, строки — `ElementRow`. Фокус окна — область запроса; под ней одна строка: что происходит слева, единственное
// действие «Искать» справа; результаты — строки без рамок, имя и «почему» под ним, точка состояния. Подбирает модель OpenAI, когда она
// отвечает; не ответила — векторы узла (закон двери), и окно говорит, кто подобрал.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Row = { id: string; label: string; href: string; state: { kind: MenuStateKind; label: string }; why: string; said: string }

export function MenuAi({ lang, words, dialogUi }: { lang: string; words: MenuSearchWords; dialogUi: AppDialogUi }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [rows, setRows] = useState<Row[] | null>(null)
  const [by, setBy] = useState<"model" | "vectors" | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const keyHref = `${BASE}/${lang}/architect/build/environment#OPENAI_API_KEY`

  async function start() {
    const r = (await fetch(`${BASE}/api/architect/menu/ai`, { cache: "no-store" }).then((x) => x.json()).catch(() => null)) as { ok?: boolean; key?: boolean } | null
    if (r?.ok && !r.key) { window.location.href = keyHref; return }
    setOpen(true)
  }

  async function search() {
    const t = text.trim()
    if (!t || busy) return
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/architect/menu/ai`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t, lang }) })
      const j = (await r.json()) as { ok?: boolean; rows?: Row[]; reason?: string; by?: "model" | "vectors" }
      if (!r.ok || !j.ok || !Array.isArray(j.rows)) { setRows(null); setBy(null); setError(j?.reason === "no-vectors" ? words.aiNoVectors : words.failed); return }
      setRows(j.rows)
      setBy(j.by ?? null)
    } catch {
      setError(words.failed)
    } finally {
      setBusy(false)
    }
  }

  const status = busy
    ? <span className="inline-flex items-center gap-2"><Spinner className="size-3.5" />{words.aiSearching}</span>
    : rows && by ? (by === "model" ? words.byModel : words.byVectors) : null

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => void start()} data-menu-ai>{words.ai}</Button>
      <AppDialog open={open} onOpenChange={setOpen} title={words.aiTitle} description={words.aiLead} ui={dialogUi} size="md">
        <form data-block="menu-ai" className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void search() }}>
          <label htmlFor={id} className="sr-only">{words.aiLead}</label>
          <VoiceControl
            id={id}
            variant="textarea"
            rows={3}
            value={text}
            onChange={setText}
            lang={lang}
            placeholder={words.aiPlaceholder}
            disabled={busy}
            apiUrl={`${BASE}/api/transcribe`}
            keyHint={{ href: keyHref, label: words.voiceKey }}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 text-[length:var(--fs-small)] text-muted-foreground" role="status" data-menu-ai-by={by ?? undefined}>{status}</p>
            <Button type="submit" disabled={busy || !text.trim()}>{words.aiFind}</Button>
          </div>
        </form>
        {error && <p className="mt-3 text-[length:var(--fs-small)] text-destructive" role="alert">{error}</p>}
        {rows && rows.length === 0 && !busy && <EmptyState className="mt-4 py-8" title={words.aiNone} hint={words.aiNoneHint} />}
        {rows && rows.length > 0 && (
          <ul data-block="menu-ai-result" className="mt-3 flex flex-col gap-0.5 border-t border-border pt-3">
            {rows.map((r) => (
              <li key={r.id}><ElementRow href={r.href} label={r.label} state={r.state} note={r.said ? `${r.why} — «${r.said}»` : r.why} /></li>
            ))}
          </ul>
        )}
      </AppDialog>
    </>
  )
}
