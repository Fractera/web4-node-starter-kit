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
import { DomainServerPipeline, type ServerDomain } from "./domain-server-pipeline.client"
import { useNodePlace } from "@/components/node-state/use-node-place.client"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** 828-2: `createdZoneId` — the node itself created this domain's zone in Cloudflare (it may leave with the entry) */
export type Extra = ServerDomain & { holder: string | null; holderAddress?: string | null; createdZoneId?: string }

// 372: «active» is the zone's status in Cloudflare; beside it — whether the domain is connected (the node's main one or an element's).
const BADGE: Record<string, string> = {
  active: "border-success/50 text-success",
  pending: "border-border text-muted-foreground",
}

type Props = {
  lang: string
  /** 775: the one modal's chrome words, chosen on the server (`appDialogUi(lang)`) */
  dialogUi: AppDialogUi
  /** 775: the section this list belongs to — the main domain's candidates («main») or the elements' domains («element») */
  role: "main" | "element"
  domains: Extra[]
  primaryName: string | null
  architect: boolean | null
  words: DomainListWords
  ladderWords: DomainLadderWords
  onChanged: () => Promise<void>
}

export function DomainCards({ lang, dialogUi, role, domains, primaryName, architect, words: w, ladderWords, onChanged }: Props) {
  // 775: two add fields on one page — the elements' keeps the id an element's settings link to (#domain-add).
  const addId = role === "main" ? "domain-add-main" : "domain-add"
  // 799: on a server node a card measures public DNS (no Cloudflare, no tunnel) — the node says where it lives, never the address bar.
  const onServer = useNodePlace()?.kind === "server"
  // 775: every row closed until the person opens it (the owner: «первый аккордеон открывается зачем — задания не было»).
  const [open, setOpen] = useState<string>("")
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
  // 828: the name an unregistered one most likely meant (`here` — the node already has it); 828-2: what became of the node's own zone.
  const [closest, setClosest] = useState<{ name: string; here: boolean } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function act(method: "POST" | "DELETE", domain: string, slot: string, detach = false) {
    setBusy(slot)
    setError((e) => ({ ...e, [slot]: "" }))
    setClosest(null)
    setNotice(null)
    try {
      const r = await fetch(`${BASE}/api/domain/list`, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(detach ? { name: domain, detach: true } : method === "POST" ? { name: domain, for: role } : { name: domain }),
      })
      const d = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; domain?: { name: string }; zone?: string | null; closest?: string | null; closestHere?: boolean } | null
      if (d?.ok) {
        setConfirm(null)
        await onChanged()
        if (method === "POST" && d.domain) { setName(""); setOpen(d.domain.name) }
        const fate = d.zone ? ({ deleted: w.pipe.zoneDeleted, "kept-active": w.pipe.zoneKeptActive, "kept-records": w.pipe.zoneKeptRecords, "kept-failed": w.pipe.zoneKeptFailed } as Record<string, string>)[d.zone] : null
        if (method === "DELETE" && fate) setNotice(fate.replace("{domain}", domain))
      } else {
        const code = d?.error ?? String(r.status)
        if (code === "not-registered" && d?.closest) setClosest({ name: d.closest, here: d.closestHere === true })
        setError((e) => ({ ...e, [slot]: w.errors[code] ?? `${w.errors.unknown} ${code}` }))
      }
    } catch {
      setError((e) => ({ ...e, [slot]: w.errors.unknown }))
    }
    setBusy(null)
  }

  const confirmed = confirm ? domains.find((x) => x.name === confirm) ?? null : null

  return (
    <>
    <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="rounded-lg border border-border bg-card" data-block={`domain-cards-${role}`} data-domain-cards={role}>
      {domains.map((d) => {
        const connected = !!d.holder || primaryName === d.name
        return (
          <AccordionItem key={d.name} value={d.name} data-domain-card={d.name} data-domain-state={d.state}>
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              {/* 775 (the owner: «должно быть написано основной домен: далее крупным шрифтом throughsongs.com далее два бейджа … слишком
                  длинный … сокращаем и заканчиваем …»): the section's word, the name large and cut with an ellipsis, then the badges. */}
              <span className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-muted-foreground">{role === "main" ? w.rowMain : w.rowExtra}</span>
                <span className="min-w-0 max-w-full truncate font-mono text-base font-semibold text-foreground" data-domain-name>{d.name}</span>
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
            <AccordionContent className="flex flex-col gap-2 px-4">
              {onServer ? (
                <DomainServerPipeline lang={lang} domain={d} holder={d.holder} forItem={forItem} words={w} onChanged={onChanged} />
              ) : (
                <DomainPipeline lang={lang} role={role} holder={d.holder ? d.holderAddress ?? d.holder : null} domain={d} words={w} ladderWords={ladderWords} onChanged={onChanged} hasPrimary={!!primaryName} forItem={forItem} architect={architect} />
              )}
              {/* 775 (the owner, 2026-11-17: «кнопку убрать из списка должно быть красный тревожный и должна вызывать обязательно
                  подтверждающий модальное окно»): red, and the one modal of the product asks first. */}
              <Button type="button" variant="destructive" size="sm" className="w-fit" onClick={() => setConfirm(d.name)} disabled={busy !== null} data-domain-remove>
                {d.holder ? w.detachRemove : w.remove}
              </Button>
              {error[d.name] && <p className="text-sm text-destructive" role="alert">{error[d.name]}</p>}
            </AccordionContent>
          </AccordionItem>
        )
      })}

      {/* 775 (the owner, 2026-11-17: «у нас сейчас домен уже добавлен? мы можем добавить ещё один основной домен?»): the node has ONE main
          domain — the main section offers its add row only while it holds no domain at all; the elements' section always. */}
      {(role === "element" || domains.length === 0) && (
        <AccordionItem value="add" data-domain-card="add">
          <AccordionTrigger className="px-4 py-3"><span className="font-medium">+ {role === "main" ? w.addMainTitle : w.addExtraTitle}</span></AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2 px-4">
            <Label htmlFor={addId}>{role === "main" ? w.addMainLabel : w.addLabel}</Label>
            <div className="flex flex-wrap gap-2" data-block="domain-add-row">
              <Input id={addId} className="max-w-72 font-mono" value={name} onChange={(e) => setName(e.target.value)} placeholder="mybrand.com" autoComplete="off" spellCheck={false} />
              <Button type="button" size="sm" onClick={() => act("POST", name, "add")} disabled={!name.trim() || busy !== null} data-domain-add>
                {busy === "add" ? w.adding : w.add}
              </Button>
            </div>
            {error.add && <p className="text-sm text-destructive" role="alert">{error.add}</p>}
            {closest && (closest.here ? (
              <p className="text-sm text-muted-foreground" data-domain-closest-here>{w.pipe.closestHere.replace("{name}", closest.name)}</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2" data-block="domain-closest" data-domain-closest={closest.name}>
                <p className="text-sm text-foreground">{w.pipe.didYouMean.replace("{name}", closest.name)}</p>
                <Button type="button" size="sm" variant="outline" onClick={() => { setName(closest.name); void act("POST", closest.name, "add") }} disabled={busy !== null}>
                  {w.pipe.addClosest.replace("{name}", closest.name)}
                </Button>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
    {notice && <p className="text-sm text-foreground" role="status" data-domain-zone-fate>{notice}</p>}
    <AppDialog
      open={confirm !== null}
      onOpenChange={(o) => { if (!o) setConfirm(null) }}
      title={confirmed ? (confirmed.holder ? w.detachRemove : w.remove) : ""}
      ui={dialogUi}
      footer={
        <>
          <Button variant="outline" onClick={() => setConfirm(null)}>{w.cancel}</Button>
          <Button variant="destructive" disabled={busy !== null} onClick={() => confirmed && act("DELETE", confirmed.name, confirmed.name, !!confirmed.holder)} data-domain-remove-yes>
            {busy && confirmed && busy === confirmed.name ? w.detaching : confirmed?.holder ? w.detachRemoveYes : w.removeYes}
          </Button>
        </>
      }
    >
      <p className="text-sm text-foreground text-pretty">
        {/* 828-2: a zone the node created leaves with the entry while empty and inactive — the dialog says so instead of «not touched» */}
        {confirmed ? (confirmed.holder ? w.detachConfirm.replace("{domain}", confirmed.name).replace("{element}", confirmed.holderAddress ?? confirmed.holder) : (confirmed.createdZoneId ? w.pipe.ownZoneNote : w.removeConfirm).replace("{domain}", confirmed.name)) : ""}
      </p>
    </AppDialog>
    </>
  )
}
