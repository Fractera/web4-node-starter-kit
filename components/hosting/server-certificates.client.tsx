"use client"
// @part server-certificates — every certificate of a server node in one table, with «check and complete» and the person's own certificate

import { Check, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { CertsStep, type CertRow, type CertsRun } from "@/components/hosting/server-domain-certs.client"
import type { ServerCertificatesWords } from "@/components/hosting/server-certificates.i18n"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { useNodePlace } from "@/components/node-state/use-node-place.client"
import { httpsDue } from "@/lib/hosting/final-check.mjs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Small } from "@/components/ui/typography"

// «СЕРТИФИКАТЫ БЕЗОПАСНОСТИ» (node step 742-4). The owner, 2026-11-14: «опции только для режима выделенный сервер на вкладке домены
// хостинг ниже чем активация домена: сертификаты безопасности. Там будем решать вопрос обновления сертификатов в случае возникновения
// форс-мажора а также мониторинга их состояние».
// 🔒 ONE DOOR: the server node's own `/api/node/server/domain` — the same answer its domain ladder reads; this page adds no door.
// 🔒 NO TIMER NOBODY ORDERED: the page asks once when opened and follows only a certificate run it started; a schedule is the owner's word.
// Not here yet (742, a later substep): a forced renewal and certbot's own timer seen — the server's root helper has no such verb today.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const SOON = 30

type Row = CertRow & { kind?: string; off?: boolean; https: boolean | null }
type State = { rows: Row[]; certsRun: CertsRun; helper: boolean } | null

export function ServerCertificates({ words, domainWords }: { words: ServerCertificatesWords; domainWords: ServerDomainWords }) {
  const place = useNodePlace()
  const [state, setState] = useState<State | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const door = `${BASE}/api/node/server/domain`

  const load = useCallback(async () => {
    try {
      const r = await fetch(door, { cache: "no-store" })
      const a = r.ok ? ((await r.json()) as Record<string, unknown>) : null
      setState(a && a.phase === "live" && Array.isArray(a.rows) ? { rows: a.rows as Row[], certsRun: (a.certsRun as CertsRun) ?? null, helper: a.helper !== false } : null)
    } catch { setState(null) }
  }, [door])

  useEffect(() => { if (place?.kind === "server") void load() }, [place, load])
  const running = Boolean(state?.certsRun?.running)
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => void load(), 4000)
    return () => clearInterval(t)
  }, [running, load])

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true)
    try { await fetch(door, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, ...extra }) }) } catch { /* the table below says what the server holds */ } finally {
      setBusy(false)
      await load()
    }
  }

  if (place === undefined) return null
  if (place?.kind !== "server") return <Small className="my-6 block text-muted-foreground" data-block="server-certificates-home">{words.onlyServer}</Small>
  if (state === undefined) return <Small className="my-6 block text-muted-foreground" data-block="server-certificates-loading">{words.loading}</Small>
  if (state === null || state.rows.length === 0) return <Small className="my-6 block text-muted-foreground" data-block="server-certificates-none">{words.none}</Small>

  const needs = state.rows.filter((r) => !r.optional && (r.cert === "missing" || r.cert === "unknown" || (r.daysLeft !== null && r.daysLeft < SOON)))
  return (
    <div className="my-6 flex flex-col gap-4" data-block="server-certificates">
      <Small className={needs.length ? "text-destructive" : "text-foreground"} data-block="server-certificates-verdict">
        {needs.length ? words.attention.replace("{n}", String(needs.length)) : words.calm} {words.lifetime}
      </Small>
      <Table data-block="server-certificates-table">
        <TableHeader>
          <TableRow><TableHead>{words.head.name}</TableHead><TableHead>{words.head.cert}</TableHead><TableHead>{words.head.days}</TableHead><TableHead>{words.head.source}</TableHead><TableHead>{words.head.https}</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {state.rows.map((r) => (
            <TableRow data-host={r.host} key={r.host}>
              <TableCell className="font-mono text-xs">{r.host}</TableCell>
              <TableCell><Badge variant={r.cert === "ok" ? "default" : r.cert === "expiring" ? "secondary" : "destructive"}>{domainWords.certState[r.cert as keyof ServerDomainWords["certState"]] ?? r.cert}</Badge></TableCell>
              <TableCell className="text-xs tabular-nums">{r.daysLeft !== null ? domainWords.daysLeft.replace("{n}", String(r.daysLeft)) : "—"}</TableCell>
              <TableCell className="text-xs">{r.certSource ? (r.certSource === "own" ? domainWords.own : "Let's Encrypt") : "—"}</TableCell>
              <TableCell>{r.https === true ? <Check aria-label="ok" className="size-4 text-primary" /> : r.https === false && httpsDue(r) ? <X aria-label="fail" className="size-4 text-destructive" /> : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Small className="text-muted-foreground">{words.renewNote}</Small>
      <CertsStep busy={busy} helper={state.helper} onAct={act} readOnly={false} rows={state.rows} run={state.certsRun} words={domainWords} />
    </div>
  )
}
