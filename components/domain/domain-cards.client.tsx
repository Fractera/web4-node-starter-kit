"use client"
// @local — the accordion of the node's domains with «+ Добавить домен» (step 775): one section of the domain page holds it — the main
// domain's path while the node has none, the additional domains once it has one

import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DomainListWords } from "./domain-list.i18n"
import type { DomainLadderWords } from "./domain-ladder.i18n"
import { DomainPipeline, type PipelineDomain } from "./domain-pipeline.client"
import { DangerConfirm } from "./danger-confirm"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export type Extra = PipelineDomain & { holder: string | null; holderAddress?: string | null }

// 372: «active» is the zone's status in Cloudflare; beside it — whether the domain is connected (the node's main one or an element's).
const BADGE: Record<string, string> = {
  active: "border-success/50 text-success",
  pending: "border-border text-muted-foreground",
}

type Props = {
  lang: string
  /** 775: the section this list belongs to — the main domain's candidates («main») or the elements' domains («element») */
  role: "main" | "element"
  domains: Extra[]
  primaryName: string | null
  architect: boolean | null
  words: DomainListWords
  ladderWords: DomainLadderWords
  onChanged: () => Promise<void>
}

export function DomainCards({ lang, role, domains, primaryName, architect, words: w, ladderWords, onChanged }: Props) {
  // 775: two add fields on one page — the elements' keeps the id an element's settings link to (#domain-add).
  const addId = role === "main" ? "domain-add-main" : "domain-add"
  const [open, setOpen] = useState<string>(domains[0]?.name ?? "")
  // 443-4: came from an element's settings (`?for=<id>`) — a ready domain's link leads back to that element's «Домен».
  const [forItem, setForItem] = useState<string | null>(null)
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("for")
    if (v && /^[a-z0-9-]{1,64}$/.test(v)) setForItem(v)
  }, [])
  // 443: an address with #domain-add opens the add card.
  useEffect(() => {
    const follow = () => {
      if (role !== "element" || window.location.hash !== "#domain-add") return
      setOpen("add")
      requestAnimationFrame(() => document.getElementById("domain-add")?.closest("[data-domain-card]")?.scrollIntoView({ block: "center" }))
    }
    follow()
    window.addEventListener("hashchange", follow)
    return () => window.removeEventListener("hashchange", follow)
  }, [role])
  const [name, setName] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<Record<string, string>>({})
  // 373-1: a domain connected to an element is removed after a confirmation inside its card (the element named).
  const [confirm, setConfirm] = useState<string | null>(null)

  async function act(method: "POST" | "DELETE", domain: string, slot: string, detach = false) {
    setBusy(slot)
    setError((e) => ({ ...e, [slot]: "" }))
    try {
      const r = await fetch(`${BASE}/api/domain/list`, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(detach ? { name: domain, detach: true } : method === "POST" ? { name: domain, for: role } : { name: domain }),
      })
      const d = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; domain?: { name: string } } | null
      if (d?.ok) {
        setConfirm(null)
        await onChanged()
        if (method === "POST" && d.domain) { setName(""); setOpen(d.domain.name) }
      } else {
        const code = d?.error ?? String(r.status)
        setError((e) => ({ ...e, [slot]: w.errors[code] ?? `${w.errors.unknown} ${code}` }))
      }
    } catch {
      setError((e) => ({ ...e, [slot]: w.errors.unknown }))
    }
    setBusy(null)
  }

  return (
    <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="rounded-lg border border-border px-3" data-block={`domain-cards-${role}`} data-domain-cards={role}>
      {domains.map((d) => {
        const connected = !!d.holder || primaryName === d.name
        return (
          <AccordionItem key={d.name} value={d.name} data-domain-card={d.name} data-domain-state={d.state}>
            <AccordionTrigger>
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-mono">{d.name}</span>
                <span className={`rounded-md border px-1.5 text-[length:var(--fs-small)] ${BADGE[d.state] ?? "border-destructive/40 text-destructive"}`}>
                  {d.state === "pending" && d.status ? d.status : d.state}
                </span>
                <span
                  className={`rounded-md border px-1.5 text-[length:var(--fs-small)] ${connected ? "border-success/50 text-success" : "border-border text-muted-foreground"}`}
                  data-domain-connected={connected ? "yes" : "no"}
                >
                  {connected ? w.connected : w.notConnected}
                </span>
                {d.holder && <span className="text-[length:var(--fs-small)] text-muted-foreground">→ {d.holderAddress ?? d.holder}</span>}
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <DomainPipeline lang={lang} role={role} domain={d} words={w} ladderWords={ladderWords} onChanged={onChanged} hasPrimary={!!primaryName} forItem={forItem} architect={architect} />
              {d.holder && <p className="text-sm text-foreground">{w.attachedTo} <span className="font-mono">{d.holderAddress ?? d.holder}</span></p>}
              {d.holder && confirm === d.name ? (
                <DangerConfirm id="domain-detach" text={w.detachConfirm.replace("{domain}", d.name).replace("{element}", d.holderAddress ?? d.holder)}
                  yes={busy === d.name ? w.detaching : w.detachRemoveYes} cancel={w.cancel} busy={busy !== null}
                  onYes={() => act("DELETE", d.name, d.name, true)} onCancel={() => setConfirm(null)} />
              ) : (
                <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => (d.holder ? setConfirm(d.name) : act("DELETE", d.name, d.name))} disabled={busy !== null} data-domain-remove>
                  {d.holder ? w.detachRemove : w.remove}
                </Button>
              )}
              {error[d.name] && <p className="text-sm text-destructive" role="alert">{error[d.name]}</p>}
            </AccordionContent>
          </AccordionItem>
        )
      })}

      <AccordionItem value="add" data-domain-card="add">
        <AccordionTrigger><span className="font-medium">+ {w.addTitle}</span></AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2">
          <Label htmlFor={addId}>{role === "main" ? w.addMainLabel : w.addLabel}</Label>
          <div className="flex flex-wrap gap-2" data-block="domain-add-row">
            <Input id={addId} className="max-w-72 font-mono" value={name} onChange={(e) => setName(e.target.value)} placeholder="mybrand.com" autoComplete="off" spellCheck={false} />
            <Button type="button" size="sm" onClick={() => act("POST", name, "add")} disabled={!name.trim() || busy !== null} data-domain-add>
              {busy === "add" ? w.adding : w.add}
            </Button>
          </div>
          {error.add && <p className="text-sm text-destructive" role="alert">{error.add}</p>}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
