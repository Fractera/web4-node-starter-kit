"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import type { CronSwitchUi } from "../_i18n/cron-switch.i18n"

// «ИСПОЛЬЗОВАТЬ АВТОМАТИЗАЦИЮ» НАД КАЛЕНДАРЁМ КРОНА (551-3). Владелец 2026-10-20: «На вкладкеКрон автоматизации нужен switch
// переключатель использовать автоматизацию или не использовать». Состояние спрашивается при открытии у двери ядра `/api/node/automation`
// (страница предрендерена), щелчок пишет поле `automation.cron` в паспорт элемента. Таймеров и опроса нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function CronSwitch({ item, ui }: { item: string; ui: CronSwitchUi }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading")
  const [on, setOn] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let live = true
    fetch(`${BASE}/api/node/automation?item=${encodeURIComponent(item)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; automation?: { cron: boolean } }) => {
        if (!live) return
        if (j.ok && j.automation) { setOn(j.automation.cron); setState("ready") } else setState("failed")
      })
      .catch(() => live && setState("failed"))
    return () => { live = false }
  }, [item])

  async function change(next: boolean) {
    setBusy(true)
    setError(false)
    try {
      const r = await fetch(`${BASE}/api/node/automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, cron: next }),
      })
      const j = (await r.json().catch(() => null)) as { ok?: boolean } | null
      if (r.ok && j?.ok) setOn(next)
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  if (state === "loading") return <Skeleton className="h-16 w-full max-w-3xl" aria-label={ui.loading} />
  if (state === "failed") return <p className="text-sm text-destructive" role="alert" data-cron-switch="failed">{ui.failed}</p>
  return (
    <div className="flex max-w-3xl flex-col gap-2 rounded-lg border border-border px-4 py-3" data-cron-switch={on ? "on" : "off"}>
      <div className="flex items-center gap-3">
        <Switch id={`cron-switch-${item}`} checked={on} disabled={busy} onCheckedChange={change} />
        <Label htmlFor={`cron-switch-${item}`}>{ui.label}</Label>
      </div>
      <p className={`text-sm ${on ? "text-muted-foreground" : "text-foreground"}`}>{on ? ui.on : ui.off}</p>
      <p className="text-xs text-muted-foreground">{ui.where}</p>
      {error && <p className="text-sm text-destructive" role="alert">{ui.saveFailed}</p>}
    </div>
  )
}
