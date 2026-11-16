"use client"
// @local — steps 1–3 of the server's domain ladder (one route: the tab «Выделенный сервер»): the domain, where its records live, who writes them

import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"
import type { LadderView } from "@/components/hosting/server-ladder.client"
import type { LadderWay, ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Small } from "@/components/ui/typography"
import { answersOf, normalWay, wayOf } from "@/lib/hosting/launch-domain.mjs"

// 737-19. Step 1 — the domain, typed once, changed by one button. Step 2 — what the internet answers about it, with no question to the
// person (`lib/hosting/domain-detect.mjs`): where it was bought, who keeps its DNS, where it leads now, its mail, a live site on it.
// Step 3 — who writes the records: one question since 759 (below).

const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

/** 744-7: one line of what each done rung of the domain ladder did — the server's own ladder and step 3 of the launch say it alike. */
export function domainLines(view: LadderView, words: ServerLadderWords) {
  const d = view.detect
  return {
    domain: view.zone ? fill(words.domain.line, { zone: view.zone, ip: view.ip ?? "" }) : null,
    where: d ? `${words.where.dns} ${d.dnsHost === "cloudflare" ? words.where.cloudflare : d.ns.join(", ")}` : null,
    who: view.way ? words.who.option[normalWay(view.way) as LadderWay] : null,
    records: view.dnsAt ? fill(words.records.checkedAt, { time: new Date(view.dnsAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) }) : null,
  }
}

/** The two names of the quick way for this domain: `@` and `*` on an apex, `node` and `*.node` on a subdomain. */
export function quickNames(view: LadderView) {
  const w = view.records[0]?.wildcard?.name ?? "*"
  const at = view.records[0]?.records.find((r) => r.host === view.zone)?.name ?? "@"
  return { at, star: w }
}

export function DomainStep({ view, words, busy, prefill, onSave }: { view: LadderView; words: ServerLadderWords; busy: boolean; prefill: string | null; onSave: (name: string) => unknown }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  useEffect(() => { if (prefill) { setName(prefill); setEditing(true) } }, [prefill])
  const w = words.domain
  const run = view.run && view.run.state !== "done" ? view.run : null

  if (view.zone && !editing) {
    return (
      <div className="flex flex-col gap-2" data-block="server-ladder-domain">
        <div className="flex flex-wrap items-center gap-3">
          <Small className="font-mono text-foreground">{fill(w.line, { zone: view.zone, ip: view.ip ?? "" })}</Small>
          {view.own ? <Small className="text-muted-foreground">{w.own}</Small> : null}
          {view.canType ? <Button disabled={busy} onClick={() => { setName(""); setEditing(true) }} size="sm" variant="ghost">{w.change}</Button> : null}
        </div>
        {run ? <Small className={run.state === "failed" ? "break-all text-destructive" : "text-muted-foreground"}>{words.run[run.state as keyof ServerLadderWords["run"]]} {run.state === "failed" ? run.detail ?? "" : ""}</Small> : null}
      </div>
    )
  }
  if (!view.canType) return <Small className="text-muted-foreground">{w.hint}</Small>
  return (
    <form className="flex flex-col gap-3" data-block="server-ladder-domain-form" onSubmit={(e) => { e.preventDefault(); void onSave(name); setEditing(false) }}>
      <Field>
        <FieldLabel htmlFor="server-ladder-domain">{w.label}</FieldLabel>
        <Input autoComplete="off" id="server-ladder-domain" inputMode="url" onChange={(e) => setName(e.target.value)} placeholder={w.placeholder} spellCheck={false} value={name} />
        <FieldDescription>{w.hint}</FieldDescription>
      </Field>
      <div className="flex gap-2">
        <Button disabled={busy || !name.trim()} size="sm" type="submit">{w.submit}</Button>
        {view.zone ? <Button disabled={busy} onClick={() => setEditing(false)} size="sm" type="button" variant="ghost">{w.cancel}</Button> : null}
      </div>
    </form>
  )
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-2 text-sm" data-block="server-ladder-fact">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground">{children}</span>
    </div>
  )
}

export function WhereStep({ view, words, busy, onAgain, onSub }: { view: LadderView; words: ServerLadderWords; busy: boolean; onAgain: () => unknown; onSub: (name: string) => void }) {
  const d = view.detect
  const w = words.where
  if (!d) return <Small className="text-muted-foreground">{w.checking}</Small>
  const hours = String(Math.max(1, Math.ceil((d.nsTtl ?? 86400) / 3600)))
  const date = d.expires ? new Date(d.expires).toLocaleDateString() : ""
  return (
    <div className="flex flex-col gap-2" data-block="server-ladder-where" data-dns={d.dnsHost}>
      <Fact label={w.bought}>{d.registrar ? `${d.registrar}${date ? `, ${fill(w.paid, { date })}` : ""}` : w.unknown}</Fact>
      <Fact label={w.dns}>{d.dnsHost === "none" ? w.none : d.dnsHost === "cloudflare" ? `${w.cloudflare} (${d.ns.join(", ")})` : d.ns.join(", ")}</Fact>
      <Fact label={fill(w.leads, { name: d.name })}>{fill(w.aKind[d.aKind], { a: d.a.join(", ") })}</Fact>
      <Fact label={w.mail}>{d.mx.length ? fill(w.mailYes, { n: String(d.mx.length) }) : w.mailNo}</Fact>
      {d.changing ? <Small className="text-foreground">{fill(w.changing, { hours })}</Small> : null}
      {d.site && d.aKind !== "server" ? (
        <div className="flex flex-col gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3" data-block="server-ladder-live">
          <Small className="text-foreground">{fill(w.live, { name: d.name, title: d.site.title ?? String(d.site.status) })}</Small>
          {!d.sub && view.canType ? <Button className="w-fit" disabled={busy} onClick={() => onSub(`node.${d.name}`)} size="sm" variant="outline">{w.sub}</Button> : null}
        </div>
      ) : null}
      {view.readOnly ? null : <Button className="w-fit" disabled={busy} onClick={() => void onAgain()} size="sm" variant="ghost">{w.again}</Button>}
    </div>
  )
}

/** The plain text for whoever holds the access (737-19e). */
export function instructionText(view: LadderView, words: ServerLadderWords) {
  const { at, star } = quickNames(view)
  return fill(words.who.instruction, { zone: view.detect?.zone ?? view.zone ?? "", at, star, ip: view.ip ?? "" })
}

type Answer = "yes" | "no"

/** 744-5: one question and its two answers, the chosen one filled; on a read-only view only the answer given. */
function Question({ id, text, value, busy, readOnly, words, onAnswer }: {
  id: string; text: string; value: Answer | null; busy: boolean; readOnly: boolean; words: ServerLadderWords["who"]; onAnswer: (a: Answer) => void
}) {
  return (
    <div className="flex flex-col gap-2" data-answer={value ?? ""} data-block={`server-ladder-who-${id}`}>
      <Small className="text-foreground">{text}</Small>
      {readOnly ? (value ? <Small className="font-medium text-foreground">{words[value]}</Small> : null) : (
        <ButtonGroup>
          {(["yes", "no"] as const).map((a) => <Button disabled={busy} key={a} onClick={() => onAnswer(a)} size="sm" variant={value === a ? "default" : "outline"}>{words[a]}</Button>)}
        </ButtonGroup>
      )}
    </div>
  )
}

// 759 (the owner, 2026-11-16: «единственное возможный вариант подключения только через регистратора»): one question — access to the
// registrar; «no» is not a dead end: the instruction is copied for whoever has it. `wayOf` decides.
export function WhoStep({ view, words, busy, onChoose }: { view: LadderView; words: ServerLadderWords; busy: boolean; onChoose: (way: LadderWay) => unknown }) {
  const [copied, setCopied] = useState(false)
  const [asked, setAsked] = useState<Answer | null>(null)
  const w = words.who
  const way = normalWay(view.way) as LadderWay | null
  const registrar = asked ?? (answersOf(view.way).registrar as Answer | null)
  function answer(a: Answer) {
    setAsked(a)
    const next = wayOf({ registrar: a })
    if (next && next !== way) void onChoose(next)
  }
  return (
    <div className="flex flex-col gap-3" data-block="server-ladder-who" data-way={way ?? ""}>
      <Question busy={busy} id="registrar" onAnswer={answer} readOnly={view.readOnly} text={w.registrar} value={registrar} words={w} />
      {way ? <Small className="text-muted-foreground">{w.note[way]}</Small> : null}
      {way === "none" ? (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3" data-block="server-ladder-instruction">
          <Small className="text-foreground">{instructionText(view, words)}</Small>
          <Button
            className="w-fit"
            onClick={async () => { try { await navigator.clipboard.writeText(instructionText(view, words)); setCopied(true) } catch { setCopied(false) } }}
            size="sm"
            variant="outline"
          >
            {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
            {copied ? w.copied : w.copy}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
