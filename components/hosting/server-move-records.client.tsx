"use client"
// @local — the domain's records of the move ladder (one route: the tab «Выделенный сервер»); its pieces are the part dns-records and AppDialog

import { useCallback, useEffect, useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { DnsRecords, type DnsRecordState, type DnsZone } from "@/components/hosting/dns-records"
import type { ServerMoveWords } from "@/components/hosting/server-move.i18n"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"

// THE DOMAIN'S RECORDS, SWITCHED WHILE THE COPY RUNS (node step 737-15). The owner, 2026-11-13: «было бы неплохо чтобы параллельно в
// этом процессе пользователя была возможность настроить свой домен» and «перенести эти записи сразу … к моменту начала и завершения
// переезда домен уже проснулся». Shown once the server is connected (its IP known) and until the move: the A record of every name, what
// public DNS answers for each, and — for a zone on this node's Cloudflare account — one confirmed switch done by the node itself.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Answer = { ok: boolean; zone: string | null; ip: string | null; records: DnsZone[]; dns: Array<{ host: string; state: string }> | null; cloudflare: boolean; reason?: string }
type Switched = { ok: boolean; results?: Array<{ host: string; ok: boolean; reason?: string }>; elsewhere?: string[]; reason?: string }

const tone = (s: string): DnsRecordState["tone"] => (s === "ok" ? "default" : s === "unknown" ? "secondary" : "destructive")

export function ServerRecords({ words, dialogUi }: { words: ServerMoveWords["records"]; dialogUi: AppDialogUi }) {
  const [view, setView] = useState<Answer | null>(null)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const [switched, setSwitched] = useState<Switched | null>(null)

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
  if (!view.zone || !view.ip) return <Small className="text-muted-foreground" data-block="server-move-records-none">{words.none}</Small>
  const fill = (t: string) => t.replace("{zone}", view.zone ?? "").replace("{ip}", view.ip ?? "")
  const states = view.dns ? Object.fromEntries(view.dns.map((d) => [d.host, { text: words.state[d.state as keyof typeof words.state] ?? d.state, tone: tone(d.state) }])) : undefined
  const failed = switched?.results?.filter((x) => !x.ok) ?? []

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4" data-block="server-move-records">
      <p className="font-medium text-foreground text-sm">{fill(words.title)}</p>
      <Small className="text-muted-foreground">{words.text}</Small>
      {view.cloudflare ? null : <Small className="text-foreground">{words.manual}</Small>}
      <DnsRecords states={states} words={words.table} zones={view.records} />
      {switched?.ok ? <Small className="text-foreground">{words.done.replace("{n}", String(switched.results?.length ?? 0))}</Small> : null}
      {switched && !switched.ok ? <Small className="break-all text-destructive">{words.failed} {failed.map((x) => `${x.host} (${x.reason})`).join(", ") || switched.reason}</Small> : null}
      {switched?.elsewhere?.length ? <Small className="text-muted-foreground">{words.elsewhere} <span className="font-mono">{switched.elsewhere.join(" ")}</span></Small> : null}
      <div className="flex flex-wrap gap-2">
        {view.cloudflare ? <Button disabled={busy} onClick={() => setOpen(true)} size="sm">{words.switch}</Button> : null}
        <Button disabled={busy} onClick={() => void load(true)} size="sm" variant="outline">{words.check}</Button>
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
