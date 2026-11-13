"use client"
// @local — the domain's records of the move ladder (one route: the tab «Выделенный сервер»); its pieces are the part dns-records and AppDialog

import { useCallback, useEffect, useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { DnsRecords, type DnsRecordState, type DnsZone } from "@/components/hosting/dns-records"
import type { ServerMoveWords } from "@/components/hosting/server-move.i18n"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Small } from "@/components/ui/typography"

// THE DOMAIN'S RECORDS, SWITCHED WHILE THE COPY RUNS (node step 737-15). The owner, 2026-11-13: «было бы неплохо чтобы параллельно в
// этом процессе пользователя была возможность настроить свой домен» and «перенести эти записи сразу … к моменту начала и завершения
// переезда домен уже проснулся». Shown once the server is connected (its IP known) and until the move: the A record of every name, what
// public DNS answers for each, and — for a zone on this node's Cloudflare account — one confirmed switch done by the node itself.
// 737-15, A NEW DOMAIN (the owner, 2026-11-13: «установку домена где-то в начале пока ставится сервер»): a node with no domain of its own
// types one here; the door keeps it and the server takes it — at once after the copy, otherwise by the copy itself.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Run = { state: "saved" | "starting" | "running" | "done" | "failed"; zone?: string; detail?: string }
type Names = { zone: string | null; names?: number; certified?: string[]; waiting?: string[]; pointing?: string[] }
type Answer = { ok: boolean; zone: string | null; ip: string | null; records: DnsZone[]; dns: Array<{ host: string; state: string }> | null; cloudflare: boolean; own?: boolean; mayType?: boolean; run?: Run | null; names?: Names | null; reason?: string }
type Switched = { ok: boolean; results?: Array<{ host: string; ok: boolean; reason?: string }>; elsewhere?: string[]; reason?: string }

const tone = (s: string): DnsRecordState["tone"] => (s === "ok" ? "default" : s === "unknown" ? "secondary" : "destructive")

export function ServerRecords({ words, dialogUi }: { words: ServerMoveWords["records"]; dialogUi: AppDialogUi }) {
  const [view, setView] = useState<Answer | null>(null)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const [switched, setSwitched] = useState<Switched | null>(null)
  const [domain, setDomain] = useState("")
  const [typing, setTyping] = useState(false)
  const [refused, setRefused] = useState<string | null>(null)

  const load = useCallback(async (check = false) => {
    setBusy(true)
    try {
      const r = await fetch(`${BASE}/api/node/server/records${check ? "?check=1" : ""}`, { cache: "no-store" })
      if (r.ok) setView((await r.json()) as Answer)
    } finally {
      setBusy(false)
    }
  }, [])
  useEffect(() => { void load() }, [load])
  // While the server takes the domain, the line follows it.
  const working = view?.run?.state === "starting" || view?.run?.state === "running"
  useEffect(() => {
    if (!working) return
    const t = setInterval(() => void load(), 5000)
    return () => clearInterval(t)
  }, [working, load])

  async function sendDomain(value: string) {
    setBusy(true)
    setRefused(null)
    try {
      const r = await fetch(`${BASE}/api/node/server/records`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ domain: value }) })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; reason?: string }
      if (!j.ok) setRefused(words.form.errors[j.reason ?? ""] ?? words.form.errors.network)
      else setTyping(false)
    } catch {
      setRefused(words.form.errors.network)
    } finally {
      setBusy(false)
    }
    await load()
  }

  async function switchRecords() {
    setOpen(false)
    setBusy(true)
    try {
      const r = await fetch(`${BASE}/api/node/server/records`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm: view?.zone }) })
      setSwitched((await r.json().catch(() => ({ ok: false }))) as Switched)
    } finally {
      setBusy(false)
    }
    await load(true)
  }

  if (!view) return null
  if (!view.ip) return <Small className="text-muted-foreground" data-block="server-move-records-none">{words.none}</Small>
  if (!view.zone || typing) {
    if (!view.mayType) return <Small className="text-muted-foreground" data-block="server-move-records-none">{words.none}</Small>
    return (
      <form
        className="flex flex-col gap-3 rounded-lg border border-border p-4"
        data-block="server-move-records-domain"
        onSubmit={(e) => { e.preventDefault(); void sendDomain(domain) }}
      >
        <p className="font-medium text-foreground text-sm">{words.form.title}</p>
        <Small className="text-muted-foreground">{words.form.text}</Small>
        <Field>
          <FieldLabel htmlFor="server-domain">{words.form.label}</FieldLabel>
          <Input autoComplete="off" id="server-domain" inputMode="url" onChange={(e) => setDomain(e.target.value)} placeholder={words.form.placeholder} spellCheck={false} value={domain} />
        </Field>
        {refused ? <Small className="text-destructive">{refused}</Small> : null}
        <Button className="w-fit" disabled={busy || !domain.trim()} size="sm" type="submit">{words.form.submit}</Button>
      </form>
    )
  }
  const fill = (t: string) => t.replace("{zone}", view.zone ?? "").replace("{ip}", view.ip ?? "")
  const states = view.dns ? Object.fromEntries(view.dns.map((d) => [d.host, { text: words.state[d.state as keyof typeof words.state] ?? d.state, tone: tone(d.state) }])) : undefined
  const failed = switched?.results?.filter((x) => !x.ok) ?? []
  const run = view.own ? null : view.run
  const names = view.names?.zone === view.zone ? view.names : null
  const runLine = run?.state === "done" && names
    ? words.run.done.replace("{c}", String(names.certified?.length ?? 0)).replace("{n}", String(names.names ?? 0)).replace("{w}", names.waiting?.length ? names.waiting.join(" ") : "—")
    : run?.state === "failed" ? `${words.run.failed} ${run.detail ?? ""}` : run ? words.run[run.state] : null

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4" data-block="server-move-records">
      <p className="font-medium text-foreground text-sm">{fill(words.title)}</p>
      <Small className="text-muted-foreground">{words.text}</Small>
      {view.cloudflare ? null : <Small className="text-foreground">{words.manual}</Small>}
      <DnsRecords states={states} words={words.table} zones={view.records} />
      {runLine ? (
        <Small className={run?.state === "failed" ? "break-all text-destructive" : "flex items-center gap-2 text-foreground"} data-block="server-move-records-run" data-state={run?.state}>
          {working ? <Spinner className="size-4" /> : null}
          {runLine}
        </Small>
      ) : null}
      {refused ? <Small className="text-destructive">{refused}</Small> : null}
      {switched?.ok ? <Small className="text-foreground">{words.done.replace("{n}", String(switched.results?.length ?? 0))}</Small> : null}
      {switched && !switched.ok ? <Small className="break-all text-destructive">{words.failed} {failed.map((x) => `${x.host} (${x.reason})`).join(", ") || switched.reason}</Small> : null}
      {switched?.elsewhere?.length ? <Small className="text-muted-foreground">{words.elsewhere} <span className="font-mono">{switched.elsewhere.join(" ")}</span></Small> : null}
      <div className="flex flex-wrap gap-2">
        {view.cloudflare ? <Button disabled={busy} onClick={() => setOpen(true)} size="sm">{words.switch}</Button> : null}
        <Button disabled={busy} onClick={() => void load(true)} size="sm" variant="outline">{words.check}</Button>
        {view.own || !view.mayType ? null : (
          <>
            <Button disabled={busy || working} onClick={() => void sendDomain(view.zone ?? "")} size="sm" variant="outline">{words.form.certs}</Button>
            <Button disabled={busy || working} onClick={() => { setDomain(""); setTyping(true) }} size="sm" variant="ghost">{words.form.change}</Button>
          </>
        )}
      </div>
      <AppDialog
        footer={
          <>
            <Button onClick={() => setOpen(false)} variant="outline">{words.notNow}</Button>
            <Button onClick={() => void switchRecords()}>{words.confirm}</Button>
          </>
        }
        onOpenChange={setOpen}
        open={open}
        title={fill(words.confirmTitle)}
        ui={dialogUi}
      >
        <ul className="flex list-disc flex-col gap-2 pl-5 text-foreground text-sm" data-block="server-move-records-confirm">
          {words.confirmItems.map((t) => <li key={t}>{fill(t)}</li>)}
        </ul>
      </AppDialog>
    </div>
  )
}
