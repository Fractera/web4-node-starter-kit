"use client"
// @part ladder-step — a step ladder with one rung open at a time (an accordion): a done rung is one line of what it did, a locked rung one muted line of what opens it; and the older single rung with its grey line
import { Check, Lock, TriangleAlert } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { type ReactNode, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { H3 } from "@/components/ui/typography"
import { currentOf, openOf } from "@/lib/hosting/ladder-rule.mjs"
import { cn } from "@/lib/utils"

// THE LADDER (node step 744-7, D46, D47). The owner, 2026-11-14: «каждый следующий шаг заблокирован до предыдущего … реализуй шаги в
// формате аккордеона … только один шаг должен быть открыты все остальные должны быть скрыты».
// 🔒 WHICH RUNG IS OPEN IS THE RULE'S (`lib/hosting/ladder-rule.mjs`), never the page's: a page only says what each rung has done. The
// ladder stands on its current rung and follows it when a rung becomes done; a done rung opens again to look back (one at a time); a
// locked rung cannot open — its line says what opens it (the law of 259-1, the owner's words 2026-09-17: a hidden rung without it reads
// «непонятно что делать»). A closed rung's body is not mounted: a body keeps nothing it cannot ask again.
// The older `LadderStep` / `LadderLocked` stay for the computer's own domain ladder until it moves here (745, D47).

/** `warn` — a rung passed without its result (skipped, «later»): the ladder goes on past it, its mark is an orange «!», never a check. */
/** `error` (775, the owner 2026-11-17: «внутри есть ошибка — голубой кружок не покраснел»): a problem measured inside the rung — its mark turns red with «!». */
/** `busy` — the rung's work runs right now (the server's installation): its mark turns, so a closed rung still shows it (Telegram 173). */
export type Rung = { id: string; title: string; done: boolean; warn?: boolean; error?: boolean; busy?: boolean; summary?: string | null; body: ReactNode }
type RungState = "done" | "warn" | "error" | "current" | "locked"

/** `focus` — a rung a body sends the person back to on purpose («take a subdomain instead»); without it the ladder follows its current rung. */
/** `className` (800-2) — a ladder inside another card drops its own frame («rounded-none border-0 bg-transparent»). */
export function Ladder({ id, rungs, locked, focus = null, className }: { id: string; rungs: Rung[]; locked: string; focus?: string | null; className?: string }) {
  const open = openOf(rungs)
  const aim = focus ?? currentOf(rungs) ?? ""
  const [value, setValue] = useState(aim)
  const [followed, setFollowed] = useState(aim)
  if (followed !== aim) {
    setFollowed(aim)
    setValue(aim)
  }
  return (
    <Accordion className={cn("rounded-lg border border-border bg-card", className)} collapsible data-block={`ladder-${id}`} onValueChange={setValue} type="single" value={value}>
      {rungs.map((r, i) => {
        // 762 (the owner, 2026-11-16: «должен гореть оранжевым восклицательным знаком даже если мы его пропускаем а голубую галочку … когда Telegram будет действительно установлен»)
        const state: RungState = !open[i] ? "locked" : r.error ? "error" : r.done ? (r.warn ? "warn" : "done") : "current"
        return (
          <AccordionItem data-block={`ladder-${id}-${r.id}`} data-rung={state} data-step={i + 1} disabled={!open[i]} key={r.id} value={r.id}>
            <AccordionTrigger className="px-4 py-3 disabled:opacity-100 [&:disabled>svg]:hidden [&>svg]:translate-y-1">
              <span className="flex min-w-0 items-start gap-3">
                <RungMark busy={r.busy === true && state !== "locked" && state !== "error"} n={i + 1} state={state} />
                <span className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                  <span className={state === "current" ? "font-semibold text-foreground" : state === "done" || state === "warn" ? "text-foreground" : "text-muted-foreground"}>{r.title}</span>
                  {(state === "done" || state === "warn") && r.summary && value !== r.id ? <span className="break-words font-normal text-muted-foreground">{r.summary}</span> : null}
                  {state === "locked" ? (
                    <span className="flex items-center gap-1.5 font-normal text-muted-foreground">
                      <Lock aria-hidden className="size-3.5 shrink-0" />
                      {locked}
                    </span>
                  ) : null}
                </span>
              </span>
            </AccordionTrigger>
            {open[i] ? <AccordionContent className="flex flex-col gap-3 pr-4 pl-13" data-block={`ladder-${id}-${r.id}-body`}>{r.body}</AccordionContent> : null}
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

/** The rung's mark: a check when done, an orange «!» when passed without its result, its number in the accent where the ladder stands, a muted number while locked. */
function RungMark({ n, state, busy = false }: { n: number; state: RungState; busy?: boolean }) {
  // the owner, Telegram 173 (2026-11-20): «для этого единственного аккордеона заменить голубую галочку на индикатор загрузки Loader который вращается»
  if (busy) return <Spinner aria-hidden className="size-6 shrink-0 text-primary" data-block="ladder-rung-busy" role={undefined} />
  const look = state === "done" ? "bg-primary text-primary-foreground" : state === "warn" ? "bg-warning text-background" : state === "error" ? "bg-destructive text-background" : state === "current" ? "border border-primary text-primary" : "bg-muted text-muted-foreground"
  return (
    <span aria-hidden className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums", look)}>
      {state === "done" ? <Check className="size-3.5" /> : state === "warn" || state === "error" ? <span className="font-bold">!</span> : n}
    </span>
  )
}

// THE RUNG OF A LADDER (node step 737-7), taken out of the domain ladder's own copy (`components/domain/domain-ladder.client.tsx`, 259-1)
// for the move ladder and every ladder after it; since 744-7 only that domain ladder uses it. Its law, paid by the owner's words
// 2026-09-17: a rung opens when the one before it is done; in place of a closed one stands a grey line naming WHAT appears there and AFTER
// WHAT — a hidden rung without it reads «непонятно что делать».
export function LadderStep({ children, done, n, title, id }: { children: ReactNode; done?: boolean; n: number; title: string; id?: string }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4" data-block={id ? `ladder-step-${id}` : "ladder-step"} data-step={n} data-done={done ? "1" : "0"}>
      <H3 className="mb-2 flex items-center gap-2" variant="ui">
        <span className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {done ? <Check className="size-3.5" aria-hidden /> : n}
        </span>
        {title}
      </H3>
      {children}
    </section>
  )
}

/** The grey line in place of a closed rung: what appears here and after what. */
export function LadderLocked({ n, text, title }: { n: number; text: string; title?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border border-dashed px-4 py-3 text-muted-foreground text-sm" data-block="ladder-locked" data-step-locked={n}>
      <TriangleAlert className="size-4 shrink-0" aria-hidden />
      {title ? <span className="font-medium">{n}. {title}</span> : null}
      <span>{title ? `— ${text}` : text}</span>
    </div>
  )
}
