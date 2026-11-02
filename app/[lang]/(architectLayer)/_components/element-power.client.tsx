"use client"

import { useEffect, useState } from "react"
import { Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { ElementSettingsUi } from "../_i18n/element-settings.i18n"

// «ВКЛЮЧЕНИЕ ЭЛЕМЕНТА» В «ОПАСНОЙ ЗОНЕ» (567). Состояние спрашивается у двери `/api/node/power` в браузере (признак меняется без
// пересборки ядра); выключить — причина и подтверждение, включить — подтверждение. Включение ждёт ответа элемента до минуты.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type State = { on: boolean; reason: string | null; byDefault: boolean }

export function ElementPower({ id, lang, ui, dialogUi, initial }: {
  id: string
  lang: string
  ui: ElementSettingsUi
  dialogUi: AppDialogUi
  initial: State
}) {
  const w = ui.powerDialog
  const [state, setState] = useState<State>(initial)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${BASE}/api/node/power?id=${encodeURIComponent(id)}&lang=${lang}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: (State & { ok?: boolean }) | null) => { if (d?.ok) setState({ on: d.on, reason: d.reason, byDefault: d.byDefault }) })
      .catch(() => { /* состояние со страницы остаётся */ })
  }, [id, lang])

  async function apply() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/node/power`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, lang, action: state.on ? "off" : "on", reason: reason.trim() }),
      })
      const d = (await r.json().catch(() => null)) as (State & { ok?: boolean; line?: string | null }) | null
      if (!d?.ok) { setError(`${w.failed} ${d?.line ?? r.status}`); setBusy(false); return }
      setState({ on: d.on, reason: d.reason, byDefault: d.byDefault })
      setOpen(false)
      setBusy(false)
    } catch {
      setError(`${w.failed} —`)
      setBusy(false)
    }
  }

  const turningOff = state.on
  return (
    <div className="flex flex-col gap-2" data-element-power={state.on ? "on" : "off"}>
      <p className="text-sm font-medium text-foreground">
        {state.on ? w.stateOn : `${state.byDefault ? w.stateOffDefault : w.stateOff} ${state.reason ?? ""}`}
      </p>
      <Button type="button" variant="outline" size="sm" className="w-fit gap-1.5" onClick={() => { setReason(""); setError(null); setOpen(true) }} data-element-power-open>
        <Power className="size-4" aria-hidden />
        {state.on ? w.turnOff : w.turnOn}
      </Button>
      <AppDialog
        open={open}
        onOpenChange={(v) => !busy && setOpen(v)}
        title={turningOff ? w.offTitle : w.onTitle}
        description={turningOff ? w.offText : w.onText}
        ui={dialogUi}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>{w.cancel}</Button>
            <Button onClick={apply} disabled={busy || (turningOff && !reason.trim())} data-element-power-confirm>
              {busy ? w.working : turningOff ? w.turnOff : w.turnOn}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          {turningOff ? (
            <>
              <Label htmlFor={`power-reason-${id}`}>{w.reasonLabel}</Label>
              <Input id={`power-reason-${id}`} value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} placeholder={w.reasonPlaceholder} />
            </>
          ) : null}
          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        </div>
      </AppDialog>
    </div>
  )
}
