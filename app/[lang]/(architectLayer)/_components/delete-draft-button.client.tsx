"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { sameName } from "@/lib/web4-items/name-match.mjs"
import type { Web4DraftsUi } from "../_i18n/web4-drafts.i18n"

// «УДАЛИТЬ» ЧЕРНОВИК (314-1). Слово владельца: «кнопку удалить которая должно вызывать модельное окно с подтверждением где
// пользователь должен ввести созданный для него домен». Кнопка подтверждения неактивна, пока ввод не совпал; дверь сверяет его ещё
// раз сама — интерфейс не единственная защита. 749-1 (владелец 2026-11-15: «вместо того чтобы показать его название ты показываешь
// его идентификатор»): вводится НАЗВАНИЕ черновика (его дают при создании, 749-2; у старого черновика без имени — его адрес).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function DeleteDraftButton({ lang, id, name, ui, dialogUi }: {
  lang: string
  id: string
  /** Имя черновика для людей (`elementLabel`). */
  name: string
  ui: Web4DraftsUi
  dialogUi: AppDialogUi
}) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const match = sameName(typed, name)

  async function remove() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/architect/drafts/${id}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: typed.trim() }),
      })
      if (r.status === 409) throw new Error("mismatch")
      if (!r.ok) throw new Error(String(r.status))
      // Владелец 2026-10-01: «после того как окно закрылось вкладка не поменялась, когда я обновил страницу вкладка исчезла».
      // ✗ Было: окно закрывалось сразу, а мягкий переход (`router.push` + `refresh`) перерисовывал раскладку от 4 с до >45 с —
      // всё это время на экране страница удалённого черновика (замерено). Теперь как у удаления элемента: ПОЛНЫЙ переход, а окно
      // остаётся открытым в состоянии «удаляю», пока браузер не ушёл, — «окно закрылось, страница прежняя» невозможно.
      window.location.assign(`${BASE}/${lang}/architect`)
    } catch (e) {
      setError(e instanceof Error && e.message === "mismatch" ? ui.deleteMismatch : ui.deleteFailed)
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => { setTyped(""); setError(null); setOpen(true) }} data-delete-draft>
        <Trash2 />
        {ui.delete}
      </Button>
      <AppDialog
        open={open}
        onOpenChange={(v) => !busy && setOpen(v)}
        title={ui.deleteTitle.replace("{name}", name)}
        titleClassName="text-destructive"
        description={ui.deleteText}
        ui={dialogUi}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>{ui.cancel}</Button>
            <Button variant="destructive" onClick={remove} disabled={!match || busy}>
              {busy ? ui.deleting : ui.deleteConfirm}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground select-all" data-delete-name>{name}</p>
          <Label htmlFor={`confirm-${id}`}>{ui.deleteLabel}</Label>
          <Input id={`confirm-${id}`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />
          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        </div>
      </AppDialog>
    </>
  )
}
