"use client"
// @local — the core panel's red band for the main agent's deaf Telegram (781-4); its data rides the action window's poll

import { useState } from "react"
import { TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { MainChannelBandUi } from "./main-channel-band.i18n"

// КРАСНАЯ ПОЛОСА «TELEGRAM ГЛАВНОГО АГЕНТА ВАС НЕ СЛЫШИТ» (узел, шаг 781-4). Владелец 2026-11-18: «тревожный красный баннер если у нас
// существует Telegram основного агента который не подключился к сессии. Расскажи в нём что нужно делать и реши эту задачу механическим
// способом». Механика — узел сам (781-3): дождаться конца хода, перезапустить тот же разговор; полоса — лицо редкого случая и кнопка
// человека: «Переподключить сейчас» (живая сессия) или «Разбудить» (узел закрыл её после второго отказа). Данные — опрос окна действий.

export type MainChannel = { bot: boolean; state: "no-bot" | "asleep" | "starting" | "hears" | "healing" | "deaf" | "failed"; why: string | null; since: string | null }

export function MainChannelBand({ channel, ui, url, onChanged }: { channel: MainChannel; ui: MainChannelBandUi; url: string; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const failed = channel.state === "failed"
  const title = failed ? ui.failedTitle : channel.state === "healing" ? ui.healingTitle : ui.deafTitle
  const text = failed ? ui.failedText : channel.state === "healing" ? ui.healingText : ui.deafText

  const act = async () => {
    setBusy(true)
    try {
      const r = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: failed ? "wake" : "reconnect" }) })
      const d = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
      if (!r.ok || !d?.ok) throw new Error(d?.reason ?? String(r.status))
      toast.success(ui.done)
      onChanged()
    } catch (e) {
      toast.error(ui.failed.replace("{reason}", e instanceof Error ? e.message : String(e)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Alert data-block="main-channel-band" data-channel-state={channel.state}
      className="rounded-none border-x-0 border-t-0 border-b-destructive bg-destructive px-4 py-3 text-white">
      <TriangleAlert aria-hidden />
      <AlertTitle className="line-clamp-none font-semibold">{title}</AlertTitle>
      <AlertDescription className="text-white">
        <p>{text}</p>
        <div data-block="main-channel-band-actions" className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => { void act() }}>
            {busy ? ui.working : failed ? ui.wake : ui.reconnect}
          </Button>
          {!failed && <span className="text-xs text-white">{ui.reconnectNote}</span>}
          <span className="text-xs text-white">{ui.terminal}</span>
        </div>
      </AlertDescription>
    </Alert>
  )
}
