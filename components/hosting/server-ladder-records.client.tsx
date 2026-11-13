"use client"
// @local — step 4 «Записи» of the server's domain ladder (one route: the tab «Выделенный сервер»): the quick way, the alternative, the node's own write, the way back to the registrar

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { DomainLadderWords } from "@/components/domain/domain-ladder.i18n"
import { keyReasonText } from "@/components/domain/key-reason"
import { TokenHowTo } from "@/components/domain/token-how-to.client"
import type { LadderView } from "@/components/hosting/server-ladder.client"
import { quickNames } from "@/components/hosting/server-ladder-steps.client"
import type { ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import { WhyNotCloudflare } from "@/components/hosting/why-not-cloudflare.client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Small } from "@/components/ui/typography"

// 737-19. The owner, 2026-11-13: «сделать выпадающие список два аккордеона быстрые и удобный способ с инструкций с небольшой второй
// вариант полный список» — and his anger at the first build: the hard way first, the easy one «в качестве комментария вне читаемость
// строке без Примеров». Here the quick way stands first and open: three short steps, the two records with copy buttons, what @ and *
// mean on THIS domain, and the separate records that would beat the star (from the last DNS check). The full list is the alternative.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)
const tone = (s: string) => (s === "ok" ? "default" : s === "unchecked" ? "outline" : s === "unknown" ? "secondary" : "destructive") as "default" | "outline" | "secondary" | "destructive"

function CopyButton({ value, label, done }: { value: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      aria-label={`${copied ? done : label}: ${value}`}
      onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { setCopied(false) } }}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}

function Records({ rows, view, words, withState }: { rows: Array<{ name: string; host: string; optional?: boolean }>; view: LadderView; words: ServerLadderWords["records"]; withState: boolean }) {
  const t = words.table
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.type}</TableHead>
          <TableHead>{t.name}</TableHead>
          <TableHead>{t.value}</TableHead>
          {withState ? <TableHead>{t.state}</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => {
          const s = view.dns[r.host] ?? "unchecked"
          return (
            <TableRow data-host={r.host} key={r.host}>
              <TableCell className="font-mono">A</TableCell>
              <TableCell className="font-mono">
                {r.name}<CopyButton done={t.copied} label={t.copy} value={r.name} />
                {r.optional ? <span className="ml-1 font-sans text-muted-foreground text-xs">{t.optional}</span> : null}
              </TableCell>
              <TableCell className="font-mono">{view.ip}<CopyButton done={t.copied} label={t.copy} value={view.ip ?? ""} /></TableCell>
              {withState ? <TableCell><Badge variant={tone(s)}>{words.state[s as keyof typeof words.state] ?? s}</Badge></TableCell> : null}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

function Auto({ view, words, keyWords, busy, dialogUi, onWrite, onKeySaved }: { view: LadderView; words: ServerLadderWords["records"]["auto"]; keyWords: DomainLadderWords; busy: boolean; dialogUi: AppDialogUi; onWrite: () => Promise<unknown>; onKeySaved: () => unknown }) {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState("")
  const [refused, setRefused] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const map = { zone: view.zone ?? "", ip: view.ip ?? "" }
  async function saveKey() {
    setRefused("")
    const r = await fetch(`${BASE}/api/domain/key`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }) }).catch(() => null)
    const a = (await r?.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
    setToken("")
    if (a?.ok) await onKeySaved()
    else setRefused(keyReasonText(keyWords, a?.reason ?? "network"))
  }
  async function write() {
    setOpen(false)
    const a = (await onWrite()) as { ok?: boolean; results?: Array<{ host: string; ok: boolean; reason?: string }>; reason?: string } | null
    const bad = a?.results?.filter((x) => !x.ok) ?? []
    setResult(a?.ok ? fill(words.done, { n: String(a.results?.length ?? 0) }) : `${words.failed} ${bad.map((x) => `${x.host} (${x.reason})`).join(", ") || a?.reason || ""}`)
  }
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3" data-block="server-ladder-auto">
      <p className="font-medium text-foreground text-sm">{words.title}</p>
      <Small className="text-muted-foreground">{words.text}</Small>
      {view.key ? (
        <Button className="w-fit" disabled={busy} onClick={() => setOpen(true)} size="sm">{words.button}</Button>
      ) : (
        <div className="flex flex-col gap-2" data-block="server-ladder-key">
          <Small className="text-foreground">{words.noKey}</Small>
          <TokenHowTo words={keyWords} />
          <Field>
            <FieldLabel htmlFor="server-ladder-key">{words.keyLabel}</FieldLabel>
            <div className="flex gap-2">
              <Input autoComplete="off" id="server-ladder-key" onChange={(e) => setToken(e.target.value)} spellCheck={false} type="password" value={token} />
              <Button disabled={busy || !token.trim()} onClick={() => void saveKey()} size="sm" type="button">{words.keySave}</Button>
            </div>
          </Field>
          {refused ? <Small className="text-destructive">{refused}</Small> : null}
        </div>
      )}
      {result ? <Small className="break-all text-foreground">{result}</Small> : null}
      <AppDialog
        footer={<><Button onClick={() => setOpen(false)} variant="outline">{words.notNow}</Button><Button onClick={() => void write()}>{words.confirm}</Button></>}
        onOpenChange={setOpen}
        open={open}
        title={fill(words.confirmTitle, map)}
        ui={dialogUi}
      >
        <ul className="flex list-disc flex-col gap-2 pl-5 text-foreground text-sm">{words.confirmItems.map((t) => <li key={t}>{fill(t, map)}</li>)}</ul>
      </AppDialog>
    </div>
  )
}

export function RecordsStep({ view, words, keyWords, busy, dialogUi, onCheck, onWrite, onKeySaved }: {
  view: LadderView; words: ServerLadderWords; keyWords: DomainLadderWords; busy: boolean; dialogUi: AppDialogUi
  onCheck: () => unknown; onWrite: () => Promise<unknown>; onKeySaved: () => unknown
}) {
  const w = words.records
  const d = view.detect
  const cf = view.way === "cloudflare"
  const name = view.zone ?? ""
  const { at, star } = quickNames(view)
  const all = view.records[0]?.records ?? []
  const sample = all.filter((r) => r.host !== view.zone && r.kind !== "www").slice(0, 2).map((r) => r.host).join(", ")
  const registrar = d?.registrar ? ` (${d.registrar})` : ""
  const hours = String(Math.max(1, Math.ceil((d?.nsTtl ?? 86400) / 3600)))
  const conflicts = all.filter((r) => view.dns[r.host] === "elsewhere" || view.dns[r.host] === "aaaa").map((r) => r.name)
  const map = { zone: d?.zone ?? name, name, ip: view.ip ?? "", at, star, example: sample, ns: (d?.ns ?? []).join(", "), registrar, hours }

  return (
    <div className="flex flex-col gap-3" data-block="server-ladder-records" data-way={view.way ?? ""}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Small className="max-w-prose text-foreground">{fill(cf ? w.hereCf : view.way === "migrate" ? w.hereMigrate : w.hereDns, map)}</Small>
        <WhyNotCloudflare words={w.why} />
      </div>
      {view.way === "migrate" ? (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3" data-block="server-ladder-migrate">
          <p className="font-medium text-foreground text-sm">{w.migrate.title}</p>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-foreground text-sm">{w.migrate.items.map((t) => <li key={t}>{fill(t, map)}</li>)}</ol>
          {d?.mx.length ? <Small className="break-all text-foreground">{w.migrate.mail} <span className="font-mono">{d.mx.join(" · ")}</span></Small> : null}
          {d?.txt.length ? <Small className="break-all text-foreground">{w.migrate.txt} <span className="font-mono">{d.txt.join(" · ")}</span></Small> : null}
          {d?.ds ? <Small className="text-destructive">{w.migrate.ds}</Small> : null}
          {!d?.mx.length && !d?.txt.length ? <Small className="text-muted-foreground">{w.migrate.nothing}</Small> : null}
        </div>
      ) : null}
      <Accordion collapsible defaultValue="quick" type="single">
        <AccordionItem value="quick">
          <AccordionTrigger>
            <span className="flex items-center gap-2">{w.quick.title}<Badge variant="secondary">{w.quick.badge}</Badge></span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            <ol className="flex list-decimal flex-col gap-1 pl-5 text-foreground text-sm">{(cf ? w.quick.stepsCf : w.quick.stepsDns).map((t) => <li key={t}>{fill(t, map)}</li>)}</ol>
            <Records rows={[{ name: at, host: view.zone ?? "@" }, { name: star, host: `*.${name}` }]} view={view} words={w} withState={false} />
            <ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground text-sm">
              <li><span className="font-mono text-foreground">{at}</span> — {fill(w.quick.at, map)}</li>
              <li><span className="font-mono text-foreground">{star}</span> — {fill(w.quick.star, map)}</li>
            </ul>
            {conflicts.length ? <Small className="text-destructive">{fill(w.quick.conflicts, { ...map, names: conflicts.join(", ") })}</Small> : null}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="full">
          <AccordionTrigger>{w.full.title}</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            <Small className="text-foreground">{fill(w.full.text, map)}</Small>
            <Small className="text-muted-foreground">{fill(w.full.example, map)}</Small>
            <Records rows={all} view={view} words={w} withState />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {cf && !view.readOnly ? <Auto busy={busy} dialogUi={dialogUi} keyWords={keyWords} onKeySaved={onKeySaved} onWrite={onWrite} view={view} words={w.auto} /> : null}
      {view.readOnly ? null : (
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={busy} onClick={() => void onCheck()} size="sm">{w.check}</Button>
          {view.dnsAt ? <Small className="text-muted-foreground">{fill(w.checkedAt, { time: new Date(view.dnsAt).toLocaleTimeString() })}</Small> : null}
        </div>
      )}
    </div>
  )
}
