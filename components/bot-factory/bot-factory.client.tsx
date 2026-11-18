"use client"
// @part bot-factory — the node's bot factory on a bot page: its one-time setup (the core's page) and «make this bot with one tap» (any)

import { useCallback, useEffect, useState } from "react"
import { Check, ExternalLink } from "lucide-react"
import { CopyRow, Step, StepPoints } from "@/components/auth/setup-ladder.client"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { H3, Small } from "@/components/ui/typography"
import type { BotFactoryWords } from "./bot-factory.i18n"

// 798-2 (the owner, 2026-11-18, Telegram 786–790): «человек прочитает задачу и подтвердит чеклист» — the task in points, his ticks, and the
// node's own check (Telegram's getMe.can_manage_bots) before the factory is kept. Then every bot page makes its bot by one tap: the door
// opens Telegram's own window, a detached waiter takes the token and connects it to the page's service. The token goes one way.

type Factory = { ready: boolean; username?: string; tail?: string; live?: string }
type Wait = { service?: string; state?: string; error?: string; bot?: { username?: string; tail?: string } } | null
type State = { factory: Factory; suggestion: { name: string; username: string } | null; wait: Wait }

const DOOR = "/api/node/bot-factory"
const BOTFATHER = "https://t.me/BotFather"
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

export function BotFactory({ service, lang, words: w }: { service: string; lang: string; words: BotFactoryWords }) {
  const core = service === "build"
  const [st, setSt] = useState<State | null>(null)
  const [ticks, setTicks] = useState<boolean[]>(() => w.checks.map(() => false))
  const [token, setToken] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [replacing, setReplacing] = useState(false)
  const [link, setLink] = useState<string | null>(null)

  const load = useCallback(async (live = false) => {
    const r = await fetch(`${DOOR}${live ? "?live=1" : ""}`, { cache: "no-store" }).then((x) => x.json()).catch(() => null)
    if (r?.ok) setSt({ factory: r.factory, suggestion: r.suggestion, wait: r.wait })
  }, [])
  useEffect(() => { void load() }, [load])

  const mine = st?.wait?.service === service ? st.wait : null
  const waiting = mine?.state === "waiting"
  useEffect(() => {
    if (!waiting) return
    const t = setInterval(() => { void load() }, 3000)
    return () => clearInterval(t)
  }, [waiting, load])

  async function save() {
    setBusy("save"); setError(null)
    const value = token.trim()
    setToken("")
    const r = await fetch(DOOR, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", token: value }) }).then((x) => x.json()).catch(() => null)
    setBusy(null)
    if (r?.ok) { setReplacing(false); await load() } else setError(fill(w.errors[r?.error] ?? w.errors["telegram-unreachable"], { username: r?.username ?? "" }))
  }
  async function create() {
    setBusy("create"); setError(null)
    const r = await fetch(DOOR, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", service, lang }) }).then((x) => x.json()).catch(() => null)
    setBusy(null)
    if (!r?.ok) { setError(fill(w.failed, { error: r?.error ?? "—" })); return }
    setLink(r.url)
    window.open(r.url, "_blank", "noopener,noreferrer")
    await load()
  }

  if (!st) return null
  const f = st.factory
  const err = error && <p data-block="bfer1" role="status" className="rounded-lg border border-destructive/40 px-4 py-3 text-destructive text-sm">{error}</p>

  // Another page and no factory yet: one line to the core's page; the hand road below stays.
  if (!f.ready && !core) {
    return (
      <p data-block="bfmi1" className="my-4 text-muted-foreground text-sm">
        {w.missing}{" "}
        <a data-block="bfmi2" href={`/${lang}/architect/build/telegram`} className="text-primary underline-offset-4 hover:underline">{w.missingLink}</a>
      </p>
    )
  }

  const setup = core && (!f.ready || replacing) && st.suggestion !== undefined && (
    <section data-block="bfst1" data-bot-factory="setup" className="my-6 flex flex-col gap-3 rounded-xl border p-5">
      <H3>{w.title}</H3>
      <p data-block="bfst2" className="text-muted-foreground text-sm">{w.lead}</p>
      <Small className="text-muted-foreground">{w.why}</Small>
      <Step n={1} title={w.step1Title}>
        <StepPoints items={w.step1Points} />
        {st.suggestion && <CopyRow id="bf-name" label={w.nameLabel} value={st.suggestion.name} copy={w.copy} copied={w.copied} />}
        {st.suggestion && <CopyRow id="bf-username" label={w.usernameLabel} value={st.suggestion.username} copy={w.copy} copied={w.copied} />}
        <div data-block="bfst3" className="mt-3">
          <a href={BOTFATHER} target="_blank" rel="noreferrer noopener" className={buttonVariants({ variant: "outline" })}>
            {w.openBotFather}<ExternalLink className="ml-2 size-4" aria-hidden />
          </a>
        </div>
      </Step>
      <Step n={2} title={w.step2Title}><StepPoints items={w.step2Points} /></Step>
      <Step n={3} title={w.step3Title}>
        <div data-block="bfst4" className="flex flex-col gap-2">
          {w.checks.map((c, i) => (
            <div data-block="bfst5" key={c} className="flex items-center gap-2">
              <Checkbox id={`bf-check-${i}`} checked={ticks[i]} onCheckedChange={(v) => setTicks((t) => t.map((x, j) => (j === i ? v === true : x)))} />
              <Label htmlFor={`bf-check-${i}`} className="font-normal">{c}</Label>
            </div>
          ))}
        </div>
        <div data-block="bfst6" className="mt-3 flex flex-col gap-1">
          <Label htmlFor="bf-token">{w.tokenLabel}</Label>
          <Input id="bf-token" type="password" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" spellCheck={false} className="font-mono text-xs" />
          <Small className="text-muted-foreground">{w.tokenHint}</Small>
        </div>
        <div data-block="bfst7" className="mt-3">
          <Button type="button" onClick={save} disabled={busy !== null || !token.trim() || ticks.some((t) => !t)}>
            {busy === "save" && <Spinner className="size-4" />}{busy === "save" ? w.saving : w.save}
          </Button>
        </div>
      </Step>
      {err}
    </section>
  )

  const ready = f.ready && !replacing && (
    <section data-block="bfrd1" data-bot-factory="ready" className="my-6 flex flex-col gap-3 rounded-xl border p-5">
      {core && (
        <div data-block="bfrd2" className="flex flex-wrap items-center gap-3">
          <p data-block="bfrd3" className="flex items-center gap-2 text-sm"><Check className="size-4 text-primary" aria-hidden />{fill(w.ready, { username: f.username ?? "", tail: f.tail ?? "" })}</p>
          <Button type="button" variant="ghost" size="sm" onClick={() => load(true)}>{w.recheck}</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setReplacing(true)}>{w.replace}</Button>
        </div>
      )}
      <H3>{w.createTitle}</H3>
      <p data-block="bfrd4" className="text-muted-foreground text-sm">{w.createText}</p>
      <div data-block="bfrd5" className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={create} disabled={busy !== null || waiting}>
          {(busy === "create" || waiting) && <Spinner className="size-4" />}{w.create}
        </Button>
        {waiting && link && <a href={link} target="_blank" rel="noreferrer noopener" className={buttonVariants({ variant: "outline" })}>{w.openAgain}<ExternalLink className="ml-2 size-4" aria-hidden /></a>}
      </div>
      {waiting && <Small className="text-muted-foreground">{w.waiting}</Small>}
      {mine?.state === "done" && <p data-block="bfrd6" role="status" className="text-sm">{fill(w.done, { username: mine.bot?.username ?? "", tail: mine.bot?.tail ?? "" })}</p>}
      {(mine?.state === "timeout" || mine?.state === "stopped") && <p data-block="bfrd7" role="status" className="text-muted-foreground text-sm">{w.timeout}</p>}
      {mine?.state === "error" && <p data-block="bfrd8" role="status" className="text-destructive text-sm">{fill(w.failed, { error: mine.error ?? "—" })}</p>}
      {err}
    </section>
  )

  return <>{setup}{ready}</>
}
