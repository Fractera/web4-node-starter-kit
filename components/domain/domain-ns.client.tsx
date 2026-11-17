"use client"
// @local — the name servers of a domain's second rung (step 775): the ones to set at the registrar beside the ones the internet sees now

import { Check, Plus, X } from "lucide-react"
import type { DomainListWords } from "./domain-list.i18n"
import type { PipelineDomain } from "./domain-pipeline.client"

/** Name servers compare without case and the trailing dot (`NS1.Example.com.` == `ns1.example.com`). */
const nsKey = (s: string) => s.trim().toLowerCase().replace(/\.$/, "")
const sameNs = (a: string, b: string) => nsKey(a) === nsKey(b)

// 372 (the owner 2026-10-02): the colour says what to do with a line — a needed server not yet at the registrar is an orange «+» (add),
// one already there a green check; a server seen now that is not wanted — a red cross (remove).
export function DomainNs({ domain: d, words: w }: { domain: PipelineDomain; words: DomainListWords }) {
  const p = w.pipe
  return (
    <div className="flex flex-col gap-2" data-block="domain-ns">
      {d.state !== "active" && <p className="text-sm text-foreground">{p.step2Text}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-[length:var(--fs-small)] text-muted-foreground">{p.assigned}</p>
          <ul className="flex flex-col gap-0.5 font-mono text-sm select-all">
            {(d.nameServers ?? []).map((n) => {
              const here = (d.registrarNs ?? []).some((r) => sameNs(r, n))
              return (
                <li key={n} className={`flex items-center gap-1.5 ${here ? "text-success" : "text-warning"}`} data-ns-state={here ? "ok" : "add"}>
                  {here ? <Check className="size-4 shrink-0" aria-hidden /> : <Plus className="size-4 shrink-0" aria-hidden />}
                  {n}
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <p className="text-[length:var(--fs-small)] text-muted-foreground">{p.atRegistrar}</p>
          {d.registrarNs && d.registrarNs.length > 0 ? (
            <ul className="flex flex-col gap-0.5 font-mono text-sm">
              {d.registrarNs.map((n) => {
                const wanted = (d.nameServers ?? []).some((a) => sameNs(a, n))
                return (
                  <li key={n} className={`flex items-center gap-1.5 ${wanted ? "text-success" : "text-destructive"}`} data-ns-state={wanted ? "ok" : "remove"}>
                    {wanted ? <Check className="size-4 shrink-0" aria-hidden /> : <X className="size-4 shrink-0" aria-hidden />}
                    {n}
                  </li>
                )
              })}
            </ul>
          ) : <p className="text-sm text-muted-foreground">{p.nothingYet}</p>}
        </div>
      </div>
      {d.registrar && <p className="text-sm text-foreground" data-pipe-registrar>{p.registrar} <span className="font-medium">{d.registrar}</span></p>}
      <p className="text-sm text-foreground" data-pipe-ns-match={d.nsMatch ? "yes" : "no"}>{d.state === "active" || d.nsMatch ? p.match : p.noMatch}</p>
    </div>
  )
}
