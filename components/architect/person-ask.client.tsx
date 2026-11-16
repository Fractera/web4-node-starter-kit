"use client"
// @local — the core panel's action request window (761-16); the elements' own windows are 761-16's next substep, through their template

import Link from "next/link"
import { useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PersonAskUi } from "./person-ask.i18n"

// ДЕЙСТВИЕ ЧЕЛОВЕКА — ОКНО ВНИЗУ КАЖДОЙ СТРАНИЦЫ ПУЛЬТА (узел, шаг 761-16). Владелец 2026-11-16: «уведомление на экране которое
// невозможно пропустить в котором ты меня призываешь совершить определённое действие и подтвердить о его завершении»; «вся верхняя
// часть экрана очень сильно занята … уведомление лучше показывать снизу». Запрос главного агента (`npm run ask-person`) — оранжевое
// уведомление проекта (Sonner, нижний правый угол, без срока): что сделать, почему только вы, «Открыть» и «Готово». «Готово» будит
// главного агента (`/api/node/person-asks`). Закрытое крестиком возвращается через минуту, пока запрос открыт.
// Свежесть: открытие страницы, возврат на вкладку и раз в 15 секунд, пока вкладка видна, — слово владельца «невозможно пропустить»:
// запрос появляется, пока человек смотрит на экран, а не после перехода.

type Ask = { id: string; text: string; href: string | null; why: string | null; hint?: string | null; copy?: string | null; byName?: string | null }

const POLL_MS = 15_000
const BACK_MS = 60_000
const toastId = (id: string) => `person-ask-${id}`

export function PersonAsk({ url, ui }: { url: string; ui: PersonAskUi }) {
  const shown = useRef(new Set<string>())
  const closedAt = useRef(new Map<string, number>())

  const confirm = useCallback(async (a: Ask) => {
    try {
      const r = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id }) })
      const d = (await r.json().catch(() => null)) as { ok?: boolean } | null
      if (!r.ok || !d?.ok) throw new Error(String(r.status))
      toast.dismiss(toastId(a.id))
      shown.current.delete(a.id)
      toast.success(ui.sent)
    } catch {
      toast.error(ui.failed)
    }
  }, [url, ui])

  const show = useCallback((a: Ask) => {
    toast.warning(ui.title, {
      id: toastId(a.id),
      duration: Infinity,
      description: (
        <span className="flex flex-col gap-1" data-block="person-ask-body" data-person-ask={a.id}>
          {a.byName && <span data-person-ask-by>{ui.from.replace("{name}", a.byName)}</span>}
          <span className="font-medium text-foreground">{a.text}</span>
          {a.why && <span>{a.why}</span>}
          {a.hint && <span className="border-l-2 border-warning pl-2" data-person-ask-hint>{ui.hint} {a.hint}</span>}
          {a.copy && (
            <span className="flex flex-col gap-1" data-person-ask-copy>
              <code className="select-all break-all rounded-sm bg-muted px-2 py-1 font-mono text-xs text-foreground">{a.copy}</code>
              <Button type="button" variant="outline" size="xs" className="self-start"
                onClick={() => { void navigator.clipboard.writeText(a.copy ?? "").then(() => toast.success(ui.copied), () => toast.error(ui.failed)) }}>
                <Copy data-icon aria-hidden />{ui.copy}
              </Button>
            </span>
          )}
          {a.href && (
            a.href.startsWith("/")
              ? <Link href={a.href} className="font-medium underline underline-offset-4">{ui.open}</Link>
              : <a href={a.href} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">{ui.open}</a>
          )}
        </span>
      ),
      action: { label: ui.done, onClick: () => { void confirm(a) } },
      onDismiss: () => { closedAt.current.set(a.id, Date.now()); shown.current.delete(a.id) },
    })
    shown.current.add(a.id)
  }, [ui, confirm])

  // a guest or a signed-in non-architect gets 401/403 once — then this page asks no more (no refusal every 15 s in the console)
  const refused = useRef(false)
  const refresh = useCallback(() => {
    if (refused.current) return
    fetch(url, { cache: "no-store", credentials: "include" })
      .then((r) => { if (r.status === 401 || r.status === 403) refused.current = true; return r.ok ? r.json() : null })
      .then((d: { ok?: boolean; asks?: Ask[] } | null) => {
        if (!d?.ok) return
        const open = new Set((d.asks ?? []).map((a) => a.id))
        for (const id of shown.current) if (!open.has(id)) { toast.dismiss(toastId(id)); shown.current.delete(id) }
        for (const a of d.asks ?? []) {
          const closed = closedAt.current.get(a.id)
          if (shown.current.has(a.id) || (closed && Date.now() - closed < BACK_MS)) continue
          show(a)
        }
      })
      .catch(() => {})
  }, [url, show])

  useEffect(() => {
    refresh()
    const onVisible = () => { if (document.visibilityState === "visible") refresh() }
    document.addEventListener("visibilitychange", onVisible)
    const t = window.setInterval(() => { if (document.visibilityState === "visible") refresh() }, POLL_MS)
    return () => { document.removeEventListener("visibilitychange", onVisible); window.clearInterval(t) }
  }, [refresh])

  return null
}
