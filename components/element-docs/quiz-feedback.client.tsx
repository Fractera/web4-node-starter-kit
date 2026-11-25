"use client"
// @local — the «upload the team's results» window of one element's quiz page (852-4); nothing else uploads quiz feedback

import { useState } from "react"
import { Upload } from "lucide-react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// «ЗАГРУЗИТЬ РЕЗУЛЬТАТЫ КОМАНДЫ» (шаг 852-4): файл (размеченный PDF, Markdown, JSON, текст или фото страниц, до 10 МБ) и комментарий →
// дверь `/api/node/product-quiz/feedback`: файл ложится в папку данных элемента, главный агент ставит агенту элемента задачу разобрать
// правки по номерам дерева. Окно — одно на проект (`AppDialog`).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export type QuizFeedbackWords = {
  button: string
  title: string
  text: string
  fileLabel: string
  fileHint: string
  commentLabel: string
  commentHint: string
  send: string
  sending: string
  cancel: string
  sent: string
  sentNoWake: string
  failed: string
  errors: Record<"bad-kind" | "empty" | "too-big" | "bad-comment" | "unknown-element", string>
}

export function QuizFeedback({ item, words, dialogUi }: { item: string; words: QuizFeedbackWords; dialogUi: AppDialogUi }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null)

  async function send() {
    if (!file) return
    setBusy(true)
    setSaid(null)
    const form = new FormData()
    form.set("item", item)
    form.set("file", file)
    form.set("comment", comment)
    try {
      const r = await fetch(`${BASE}/api/node/product-quiz/feedback`, { method: "POST", body: form })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; woke?: boolean } | null
      if (j?.ok) { setSaid({ ok: true, text: j.woke ? words.sent : words.sentNoWake }); setFile(null); setComment("") }
      else setSaid({ ok: false, text: `${words.failed} ${words.errors[j?.error as keyof QuizFeedbackWords["errors"]] ?? j?.error ?? r.status}` })
    } catch {
      setSaid({ ok: false, text: words.failed })
    }
    setBusy(false)
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => { setOpen(true); setSaid(null) }} data-quiz-feedback-open>
        <Upload data-icon="inline-start" aria-hidden />
        {words.button}
      </Button>
      <AppDialog
        open={open}
        onOpenChange={(v) => !busy && setOpen(v)}
        title={words.title}
        description={words.text}
        ui={dialogUi}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>{words.cancel}</Button>
            <Button onClick={send} disabled={busy || !file} data-quiz-feedback-send>{busy ? words.sending : words.send}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4" data-block="quiz-feedback">
          <Field>
            <FieldLabel htmlFor="quiz-feedback-file">{words.fileLabel}</FieldLabel>
            <Input id="quiz-feedback-file" type="file" accept=".pdf,.md,.txt,.json,.png,.jpg,.jpeg,.webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} data-quiz-feedback-file />
            <FieldDescription>{words.fileHint}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="quiz-feedback-comment">{words.commentLabel}</FieldLabel>
            <Textarea id="quiz-feedback-comment" rows={3} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} />
            <FieldDescription>{words.commentHint}</FieldDescription>
          </Field>
          {said && <p className={said.ok ? "text-sm text-foreground" : "text-sm text-destructive"} role={said.ok ? "status" : "alert"} data-quiz-feedback-said={said.ok ? "ok" : "no"}>{said.text}</p>}
        </div>
      </AppDialog>
    </>
  )
}
