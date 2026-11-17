"use client"
// @local — the core panel's action request window (761-16, look 761-16c); the elements' own windows come through their template

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PersonAskCard, type Ask } from "./person-ask-card.client"
import type { PersonAskUi } from "./person-ask.i18n"

// ДЕЙСТВИЕ ЧЕЛОВЕКА — МАЯЧОК ВНИЗУ СПРАВА НА КАЖДОЙ СТРАНИЦЕ ПУЛЬТА (узел, шаг 761-16, вид 761-16c). Владелец 2026-11-16:
// «уведомление на экране которое невозможно пропустить … и подтвердить о его завершении»; «need create speciao design and auto hidden
// tools»; вариант C (16:30, «мне нравится твой выбор»). Новый запрос раскрывает карточку сам; 30 секунд без касания — карточка
// сворачивается в пульсирующий маячок с числом. Исчезает только по «Готово», которое будит того, кто просил (`/api/node/person-asks`).
// Свежесть: открытие страницы, возврат на вкладку и раз в 15 секунд, пока вкладка видна.

const POLL_MS = 15_000
const COLLAPSE_MS = 30_000

export function PersonAsk({ url, ui }: { url: string; ui: PersonAskUi }) {
  const [asks, setAsks] = useState<Ask[]>([])
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [touched, setTouched] = useState(false)
  const known = useRef(new Set<string>())

  // a guest or a signed-in non-architect gets 401/403 once — then this page asks no more (no refusal every 15 s in the console)
  const refused = useRef(false)
  const refresh = useCallback(() => {
    if (refused.current) return
    fetch(url, { cache: "no-store", credentials: "include" })
      .then((r) => { if (r.status === 401 || r.status === 403) refused.current = true; return r.ok ? r.json() : null })
      .then((d: { ok?: boolean; asks?: Ask[] } | null) => {
        if (!d?.ok) return
        const list = d.asks ?? []
        const fresh = list.findIndex((a) => !known.current.has(a.id))
        known.current = new Set(list.map((a) => a.id))
        setAsks(list)
        setIndex((i) => (fresh >= 0 ? fresh : Math.min(i, Math.max(0, list.length - 1))))
        if (fresh >= 0) { setOpen(true); setTouched(false) }
        if (list.length === 0) setOpen(false)
      })
      .catch(() => {})
  }, [url])

  useEffect(() => {
    refresh()
    const onVisible = () => { if (document.visibilityState === "visible") refresh() }
    document.addEventListener("visibilitychange", onVisible)
    const t = window.setInterval(() => { if (document.visibilityState === "visible") refresh() }, POLL_MS)
    return () => { document.removeEventListener("visibilitychange", onVisible); window.clearInterval(t) }
  }, [refresh])

  // the person's own words «auto hidden»: an untouched card folds into the beacon; a touch keeps it open until they fold it
  useEffect(() => {
    if (!open || touched) return
    const t = window.setTimeout(() => setOpen(false), COLLAPSE_MS)
    return () => window.clearTimeout(t)
  }, [open, touched, index])

  const done = useCallback(async (a: Ask) => {
    setBusy(true)
    try {
      const r = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id }) })
      const d = (await r.json().catch(() => null)) as { ok?: boolean } | null
      if (!r.ok || !d?.ok) throw new Error(String(r.status))
      const rest = asks.filter((x) => x.id !== a.id)
      known.current.delete(a.id)
      setAsks(rest)
      setIndex((i) => Math.min(i, Math.max(0, rest.length - 1)))
      if (rest.length === 0) setOpen(false)
      toast.success(ui.sent)
    } catch {
      toast.error(ui.failed)
    } finally {
      setBusy(false)
    }
  }, [url, ui, asks])

  // 768: a secret saved by its own field — the door already closed the request; the card only lets it go
  const saved = useCallback((a: Ask) => {
    const rest = asks.filter((x) => x.id !== a.id)
    known.current.delete(a.id)
    setAsks(rest)
    setIndex((i) => Math.min(i, Math.max(0, rest.length - 1)))
    if (rest.length === 0) setOpen(false)
  }, [asks])

  if (asks.length === 0) return null
  const ask = asks[Math.min(index, asks.length - 1)]
  const label = ui.waiting.replace("{n}", String(asks.length))

  return (
    // 773 (the owner, 2026-11-17: «подними его на такую же высоту на какой находится левый индикатор»): bottom-16 like the width
    // badge, so the footer's language switch (35–65 px from the bottom) is free; the ping ring is a picture — it grew to 112 px and
    // took the clicks meant for «RU» (measured with elementFromPoint), so it never catches the pointer.
    <div className="fixed right-4 bottom-16 z-50" data-block="person-ask" data-person-ask-count={asks.length}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="bare" size="bare" aria-label={label} data-person-ask-beacon
            className="relative grid size-14 place-items-center rounded-full border-4 border-warning bg-background text-2xl font-black text-warning shadow-lg transition-transform active:scale-95">
            <span aria-hidden className="pointer-events-none absolute -inset-1 rounded-full border-4 border-warning/40 animate-ping motion-reduce:animate-none" />
            <span aria-hidden>!</span>
            <Badge className="absolute -top-1 -right-1 min-w-5 border-2 border-background px-1 tabular-nums">{asks.length}</Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" sideOffset={12}
          className="w-[min(28rem,calc(100vw-2rem))] border-l-4 border-l-warning p-4 shadow-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onPointerEnter={() => setTouched(true)} onFocusCapture={() => setTouched(true)}>
          <PersonAskCard ask={ask} index={Math.min(index, asks.length - 1)} total={asks.length} ui={ui} busy={busy} url={url} onSaved={saved}
            onStep={(d) => { setTouched(true); setIndex((i) => (i + d + asks.length) % asks.length) }}
            onCollapse={() => setOpen(false)} onDone={(a) => { void done(a) }} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
