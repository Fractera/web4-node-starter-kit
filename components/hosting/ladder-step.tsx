// @part ladder-step — one numbered rung of a step ladder: its number or a check, its title, its body; and the grey line that stands in place of a rung not open yet
import { Check, TriangleAlert } from "lucide-react"
import type { ReactNode } from "react"
import { H3 } from "@/components/ui/typography"

// THE RUNG OF A LADDER (node step 737-7), taken out of the domain ladder's own copy (`components/domain/domain-ladder.client.tsx`, 259-1)
// for the move ladder and every ladder after it. Its law, paid by the owner's words 2026-09-17: a rung opens when the one before it is done;
// in place of a closed one stands a grey line naming WHAT appears there and AFTER WHAT — a hidden rung without it reads «непонятно что
// делать». The domain ladder takes it too (its own copy removed in 737-7 together with its four raw controls — `check:parts-dup`).

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
