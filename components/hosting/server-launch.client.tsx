"use client"
// @local — the launch of a dedicated server (one route: «Активация выделенного сервера»); its pieces are the parts ladder-step and stage-log

import { type ReactNode, useCallback, useEffect, useState } from "react"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { DomainLadderWords } from "@/components/domain/domain-ladder.i18n"
import type { DnsZone } from "@/components/hosting/dns-records"
import { LadderLocked, LadderStep } from "@/components/hosting/ladder-step"
import type { CertRow, CertsRun } from "@/components/hosting/server-domain-certs.client"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { CheckStep, strategyOf } from "@/components/hosting/server-launch-check.client"
import { LaunchDomain } from "@/components/hosting/server-launch-domain.client"
import { CertsLaunchStep, InstallStep, ReadyStep, RecheckStep } from "@/components/hosting/server-launch-end.client"
import type { LaunchStep, ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import type { Detect } from "@/components/hosting/server-ladder.client"
import type { LadderWay, ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import type { Stage } from "@/components/hosting/stage-log"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { H2, Small } from "@/components/ui/typography"

// «ЗАПУСТИТЬ СЕРВЕР» (node step 738-4). The owner, 2026-11-14: «входит у неё заново обнаруживает пустой страницу и до того момента пока он
// не в ведёт информацию о IP-адресе и пароле странице будет оставаться пустой … в любой момент перезагрузить эту страницу и пока идёт
// какой-то из процессов начать работать со вторым … с 10-м и с 100-м сервером поочерёдно возвращаясь на эту страницу когда заново вводит
// credentials».
// 🔒 THE PAGE KEEPS NOTHING: the address lives in this island's memory only; a reload empties it. Everything shown is the server's own answer
// (`/api/node/launch` → the server over SSH), so the same address on any visit shows the same truth, and other servers run on meanwhile.
// 🔒 THE LADDER LAW (259-1): a step opens when the one before it is done; a closed one is a grey line naming what appears there. The domain
// (step 3) holds nothing: the installation opens after the check, and DNS wakes while the server installs.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type CoreRow = CertRow & { zone: string; label: string; kind: string; https: boolean | null; status: number | null }
export type LaunchState = {
  host?: string
  cleared?: { state?: string; detail?: string; stopped?: number; backup?: string } | null
  probe: { publicIp?: string | null; fractera: { head: string | null; ahead: number | null; behind: number | null; phase: string | null; launching: boolean } | null } | null
  launch: { state: "running" | "done" | "failed"; mode?: string; failed?: string | null; detail?: string; version?: { head: string; behind: number | null } | null } | null
  progress: Stage[]
  sub: Stage[]
  update: { state?: string; stage?: string; summary?: string; reason?: string } | null
  domain: { domain?: string; way?: LadderWay | null; detect?: Detect | null; check?: { at: string; results: Array<{ host: string; state: string }> } | null; signin?: { ok: boolean; providers: unknown; location: string | null } | null } | null
  mark: { phase?: string; domain?: string; domainActive?: boolean } | null
  core: { zone: string | null; rows: CoreRow[]; steps: { domain: boolean; dns: boolean; certs: boolean; check: boolean; active: boolean }; certsRun: CertsRun; helper: boolean; checkAt: string | null; dnsAt: string | null } | null
  verdict: { level: "ok" | "warn" | "fail"; items: Array<{ id: string; level: string; value?: unknown; need?: unknown }> } | null
  records: DnsZone[]
  week: number | null
}
type Answer = { ok?: boolean; reason?: string; state?: LaunchState; fingerprint?: string; seen?: string | null; pinned?: string | null; key?: boolean; cleared?: LaunchState["cleared"]; week?: number; want?: number; over?: string[] }
type Target = { host: string; port: number; fingerprint: string | null }

export function ServerLaunch({ words, ladderWords, domainWords, keyWords, dialogUi }: { words: ServerLaunchWords; ladderWords: ServerLadderWords; domainWords: ServerDomainWords; keyWords: DomainLadderWords; dialogUi: AppDialogUi }) {
  const [form, setForm] = useState({ host: "", port: "22", password: "" })
  const [target, setTarget] = useState<Target | null>(null)
  const [state, setState] = useState<LaunchState | null>(null)
  const [key, setKey] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [changed, setChanged] = useState<{ seen: string; pinned: string | null } | null>(null)

  const say = useCallback((a: Answer | null) => {
    if (!a || a.ok === false) {
      const reason = String(a?.reason ?? "network")
      const over = a?.over?.length ? ` (${a.over.join(", ")})` : ""
      setError((words.errors[reason] ?? reason).replace("{week}", String(a?.week ?? "")).replace("{want}", String(a?.want ?? "")).replace("{over}", over))
    } else setError("")
    if (a?.key !== undefined) setKey(Boolean(a.key))
  }, [words])

  const post = useCallback(async (body: Record<string, unknown>): Promise<Answer | null> => {
    try {
      const r = await fetch(`${BASE}/api/node/launch`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" })
      return (await r.json().catch(() => null)) as Answer | null
    } catch { return null }
  }, [])

  const act = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    if (!target) return
    setBusy(true)
    try {
      const a = await post({ action, host: target.host, port: target.port, ...extra })
      say(a)
      if (a?.state) setState({ ...a.state, host: target.host, cleared: action === "clear" ? (a.cleared ? { state: "done", ...a.cleared } : { state: "failed", detail: a.reason }) : state?.cleared ?? null })
      return a
    } finally { setBusy(false) }
  }, [target, post, say, state?.cleared])

  async function connect(trust: string | null = null) {
    const host = form.host.trim().toLowerCase()
    const port = Number(form.port) || 22
    setBusy(true)
    setError("")
    try {
      const a = await post({ action: "connect", host, port, password: form.password, ...(trust ? { trust } : {}) })
      say(a)
      if (a?.reason === "host-key-changed" && a.seen) setChanged({ seen: a.seen, pinned: a.pinned ?? null })
      if (a?.ok && a.state) {
        setChanged(null)
        setTarget({ host, port, fingerprint: a.fingerprint ?? null })
        setState({ ...a.state, host })
      }
    } finally {
      setBusy(false)
      setForm((f) => ({ ...f, password: "" }))
    }
  }

  // While the server works (a launch, a certificate run), the page asks it every 5 s; otherwise it waits for a press.
  const working = state?.launch?.state === "running" || Boolean(state?.core?.certsRun?.running)
  useEffect(() => {
    if (!target || !working) return
    const t = setInterval(() => {
      void post({ action: "state", host: target.host, port: target.port }).then((a) => { if (a?.state) setState((s) => ({ ...(a.state as LaunchState), host: target.host, cleared: s?.cleared ?? null })) })
    }, 5000)
    return () => clearInterval(t)
  }, [target, working, post])

  if (!target || !state) {
    return (
      <section className="my-6 flex flex-col gap-4 rounded-lg border border-border p-4" data-block="server-launch-form">
        <H2 variant="ui">{words.title}</H2>
        <Small className="text-foreground">{words.lead}</Small>
        <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
          <Field><FieldLabel htmlFor="launch-host">{words.host}</FieldLabel><Input autoComplete="off" id="launch-host" inputMode="decimal" onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="203.0.113.7" value={form.host} /></Field>
          <Field><FieldLabel htmlFor="launch-port">{words.port}</FieldLabel><Input id="launch-port" inputMode="numeric" onChange={(e) => setForm({ ...form, port: e.target.value })} value={form.port} /></Field>
        </div>
        <Field>
          <FieldLabel htmlFor="launch-password">{words.password}</FieldLabel>
          <Input autoComplete="off" id="launch-password" onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" value={form.password} />
          <FieldDescription>{words.passwordNote}</FieldDescription>
        </Field>
        {changed ? (
          <div className="flex flex-col gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3" data-block="server-launch-changed">
            <p className="font-medium text-foreground text-sm">{words.changed.title}</p>
            <Small className="text-muted-foreground">{words.changed.text}</Small>
            <Small className="break-all font-mono text-foreground">{words.changed.seen} {changed.seen}</Small>
            {changed.pinned ? <Small className="break-all font-mono text-muted-foreground">{words.changed.pinned} {changed.pinned}</Small> : null}
            <div><Button disabled={busy || !form.password} onClick={() => void connect(changed.seen)} size="sm" variant="destructive">{words.changed.trust}</Button></div>
          </div>
        ) : null}
        {error && !changed ? <Small className="text-destructive" data-block="server-launch-error">{error}</Small> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={busy || !form.host.trim()} onClick={() => void connect()}>{words.connect}</Button>
          {busy ? <Small className="text-muted-foreground">{words.connecting}</Small> : null}
        </div>
      </section>
    )
  }

  const strategy = strategyOf(state)
  const installed = state.launch?.state === "done" || strategy === "latest"
  const done: Record<LaunchStep, boolean> = {
    server: true,
    check: state.verdict?.level !== "fail" && Boolean(state.verdict),
    domain: Boolean(state.domain?.domain && state.domain?.check),
    install: installed,
    recheck: Boolean(state.core?.steps.dns),
    certs: Boolean(state.core?.steps.certs && state.core?.steps.check),
    ready: Boolean(state.core?.steps.active && state.domain?.signin?.ok),
  }
  // The domain holds nothing: the installation opens right after the check.
  const opens: Record<LaunchStep, boolean> = { server: true, check: true, domain: done.check, install: done.check, recheck: done.install && Boolean(state.core), certs: done.recheck, ready: done.certs }
  const order: LaunchStep[] = ["server", "check", "domain", "install", "recheck", "certs", "ready"]
  const body: Record<LaunchStep, ReactNode> = {
    server: (
      <div className="flex flex-wrap items-center gap-3">
        <Small className="break-all text-foreground">{words.connected.replace("{host}", target.host).replace("{fp}", target.fingerprint ?? "—")}</Small>
        <Button disabled={busy} onClick={() => { setTarget(null); setState(null); setError("") }} size="sm" variant="outline">{words.another}</Button>
      </div>
    ),
    check: <CheckStep busy={busy} dialogUi={dialogUi} onAct={async (a, x) => { await act(a, x) }} state={state} words={words} />,
    domain: <LaunchDomain busy={busy} dialogUi={dialogUi} keyPresent={key} keyWords={keyWords} note={words.domainNote} onAct={act} state={state} words={ladderWords} />,
    install: <InstallStep busy={busy} onAct={act} state={state} strategy={strategy} words={words} />,
    recheck: <RecheckStep busy={busy} domainWords={domainWords} onAct={act} state={state} words={words} />,
    certs: <CertsLaunchStep busy={busy} domainWords={domainWords} onAct={act} state={state} words={words} />,
    ready: <ReadyStep busy={busy} onAct={act} state={state} words={words} />,
  }
  return (
    <section className="my-6 flex flex-col gap-3" data-block="server-launch" data-host={target.host}>
      <H2 variant="ui">{words.title}</H2>
      {error ? <Small className="text-destructive" data-block="server-launch-error">{error}</Small> : null}
      {order.map((id, i) => (opens[id]
        ? <LadderStep done={done[id]} id={`launch-${id}`} key={id} n={i + 1} title={words.step[id]}>{body[id]}</LadderStep>
        : <LadderLocked key={id} n={i + 1} text={words.locked} title={words.step[id]} />))}
    </section>
  )
}
