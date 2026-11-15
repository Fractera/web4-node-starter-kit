"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { sameName } from "@/lib/web4-items/name-match.mjs"
import type { ElementSettingsUi } from "../_i18n/element-settings.i18n"

// «УДАЛИТЬ ЭЛЕМЕНТ» НАСОВСЕМ (325-5). Окно: что потеряется (коммиты, которых нет в GitHub — спрашивается у двери при открытии),
// ввод НАЗВАНИЯ элемента, кнопка неактивна до совпадения; дверь сверяет название ещё раз сама. Удалено — переход в слой;
// сбой — список этапов, какие не прошли.
// 749-1 (владелец 2026-11-15: «вместо того чтобы показать его название ты показываешь его идентификатор»): окно называет элемент его
// именем для людей (`elementLabel`) и ждёт это имя (`sameName`: пробелы и регистр не важны); адрес в интернете — строкой ниже и только
// когда у узла есть домен — без домена адрес совпадал с идентификатором. Пустое поле, без подсказки: подсказка читалась как ввод (746-3).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Risk = { commits: number; unexported: number | null }

export function DeleteElementButton({ lang, id, name, internet, ui, dialogUi }: {
  lang: string
  id: string
  /** Имя элемента для людей (`elementLabel`). */
  name: string
  /** Адрес в интернете (`<адрес>.<зона>`) — только у узла со своим доменом; иначе `null`. */
  internet: string | null
  ui: ElementSettingsUi
  dialogUi: AppDialogUi
}) {
  const w = ui.removeDialog
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const [busy, setBusy] = useState(false)
  const [risk, setRisk] = useState<Risk | null>(null)
  const [error, setError] = useState<string | null>(null)
  const match = sameName(typed, name)

  async function openDialog() {
    setTyped("")
    setError(null)
    setOpen(true)
    try {
      const r = await fetch(`${BASE}/api/architect/items/${id}`, { cache: "no-store" })
      if (r.ok) setRisk((await r.json()) as Risk)
    } catch { /* без оценки риска окно всё равно работает */ }
  }

  async function remove() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/architect/items/${id}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: typed.trim() }),
      })
      const d = (await r.json().catch(() => null)) as { ok?: boolean; steps?: Array<{ step: string; ok: boolean; detail?: string }> } | null
      if (r.status === 409) { setError(w.mismatch); setBusy(false); return }
      if (!d?.ok) {
        const failed = (d?.steps ?? []).filter((s) => !s.ok).map((s) => `${s.step}${s.detail ? ` (${s.detail})` : ""}`).join(", ")
        setError(failed ? `${w.failed} ${failed}` : `${w.failed} ${r.status}`)
        setBusy(false)
        return
      }
      // 325-6: ПОЛНЫЙ переход, а не `router.push`: страница удалённого элемента больше не существует, слой перерисован
      // дверью, и мягкий переход ждал бы перерисовки под открытым окном. Окно не закрывается до ухода страницы (2026-10-01: закрытое
      // окно над прежней страницей читалось как «удаление не сработало»).
      window.location.assign(`${BASE}/${lang}/architect`)
    } catch {
      setError(`${w.failed} —`)
      setBusy(false)
    }
  }

  const riskLine = risk
    ? (risk.unexported === null ? w.riskNever.replace("{n}", String(risk.commits)) : risk.unexported > 0 ? w.riskAhead.replace("{n}", String(risk.unexported)) : w.riskNone)
    : null

  return (
    <>
      <Button type="button" variant="destructive" size="sm" className="w-fit gap-1.5" onClick={openDialog} data-delete-element>
        <Trash2 className="size-4" aria-hidden />
        {ui.remove.action}
      </Button>
      <AppDialog
        open={open}
        onOpenChange={(v) => !busy && setOpen(v)}
        title={w.title.replace("{name}", name)}
        titleClassName="text-destructive"
        description={w.text}
        ui={dialogUi}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>{w.cancel}</Button>
            <Button variant="destructive" onClick={remove} disabled={!match || busy} data-delete-element-confirm>
              {busy ? w.deleting : w.confirm}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          {riskLine && <p className="text-sm font-medium text-destructive" data-delete-risk>{riskLine}</p>}
          <p className="text-sm font-semibold text-foreground select-all" data-delete-name>{name}</p>
          {internet ? <p className="text-xs text-muted-foreground" data-delete-address>{w.addressLine.replace("{address}", internet)}</p> : null}
          <Label htmlFor={`confirm-element-${id}`}>{w.label}</Label>
          <Input id={`confirm-element-${id}`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />
          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        </div>
      </AppDialog>
    </>
  )
}
