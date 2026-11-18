"use client"
// @part bot-factory — the node's bot factory on a bot page: its one-time setup (the core's page) and «make this bot with one tap» (any)

import { type ReactNode, useCallback, useEffect, useState } from "react"
import { Check, ExternalLink } from "lucide-react"
import { CopyRow } from "@/components/auth/setup-ladder.client"
import { Ladder } from "@/components/hosting/ladder-step"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { H3, Small } from "@/components/ui/typography"
import type { BotFactoryWords } from "./bot-factory.i18n"
import { tokenFrom } from "@/lib/hosting/server-telegram.mjs"

// 798-2 (the owner, 2026-11-18, Telegram 786–790): the task, his checklist, the node's own check. Telegram 799: «километр какая-то простыня»
// → the page's own ladder (the server and domain pages, his 775): one rung open, a done rung one line, every instruction under «Подробнее»,
// only fields and buttons in view. His tick on rungs 1 and 2 is «Сделал»; rung 3 is done only by Telegram's getMe.can_manage_bots.

type Factory = { ready: boolean; kept?: boolean; dead?: boolean; username?: string; tail?: string; live?: string }
type Wait = { service?: string; state?: string; error?: string; bot?: { username?: string; tail?: string } } | null
type State = { factory: Factory; suggestion: { name: string; username: string } | null; wait: Wait }

const DOOR = "/api/node/bot-factory"
const BOTFATHER = "https://t.me/BotFather"
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)
const post = (body: Record<string, unknown>) =>
  fetch(DOOR, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((x) => x.json()).catch(() => null)

/** «Подробнее»: an instruction, closed by default. */
function More({ id, label, children, plain = false }: { id: string; label: string; children: ReactNode; plain?: boolean }) {
  return (
    <Accordion type="single" collapsible data-block={`bf-more-${id}`}>
      <AccordionItem value="more" className="border-b-0">
        <AccordionTrigger className="py-1 text-muted-foreground text-sm">{label}</AccordionTrigger>
        <AccordionContent className={plain ? "flex flex-col gap-3" : "text-muted-foreground text-sm"}>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
const Points = ({ items }: { items: string[] }) => <ol data-block="bf-points" className="list-decimal pl-5">{items.map((t) => <li key={t}>{t}</li>)}</ol>

/** Inside step 1 of the bot page (`TelegramChannel`): `manual` — the hand road (@BotFather → token), shown only on a page whose node has no
 *  factory (an element's page); the owner, terminal ~20:35: «Вручную через отца ботов … ребус … убери» — the core's page has one road;
 *  `onDone` — the new bot is connected, the page asks its channel again. */
export function BotFactory({ service, lang, words: w, manual, onDone }: { service: string; lang: string; words: BotFactoryWords; manual: ReactNode; onDone: () => void }) {
  const core = service === "build"
  const [st, setSt] = useState<State | null>(null)
  const [did1, setDid1] = useState(false)
  const [token, setToken] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkError, setCheckError] = useState<string | null>(null)
  const [replacing, setReplacing] = useState(false)
  const [link, setLink] = useState<string | null>(null)

  const load = useCallback(async (live = false) => {
    const r = await fetch(`${DOOR}${live ? "?live=1" : ""}`, { cache: "no-store" }).then((x) => x.json()).catch(() => null)
    if (r?.ok) setSt({ factory: r.factory, suggestion: r.suggestion, wait: r.wait })
  }, [])
  // the page asks Telegram itself on every visit: a token of a deleted bot must not read «kept» (✗ 2026-11-18 20:49)
  useEffect(() => { void load(true) }, [load])

  const mine = st?.wait?.service === service ? st.wait : null
  const waiting = mine?.state === "waiting"
  const doneTail = mine?.state === "done" ? mine.bot?.tail ?? "" : null
  useEffect(() => { if (doneTail !== null && link) onDone() }, [doneTail, link, onDone])
  useEffect(() => {
    if (!waiting) return
    const t = setInterval(() => { void load() }, 3000)
    return () => clearInterval(t)
  }, [waiting, load])

  // step 2: the token, or BotFather's whole message (the server's own `tokenFrom`), kept at once whatever the mode is
  async function save() {
    setBusy("save"); setError(null); setCheckError(null)
    const r = await post({ action: "save", token: tokenFrom(token) ?? token.trim() })
    setToken(""); setBusy(null)
    if (r?.ok) await load(); else setError(fill(w.errors[r?.error] ?? w.errors["telegram-unreachable"], { username: r?.username ?? "" }))
  }
  // step 3: «Проверить» — Telegram's answer about the kept bot, named
  async function check() {
    setBusy("check"); setCheckError(null)
    const r = await post({ action: "check" })
    setBusy(null)
    if (r?.ok) { setReplacing(false); await load() } else setCheckError(fill(w.errors[r?.error] ?? w.errors["telegram-unreachable"], { username: r?.username ?? "" }))
  }
  async function create() {
    setBusy("create"); setError(null)
    const r = await post({ action: "create", service, lang })
    setBusy(null)
    if (!r?.ok) { setError(fill(w.failed, { error: r?.error ?? "—" })); return }
    setLink(r.url)
    window.open(r.url, "_blank", "noopener,noreferrer")
    await load()
  }

  if (!st) return null
  const f = st.factory
  const found = token.trim() ? tokenFrom(token) : null
  const err = error && <p data-block="bf-error" role="status" className="text-destructive text-sm">{error}</p>

  // Another bot page, no factory yet: one line to the core's page; the hand road below stays open.
  if (!f.ready && !core) {
    return (
      <>
        <p data-block="bf-missing" className="text-muted-foreground text-sm">
          {w.missing}{" "}
          <a href={`/${lang}/architect/build/telegram`} className="text-primary underline-offset-4 hover:underline">{w.missingLink}</a>
        </p>
        {manual}
      </>
    )
  }

  if (core && (!f.ready || replacing)) {
    return (
      <section data-block="bf-setup" data-bot-factory="setup" className="flex flex-col gap-3">
        <div data-block="bf-head" className="flex flex-col gap-1">
          <H3 variant="ui">{w.title}</H3>
          <p data-block="bf-lead" className="text-muted-foreground text-sm">{w.lead}</p>
          <More id="why" label={w.more}>{w.why}</More>
        </div>
        <Ladder id="bot-factory" locked={w.locked} rungs={[
          { id: "make", title: w.step1Title, done: did1 || Boolean(f.kept && !replacing), summary: w.sum1, body: (
            <>
              {st.suggestion && <CopyRow id="bf-name" label={w.nameLabel} value={st.suggestion.name} copy={w.copy} copied={w.copied} />}
              {st.suggestion && <CopyRow id="bf-username" label={w.usernameLabel} value={st.suggestion.username} copy={w.copy} copied={w.copied} />}
              <div data-block="bf-make-acts" className="flex flex-wrap gap-2">
                <a href={BOTFATHER} target="_blank" rel="noreferrer noopener" className={buttonVariants({ variant: "outline" })}>{w.openBotFather}<ExternalLink data-icon aria-hidden /></a>
                <Button type="button" onClick={() => setDid1(true)}>{w.did1}</Button>
              </div>
              <More id="make" label={w.more}><Points items={w.step1Points} /></More>
            </>
          ) },
          { id: "token", title: w.step2Title, done: Boolean(f.kept), summary: fill(w.sum2, { username: f.username ?? "", tail: f.tail ?? "" }), body: (
            <>
              <div data-block="bf-token" className="flex flex-col gap-1">
                <Label htmlFor="bf-token">{w.tokenLabel}</Label>
                <div data-block="bf-token-row" className="flex flex-wrap gap-2">
                  <Input id="bf-token" type="password" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" spellCheck={false} className="min-w-64 flex-1 font-mono text-xs" />
                  <Button type="button" onClick={save} disabled={busy !== null || !token.trim()}>
                    {busy === "save" && <Spinner className="size-4" />}{busy === "save" ? w.saving : w.save}
                  </Button>
                </div>
                {token.trim() ? <Small className="text-muted-foreground" data-block="bf-token-found">{found ? fill(w.found, { tail: found.slice(-4) }) : w.notFound}</Small> : null}
                <Small className="text-muted-foreground">{w.tokenHint}</Small>
              </div>
              {/* the owner, 20:32: «я понять есть там токен или нету … подсветил зелёной галочкой последние буковки» */}
              {f.dead && <p data-block="bf-token-dead" role="status" className="text-destructive text-sm">{fill(w.dead, { username: f.username ?? "", tail: f.tail ?? "" })}</p>}
              {f.kept && <p data-block="bf-token-kept" role="status" className="flex items-center gap-2 text-sm text-success"><Check className="size-4 shrink-0" aria-hidden />{fill(w.kept, { username: f.username ?? "", tail: f.tail ?? "" })}</p>}
              {err}
            </>
          ) },
          { id: "mode", title: w.step3Title, done: f.ready && !replacing, body: (
            <>
              <Points items={w.step3Points} />
              <div data-block="bf-mode-acts">
                <Button type="button" onClick={check} disabled={busy !== null}>
                  {busy === "check" && <Spinner className="size-4" />}{busy === "check" ? w.checking : w.check}
                </Button>
              </div>
              {checkError && <p data-block="bf-check-error" role="status" className="text-destructive text-sm">{checkError}</p>}
            </>
          ) },
        ]} />
      </section>
    )
  }

  // The factory is ready: one line on the core's page, and «make this bot» on every bot page.
  return (
    <section data-block="bf-ready" data-bot-factory="ready" className="flex flex-col gap-2">
      {core && (
        <div data-block="bf-ready-line" className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span data-block="bf-ready-text" className="flex items-center gap-2 text-sm"><Check className="size-4 text-primary" aria-hidden />{fill(w.ready, { username: f.username ?? "", tail: f.tail ?? "" })}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => load(true)}>{w.recheck}</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setReplacing(true)}>{w.replace}</Button>
        </div>
      )}
      <div data-block="bf-create" className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={create} disabled={busy !== null || waiting}>
          {(busy === "create" || waiting) && <Spinner className="size-4" />}{w.create}
        </Button>
        {/* ✗ 2026-11-18 19:33/19:37: a window opened after the door's answer may be blocked by the browser — the link is pressed by the person */}
        {waiting && link && <a href={link} target="_blank" rel="noreferrer noopener" className={buttonVariants({})} data-bf-open-telegram>{w.openAgain}<ExternalLink data-icon aria-hidden /></a>}
        {waiting && <Small className="text-muted-foreground">{w.waiting}</Small>}
      </div>
      {mine?.state === "done" && <p data-block="bf-done" role="status" className="text-sm">{fill(w.done, { username: mine.bot?.username ?? "", tail: mine.bot?.tail ?? "" })}</p>}
      {(mine?.state === "timeout" || mine?.state === "stopped") && <p data-block="bf-timeout" role="status" className="text-muted-foreground text-sm">{w.timeout}</p>}
      {mine?.state === "error" && <p data-block="bf-failed" role="status" className="text-destructive text-sm">{fill(w.failed, { error: mine.error ?? "—" })}</p>}
      {err}
      <More id="create" label={w.more}>{w.createText}</More>
    </section>
  )
}
