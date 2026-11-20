"use client"
// @local — an element's «Настройки → Домен» on a dedicated server (one route): its own domain as a ladder in the server launch's style

import { type ReactNode, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Ladder } from "@/components/hosting/ladder-step"
import { ServerCertState } from "@/components/hosting/server-cert-state.client"
import { certDate, type CertRow } from "@/components/hosting/server-domain-certs.client"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { Button, buttonVariants } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { H3, Small } from "@/components/ui/typography"
import type { ElementDomainRecord, Primary } from "@/lib/web4-items/element-domain"
import type { ElementSettingsUi } from "../_i18n/element-settings.i18n"
import { ElementDomainMore } from "./element-domain-more.client"

// 809 (the owner, 2026-11-20, Telegram 63: «переработать … в стиле в котором создается подключение сервера … бардак множество текстов
// полей противоречащих друг друга по смыслу в текущей ситуации»; the layout, Telegram 84, his «Да»). Five rungs, one open at a time
// (the part `Ladder`, its one rule): the domain in the node's list · connected · the records lead here · certificate and HTTPS · the main
// address. A done rung is one line of what it did; nothing of a road already walked stays on the page. «Отключить» lives in the danger
// zone below, behind a confirm window. The doors are the same as before (324, 801): `/api/domain/list`, the element's own domain door,
// the server's `/api/node/server/domain` (its names, public DNS, certificates).
// 🔒 THE FOLLOW HAS AN END (801-3): while the connected domain waits for its records or certificate, the page asks the server every 5 s,
// at most 20 minutes; nothing asks otherwise.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Listed = { name: string; state: string; holder: string | null }
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

export function ElementDomainLadder({ id, lang, ui, record, dialogUi, domainWords, signIn }: {
  id: string; lang: string; ui: ElementSettingsUi; record: ElementDomainRecord | null; dialogUi: AppDialogUi; domainWords: ServerDomainWords; signIn: ReactNode
}) {
  const w = ui.domainLadder
  const m = ui.mirrorCard
  const router = useRouter()
  const domain = record?.domain ?? null
  const [list, setList] = useState<Listed[] | null>(null)
  const [listFailed, setListFailed] = useState(false)
  const [rows, setRows] = useState<CertRow[] | null>(null)
  const [ip, setIp] = useState<string | null>(null)
  const [picked, setPicked] = useState("")
  const [busy, setBusy] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)
  // 805: a connected domain reaches this page's record a few seconds later — the page asks again every 3 s, at most 40 s, after the press
  const [pending, setPending] = useState<string | null>(null)
  useEffect(() => {
    if (!pending) return
    if (domain === pending) { setPending(null); return }
    let tries = 0
    const t = window.setInterval(() => { tries += 1; router.refresh(); if (tries >= 13) { window.clearInterval(t); setPending(null) } }, 3000)
    return () => window.clearInterval(t)
  }, [pending, domain, router])

  useEffect(() => {
    fetch(`${BASE}/api/domain/list`, { cache: "no-store" }).then((r) => r.json())
      .then((j: { ok?: boolean; extra?: Listed[] }) => { if (j.ok && Array.isArray(j.extra)) setList(j.extra); else setListFailed(true) })
      .catch(() => setListFailed(true))
  }, [])
  const loadRows = useCallback(async () => {
    try {
      const a = (await (await fetch(`${BASE}/api/node/server/domain`, { cache: "no-store" })).json()) as { rows?: CertRow[]; ip?: string | null }
      setRows((a.rows ?? []).filter((r) => r.host === domain || r.host === `www.${domain}`))
      setIp(a.ip ?? null)
    } catch { setRows([]) }
  }, [domain])
  useEffect(() => { if (domain) void loadRows() }, [domain, loadRows])

  const need = (rows ?? []).filter((r) => !r.optional)
  const named = need.length ? need : rows ?? []
  const recordsOk = named.length > 0 && named.every((r) => r.dns === "ok")
  const certOk = named.length > 0 && named.every((r) => (r.cert === "ok" || r.cert === "expiring") && r.https !== false)
  useEffect(() => {
    if (!domain || (recordsOk && certOk)) return
    const started = Date.now()
    const t = setInterval(() => { if (Date.now() - started > 20 * 60_000) clearInterval(t); else void loadRows() }, 5000)
    return () => clearInterval(t)
  }, [domain, recordsOk, certOk, loadRows])

  async function door(method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown> | null, act: string) {
    setBusy(act); setError(null)
    try {
      const r = await fetch(`${BASE}/api/architect/items/${id}/domain`, { method, headers: { "content-type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (j?.ok) { if (act === "attach") setPending(picked); setPicked(""); setConfirm(false); router.refresh() } else setError(w.refused[j?.error ?? ""] ?? m.errors[j?.error ?? ""] ?? String(j?.error ?? r.status))
    } catch { setError(m.loadFailed) } finally { setBusy("") }
  }
  async function recheck() {
    setBusy("dns")
    try { await fetch(`${BASE}/api/node/server/domain`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "dns-check" }) }) } catch { /* the rows below say what the server holds */ }
    await loadRows(); setBusy("")
  }

  const free = (list ?? []).filter((d) => !d.holder && d.state === "active" && d.name !== domain)
  const end = certDate(named.find((r) => r.notAfter)?.notAfter)
  const primaryUrl = record?.url.replace("https://", "") ?? ""
  const rungs = [
    {
      id: "list", title: w.steps.list, done: Boolean(domain) || free.length > 0,
      summary: domain ?? (free.length ? fill(w.free, { names: free.map((d) => d.name).join(", ") }) : null),
      body: (
        <div className="flex flex-col gap-2" data-block="element-domain-ladder-list">
          {listFailed ? <Small className="text-destructive">{m.loadFailed}</Small> : null}
          {list && !free.length ? <Small className="rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-foreground" role="status">{m.noFree}</Small> : null}
          <a className={`${buttonVariants({ size: "sm", variant: "outline" })} w-fit`} data-block="element-domain-ladder-add" href={`${BASE}/${lang}/architect/hosting/domain?for=${encodeURIComponent(id)}#domain-add`}>{m.add}</a>
          <ElementDomainMore label={w.more}>
            <Small className="text-muted-foreground">{m.addHint}</Small>
            <ol className="list-decimal pl-5 text-muted-foreground text-sm">{m.addSteps.map((s) => <li key={s}>{s}</li>)}</ol>
          </ElementDomainMore>
        </div>
      ),
    },
    {
      id: "connect", title: w.steps.connect, done: Boolean(domain), summary: domain ? fill(w.connected, { domain }) : null,
      body: (
        <div className="flex flex-col gap-3" data-block="element-domain-ladder-connect">
          <Field>
            <FieldLabel htmlFor={`element-domain-${id}`}>{m.label}</FieldLabel>
            <Select onValueChange={setPicked} value={picked}>
              <SelectTrigger className="w-full max-w-md" id={`element-domain-${id}`}><SelectValue placeholder={m.placeholder} /></SelectTrigger>
              <SelectContent>{free.map((d) => <SelectItem key={d.name} value={d.name}><span className="font-mono">{d.name}</span></SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Button className="w-fit" disabled={!picked || Boolean(busy) || Boolean(pending)} onClick={() => void door("POST", { name: picked }, "attach")} size="sm">{busy === "attach" ? m.attaching : m.attach}</Button>
          {pending ? <Small className="flex items-center gap-2 text-muted-foreground" role="status"><Spinner className="size-4" />{m.pending.replace("{domain}", pending)}</Small> : null}
        </div>
      ),
    },
    {
      id: "records", title: w.steps.records, done: recordsOk, summary: recordsOk ? fill(w.recordsOk, { ip: ip ?? "—" }) : null,
      body: (
        <div className="flex flex-col gap-2" data-block="element-domain-ladder-records">
          {rows === null ? <Small className="text-muted-foreground">{w.recordsWait}</Small> : (
            <>
              <Small className="text-foreground">{w.recordsLead}</Small>
              <Small className="font-mono text-foreground">{`A  @  → ${ip ?? "—"}`}</Small>
              <Small className="font-mono text-foreground">{`A  www  → ${ip ?? "—"}`}</Small>
            </>
          )}
          <Button className="w-fit" disabled={Boolean(busy)} onClick={() => void recheck()} size="sm" variant="outline">{busy === "dns" ? <><Spinner data-icon="inline-start" />{w.rechecking}</> : w.recheck}</Button>
        </div>
      ),
    },
    {
      id: "cert", title: w.steps.cert, done: recordsOk && certOk, summary: certOk ? fill(w.certOk, { date: end || "—" }) : null,
      body: <ServerCertState domainWords={domainWords} expect owner={{ hosts: domain ? [domain, `www.${domain}`] : [] }} words={{ loading: ui.certificateCard.loading, issuing: ui.certificateCard.issuing, ready: ui.certificateCard.ready }} />,
    },
    {
      id: "primary", title: w.steps.primary, done: Boolean(record), summary: record ? fill(w.primaryDone, { primary: primaryUrl }) : null,
      body: record ? (
        <div className="flex flex-col gap-2" data-block="element-domain-ladder-primary">
          <ButtonGroup>
            {(["subdomain", "domain"] as Primary[]).filter((p) => p === "domain" || record.subdomain).map((p) => (
              // 809 (the owner, 2026-11-20, Telegram 111): the active address — contrast blue, never the pale disabled look; the other — struck through
              <Button className={record.primary === p ? "disabled:opacity-100" : undefined} disabled={Boolean(busy) || record.primary === p} key={p} onClick={() => void door("PATCH", { primary: p }, "primary")} size="sm" variant={record.primary === p ? "default" : "outline"}>
                <span className={record.primary === p ? "font-mono" : "font-mono line-through"}>{p === "domain" ? record.domain : record.subdomain}</span>
              </Button>
            ))}
          </ButtonGroup>
          <Small className="text-muted-foreground">{m.primaryNote.replace("{primary}", primaryUrl)}</Small>
          <ElementDomainMore label={ui.signIn.title}>{signIn}</ElementDomainMore>
        </div>
      ) : null,
    },
  ]
  return (
    <div className="flex flex-col gap-4" data-block="element-domain-ladder" data-element-domain={domain ?? ""}>
      {error ? <Small className="text-destructive" role="alert">{error}</Small> : null}
      <Ladder id="element-domain" locked={w.locked} rungs={rungs} />
      {record ? (
        <div className="flex flex-col gap-2" data-block="element-domain-danger">
          <H3 variant="ui">{w.danger}</H3>
          <Button className="w-fit" disabled={Boolean(busy)} onClick={() => setConfirm(true)} size="sm" variant="destructive">{w.detach}</Button>
          <AppDialog description={fill(w.detachText, { domain: record.domain, subdomain: record.subdomain ?? "" })} footer={<>
            <Button disabled={Boolean(busy)} onClick={() => setConfirm(false)} variant="ghost">{w.cancel}</Button>
            <Button disabled={Boolean(busy)} onClick={() => void door("DELETE", null, "detach")} variant="destructive">{busy === "detach" ? m.detaching : w.detach}</Button>
          </>} onOpenChange={setConfirm} open={confirm} size="sm" title={fill(w.detachTitle, { domain: record.domain })} ui={dialogUi} />
        </div>
      ) : null}
    </div>
  )
}
