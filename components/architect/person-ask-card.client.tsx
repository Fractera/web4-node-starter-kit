"use client"
// @local — the card of the core panel's action request (761-16c, variant C): what one request shows inside the beacon's Popover

import Link from "next/link"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Copy } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import type { PersonAskUi } from "./person-ask.i18n"
import { PersonAskSecret } from "./person-ask-secret.client"

export type AskSecret = { kind: "env" | "openai" | "server-root"; name?: string; where?: string | null; host?: string; port?: number }
export type Ask = { id: string; text: string; href: string | null; why: string | null; hint?: string | null; copy?: string | null; byName?: string | null; secret?: AskSecret | null }

type Props = {
  ask: Ask
  index: number
  total: number
  ui: PersonAskUi
  busy: boolean
  url: string
  onStep: (delta: number) => void
  onCollapse: () => void
  onDone: (a: Ask) => void
  onSaved: (a: Ask) => void
}

// The card is the one thing the person came for: the request's words lead (medium, foreground), the by-line and the reason are muted,
// the hint carries the warning stripe — the only orange inside the card besides the «!», so the colour keeps its meaning.
export function PersonAskCard({ ask, index, total, ui, busy, url, onStep, onCollapse, onDone, onSaved }: Props) {
  const copy = () => {
    void navigator.clipboard.writeText(ask.copy ?? "").then(() => toast.success(ui.copied), () => toast.error(ui.failed))
  }
  return (
    <div className="flex flex-col gap-3" data-block="person-ask-card" data-person-ask={ask.id}>
      <div className="flex items-center gap-2" data-block="person-ask-head">
        <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-warning text-sm font-bold text-warning">!</span>
        <span className="flex-1 text-sm font-semibold">{ui.title}</span>
        {total > 1 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums" data-block="person-ask-counter" data-person-ask-counter>
            <Button type="button" variant="ghost" size="icon-xs" aria-label={ui.prev} onClick={() => onStep(-1)}><ChevronLeft data-icon aria-hidden /></Button>
            {ui.counter.replace("{i}", String(index + 1)).replace("{n}", String(total))}
            <Button type="button" variant="ghost" size="icon-xs" aria-label={ui.next} onClick={() => onStep(1)}><ChevronRight data-icon aria-hidden /></Button>
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 text-sm" data-block="person-ask-body">
        {ask.byName && <span className="text-xs text-muted-foreground" data-person-ask-by>{ui.from.replace("{name}", ask.byName)}</span>}
        <span className="font-medium text-foreground text-pretty">{ask.text}</span>
        {ask.why && <span className="text-muted-foreground text-pretty">{ask.why}</span>}
        {ask.hint && <span className="border-l-2 border-warning pl-2 text-muted-foreground text-pretty" data-person-ask-hint>{ui.hint} {ask.hint}</span>}
        {ask.copy && (
          <span className="flex flex-col gap-1" data-block="person-ask-copy" data-person-ask-copy>
            <code className="select-all break-all rounded-sm bg-muted px-2 py-1 font-mono text-xs text-foreground">{ask.copy}</code>
            <Button type="button" variant="outline" size="xs" className="self-start" onClick={copy}><Copy data-icon aria-hidden />{ui.copy}</Button>
          </span>
        )}
      </div>
      {/* 768: a secret is typed here and «Сохранить» closes the request — no «Готово» without it */}
      {ask.secret && <PersonAskSecret ask={ask} ui={ui} url={url} onSaved={onSaved} />}
      <div className="flex flex-wrap items-center justify-end gap-2" data-block="person-ask-actions">
        <Button type="button" variant="ghost" size="sm" onClick={onCollapse}>{ui.collapse}</Button>
        {ask.href && (
          ask.href.startsWith("/")
            ? <Link href={ask.href} className={buttonVariants({ variant: "outline", size: "sm" })}>{ui.open}</Link>
            : <a href={ask.href} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>{ui.open}</a>
        )}
        {!ask.secret && <Button type="button" size="sm" disabled={busy} onClick={() => onDone(ask)} data-person-ask-done>{ui.done}</Button>}
      </div>
    </div>
  )
}
