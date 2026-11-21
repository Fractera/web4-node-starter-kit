"use client"
// @local — a domain's steps on «Активация домена» (324-1; 775 — the ladder of the page «Сервер»): zone, name servers, active / main, and the fourth rung

import { useState, type ReactNode } from "react"
import { X } from "lucide-react"
import { useNodePlace } from "@/components/node-state/use-node-place.client"
import signIn from "@/lib/auth/sign-in-link.cjs"
import { Ladder, type Rung } from "@/components/hosting/ladder-step"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DomainListWords } from "./domain-list.i18n"
import type { DomainLadderWords } from "./domain-ladder.i18n"
import { TokenHowTo } from "./token-how-to.client"
import { keyReasonText } from "./key-reason"
import { DomainNs } from "./domain-ns.client"

// THE STEPS OF A DOMAIN (324-1; 775 — the owner 2026-11-17: «сделать в одном стиле с вкладкой сервер … карточки которые содержат активные
// и неактивные цифры … замочек»; «не хватает четвёртого шага»). The same part as the page «Сервер» (`Ladder`): its rule opens only the
// current rung, a passed rung is one line, a locked one carries the lock. 1 — the node creates the zone itself (no right — the key field
// here); 2 — the name servers to set and the ones seen now; 3 — the main domain's «Сделать основным» (an element's domain: «active»);
// 4 — the main domain's elements' subdomains (open once it is the main one, `DomainMain`), an element's domain — its connection.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type AddressRecord = { name: string; type: string; content: string }

export type PipelineDomain = {
  name: string; state: string; status?: string; nameServers?: string[]; registrarNs?: string[]; nsMatch?: boolean
  activationAsked?: boolean; checkedAt?: string; registrar?: string | null
  /** 828: what the registry said of the name — `unregistered` gets no zone */
  registry?: string
}

export function DomainPipeline({ lang, role = "element", domain: d, words: w, ladderWords, onChanged, hasPrimary, forItem, holder = null, architect = null }: {
  lang: string
  /** 775: the main domain's candidate ends in «Сделать основным», an element's domain in its connection */
  role?: "main" | "element"
  /** 775: the node has its architect — only then may a domain become the main one; `null` — the sign-in did not answer */
  architect?: boolean | null
  /** 443-4: the element whose settings sent the person here (`?for=`) */
  forItem?: string | null
  /** 775: the element this domain is connected to (its readable address), or null */
  holder?: string | null
  domain: PipelineDomain
  hasPrimary: boolean
  words: DomainListWords
  ladderWords: DomainLadderWords
  onChanged: () => Promise<void>
}) {
  const p = w.pipe
  const place = useNodePlace()
  const signInHref = place?.signIn && typeof window !== "undefined"
    ? signIn.architectSignIn(place.signIn, `${window.location.pathname}${window.location.search}`, window.location.origin)
    : null
  const [busy, setBusy] = useState<string | null>(null)
  const [conflicts, setConflicts] = useState<AddressRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [noPermission, setNoPermission] = useState(false)
  const [noKey, setNoKey] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [key, setKey] = useState("")
  const [needAccount, setNeedAccount] = useState(false)
  const [account, setAccount] = useState("")
  const time = (iso?: string) => iso ? new Date(iso).toLocaleTimeString(lang === "ru" ? "ru-RU" : "en-GB") : ""

  async function call(method: "POST" | "PUT", body: Record<string, string | undefined>, slot: string): Promise<PipelineDomain | null> {
    setBusy(slot)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/domain/list`, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; domain?: PipelineDomain } | null
      if (j?.ok && j.domain) { await onChanged(); setBusy(null); return j.domain }
      const code = j?.error ?? String(r.status)
      if (code === "no-zone-permission") { setNoPermission(true); await onChanged() }
      if (code === "no-key") { setNoPermission(true); setNoKey(true) }
      if (code === "no-account" || code === "bad-account-id") setNeedAccount(true)
      setError(w.errors[code] ?? `${w.errors.unknown} ${code}`)
    } catch { setError(w.errors.unknown) }
    setBusy(null)
    return null
  }

  const describe = (x: PipelineDomain): string =>
    x.state === "active" ? (role === "main" ? p.step3DoneMain : p.step3Done) : x.state === "not-visible" ? w.state["not-visible"] : x.nsMatch ? (x.activationAsked ? p.step3Asked : p.match) : p.noMatch

  async function check() {
    const x = await call("PUT", { name: d.name }, "check")
    if (x) setNote(p.lastCheck.replace("{time}", time(x.checkedAt)).replace("{what}", describe(x)))
  }

  async function createZone() {
    const x = await call("POST", { name: d.name, action: "create-zone", accountId: needAccount ? account.trim() : undefined }, "zone")
    if (x) { setNoPermission(false); setNoKey(false); setNeedAccount(false); setNote(p.lastCheck.replace("{time}", time(x.checkedAt)).replace("{what}", p.step1Done)) }
  }

  // 372: foreign A/AAAA records on the node's names are never removed silently — the door lists them, the person confirms a second press.
  async function makePrimary(removeAddressRecords: boolean) {
    setBusy("primary")
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/domain/activate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ hostname: d.name, removeAddressRecords }) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string; records?: AddressRecord[] } | null
      if (j?.ok) { window.location.reload(); return }
      if (j?.reason === "address-records" && j.records?.length) { setConflicts(j.records); setBusy(null); return }
      setError(`${p.makePrimaryFailed} ${j?.reason ?? r.status}`)
    } catch { setError(p.makePrimaryFailed) }
    setBusy(null)
  }

  async function saveKeyAndCreate() {
    setBusy("key")
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/domain/key`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: key.trim() }) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
      if (!j?.ok) { setError(j?.reason ? keyReasonText(ladderWords, j.reason) : `${w.key.failed} ${r.status}`); setBusy(null); return }
      setKey("")
    } catch { setError(w.key.failed); setBusy(null); return }
    setBusy(null)
    await createZone()
  }

  const zoneReady = d.state === "pending" || d.state === "active"
  const nsReady = zoneReady && (d.state === "active" || !!d.nsMatch)
  const active = d.state === "active"
  const checkButton = (
    <Button type="button" size="sm" variant="outline" className="w-fit" onClick={check} disabled={busy !== null} data-pipe-check>
      {busy === "check" ? p.checking : p.check}
    </Button>
  )

  // 828: an entry whose registry does not know the name (added before the registry was asked) — no «Создать зону», the refusal and a
  // recheck (bought just now — the registry knows it in minutes).
  const zoneBody: ReactNode = d.registry === "unregistered" ? (
    <><p className="text-sm text-destructive" role="alert" data-pipe-not-registered>{w.errors["not-registered"]}</p>{checkButton}</>
  ) : (
    <>
      <p className="text-sm text-foreground">{p.step1Todo}</p>
      <Button type="button" size="sm" className="w-fit" onClick={createZone} disabled={busy !== null} data-pipe-create-zone>{busy === "zone" ? p.creating : p.createZone}</Button>
      {needAccount && (
        <div className="flex flex-col gap-2 rounded-md border border-warning/50 bg-warning/10 p-3" data-pipe-need-account>
          <p className="text-sm text-foreground">{p.accountHint}</p>
          <Label htmlFor={`pipe-account-${d.name}`}>{p.accountLabel}</Label>
          <div className="flex flex-wrap gap-2">
            <Input id={`pipe-account-${d.name}`} className="max-w-80 font-mono" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="0123456789abcdef0123456789abcdef" autoComplete="off" spellCheck={false} />
            <Button type="button" size="sm" onClick={createZone} disabled={!/^[0-9a-fA-F]{32}$/.test(account.trim()) || busy !== null} data-pipe-account-retry>{busy === "zone" ? p.creating : p.accountRetry}</Button>
          </div>
        </div>
      )}
      {noPermission && (
        <div className="flex flex-col gap-2 rounded-md border border-destructive bg-destructive/5 p-3" data-pipe-no-permission>
          <p className="text-sm text-foreground">{noKey ? w.key.none : p.noPermission}</p>
          <TokenHowTo words={ladderWords} />
          <Label htmlFor={`pipe-key-${d.name}`}>{w.key.label}</Label>
          <div className="flex flex-wrap gap-2">
            <Input id={`pipe-key-${d.name}`} type="password" placeholder=" " className="field-pulse max-w-80 font-mono" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" spellCheck={false} />
            <Button type="button" size="sm" onClick={saveKeyAndCreate} disabled={!key.trim() || busy !== null} data-pipe-key-save>{busy === "key" ? w.key.saving : p.keySaveAndCreate}</Button>
          </div>
        </div>
      )}
    </>
  )

  const thirdBody: ReactNode = !active ? (
    <><p className="text-sm text-foreground">{d.nsMatch && d.activationAsked ? p.step3Asked : p.step3Wait}</p>{checkButton}</>
  ) : role === "element" ? (
    <p className="text-sm text-foreground">{p.step3Done}</p>
  ) : architect !== true ? (
    <div className="flex flex-col gap-2 rounded-md border border-warning bg-warning/10 p-3" role="alert" data-block="pipe-locked" data-pipe-locked={architect === null ? "no-sign-in" : "no-architect"}>
      <p className="text-sm text-foreground text-pretty">{architect === null ? p.lockedNoSignIn : p.lockedNoArchitect}</p>
      {architect === false && signInHref && <a href={signInHref} className={cn(buttonVariants({ size: "sm" }), "w-fit")} data-pipe-locked-signin>{p.lockedButton}</a>}
    </div>
  ) : conflicts ? (
    <div className="flex flex-col gap-2 rounded-md border border-destructive/50 bg-destructive/5 p-3" data-pipe-conflicts>
      <p className="text-sm text-foreground">{p.conflictsTitle}</p>
      <ul className="flex flex-col gap-0.5 font-mono text-sm text-destructive">
        {conflicts.map((c) => <li key={`${c.name}-${c.type}-${c.content}`} className="flex items-center gap-1.5"><X className="size-4 shrink-0" aria-hidden />{c.name} · {c.type} · {c.content}</li>)}
      </ul>
      <p className="text-sm text-muted-foreground">{p.conflictsNote}</p>
      <Button type="button" variant="destructive" className="w-fit" onClick={() => makePrimary(true)} disabled={busy !== null} data-pipe-remove-and-connect>{busy === "primary" ? p.makingPrimary : p.removeAndConnect}</Button>
    </div>
  ) : (
    <div className="flex flex-col gap-2" data-pipe-make-primary>
      <p className="text-sm text-foreground">{p.makePrimaryNote}</p>
      <Button type="button" className="w-fit" onClick={() => makePrimary(false)} disabled={busy !== null || hasPrimary}>{busy === "primary" ? p.makingPrimary : p.makePrimary}</Button>
    </div>
  )

  const connectBody: ReactNode = holder ? <p className="text-sm text-foreground">{p.s4extra.replace("{element}", holder)}</p> : (
    <>
      <p className="text-sm text-foreground">{p.connectHow}</p>
      {forItem && <a className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline" href={`/${lang}/architect/${forItem}/settings/domain#main-mirror`} data-pipe-open-mirror={forItem}>{p.openMirror.replace("{item}", forItem)}</a>}
    </>
  )

  const rungs: Rung[] = [
    { id: "zone", title: p.t1, done: zoneReady, summary: p.s1, body: zoneBody },
    { id: "ns", title: p.t2, done: nsReady, summary: p.s2, body: <><DomainNs domain={d} words={w} />{!active && checkButton}</> },
    { id: "active", title: role === "main" ? p.t3main : p.t3extra, done: role === "main" ? false : active, summary: role === "main" ? p.s3main : p.s3extra, body: thirdBody },
    { id: "fourth", title: role === "main" ? p.t4main : p.t4extra, done: role === "element" && !!holder, summary: holder ? p.s4extra.replace("{element}", holder) : null, body: role === "main" ? null : connectBody },
  ]

  return (
    <div className="flex flex-col gap-2" data-domain-pipeline={d.name}>
      <Ladder id={`domain-${role}`} locked={p.locked} rungs={rungs} />
      {note && <p className="text-sm text-foreground" role="status" data-pipe-note>{note}</p>}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}
