"use client"
// @local — step 5 of the launch ladder (one route: «Активация выделенного сервера»): the server's own Telegram bot, made while the server installs

import { useEffect, useRef, useState } from "react"
import { ExternalLink } from "lucide-react"
import { CopyRow } from "@/components/auth/setup-ladder.client"
import { ChromeHelp, telegramTask } from "@/components/hosting/chrome-help.client"
import type { LaunchState } from "@/components/hosting/server-launch.client"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Small } from "@/components/ui/typography"
import { botLines, serverBotSuggestion, tailOf, tokenFrom } from "@/lib/hosting/server-telegram.mjs"

// 758. The owner, 2026-11-16: «Telegram может быть в пятым шагом то есть в тот момент когда идёт установка сервера у пользователя есть
// время подключить Telegram» and «шаг 5 необязательный». The step opens as soon as the installation runs (step 4 is done then), keeps one
// line of the installation's progress, and closes when the bot is settled AND the server's node answers (`launchDone`).
// 🔒 THE TOKEN GOES ONE WAY: this field → the launch door → the runner's stdin → the server (its waiting file or its node's channel door).
// Nothing brings it back: the page knows its last four characters, the bot's name and the invite link (`lib/hosting/server-telegram.mjs`).

type Act = (action: string, extra?: Record<string, unknown>) => Promise<unknown>
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

export function TelegramStep({ lang, state, words, busy, onAct }: { lang: string; state: LaunchState; words: ServerLaunchWords; busy: boolean; onAct: Act }) {
  const w = words.telegram
  const t = state.telegram ?? null
  const [token, setToken] = useState("")
  const [asking, setAsking] = useState(false)
  const running = state.launch?.state === "running"
  const stage = state.progress.find((s) => s.state === "running")
  const bot = t?.username ? `@${t.username}` : t?.name ?? ""
  // 784 (Telegram 714): «нужно решение которое … повторно подключит другого Telegram бота» — «Заменить бота» brings the form back
  const showForm = asking || (!t?.configured && !t?.pending && !t?.skipped)
  const found = token.trim() ? tokenFrom(token) : null
  // 760-10: the bot made by the main agent in the person's Telegram Web — the token still pasted here by the person
  const agent = telegramTask(w.agent, { zone: state.domain?.domain ?? null, ip: state.host ?? null })
  // 761-2/761-14: the bot's own three lines in this page's language, each naming the site with its link
  const lines = botLines(w.lines, { zone: state.core?.zone ?? state.domain?.domain ?? null, ip: state.host ?? null, lang })
  // 784 (Telegram 710): the name and the address ready to copy into @BotFather, as on the node's own bot page
  const named = serverBotSuggestion({ zone: state.core?.zone ?? state.domain?.domain ?? null, ip: state.host ?? null })
  const sent = useRef<string | null>(null)
  useEffect(() => {
    // a bot set before 761 (or from another page) still speaks the fallback: its lines are sent once per bot on this page
    if (!t?.configured || !t.tail || sent.current === t.tail) return
    sent.current = t.tail
    void onAct("telegram", { op: "messages", lines })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- once per bot
  }, [t?.configured, t?.tail])

  async function save() {
    const value = tokenFrom(token) ?? token.trim()
    setToken("")
    const a = (await onAct("telegram", { op: "token", token: value, lines })) as { ok?: boolean } | null
    if (a?.ok) setAsking(false)
  }
  return (
    <div className="flex flex-col gap-3" data-block="server-launch-telegram" data-bot={t?.configured ? "on" : t?.pending ? "waits" : t?.skipped ? "later" : "none"}>
      {running ? <Small className="text-muted-foreground">{fill(w.installing, { stage: stage ? words.stage[stage.id] ?? stage.id : "…" })}</Small> : null}
      {!running && !state.core ? <Small className="text-muted-foreground">{w.waitNode}</Small> : null}

      {/* the owner, Telegram 170 (2026-11-20): «активация бота должна быть на том шаге [«Сервер готов»] … прыгать с девятого на шестой шаг
          никто не будет» — here only that the bot is connected and where it is activated */}
      {t?.configured ? (
        <div className="flex flex-col gap-1" data-block="server-launch-telegram-on">
          <Small className="text-foreground">{fill(w.on, { bot })}</Small>
          <Small className="text-muted-foreground">{w.activateAt}</Small>
        </div>
      ) : null}

      {t?.pending ? <Small className="text-foreground" data-block="server-launch-telegram-waits">{fill(w.pending, { tail: t.tail ?? "", bot: bot ? `${bot} ` : "" })}</Small> : null}
      {(t?.pending || t?.configured) && !asking ? <Button className="w-fit" disabled={busy} onClick={() => setAsking(true)} size="sm" variant="outline">{w.replace}</Button> : null}
      {t?.rejected && showForm ? <Small className="text-destructive">{fill(w.rejected, { tail: t.rejected })}</Small> : null}

      {t?.skipped && !asking ? (
        <div className="flex flex-wrap items-center gap-3" data-block="server-launch-telegram-later">
          <Small className="text-muted-foreground">{w.laterNote}</Small>
          <Button disabled={busy} onClick={() => setAsking(true)} size="sm" variant="outline">{w.connectNow}</Button>
        </div>
      ) : null}

      {showForm ? (
        <form className="flex flex-col gap-3" data-block="server-launch-telegram-form" onSubmit={(e) => { e.preventDefault(); void save() }}>
          <Small className="max-w-prose text-foreground">{w.text}</Small>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-foreground text-sm" data-block="server-launch-telegram-how">
            <li>{w.how[0]}</li>
            <li>
              {w.how[1]}
              <CopyRow copied={w.copied} copy={w.copy} id="server-launch-telegram-name" label={w.nameLabel} value={named.name} />
              <CopyRow copied={w.copied} copy={w.copy} id="server-launch-telegram-username" label={w.usernameLabel} value={named.username} />
            </li>
            <li>{w.how[2]}</li>
          </ol>
          <a className={buttonVariants({ size: "sm", variant: "outline", className: "w-fit" })} href="https://t.me/BotFather" rel="noopener noreferrer" target="_blank">{w.openBotFather}<ExternalLink data-icon="inline-end" /></a>
          <Field>
            <FieldLabel htmlFor="server-launch-telegram-token">{w.label}</FieldLabel>
            <Input autoComplete="off" id="server-launch-telegram-token" onChange={(e) => setToken(e.target.value)} spellCheck={false} type="password" value={token} />
            <FieldDescription>{token.trim() ? (found ? fill(w.found, { tail: tailOf(found) ?? "" }) : w.notFound) : w.tokenNote}</FieldDescription>
          </Field>
          <div className="flex flex-wrap gap-2" data-block="server-launch-telegram-actions">
            <Button disabled={busy || !found} size="sm" type="submit">{w.save}</Button>
            {asking && (t?.pending || t?.configured) ? <Button disabled={busy} onClick={() => { setAsking(false); setToken("") }} size="sm" type="button" variant="ghost">{w.cancel}</Button> : null}
            {!t?.skipped && !t?.pending && !t?.configured ? <Button disabled={busy} onClick={() => void onAct("telegram", { op: "skip" })} size="sm" type="button" variant="ghost">{w.later}</Button> : null}
          </div>
          {/* Telegram 710: «вкладка создать при помощи Telegram должна выглядеть как аккордеон и быть по умолчанию закрытой» */}
          {agent ? (
            <Accordion collapsible data-block="server-launch-telegram-agent-fold" type="single">
              <AccordionItem value="agent">
                <AccordionTrigger>{w.agent.title}</AccordionTrigger>
                <AccordionContent><ChromeHelp lang={lang} map={{}} task={agent.task} titled={false} words={w.agent} /></AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
        </form>
      ) : null}
    </div>
  )
}

/** The bot's activation in the step «Сервер готов» (the owner, Telegram 170): the people admitted, the invite link the person opens and
 *  presses «Старт» in, and the server's agent signed in to Claude Code. Drawn only once the bot is connected to the server's node. */
export function TelegramActivation({ lang, state, words, busy, onAct }: { lang: string; state: LaunchState; words: ServerLaunchWords; busy: boolean; onAct: Act }) {
  const w = words.telegram
  const t = state.telegram ?? null
  const [link, setLink] = useState<string | null>(null)
  if (!t?.configured) return null
  const bot = t.username ? `@${t.username}` : t.name ?? ""
  async function getLink() {
    const a = (await onAct("telegram", { op: "link" })) as { ok?: boolean; link?: string } | null
    if (a?.ok && a.link) setLink(a.link)
  }
  return (
    <div className="mt-4 flex flex-col gap-2 border-t pt-4" data-block="server-launch-telegram-activation">
      <p className="font-medium text-foreground text-sm">{fill(w.activationTitle, { bot })}</p>
      <Small className="text-muted-foreground">{fill(w.admitted, { n: String(t.allowed) })}</Small>
      {link ? (
        <div className="flex flex-col gap-1" data-block="server-launch-telegram-link">
          <a className={buttonVariants({ variant: "link", size: "sm", className: "w-fit px-0" })} href={link} rel="noopener noreferrer" target="_blank">{link}</a>
          <Small className="text-muted-foreground">{w.linkNote}</Small>
        </div>
      ) : (
        <Button className="w-fit" disabled={busy} onClick={() => void getLink()} size="sm" variant="outline">{w.link}</Button>
      )}
      <AgentLine busy={busy} lang={lang} onAct={onAct} state={state} words={w} />
    </div>
  )
}

/** 761-1: can the server's agent answer — its Claude Code signed in — and was the person greeted. The sign-in is the person's act on the
 *  server's own page, reached through the SSH window; the step asks the server again every 8 s until it is there (15 minutes at most). */
function AgentLine({ lang, state, words, busy, onAct }: { lang: string; state: LaunchState; words: ServerLaunchWords["telegram"]; busy: boolean; onAct: Act }) {
  const t = state.telegram
  const [page, setPage] = useState<string | null>(null)
  const [watching, setWatching] = useState(false)
  useEffect(() => {
    if (!watching || t?.signedIn === true) return
    const started = Date.now()
    const timer = setInterval(() => { if (Date.now() - started > 15 * 60_000) setWatching(false); else void onAct("state") }, 8000)
    return () => clearInterval(timer)
  }, [watching, t?.signedIn, onAct])
  async function signIn() {
    const a = (await onAct("window")) as { window?: { url?: string } } | null
    const url = a?.window?.url
    if (url) { setPage(`${new URL(url).origin}/${lang}/build/subscription`); setWatching(true) }
  }
  if (t?.signedIn === true) {
    return <Small className="text-foreground" data-block="server-launch-telegram-agent" data-agent="on">{t.greeted ? words.greeted : words.agentOn}</Small>
  }
  if (t?.signedIn !== false) return null
  return (
    <div className="flex flex-col gap-2" data-agent="off" data-block="server-launch-telegram-agent">
      <Small className="text-foreground">{words.agentOff}</Small>
      {page ? (
        <a className={buttonVariants({ size: "sm", className: "w-fit" })} href={page} rel="noopener noreferrer" target="_blank">{words.signInOpen}</a>
      ) : (
        <Button className="w-fit" disabled={busy} onClick={() => void signIn()} size="sm">{words.signIn}</Button>
      )}
      {watching ? <Small className="text-muted-foreground">{words.signInWatch}</Small> : null}
    </div>
  )
}

