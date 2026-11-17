"use client"
// @local — the fourth rung of the main domain (step 775): every element's subdomain on the main domain and whether it answers, by a press

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"
import type { DomainListWords } from "./domain-list.i18n"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Row = { id: string; name: string; host: string; answers: boolean }

// The owner, 2026-11-17: «не хватает четвёртого шага который показывает активацию субдоменов для каждого элемента». Asked of the node's
// door `/api/domain/subdomains` only when the person presses — a check of every element's address takes seconds and is never automatic.
export function DomainSubdomains({ lang, words: w }: { lang: string; words: DomainListWords }) {
  const p = w.pipe
  const [rows, setRows] = useState<Row[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function check() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/domain/subdomains?lang=${lang}`, { cache: "no-store" })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; elements?: Row[] } | null
      if (j?.ok && j.elements) setRows(j.elements)
      else setError(`${p.subsFailed} ${j?.error ?? r.status}`)
    } catch { setError(p.subsFailed) }
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-2" data-block="domain-subdomains">
      {rows ? (
        <ul className="flex flex-col gap-1" data-block="domain-subdomains-list">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-2 text-sm" data-subdomain={r.answers ? "ok" : "silent"}>
              {r.answers ? <Check className="size-4 shrink-0 text-success" aria-hidden /> : <X className="size-4 shrink-0 text-destructive" aria-hidden />}
              <span className="font-medium text-foreground">{r.name}</span>
              <a href={`https://${r.host}`} target="_blank" rel="noreferrer noopener" className="font-mono text-muted-foreground underline-offset-4 hover:underline">{r.host}</a>
              <span className={r.answers ? "text-success" : "text-destructive"}>{r.answers ? p.subsAnswers : p.subsSilent}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {rows?.some((r) => !r.answers) ? <Small className="text-muted-foreground">{p.subsHint}</Small> : null}
      <Button type="button" size="sm" variant="outline" className="w-fit" onClick={check} disabled={busy} data-subdomains-check>
        {busy ? p.subsChecking : p.subsCheck}
      </Button>
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
    </div>
  )
}
