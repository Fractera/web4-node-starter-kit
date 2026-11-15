"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"

// КНОПКА «СОЗДАТЬ МИКРОСЕРВИС» В ЛЕВОМ МЕНЮ (314-1). Создаёт черновик дверью ядра и ведёт на главную его группы.
// Действие — только по нажатию человека; дверь сама пускает лишь архитектора.
// 749-2 (владелец 2026-11-15: «вместо того чтобы показать его название ты показываешь его идентификатор»): нажатие открывает окно с
// одним полем — НАЗВАНИЕ; черновик рождается уже с ним (дверь пишет его в имена ядра), и меню, заголовок и окна не зовут его случайным
// адресом ни минуты. «Создать» неактивна, пока поле пустое; Enter в поле — то же нажатие. Создан — ПОЛНЫЙ переход на его страницу, окно
// стоит в состоянии «создаю», пока браузер не ушёл (как у удаления, 325-6): мягкое `router.refresh()` меню ненадёжно (замерено в 678).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
/** Как `NAME_MAX` в `name-file.cjs` — дверь режет так же. */
const NAME_MAX = 60

export type CreateDraftWords = {
  label: string
  busyLabel: string
  failed: string
  title: string
  text: string
  nameLabel: string
  confirm: string
  cancel: string
}

// 582 (владелец 2026-10-24): `native` — та же кнопка в зоне нативных («+ создать нативный элемент»); шрифт кнопки мельче подписи
// зоны: «вкладка плюс создать элемент … должна быть более мелким шрифтом даже чем название раздела».
export function CreateDraftButton({ lang, words: w, dialogUi, native = false }: {
  lang: string
  words: CreateDraftWords
  dialogUi: AppDialogUi
  native?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const ready = name.trim() !== "" && !busy
  const field = `draft-name-${native ? "native" : "custom"}`

  async function create() {
    if (!ready) return
    setBusy(true)
    setError(false)
    try {
      const r = await fetch(`${BASE}/api/architect/drafts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), ...(native ? { native: true } : {}) }),
      })
      const d = (await r.json().catch(() => null)) as { id?: string } | null
      if (!r.ok || !d?.id) throw new Error(String(r.status))
      window.location.assign(`${BASE}/${lang}/architect/${d.id}`)
    } catch {
      setError(true)
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-1" data-create-draft={native ? "native" : "custom"}>
      <Button
        type="button"
        variant="ghost"
        onClick={() => { setName(""); setError(false); setOpen(true) }}
        className="h-auto w-full justify-start gap-2 border border-dashed border-border px-[9px] py-1.5 text-left text-[length:var(--fs-small)] font-normal text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      >
        <Plus size={14} aria-hidden className="shrink-0" />
        <span className="truncate">{w.label}</span>
      </Button>
      <AppDialog
        open={open}
        onOpenChange={(v) => !busy && setOpen(v)}
        title={w.title}
        description={w.text}
        ui={dialogUi}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>{w.cancel}</Button>
            <Button onClick={create} disabled={!ready} data-create-draft-confirm>{busy ? w.busyLabel : w.confirm}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor={field}>{w.nameLabel}</Label>
          <Input
            id={field}
            value={name}
            maxLength={NAME_MAX}
            autoFocus
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void create() } }}
            data-create-draft-name
          />
          {error ? <p className="text-sm text-destructive" role="alert">{w.failed}</p> : null}
        </div>
      </AppDialog>
    </div>
  )
}
