"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { ElementSettingsUi } from "../_i18n/element-settings.i18n"

// СВЯЗЬ ЭЛЕМЕНТА С CONFIG (324-7; с 716 единственная: элементов «Дизайн» и «Блоки» у узла нет). Состояние словами и одна кнопка;
// нажатие — дверь ядра `/api/architect/items/<id>/links`, которая пишет состояние, переносит настройки и перерисовывает страницы элемента.
// 713-3: `variant="line"` — та же связь одной строкой над «Настройками сайта» (была карточка в половину ширины над вкладками).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function ElementLink({ id, kind, on, ui, variant = "card" }: { id: string; kind: "config"; on: boolean; ui: ElementSettingsUi; variant?: "card" | "line" }) {
  const w = ui.linkCard
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/architect/items/${id}/links`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, on: !on }) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (j?.ok) { router.refresh(); setBusy(false); return }
      setError(`${w.failed} ${j?.error ?? r.status}`)
    } catch { setError(w.failed) }
    setBusy(false)
  }

  if (variant === "line") {
    return (
      <div data-block="elk01" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-border px-4 py-3" data-element-link={kind} data-link-on={on ? "yes" : "no"}>
        <p data-block="elk02" className="flex min-w-0 items-center gap-2.5 text-[length:var(--fs-small)] text-foreground">
          <span data-block="elk03" aria-hidden className={`size-2 shrink-0 rounded-full ${on ? "bg-primary" : "bg-muted-foreground/50"}`} />
          {on ? w.lineOn : w.lineOff}
        </p>
        <Button type="button" size="sm" variant="outline" onClick={toggle} disabled={busy} data-link-toggle>
          {busy ? w.busy : on ? w.turnOff : w.turnOn}
        </Button>
        {error && <p data-block="elk04" className="w-full text-[length:var(--fs-small)] text-destructive" role="alert">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5" data-element-link={kind} data-link-on={on ? "yes" : "no"}>
      <p className={on ? "text-sm text-foreground" : "text-sm font-medium text-foreground"}>{on ? w.on : w.off}</p>
      <Button type="button" size="sm" variant="outline" className="w-fit" onClick={toggle} disabled={busy} data-link-toggle>
        {busy ? w.busy : on ? w.turnOff : w.turnOn}
      </Button>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}
