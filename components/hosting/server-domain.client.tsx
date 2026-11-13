"use client"
// @local — the five steps of the server's own domain in the tab «Выделенный сервер» (one route); its pieces are the parts ladder-step, dns-records, stage-log

import { type ReactNode, useCallback, useEffect, useState } from "react"
import { DnsRecords, type DnsRecordState, type DnsZone } from "@/components/hosting/dns-records"
import { LadderLocked, LadderStep } from "@/components/hosting/ladder-step"
import { CertsStep, type CertRow, type CertsRun } from "@/components/hosting/server-domain-certs.client"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { H2, Small } from "@/components/ui/typography"

// THE DOMAIN OF A NODE ON ITS SERVER — FIVE STEPS (node step 737-8). The owner, 2026-11-13: «Позже если пользователь предоставит домен
// … получает сертификаты на каждый из существующих поддоменов … Внизу появится требования прописать записи ко всем существующим доменам
// на регистраторе», and «была вкладка домен которая имела пять шагов … Все было построено и все работало».
// 🔒 THE LADDER LAW: a step opens when the one before it is done; every state is the node's (`/api/node/server/domain`), measured there.
// 🔒 ON THE BARE IP THIS IS A READ-ONLY VIEW — the records to write are visible, no button acts (the door refuses there anyway).
// 🔒 ASKED ONCE ON OPENING, THEN ONLY WHILE CERTIFICATES ARE BEING ISSUED (every 4 s) — and after each act of the person.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Step = keyof ServerDomainWords["step"]
const ORDER: Step[] = ["domain", "dns", "certs", "check", "active"]
type Row = CertRow & { zone: string; label: string; kind: string; https: boolean | null; status: number | null }
type View = {
  ok: boolean; phase: "silent" | "live" | null; readOnly: boolean; reason?: string; zone?: string | null; ip?: string | null
  records?: DnsZone[]; rows?: Row[]; steps?: Record<Step, boolean>; dnsAt?: string | null; checkAt?: string | null; certsRun?: CertsRun; helper?: boolean
}

const dnsTone = (s: string): DnsRecordState["tone"] => (s === "ok" ? "default" : s === "unchecked" ? "outline" : s === "unknown" ? "secondary" : "destructive")
const when = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : "")

export function ServerDomain({ words, fallback }: { words: ServerDomainWords; fallback?: string }) {
  const [view, setView] = useState<View | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")

  // An unanswered request keeps the last known state on screen and asks again (the same lesson as the move ladder, 2026-11-13).
  const [tick, setTick] = useState(0)
  const load = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/node/server/domain`, { cache: "no-store" })
      if (r.ok) setView((await r.json()) as View)
      else setView((v) => v ?? { ok: false, phase: null, readOnly: true })
    } catch {
      setView((v) => v ?? { ok: false, phase: null, readOnly: true })
    } finally {
      setTick((n) => n + 1)
    }
  }, [])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    if (!tick || !view?.certsRun?.running) return
    const t = setTimeout(() => void load(), 4000)
    return () => clearTimeout(t)
  }, [tick, view, load])

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true)
    setError("")
    try {
      const r = await fetch(`${BASE}/api/node/server/domain`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, ...extra }) })
      const a = (await r.json().catch(() => null)) as (View & { reason?: string }) | null
      if (!r.ok && a?.reason) setError(words.reason[a.reason] ?? a.reason)
      if (a?.steps) setView((v) => ({ ...(v as View), ...a }))
      else await load()
    } finally {
      setBusy(false)
    }
  }

  if (!view) return <Small className="text-muted-foreground" data-block="server-domain-loading">{words.loading}</Small>
  if (view.phase !== "live" || !view.steps) return fallback ? <p className="my-6 text-muted-foreground text-sm" data-block="server-domain-none">{fallback}</p> : null

  const steps = view.steps
  const rows = view.rows ?? []
  const ro = view.readOnly
  const architect = rows.find((r) => r.kind === "architect")?.host ?? view.zone ?? ""
  const states = Object.fromEntries(rows.map((r) => [r.host, { text: words.dnsState[r.dns as keyof ServerDomainWords["dnsState"]] ?? r.dns, tone: dnsTone(r.dns) }]))

  const body: Record<Step, ReactNode> = {
    domain: ro || steps.active ? (
      <Small className="font-mono text-foreground">{view.zone ?? "—"}</Small>
    ) : (
      <Field>
        <FieldLabel htmlFor="server-domain-name">{words.domainLabel}</FieldLabel>
        <div className="flex gap-2">
          <Input id="server-domain-name" onChange={(e) => setName(e.target.value)} placeholder={view.zone ?? "example.org"} value={name} />
          <Button disabled={busy || !name.trim()} onClick={() => void act("domain", { name })}>{words.domainSave}</Button>
        </div>
        <FieldDescription>{view.zone ? `${words.domainLabel}: ${view.zone}. ` : ""}{words.domainHint}</FieldDescription>
      </Field>
    ),
    dns: (
      <div className="flex flex-col gap-3">
        <Small className="text-muted-foreground">{words.dnsText}</Small>
        <DnsRecords states={states} words={words.table} zones={view.records ?? []} />
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={busy || ro} onClick={() => void act("dns-check")} size="sm">{words.dnsCheck}</Button>
          {view.dnsAt ? <Small className="text-muted-foreground">{words.checkedAt} {when(view.dnsAt)}</Small> : null}
        </div>
      </div>
    ),
    certs: <CertsStep busy={busy} helper={view.helper !== false} onAct={act} readOnly={ro} rows={rows} run={view.certsRun ?? null} words={words} />,
    check: (
      <div className="flex flex-col gap-3">
        <Small className="text-muted-foreground">{words.checkText}</Small>
        <ul className="flex flex-col gap-1.5" data-block="server-domain-https">
          {rows.map((r) => (
            <li className="flex flex-wrap items-center gap-2 text-sm" key={r.host}>
              <span className="font-mono text-foreground">{r.host}</span>
              {r.https === null ? null : <Badge variant={r.https ? "default" : "destructive"}>{r.https ? `${words.httpsOk} · ${r.status}` : words.httpsFail}</Badge>}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={busy || ro} onClick={() => void act("check")} size="sm">{words.checkButton}</Button>
          {view.checkAt ? <Small className="text-muted-foreground">{words.checkedAt} {when(view.checkAt)}</Small> : null}
        </div>
      </div>
    ),
    active: steps.active ? (
      <div className="flex flex-col gap-3">
        <Small className="text-foreground">
          {words.activeOn.split("{url}")[0]}<a className="underline" href={`https://${architect}/`}>{`https://${architect}/`}</a>
        </Small>
        <div><Button disabled={busy || ro} onClick={() => void act("deactivate")} size="sm" variant="outline">{words.deactivate}</Button></div>
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        <Small className="text-muted-foreground">{words.activeText.replace("{architect}", architect).replace("{zone}", view.zone ?? "")}</Small>
        <div><Button disabled={busy || ro} onClick={() => void act("activate")} size="sm">{words.activate}</Button></div>
      </div>
    ),
  }

  return (
    <div className="my-6 flex flex-col gap-3" data-block="server-domain">
      <H2 variant="ui">{words.title}</H2>
      <Small className="text-foreground">{words.lead}</Small>
      {ro ? <Small className="text-muted-foreground" data-block="server-domain-read-only">{words.readOnly}</Small> : null}
      {error ? <Small className="text-destructive" data-block="server-domain-error">{words.refused} {error}</Small> : null}
      {ORDER.map((id, i) => {
        const open = ORDER.slice(0, i).every((p) => steps[p])
        if (!open) return <LadderLocked key={id} n={i + 1} text={words.locked} title={words.step[id]} />
        return <LadderStep done={steps[id]} id={`domain-${id}`} key={id} n={i + 1} title={words.step[id]}>{body[id]}</LadderStep>
      })}
    </div>
  )
}
