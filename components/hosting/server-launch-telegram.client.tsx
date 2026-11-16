"use client"
// @local — step 5 of the launch ladder (one route: «Активация выделенного сервера»): the server's own Telegram bot, made while the server installs

import { useState } from "react"
import type { LaunchState } from "@/components/hosting/server-launch.client"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Small } from "@/components/ui/typography"

// 758. The owner, 2026-11-16: «Telegram может быть в пятым шагом то есть в тот момент когда идёт установка сервера у пользователя есть
// время подключить Telegram» and «шаг 5 необязательный». The step opens as soon as the installation runs (step 4 is done then), keeps one
// line of the installation's progress, and closes when the bot is settled AND the server's node answers (`launchDone`).
// 🔒 THE TOKEN GOES ONE WAY: this field → the launch door → the runner's stdin → the server (its waiting file or its node's channel door).
// Nothing brings it back: the page knows its last four characters, the bot's name and the invite link (`lib/hosting/server-telegram.mjs`).

type Act = (action: string, extra?: Record<string, unknown>) => Promise<unknown>
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

export function TelegramStep({ state, words, busy, onAct }: { state: LaunchState; words: ServerLaunchWords; busy: boolean; onAct: Act }) {
  const w = words.telegram
  const t = state.telegram ?? null
  const [token, setToken] = useState("")
  const [asking, setAsking] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const running = state.launch?.state === "running"
  const stage = state.progress.find((s) => s.state === "running")
  const bot = t?.username ? `@${t.username}` : t?.name ?? ""
  const showForm = !t?.configured && !t?.pending && (!t?.skipped || asking)

  async function save() {
    const value = token.trim()
    setToken("")
    const a = (await onAct("telegram", { op: "token", token: value })) as { ok?: boolean } | null
    if (a?.ok) setAsking(false)
  }
  async function getLink() {
    const a = (await onAct("telegram", { op: "link" })) as { ok?: boolean; link?: string } | null
    if (a?.ok && a.link) setLink(a.link)
  }

  return (
    <div className="flex flex-col gap-3" data-block="server-launch-telegram" data-bot={t?.configured ? "on" : t?.pending ? "waits" : t?.skipped ? "later" : "none"}>
      {running ? <Small className="text-muted-foreground">{fill(w.installing, { stage: stage ? words.stage[stage.id] ?? stage.id : "…" })}</Small> : null}
      {!running && !state.core ? <Small className="text-muted-foreground">{w.waitNode}</Small> : null}

      {t?.configured ? (
        <div className="flex flex-col gap-2" data-block="server-launch-telegram-on">
          <Small className="text-foreground">{fill(w.on, { bot })}</Small>
          <Small className="text-muted-foreground">{fill(w.admitted, { n: String(t.allowed) })}</Small>
          {link ? (
            <div className="flex flex-col gap-1" data-block="server-launch-telegram-link">
              <a className={buttonVariants({ variant: "link", size: "sm", className: "w-fit px-0" })} href={link} rel="noopener noreferrer" target="_blank">{link}</a>
              <Small className="text-muted-foreground">{w.linkNote}</Small>
            </div>
          ) : (
            <Button className="w-fit" disabled={busy} onClick={() => void getLink()} size="sm" variant="outline">{w.link}</Button>
          )}
        </div>
      ) : null}

      {t?.pending ? <Small className="text-foreground" data-block="server-launch-telegram-waits">{fill(w.pending, { tail: t.tail ?? "" })}</Small> : null}
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
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-foreground text-sm" data-block="server-launch-telegram-how">{w.how.map((line) => <li key={line}>{line}</li>)}</ol>
          <Field>
            <FieldLabel htmlFor="server-launch-telegram-token">{w.label}</FieldLabel>
            <Input autoComplete="off" id="server-launch-telegram-token" onChange={(e) => setToken(e.target.value)} spellCheck={false} type="password" value={token} />
            <FieldDescription>{w.tokenNote}</FieldDescription>
          </Field>
          <div className="flex flex-wrap gap-2" data-block="server-launch-telegram-actions">
            <Button disabled={busy || !token.trim()} size="sm" type="submit">{w.save}</Button>
            {!t?.skipped ? <Button disabled={busy} onClick={() => void onAct("telegram", { op: "skip" })} size="sm" type="button" variant="ghost">{w.later}</Button> : null}
          </div>
        </form>
      ) : null}
    </div>
  )
}
