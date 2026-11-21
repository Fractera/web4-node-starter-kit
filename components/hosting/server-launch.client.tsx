"use client"
// @local — the launch of a dedicated server (one route: «Активация выделенного сервера»); its pieces are the parts ladder-step and stage-log

import { ActionButton } from "@/components/hosting/action-button.client"
import { type ReactNode, useCallback, useEffect, useState } from "react"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { DnsZone } from "@/components/hosting/dns-records"
import { Ladder } from "@/components/hosting/ladder-step"
import { LaunchRememberSwitch, useLaunchRemember } from "@/components/hosting/launch-remember-switch.client"
import type { CertRow, CertsRun } from "@/components/hosting/server-domain-certs.client"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { CheckStep, strategyOf } from "@/components/hosting/server-launch-check.client"
import { LaunchDanger } from "@/components/hosting/server-launch-danger.client"
import { LaunchDomain } from "@/components/hosting/server-launch-domain.client"
import { RepoStep } from "@/components/hosting/server-launch-repo.client"
import { TelegramActivation, TelegramStep } from "@/components/hosting/server-launch-telegram.client"
import { telegramWarn } from "@/lib/hosting/server-telegram.mjs"
import { CertsLaunchStep, InstallStep, ReadyStep, RecheckStep } from "@/components/hosting/server-launch-end.client"
import type { ClaimShown } from "@/components/hosting/server-launch-claim.client"
import { LAUNCH_ORDER, launchDone, launchSummary, untilText } from "@/components/hosting/server-launch-rungs"
import type { LaunchStep, ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import type { Detect } from "@/components/hosting/server-ladder.client"
import type { LadderWay, ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import type { Stage } from "@/components/hosting/stage-log"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { H2, Small } from "@/components/ui/typography"

// «ЗАПУСТИТЬ СЕРВЕР» (node step 738-4): the page is empty until the address is typed; any number of servers, one after another.
// 🔒 THE PAGE KEEPS NO SECRET: 760-1 «Запомнить сервер на 24 часа» keeps the address, port and access deadline in this browser — never the
// password. Everything shown is the server's own answer (`/api/node/launch` → the server over SSH): the same address shows the same truth.
// 🔒 THE LADDER LAW (259-1, 744-7): which step is open is the part's one rule (`Ladder`, `lib/hosting/ladder-rule.mjs`); this island only
// says what each step has done (`server-launch-rungs.ts`). D46: the installation opens after the domain, never past an empty step 3.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type CoreRow = CertRow & { zone: string; label: string; kind: string; https: boolean | null; status: number | null; off?: boolean }
export type LaunchState = {
  host?: string
  cleared?: { state?: string; detail?: string; stopped?: number; backup?: string | null; nodes?: string[]; erased?: string[]; freedGb?: number; freeGb?: number } | null
  probe: { /** 806-2 */ diskFreeGb?: number; disk?: { totalGb: number; usedGb: number; copies: string[]; copiesGb: number | null }; publicIp?: string | null; otherNodes?: string[]; fractera: { head: string | null; ahead: number | null; behind: number | null; phase: string | null; launching: boolean; origin?: string | null; movedFrom?: { from?: string | null; at?: string | null } | null } | null } | null
  /** 744-4 (D49): what the server is to this node — `lib/hosting/relation.mjs`, computed by the runner from the probe */
  relation?: { kind: "clean" | "related" | "unrelated"; nodeUnrelated: boolean; nodes?: string[]; reasons: Array<{ id: string; from?: string | null; at?: string | null; origin?: string; folders?: string[]; sites?: string[]; count?: number }> } | null
  launch: { state: "running" | "done" | "failed"; mode?: string; startedAt?: string; failed?: string | null; detail?: string; version?: { head: string; behind: number | null } | null } | null
  progress: Stage[]
  sub: Stage[]
  update: { state?: string; stage?: string; summary?: string; reason?: string } | null
  /** 744-5: `from: "server"` — written from the server node's own mark (`since` — the mark's date): a domain the server already held */
  domain: { domain?: string; way?: LadderWay | null; detect?: Detect | null; check?: { at: string; results: Array<{ host: string; state: string }> } | null; signin?: { ok: boolean; providers: unknown; location: string | null; at?: string } | null; from?: string; since?: string | null } | null
  mark: { phase?: string; domain?: string; domainActive?: boolean } | null
  core: { zone: string | null; rows: CoreRow[]; steps: { domain: boolean; dns: boolean; certs: boolean; check: boolean; active: boolean }; certsRun: CertsRun; helper: boolean; checkAt: string | null; dnsAt: string | null } | null
  verdict: { level: "ok" | "warn" | "fail"; items: Array<{ id: string; level: string; value?: unknown; need?: unknown }> } | null
  /** 743-4: the trial merge of the update on the server (the target's own updater, `--preflight`), when a node there is behind. */
  preflight?: { at: string; verdict: { ok: boolean; conflicts?: string[]; reason?: string } | null } | null
  records: DnsZone[]
  week: number | null
  /** 758: the server's own bot as the page may know it — never the token (`lib/hosting/server-telegram.mjs`) */
  /** 808: the server's own repository (`lib/hosting/server-repo.mjs` readRepo) — `url` what the installation clones */
  repo?: { mode: "same" | "own"; url: string | null; account: boolean; fork: boolean; checkedAt: string | null } | null
  telegram?: { configured: boolean; pending: boolean; skipped: boolean; tail: string | null; username: string | null; name: string | null; allowed: number; rejected: string | null; live: boolean; signedIn?: boolean | null; greeted?: boolean } | null
}
type Answer = { ok?: boolean; reason?: string; state?: LaunchState; fingerprint?: string; seen?: string | null; pinned?: string | null; cleared?: LaunchState["cleared"]; week?: number; want?: number; over?: string[]; visit?: { deadline: string } | null }
/** 744-3: `until` — the end of this browser's access to the server (the server's own deadline); the key itself never reaches the page. */
type Target = { host: string; port: number; fingerprint: string | null; until: string | null }

export function ServerLaunch({ lang, words, ladderWords, domainWords, dialogUi }: { lang: string; words: ServerLaunchWords; ladderWords: ServerLadderWords; domainWords: ServerDomainWords; dialogUi: AppDialogUi }) {
  const [form, setForm] = useState({ host: "", port: "22", password: "" })
  const [target, setTarget] = useState<Target | null>(null)
  const [state, setState] = useState<LaunchState | null>(null)
  const [busy, setBusy] = useState(false)
  const [doing, setDoing] = useState("") // 744: the act that runs now — its own line beside the greyed buttons
  const [closing, setClosing] = useState(false)
  const [panel, setPanel] = useState<{ url: string | null; opening: boolean }>({ url: null, opening: false })
  const [error, setError] = useState("")
  const [changed, setChanged] = useState<{ seen: string; pinned: string | null } | null>(null)
  const [askPass, setAskPass] = useState(false) // 795 (Telegram 683): the password field only on the server's «need-password»
  const [claim, setClaim] = useState<(ClaimShown & { host: string }) | null>(null) // 739-5: kept here, a look back loses nothing
  const { on: remembering, kept, keep, forget, toggle } = useLaunchRemember((k) => setForm({ host: k.host, port: String(k.port), password: "" }))

  const say = useCallback((a: Answer | null) => {
    if (!a || a.ok === false) {
      const reason = String(a?.reason ?? "network")
      const over = a?.over?.length ? ` (${a.over.join(", ")})` : ""
      setError((words.errors[reason] ?? reason).replace("{week}", String(a?.week ?? "")).replace("{want}", String(a?.want ?? "")).replace("{over}", over))
    } else setError("")
  }, [words])
  const post = useCallback(async (body: Record<string, unknown>): Promise<Answer | null> => {
    try {
      const r = await fetch(`${BASE}/api/node/launch`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" })
      return (await r.json().catch(() => null)) as Answer | null
    } catch { return null }
  }, [])
  const act = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    if (!target) return
    if (action === "claim" && extra.status === true) return post({ action, host: target.host, port: target.port, ...extra }) // 796 ✗ 14:56: a quiet read
    setBusy(true); setDoing(action)
    try {
      const a = await post({ action, host: target.host, port: target.port, ...extra })
      say(a)
      // 744-3: the access ended (its deadline, or closed elsewhere) — back to step 1, the password again.
      if (a?.reason === "need-password") { setTarget(null); setState(null); setPanel({ url: null, opening: false }); setAskPass(true); forget(); return a }
      if (a?.state) setState({ ...a.state, host: target.host, cleared: action === "clear" ? (a.cleared ? { state: "done", ...a.cleared } : { state: "failed", detail: a.reason }) : state?.cleared ?? null })
      return a
    } finally { setBusy(false); setDoing("") }
  }, [target, post, say, state?.cleared, forget])

  async function closeAccess() {
    if (!target) return
    setBusy(true); setClosing(true)
    try {
      await post({ action: "close", host: target.host, port: target.port })
      forget(); setTarget(null); setState(null); setError(""); setPanel({ url: null, opening: false })
    } finally { setBusy(false); setClosing(false) }
  }

  // 744-3, D45: the server's own panel through SSH, opened by the door with this browser's visit; it ends with the access.
  async function openPanel() {
    if (!target) return
    setPanel({ url: null, opening: true })
    const a = await post({ action: "window", host: target.host, port: target.port })
    say(a)
    if (a?.reason === "need-password") { setTarget(null); setState(null); setAskPass(true); forget() }
    setPanel({ url: a?.ok ? (a as { window?: { url?: string } }).window?.url ?? null : null, opening: false })
  }

  async function connect(trust: string | null = null) {
    const host = form.host.trim().toLowerCase()
    const port = Number(form.port) || 22
    setBusy(true)
    setError("")
    try {
      const a = await post({ action: "connect", host, port, password: form.password, ...(trust ? { trust } : {}) })
      // 795: no access yet and no password typed — not an error, the field appears with its own lead
      if (a?.reason === "need-password" && !form.password) { setAskPass(true); setError(""); return }
      say(a)
      if (a?.reason === "host-key-changed" && a.seen) { setChanged({ seen: a.seen, pinned: a.pinned ?? null }); setAskPass(true) }
      // 769: the password's answer carries the access at once; the server is checked by the next call, which can lose nothing
      let st = a?.ok ? a.state ?? null : null
      if (a?.ok) keep(host, port, a.visit?.deadline ?? null)
      if (a?.ok && !st) {
        setDoing("checking")
        const p = await post({ action: "probe", host, port })
        if (!(st = p?.state ?? null)) setError(words.checkFailed.replace("{reason}", p?.reason ?? "timeout"))
      }
      if (a?.ok && st) {
        setChanged(null)
        setAskPass(false)
        setTarget({ host, port, fingerprint: a.fingerprint ?? null, until: a.visit?.deadline ?? null })
        setState({ ...st, host })
      }
    } finally {
      setBusy(false); setDoing("")
      setForm((f) => ({ ...f, password: "" }))
    }
  }

  // While the server works (a launch, a certificate run), the page asks it every 5 s; otherwise it waits for a press.
  // 758: a bot token that waits for the server's node keeps the page asking until the node takes it
  const working = state?.launch?.state === "running" || Boolean(state?.core?.certsRun?.running) || Boolean(state?.telegram?.pending && !state?.core)
  useEffect(() => {
    if (!target || !working) return
    const t = setInterval(() => {
      void post({ action: "state", host: target.host, port: target.port }).then((a) => { if (a?.state) setState((s) => ({ ...(a.state as LaunchState), host: target.host, cleared: s?.cleared ?? null })) })
    }, 5000)
    return () => clearInterval(t)
  }, [target, working, post])

  if (!target || !state) { // 744-7: step 1 is this form, the steps after it stand closed — the whole way seen from the start
    const access = (
      <div className="flex flex-col gap-4" data-block="server-launch-form">
        <Small className="text-foreground">{words.lead}</Small>
        <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
          <Field><FieldLabel htmlFor="launch-host">{words.host}</FieldLabel><Input autoComplete="off" id="launch-host" inputMode="decimal" onChange={(e) => { setForm({ ...form, host: e.target.value, password: "" }); setAskPass(false); setChanged(null); setError("") }} placeholder="203.0.113.7" value={form.host} /></Field>
          <Field><FieldLabel htmlFor="launch-port">{words.port}</FieldLabel><Input id="launch-port" inputMode="numeric" onChange={(e) => setForm({ ...form, port: e.target.value })} value={form.port} /></Field>
        </div>
        {kept && kept.host === form.host.trim().toLowerCase() && !askPass ? <Small className="text-muted-foreground" data-block="server-launch-kept">{words.remember.noPassword.replace("{time}", untilText(kept.until))}</Small> : null}
        {askPass ? (
          <Field data-block="server-launch-password">
            <Small className="rounded-md border border-warning/50 bg-warning/10 px-3 py-2 font-medium text-foreground" role="status">! {words.passwordAsk}</Small>
            <FieldLabel htmlFor="launch-password">{words.password}</FieldLabel>
            <Input autoComplete="off" autoFocus id="launch-password" onChange={(e) => setForm({ ...form, password: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter" && form.password && !busy) void connect() }} type="password" value={form.password} />
            <FieldDescription>{words.passwordNote}</FieldDescription>
          </Field>
        ) : null}
        {changed ? (
          <div className="flex flex-col gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3" data-block="server-launch-changed">
            <p className="font-medium text-foreground text-sm">{words.changed.title}</p>
            <Small className="text-muted-foreground">{words.changed.text}</Small>
            <Small className="break-all font-mono text-foreground">{words.changed.seen} {changed.seen}</Small>
            {changed.pinned ? <Small className="break-all font-mono text-muted-foreground">{words.changed.pinned} {changed.pinned}</Small> : null}
            <div><ActionButton disabled={busy} kind="danger" onAction={() => form.password ? connect(changed.seen) : setError(words.passwordMissing)}>{words.changed.trust}</ActionButton></div>
          </div>
        ) : null}
        {/* 761-16: «no access» is the person's action, not a failure — an orange card with «!» (the owner: a window you cannot miss) */}
        {error && !changed ? (error === words.errors["need-password"] ? <Small role="alert" className="rounded-md border border-warning/50 bg-warning/10 px-3 py-2 font-medium text-foreground" data-block="server-launch-need-hands">! {error}</Small> : <Small className="text-destructive" data-block="server-launch-error">{error}</Small>) : null}
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton disabled={busy} onAction={() => !form.host.trim() ? setError(words.hostMissing) : askPass && !form.password ? setError(words.passwordMissing) : connect()} size="default">{askPass ? words.openAccess : words.connect}</ActionButton>
          {busy ? <Small className="text-muted-foreground">{doing === "checking" ? words.checking : words.connecting}</Small> : null}
        </div>
      </div>
    )
    return (
      <section className="my-6 flex flex-col gap-3" data-block="server-launch">
        <H2 variant="ui">{words.title}</H2>
        <LaunchRememberSwitch on={remembering} onChange={(v) => toggle(v, target)} words={words.remember} />
        <Ladder id="launch" locked={words.locked} rungs={LAUNCH_ORDER.map((id) => ({ id, title: words.step[id], done: false, body: id === "server" ? access : null }))} />
      </section>
    )
  }

  const strategy = strategyOf(state)
  const done = launchDone(state, strategy)
  const summary = launchSummary(state, target, words, ladderWords)
  const body: Record<LaunchStep, ReactNode> = {
    server: (
      <div className="flex flex-col gap-2" data-block="server-launch-access">
        <Small className="break-all text-muted-foreground">{words.connected.replace("{host}", target.host).replace("{fp}", target.fingerprint ?? "—")}</Small>
        <div className="flex flex-wrap items-center gap-3" data-block="server-launch-access-actions">
          {target.until ? <Small className="font-medium text-foreground tabular-nums">{words.access.until.replace("{time}", untilText(target.until))}</Small> : null}
          <ActionButton disabled={busy} kind="second" onAction={() => closeAccess()} pendingText={words.access.closing}>{words.access.close}</ActionButton>
          <ActionButton disabled={busy} kind="second" onAction={() => { setTarget(null); setState(null); setError(""); setPanel({ url: null, opening: false }); setForm({ host: "", port: "22", password: "" }) }}>{words.another}</ActionButton>
        </div>
        <div className="flex flex-wrap items-center gap-3" data-block="server-launch-panel">
          {panel.url
            ? <a className={buttonVariants({ variant: "link", size: "sm", className: "px-0" })} href={panel.url} rel="noopener noreferrer" target="_blank">{words.window.link.replace("{url}", panel.url)}</a>
            : <ActionButton disabled={busy} kind="second" onAction={() => openPanel()} pending={panel.opening} pendingText={words.window.opening}>{words.window.open}</ActionButton>}
          <Small className="text-muted-foreground">{words.window.note}</Small>
        </div>
      </div>
    ),
    check: <CheckStep busy={busy} dialogUi={dialogUi} onAct={async (a, x) => { await act(a, x) }} state={state} words={words} />,
    domain: <LaunchDomain busy={busy} dialogUi={dialogUi} lang={lang} launchWords={words} note={words.domainNote} onAct={act} state={state} words={ladderWords} />,
    repo: <RepoStep busy={busy} onAct={act} state={state} words={words} />,
    install: <InstallStep busy={busy} onAct={act} state={state} strategy={strategy} target={target} words={words} />,
    telegram: <TelegramStep busy={busy} lang={lang} onAct={act} state={state} words={words} />,
    recheck: <RecheckStep busy={busy} domainWords={domainWords} onAct={act} state={state} words={words} />,
    certs: <CertsLaunchStep busy={busy} domainWords={domainWords} onAct={act} state={state} words={words} />,
    ready: <><TelegramActivation busy={busy} lang={lang} onAct={act} state={state} words={words} /><ReadyStep busy={busy} dialogUi={dialogUi} claim={claim?.host === target.host ? claim : { sent: null, claimed: null }} onAct={act} onClaim={(c) => setClaim({ ...c, host: target.host })} state={state} words={words} /></>,
  }
  return (
    <section className="my-6 flex flex-col gap-3" data-block="server-launch" data-host={target.host}>
      <H2 variant="ui">{words.title}</H2>
      <LaunchRememberSwitch on={remembering} onChange={(v) => toggle(v, target)} words={words.remember} />
      {error ? <Small className="text-destructive" data-block="server-launch-error">{error}</Small> : null}
      {busy && doing ? <Small className="flex items-center gap-2 text-muted-foreground" data-block="server-launch-doing" role="status"><Spinner className="size-4" />{words.doing[doing] ?? words.doing.any}</Small> : null}
      <Ladder id="launch" locked={words.locked} rungs={LAUNCH_ORDER.map((id) => ({ id, title: words.step[id], done: done[id], busy: id === "install" && state.launch?.state === "running", warn: id === "telegram" && telegramWarn(state.telegram), summary: summary[id], body: body[id] }))} />
      {strategy !== "running" && (state.relation?.kind === "unrelated" || state.probe?.fractera?.head) ? <LaunchDanger busy={busy} dialogUi={dialogUi} onAct={async (a, x) => { await act(a, x) }} state={state} words={words} /> : null}
    </section>
  )
}
