"use client"
// @local — the domain ladder of a server node's own panel (one route: the tab of the server itself); the launch page reuses its steps

import { useCallback, useEffect, useRef, useState } from "react"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { DnsZone } from "@/components/hosting/dns-records"
import { Ladder } from "@/components/hosting/ladder-step"
import { type ServerEnd, serverEndRungs } from "@/components/hosting/server-ladder-end.client"
import { RecordsStep } from "@/components/hosting/server-ladder-records.client"
import { DomainStep, domainLines, WhereStep, WhoStep } from "@/components/hosting/server-ladder-steps.client"
import type { LadderWay, ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { H2, Small } from "@/components/ui/typography"
import { normalWay } from "@/lib/hosting/launch-domain.mjs"

// ONE DOMAIN LADDER FOR THE COMPUTER AND THE SERVER (node step 737-19, D15). The owner, 2026-11-13, drew it: «ввести имя домена
// подтвердить, изменить · Запрос к домену проверка … кто его возвращает регистратор или Cloud Flyer · выбор у меня есть доступ к
// регистратору или … нету … · путь … для получения какого-то токена … · И только если ты строишь подключение к регистратору то тогда
// делаешь то что мы согласовали выше» (two accordions: the quick way and the alternative, with short comments and examples).
// 🔒 ONE SHAPE FOR EVERY DOOR: here the server's own `/api/node/server/domain`; the launch page of the person's computer builds the same
// view from the server's state read over SSH (`server-launch-domain.client.tsx`, 738). The steps never know which door spoke.
// 🔒 THE LADDER LAW: a step opens when the one before it is done; the state is the node's, measured there, never this island's. 744-7: one
// ladder of seven rungs, one open — which one is the part's rule (`Ladder`, `lib/hosting/ladder-rule.mjs`).

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
  records: DnsZone[]; dns: Record<string, string>; dnsAt: string | null; run: Run; names: Names; server: ServerEnd | null
}
type Raw = Record<string, unknown>

function fromServer(a: Raw): LadderView | null {
  if (a.phase !== "live" || !a.steps) return null
  const rows = (a.rows as ServerEnd["rows"]) ?? []
  const steps = a.steps as ServerEnd["steps"]
  return {
    zone: (a.zone as string) ?? null, ip: (a.ip as string) ?? null, readOnly: Boolean(a.readOnly), own: false, canType: !a.readOnly && !steps.active,
    detect: (a.detect as Detect) ?? null, way: (normalWay(a.way as string | null) as LadderWay | null) ?? null, records: (a.records as DnsZone[]) ?? [],
    dns: Object.fromEntries(rows.map((r) => [r.host, r.dns])), dnsAt: (a.dnsAt as string) ?? null, run: null, names: null,
    server: { rows, steps, certsRun: (a.certsRun as ServerEnd["certsRun"]) ?? null, helper: a.helper !== false, checkAt: (a.checkAt as string) ?? null },
  }
}

/** `folded` (800-2, the owner 2026-11-19: «по умолчанию … схлопнута в аккордеон. Сейчас она раскрыта и не видно где добавлять домен
 *  кастомный»): the domain page shows the ladder as ONE closed row under its subheading, like the additional domains' cards below it. */
export function ServerLadder({ words, domainWords, dialogUi, fallback, folded = false }: {
  words: ServerLadderWords; domainWords: ServerDomainWords; dialogUi: AppDialogUi; fallback?: string; folded?: boolean
}) {
  const door = `${BASE}/api/node/server/domain`
  const [view, setView] = useState<LadderView | null>(null)
  const [unfolded, setUnfolded] = useState("")
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
    // the server's own measure of every required name when it gave one (the certificates stood on it before 744-7), else this view's
    records: view.server ? view.server.steps.dns : pointing,
  }
  const summary = domainLines(view, words)
  const body = {
    domain: <DomainStep busy={busy} onSave={(n) => { setPrefill(null); return acts.domain(n) }} prefill={prefill} view={view} words={words} />,
    where: <WhereStep busy={busy} onAgain={acts.detect} onSub={(name) => setPrefill(name)} view={view} words={words} />,
    who: <WhoStep busy={busy} onChoose={acts.way} view={view} words={words} />,
    records: <RecordsStep busy={busy} onCheck={acts.check} view={view} words={words} />,
  }

  const rungs = [
    ...(["domain", "where", "who", "records"] as const).map((id) => ({ id, title: words.step[id], done: done[id], summary: summary[id], body: body[id] })),
    ...(view.server ? serverEndRungs({ busy, end: view.server, onAct: acts.server, readOnly: view.readOnly, words: domainWords, zone: view.zone }) : []),
  ]
  const ladder = (
    <Ladder className={folded ? "rounded-none border-0 bg-transparent" : undefined} focus={prefill ? "domain" : null} id="server-domain" locked={words.locked} rungs={rungs} />
  )
  const on = Boolean(view.server?.steps.active)
  const step = Math.min(rungs.filter((r) => r.done).length + 1, rungs.length)

  return (
    <div className="flex flex-col gap-3" data-block="server-ladder">
      <div className="flex flex-col gap-1" data-block="server-ladder-head">
        <H2 variant="ui">{words.title}</H2>
        <Small className={folded ? "text-muted-foreground" : "text-foreground"}>{words.lead.replace("{ip}", view.ip ?? "")}</Small>
      </div>
      {error ? <Small className="text-destructive" data-block="server-ladder-error">{error}</Small> : null}
      {folded ? (
        <Accordion className="rounded-lg border border-border bg-card" collapsible data-block="server-ladder-fold" onValueChange={setUnfolded} type="single" value={prefill ? "ladder" : unfolded}>
          <AccordionItem className="border-b-0" value="ladder">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-muted-foreground">{words.fold.row}</span>
                <span className="truncate font-mono font-semibold text-foreground" data-block="server-ladder-fold-zone">{view.zone ?? words.fold.none}</span>
                <Badge className={on ? "border-success/50 text-success" : "text-muted-foreground"} data-block="server-ladder-fold-state" variant="outline">
                  {on ? words.fold.on : words.fold.step.replace("{n}", String(step)).replace("{m}", String(rungs.length))}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="border-t border-border pb-0">{ladder}</AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : ladder}
    </div>
  )
}
