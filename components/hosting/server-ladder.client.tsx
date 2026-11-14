"use client"
// @local — the domain ladder of a server node's own panel (one route: the tab of the server itself); the launch page reuses its steps

import { useCallback, useEffect, useRef, useState } from "react"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { DomainLadderWords } from "@/components/domain/domain-ladder.i18n"
import type { DnsZone } from "@/components/hosting/dns-records"
import { LadderLocked, LadderStep } from "@/components/hosting/ladder-step"
import { ServerEndSteps, type ServerEnd } from "@/components/hosting/server-ladder-end.client"
import { RecordsStep } from "@/components/hosting/server-ladder-records.client"
import { DomainStep, WhereStep, WhoStep } from "@/components/hosting/server-ladder-steps.client"
import type { LadderWay, ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { H2, Small } from "@/components/ui/typography"

// ONE DOMAIN LADDER FOR THE COMPUTER AND THE SERVER (node step 737-19, D15). The owner, 2026-11-13, drew it: «ввести имя домена
// подтвердить, изменить · Запрос к домену проверка … кто его возвращает регистратор или Cloud Flyer · выбор у меня есть доступ к
// регистратору или … нету … · путь … для получения какого-то токена … · И только если ты строишь подключение к регистратору то тогда
// делаешь то что мы согласовали выше» (two accordions: the quick way and the alternative, with short comments and examples).
// 🔒 ONE SHAPE FOR EVERY DOOR: here the server's own `/api/node/server/domain`; the launch page of the person's computer builds the same
// view from the server's state read over SSH (`server-launch-domain.client.tsx`, 738). The steps never know which door spoke.
// 🔒 THE LADDER LAW: a step opens when the one before it is done; the state is the node's, measured there, never this island's.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
export type Detect = {
  name: string; zone: string; sub: string; ns: string[]; nsTtl: number | null; dnsHost: "cloudflare" | "other" | "none"; changing: boolean
  a: string[]; aKind: "server" | "cloudflare" | "elsewhere" | "none" | "unknown"; mx: string[]; txt: string[]; ds: boolean
  registrar: string | null; expires: string | null; site: { status: number; title: string | null } | null; at: string
}
type Run = { state: "saved" | "starting" | "running" | "done" | "failed"; detail?: string } | null
export type Names = { zone: string | null; names?: number; pointing?: string[]; certified?: string[]; waiting?: string[] } | null
export type LadderView = {
  zone: string | null; ip: string | null; readOnly: boolean; own: boolean; canType: boolean; detect: Detect | null; way: LadderWay | null
  key: boolean; records: DnsZone[]; dns: Record<string, string>; dnsAt: string | null; run: Run; names: Names; server: ServerEnd | null
}
type Raw = Record<string, unknown>

function fromServer(a: Raw): LadderView | null {
  if (a.phase !== "live" || !a.steps) return null
  const rows = (a.rows as ServerEnd["rows"]) ?? []
  const steps = a.steps as ServerEnd["steps"]
  return {
    zone: (a.zone as string) ?? null, ip: (a.ip as string) ?? null, readOnly: Boolean(a.readOnly), own: false, canType: !a.readOnly && !steps.active,
    detect: (a.detect as Detect) ?? null, way: (a.way as LadderWay) ?? null, key: Boolean(a.key), records: (a.records as DnsZone[]) ?? [],
    dns: Object.fromEntries(rows.map((r) => [r.host, r.dns])), dnsAt: (a.dnsAt as string) ?? null, run: null, names: null,
    server: { rows, steps, certsRun: (a.certsRun as ServerEnd["certsRun"]) ?? null, helper: a.helper !== false, checkAt: (a.checkAt as string) ?? null },
  }
}

export function ServerLadder({ words, domainWords, keyWords, dialogUi, fallback }: {
  words: ServerLadderWords; domainWords: ServerDomainWords; keyWords: DomainLadderWords; dialogUi: AppDialogUi; fallback?: string
}) {
  const door = `${BASE}/api/node/server/domain`
  const [view, setView] = useState<LadderView | null>(null)
  const [answered, setAnswered] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [prefill, setPrefill] = useState<string | null>(null)
  const detected = useRef<string | null>(null)

  const read = useCallback((a: Raw) => setView(fromServer(a)), [])
  const load = useCallback(async (query = "") => {
    try {
      const r = await fetch(`${door}${query}`, { cache: "no-store" })
      if (r.ok) read((await r.json()) as Raw)
    } catch { /* the last known state stays on screen */ } finally {
      setAnswered(true)
    }
  }, [door, read])

  async function post(body: Raw, then = "") {
    setBusy(true)
    setError("")
    try {
      const r = await fetch(door, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      const a = (await r.json().catch(() => null)) as Raw | null
      if (!r.ok || a?.ok === false) setError(words.domain.errors[String(a?.reason ?? "")] ?? String(a?.reason ?? words.domain.errors.network))
      return a
    } catch {
      setError(words.domain.errors.network)
      return null
    } finally {
      setBusy(false)
      await load(then)
    }
  }

  const acts = {
    domain: (name: string) => post({ action: "domain", name }),
    detect: async () => { setBusy(true); try { await post({ action: "detect" }) } finally { setBusy(false) } },
    way: (way: LadderWay) => post({ action: "way", way }),
    check: async () => { setBusy(true); try { await post({ action: "dns-check" }) } finally { setBusy(false) } },
    cloudflare: () => post({ action: "cloudflare-write" }),
    server: async (action: string, extra: Raw = {}) => { await post({ action, ...extra }) },
  }

  useEffect(() => { void load() }, [load])
  // The domain known and never asked about — the node asks the internet once, by itself.
  useEffect(() => {
    if (!view?.zone || view.readOnly || view.detect || detected.current === view.zone) return
    detected.current = view.zone
    void acts.detect()
  })
  // While the server takes the domain or issues certificates, the screen follows it.
  const working = view?.run?.state === "starting" || view?.run?.state === "running" || Boolean(view?.server?.certsRun?.running)
  useEffect(() => {
    if (!working) return
    const t = setInterval(() => void load(), 4000)
    return () => clearInterval(t)
  }, [working, load])

  if (!view) return answered && fallback ? <p className="my-6 text-muted-foreground text-sm" data-block="server-ladder-none">{fallback}</p> : null

  const required = (view.records[0]?.records ?? []).filter((r) => !r.optional).map((r) => r.host)
  const pointing = required.length > 0 && required.every((h) => view.dns[h] === "ok")
  const done = {
    domain: Boolean(view.zone),
    where: Boolean(view.detect && view.detect.dnsHost !== "none"),
    who: Boolean(view.way && view.way !== "none"),
    records: pointing,
  }
  const order = ["domain", "where", "who", "records"] as Array<keyof typeof done>
  const body = {
    domain: <DomainStep busy={busy} onSave={(n) => { setPrefill(null); return acts.domain(n) }} prefill={prefill} view={view} words={words} />,
    where: <WhereStep busy={busy} onAgain={acts.detect} onSub={(name) => setPrefill(name)} view={view} words={words} />,
    who: <WhoStep busy={busy} onChoose={acts.way} view={view} words={words} />,
    records: <RecordsStep busy={busy} dialogUi={dialogUi} keyWords={keyWords} onCheck={acts.check} onKeySaved={() => load()} onWrite={acts.cloudflare} view={view} words={words} />,
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4" data-block="server-ladder">
      <H2 variant="ui">{words.title}</H2>
      <Small className="text-foreground">{words.lead.replace("{ip}", view.ip ?? "")}</Small>
      {error ? <Small className="text-destructive" data-block="server-ladder-error">{error}</Small> : null}
      {order.map((id, i) => {
        const open = order.slice(0, i).every((p) => (p === "records" ? done.who : done[p]))
        if (!open) return <LadderLocked key={id} n={i + 1} text={words.locked} title={words.step[id]} />
        return <LadderStep done={done[id]} id={`domain-${id}`} key={id} n={i + 1} title={words.step[id]}>{body[id]}</LadderStep>
      })}
      {view.server && done.who ? (
        <ServerEndSteps busy={busy} end={view.server} first={order.length + 1} onAct={acts.server} readOnly={view.readOnly} words={domainWords} zone={view.zone} />
      ) : null}
    </div>
  )
}
