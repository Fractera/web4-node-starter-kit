"use client"
// @local — step 4 of the launch ladder (one route: «Активация выделенного сервера»): the server's own GitHub repository

import { ExternalLink } from "lucide-react"
import { useState } from "react"
import { Ladder } from "@/components/hosting/ladder-step"
import type { LaunchState } from "@/components/hosting/server-launch.client"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { Button, buttonVariants } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Small } from "@/components/ui/typography"
import { ORIGINAL_URL } from "@/lib/hosting/server-repo.mjs"

// 808. The owner, 2026-11-20 (Telegram 37): «при входе по умолчанию стоит тоже самое репозиторий … Есть второй режим: поднять чистый
// стартер Fractera на любом vps переключении появляется новая лесенка внутри этого шага» — GitHub account «Сделано» · the fork «Сделано» ·
// the address «Проверить»; «стиль дизайна используют такой же как и у всей страницы для развёртывания сервера».
// 🔒 The choice lives ON the server (`repo.json`, the runner's act `repo`); GitHub's yes is the runner's (a DIRECT fork, law 368). Once
// Fractera stands there the step only names its repository: a node is never moved to another fork under it — only the clear frees it.

type Act = (action: string, extra?: Record<string, unknown>) => Promise<unknown>
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)
/** `owner/repo` as a person reads it — never the `.git` tail. */
const shown = (url: string | null | undefined) => (url ? url.replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "") : "—")

export function RepoStep({ state, words, busy, onAct }: { state: LaunchState; words: ServerLaunchWords; busy: boolean; onAct: Act }) {
  const w = words.repo
  const r = state.repo ?? null
  const [url, setUrl] = useState("")
  const installed = state.launch?.state === "running" || state.launch?.state === "done" || Boolean(state.probe?.fractera)
  if (installed) {
    return <Small className="text-muted-foreground" data-block="server-launch-repo" data-repo="installed">{fill(w.installed, { repo: shown(state.probe?.fractera?.origin ?? r?.url) })}</Small>
  }
  const mode = r?.mode ?? "same"
  const rungs = [
    {
      id: "account", title: w.account, done: Boolean(r?.account), summary: null,
      body: (
        <div className="flex flex-col gap-2" data-block="server-launch-repo-account">
          <Small className="text-muted-foreground">{w.accountText}</Small>
          <div className="flex flex-wrap gap-2" data-block="server-launch-repo-account-actions">
            <a className={buttonVariants({ size: "sm", variant: "outline" })} href="https://github.com/signup" rel="noopener noreferrer" target="_blank">{w.accountOpen}<ExternalLink data-icon="inline-end" /></a>
            <Button disabled={busy} onClick={() => void onAct("repo", { op: "account" })} size="sm">{w.done}</Button>
          </div>
        </div>
      ),
    },
    {
      id: "fork", title: w.fork, done: Boolean(r?.fork), summary: null,
      body: (
        <div className="flex flex-col gap-2" data-block="server-launch-repo-fork">
          <Small className="text-muted-foreground">{w.forkText}</Small>
          <div className="flex flex-wrap gap-2" data-block="server-launch-repo-fork-actions">
            <a className={buttonVariants({ size: "sm", variant: "outline" })} href={ORIGINAL_URL} rel="noopener noreferrer" target="_blank">{w.forkOpen}<ExternalLink data-icon="inline-end" /></a>
            <Button disabled={busy} onClick={() => void onAct("repo", { op: "fork" })} size="sm">{w.done}</Button>
          </div>
        </div>
      ),
    },
    {
      id: "url", title: w.url, done: Boolean(r?.mode === "own" && r.url), summary: r?.mode === "own" && r.url ? fill(w.checked, { name: shown(r.url) }) : null,
      body: (
        <form className="flex flex-col gap-3" data-block="server-launch-repo-url" onSubmit={(e) => { e.preventDefault(); if (url.trim()) void onAct("repo", { op: "url", url: url.trim() }) }}>
          <Field>
            <FieldLabel htmlFor="server-launch-repo-url">{w.urlLabel}</FieldLabel>
            <Input autoComplete="off" id="server-launch-repo-url" inputMode="url" onChange={(e) => setUrl(e.target.value)} placeholder={r?.url ? shown(r.url) : "https://github.com/…"} spellCheck={false} value={url} />
            <FieldDescription>{w.urlNote}</FieldDescription>
          </Field>
          {r?.mode === "own" && r.url ? <Small className="text-foreground" data-block="server-launch-repo-checked">{fill(w.checked, { name: shown(r.url) })}</Small> : null}
          <Button className="w-fit" disabled={busy || !url.trim()} size="sm" type="submit">{w.check}</Button>
        </form>
      ),
    },
  ]
  return (
    <div className="flex flex-col gap-3" data-block="server-launch-repo" data-repo={mode}>
      <ButtonGroup>
        {(["same", "own"] as const).map((m) => <Button disabled={busy} key={m} onClick={() => { if (m !== mode) void onAct("repo", { op: m }) }} size="sm" variant={mode === m ? "default" : "outline"}>{w[m]}</Button>)}
      </ButtonGroup>
      {mode === "same" ? <Small className="text-muted-foreground">{fill(w.sameText, { repo: shown(r?.url) })}</Small> : (
        <>
          <Small className="text-muted-foreground">{w.ownText}</Small>
          <Ladder className="rounded-none border-0 bg-transparent" id="launch-repo" locked={words.locked} rungs={rungs} />
        </>
      )}
    </div>
  )
}

