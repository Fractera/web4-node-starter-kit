"use client"
// @local — one place only: «Core → Settings → Danger zone» of the core (step 746-3); the element's delete button is its pattern.

import { useState } from "react"
import { Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { NodeRemoveWords } from "./node-remove.i18n"

// «УДАЛИТЬ ПРОЕКТ С КОМПЬЮТЕРА» (шаг 746-3). Владелец 2026-11-15: «полное удаление … только с локальной машины всего проекта … с
// подтверждением что пользователь понимает … данных которые потеряет безвозвратно»; «Да, с архивом». Окно спрашивает дверь при открытии
// (страница собрана заранее и о машине ничего не знает): что уйдёт, чья работа есть только здесь, что останется. Архив — до поля
// подтверждения. Имя папки буква в букву И галочка; дверь сверяет имя ещё раз сама. Запущено — окно больше не закрывается: страница
// скоро перестанет отвечать, и закрытое окно читалось бы как «не сработало» (урок 325-6).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DOOR = `${BASE}/api/architect/node-remove`

type Element = { id: string; name: string; commits: number; unpushed: number | null }
type Preview = { ok: boolean; refused: string | null; folder: string; name: string; processes: string[]; elements: Element[]; journals: string[] }

export function NodeRemoveButton({ w, dialogUi }: { w: NodeRemoveWords; dialogUi: AppDialogUi }) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [typed, setTyped] = useState("")
  const [understood, setUnderstood] = useState(false)
  const [busy, setBusy] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const name = preview?.name ?? ""
  const ready = !!preview?.ok && typed.trim() === name && understood && !busy

  const refusal = (status: number, code?: string) =>
    code === "server" ? w.server : status === 403 || code === "not-at-machine" ? w.notAtMachine : `${w.failed} ${code ?? status}`

  async function openDialog() {
    setTyped(""); setUnderstood(false); setError(null); setPreview(null); setOpen(true)
    try {
      const r = await fetch(DOOR, { cache: "no-store" })
      const d = (await r.json().catch(() => null)) as (Preview & { error?: string }) | null
      if (!r.ok || !d) { setError(refusal(r.status, d?.error)); return }
      if (!d.ok) { setError(refusal(403, d.refused ?? undefined)); return }
      setPreview(d)
    } catch { setError(`${w.failed} —`) }
  }

  async function remove() {
    setBusy(true); setError(null)
    try {
      const r = await fetch(DOOR, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm: typed.trim(), understood }) })
      const d = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; report?: string } | null
      if (r.status === 409) { setError(w.mismatch); setBusy(false); return }
      if (!d?.ok) { setError(refusal(r.status, d?.error)); setBusy(false); return }
      setReport(d.report ?? "~")
    } catch { setError(`${w.failed} —`); setBusy(false) }
  }

  const line = (e: Element) =>
    e.unpushed === null ? w.elementNeverExported.replace("{n}", String(e.commits))
      : e.unpushed > 0 ? w.elementOnlyHere.replace("{n}", String(e.unpushed)) : w.elementSafe

  return (
    <>
      <Button type="button" variant="destructive" size="sm" className="w-fit gap-1.5" onClick={openDialog} data-node-remove>
        <Trash2 className="size-4" aria-hidden />
        {w.action}
      </Button>
      <AppDialog
        open={open}
        onOpenChange={(v) => !busy && !report && setOpen(v)}
        dismissible={!report}
        title={report ? w.startedTitle : w.dialogTitle}
        titleClassName="text-destructive"
        description={report ? undefined : w.dialogText}
        ui={dialogUi}
        size="md"
        footer={report ? undefined : (
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>{w.cancel}</Button>
            <Button variant="destructive" onClick={remove} disabled={!ready} data-node-remove-confirm>
              {busy ? w.removing : w.confirm}
            </Button>
          </>
        )}
      >
        {report ? (
          <div className="flex flex-col gap-2" data-node-remove-started>
            <p className="text-sm text-foreground">{w.started}</p>
            <p className="font-mono text-sm text-foreground break-all">{report}</p>
          </div>
        ) : !preview ? (
          error
            ? <p className="text-sm text-destructive" role="alert" data-node-remove-refused>{error}</p>
            : <p className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner />{w.loading}</p>
        ) : (
          <div className="flex flex-col gap-4" data-node-remove-preview>
            <section className="flex flex-col gap-2" aria-label={w.lostTitle}>
              <p className="text-sm font-semibold text-destructive">{w.lostTitle}</p>
              <ul className="flex flex-col gap-1.5 text-sm text-foreground">
                <li className="flex flex-col">{w.folder}:<span className="font-mono [overflow-wrap:anywhere]">{preview.folder}</span></li>
                <li>{w.data}</li>
                <li>{w.processes.replace("{n}", String(preview.processes.length))}</li>
                <li>{w.journals.replace("{n}", String(preview.journals.length))}</li>
              </ul>
              {preview.elements.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">{w.elementsTitle}</p>
                  <ul className="flex flex-col gap-1 text-sm" data-node-remove-elements>
                    {preview.elements.map((e) => (
                      <li key={e.id}>
                        <span className="font-medium text-foreground">{e.name}</span>
                        <span className={e.unpushed === 0 ? "text-muted-foreground" : "text-destructive"}> — {line(e)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
            <section className="flex flex-col gap-1" aria-label={w.keptTitle}>
              <p className="text-sm font-medium text-foreground">{w.keptTitle}</p>
              <p className="text-sm text-muted-foreground">{w.kept}</p>
            </section>
            <section className="flex flex-col gap-2">
              <Button type="button" variant="outline" size="sm" className="w-fit gap-1.5" onClick={() => window.location.assign(`${DOOR}/archive`)} data-node-remove-archive>
                <Download className="size-4" aria-hidden />
                {w.archive}
              </Button>
              <p className="text-sm text-muted-foreground">{w.archiveNote}</p>
            </section>
            <Separator />
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-node-remove">{w.label} <span className="font-mono select-all">{name}</span></Label>
              <Input id="confirm-node-remove" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />
              <Label className="flex items-start gap-2 font-normal">
                <Checkbox checked={understood} onCheckedChange={(v) => setUnderstood(v === true)} className="mt-0.5" data-node-remove-understood />
                <span className="text-sm text-foreground">{w.understood}</span>
              </Label>
              {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
            </div>
          </div>
        )}
      </AppDialog>
    </>
  )
}
