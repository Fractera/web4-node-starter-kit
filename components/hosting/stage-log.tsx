// @part stage-log — the live list of a long operation's stages: each with done, running, failed or skipped, its label and its detail
import { Check, Minus, X } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

// THE STAGES OF A LONG OPERATION (node step 737-7). The stages come from the operation itself (a server script's JSON lines, mirrored by
// the move runner) — this list only shows them; a label it does not know is shown by the stage's own id, never hidden.

export type Stage = { id: string; state: string; at?: string; detail?: string }

export function StageLog({ stages, labels }: { stages: Stage[]; labels: Record<string, string> }) {
  if (stages.length === 0) return null
  return (
    <ul className="mt-3 flex flex-col gap-1.5" data-block="stage-log">
      {stages.map((s) => (
        <li key={s.id} className="flex items-start gap-2 text-sm" data-stage={s.id} data-state={s.state}>
          <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center">
            {s.state === "done" ? <Check className="size-4 text-primary" aria-hidden />
              : s.state === "running" ? <Spinner className="size-4 text-muted-foreground" />
              : s.state === "failed" ? <X className="size-4 text-destructive" aria-hidden />
              : <Minus className="size-4 text-muted-foreground" aria-hidden />}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className={s.state === "failed" ? "text-destructive" : "text-foreground"}>{labels[s.id] ?? s.id}</span>
            {s.detail && s.state !== "done" ? <span className="break-all font-mono text-muted-foreground text-xs">{s.detail.slice(-400)}</span> : null}
            {s.detail && s.state === "done" && s.detail !== "dry run" && s.detail.length < 120 ? <span className="text-muted-foreground text-xs">{s.detail}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  )
}
