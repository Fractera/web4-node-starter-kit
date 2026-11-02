"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { H2 } from "@/components/ui/typography"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { ElementSettingsUi } from "../_i18n/element-settings.i18n"

// «ЭЛЕМЕНТ В СЕТИ WEB4» НА «НАСТРОЙКАХ САЙТА» (567-6). Слова владельца (шаг 566): «раздел, отделённый разделителем … использовать этот
// элемент в сети web 4 или нет. Представить в виде двух карточек размещённых в одной горизонтальной площади на широком экране … для того
// чтобы переключить режим нужно нажать на звёздочку в этой карточке всплывёт модельное окно в котором пользователь должен понимать о том что
// происходит и подтвердить это. После этого на карточке загорается*». Запись — дверь `/api/node/web4`; после неё страница перезагружается:
// меню (A2A и «Отзывы») рисует сервер.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function ElementWeb4({ id, ui, dialogUi, initialOn }: { id: string; ui: ElementSettingsUi; dialogUi: AppDialogUi; initialOn: boolean }) {
  const w = ui.web4
  const [on] = useState(initialOn)
  const [target, setTarget] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function apply() {
    if (target === null) return
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/node/web4`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, on: target }) })
      const d = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
      if (!d?.ok) { setError(`${w.failed} ${d?.reason ?? r.status}`); setBusy(false); return }
      window.location.reload()
    } catch {
      setError(`${w.failed} —`)
      setBusy(false)
    }
  }

  const card = (isNetwork: boolean) => {
    const chosen = on === isNetwork
    return (
      <Card size="sm" data-web4-card={isNetwork ? "network" : "web2"} data-web4-chosen={chosen ? "yes" : "no"} className={chosen ? "ring-primary/50" : undefined}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 font-semibold">
            <span>{isNetwork ? w.networkTitle : w.web2Title}</span>
            <button
              type="button"
              aria-label={chosen ? w.chosen : w.choose}
              aria-pressed={chosen}
              disabled={chosen}
              onClick={() => { setError(null); setTarget(isNetwork) }}
              className="inline-flex disabled:cursor-default"
            >
              <Star className={chosen ? "size-5 fill-primary text-primary" : "size-5 text-muted-foreground"} aria-hidden />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">{isNetwork ? w.networkText : w.web2Text}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="my-6 flex flex-col gap-3" data-element-web4={on ? "on" : "off"} aria-label={w.title}>
      <Separator />
      <H2>{w.title}</H2>
      <p className="text-sm text-muted-foreground">{w.lead}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {card(true)}
        {card(false)}
      </div>
      <AppDialog
        open={target !== null}
        onOpenChange={(v) => { if (!v && !busy) setTarget(null) }}
        title={target ? w.toNetworkTitle : w.toWeb2Title}
        description={target ? w.toNetworkText : w.toWeb2Text}
        ui={dialogUi}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTarget(null)} disabled={busy}>{w.cancel}</Button>
            <Button onClick={apply} disabled={busy} data-web4-confirm>{busy ? w.working : w.confirm}</Button>
          </>
        }
      >
        {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      </AppDialog>
    </section>
  )
}
