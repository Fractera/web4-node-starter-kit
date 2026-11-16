"use client"
// @local — step 4 «Записи» of the server's domain ladder (one route: the tab «Выделенный сервер»): the quick way and the full list, written by hand at the registrar

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import type { LadderView } from "@/components/hosting/server-ladder.client"
import { quickNames } from "@/components/hosting/server-ladder-steps.client"
import type { ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Small } from "@/components/ui/typography"

// 737-19. The owner, 2026-11-13: «сделать выпадающие список два аккордеона быстрые и удобный способ с инструкций с небольшой второй
// вариант полный список» — and his anger at the first build: the hard way first, the easy one «в качестве комментария вне читаемость
// строке без Примеров». Here the quick way stands first and open: three short steps, the two records with copy buttons, what @ and *
// mean on THIS domain, and the separate records that would beat the star (from the last DNS check). The full list is the alternative.

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

// 759 (the owner, 2026-11-16: «единственное возможный вариант подключения только через регистратора»): the node writes no record and
// names no other place — the person writes them where the domain's DNS is kept, then «Check DNS».
export function RecordsStep({ view, words, busy, onCheck }: { view: LadderView; words: ServerLadderWords; busy: boolean; onCheck: () => unknown }) {
  const w = words.records
  const d = view.detect
  const name = view.zone ?? ""
  const { at, star } = quickNames(view)
  const all = view.records[0]?.records ?? []
  const sample = all.filter((r) => r.host !== view.zone && r.kind !== "www").slice(0, 2).map((r) => r.host).join(", ")
  const registrar = d?.registrar ? ` (${d.registrar})` : ""
  const conflicts = all.filter((r) => view.dns[r.host] === "elsewhere" || view.dns[r.host] === "aaaa").map((r) => r.name)
  const map = { zone: d?.zone ?? name, name, ip: view.ip ?? "", at, star, example: sample, ns: (d?.ns ?? []).join(", "), registrar }

  return (
    <div className="flex flex-col gap-3" data-block="server-ladder-records">
      <Small className="max-w-prose text-foreground">{fill(w.hereDns, map)}</Small>
      <Accordion collapsible defaultValue="quick" type="single">
        <AccordionItem value="quick">
          <AccordionTrigger>
            <span className="flex items-center gap-2">{w.quick.title}<Badge variant="secondary">{w.quick.badge}</Badge></span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            <ol className="flex list-decimal flex-col gap-1 pl-5 text-foreground text-sm">{w.quick.stepsDns.map((t) => <li key={t}>{fill(t, map)}</li>)}</ol>
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
      {view.readOnly ? null : (
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={busy} onClick={() => void onCheck()} size="sm">{w.check}</Button>
          {view.dnsAt ? <Small className="text-muted-foreground">{fill(w.checkedAt, { time: new Date(view.dnsAt).toLocaleTimeString() })}</Small> : null}
        </div>
      )}
    </div>
  )
}
