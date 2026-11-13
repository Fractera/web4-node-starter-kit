"use client"
// @local — the body of one rung of the move ladder (one route: the tab «Выделенный сервер»); its pieces are the parts ladder-step and stage-log

import { ExternalLink } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Small } from "@/components/ui/typography"
import type { ServerMoveWords } from "@/components/hosting/server-move.i18n"
import { StageLog, type Stage } from "@/components/hosting/stage-log"

// ONE RUNG'S BODY (node step 737-7): what the rung does, its form or its result, its stages, its button. Everything shown comes from
// the node's state (`/api/node/server`); the only things this island holds itself are the fields the person is typing — the password is
// cleared the moment it is sent.

export type Rung = { state?: string; detail?: string; stages?: Stage[]; rolledBack?: boolean }
export type MoveState = {
  server?: { host?: string; port?: number; fingerprint?: string }
  rungs?: Record<string, Rung>
  verdict?: { level: "ok" | "warn" | "fail"; items: Array<{ id: string; level: string; value?: unknown; need?: unknown }> }
  checks?: Array<{ id: string; ok: boolean; value?: unknown }>
  claude?: { url?: string | null; email?: string | null }
  clear?: { state?: string; detail?: string; stopped?: number; backup?: string }
  names?: { zone?: string | null; names?: number; pointing?: string[]; certified?: string[]; waiting?: string[]; elsewhere?: string[]; unknown?: string[] }
}
type RungId = keyof ServerMoveWords["rung"]
type Start = (rung: string, extra?: Record<string, unknown>) => Promise<void>

const tone = (level: string) => (level === "fail" ? "destructive" : level === "warn" ? "secondary" : "outline") as "destructive" | "secondary" | "outline"

export function RungBody({ id, rung, state, words, busy, onStart }: { id: RungId; rung: Rung; state: MoveState; words: ServerMoveWords; busy: boolean; onStart: Start }) {
  const [host, setHost] = useState(state.server?.host ?? "")
  const [port, setPort] = useState(String(state.server?.port ?? 22))
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const running = rung.state === "running"
  const done = rung.state === "done"
  const checkLabel = (cid: string) => (cid.startsWith("element:") ? cid.slice(8) : words.checks[cid] ?? cid)

  async function connect() {
    const p = password
    setPassword("")
    await onStart("connect", { host: host.trim(), port: Number(port), password: p })
  }

  return (
    <div className="flex flex-col gap-3" data-block={`server-move-rung-${id}`}>
      <p className="text-muted-foreground text-sm">{words.rung[id].text}</p>

      {id === "connect" && !running ? (
        <div className="grid gap-3 sm:grid-cols-[1fr_6rem]" data-block="server-move-connect">
          <Field>
            <FieldLabel htmlFor="server-host">{words.host}</FieldLabel>
            <Input id="server-host" autoComplete="off" className="font-mono" inputMode="decimal" onChange={(e) => setHost(e.target.value)} placeholder="203.0.113.7" value={host} />
          </Field>
          <Field>
            <FieldLabel htmlFor="server-port">{words.port}</FieldLabel>
            <Input id="server-port" className="font-mono" inputMode="numeric" onChange={(e) => setPort(e.target.value.replace(/\D/g, ""))} value={port} />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="server-password">{words.password}</FieldLabel>
            <Input id="server-password" autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} type="password" value={password} />
            <FieldDescription>{words.passwordNote}</FieldDescription>
          </Field>
        </div>
      ) : null}
      {id === "connect" && done && state.server?.fingerprint ? (
        <Small className="break-all text-muted-foreground">{words.fingerprint}: <span className="font-mono">{state.server.fingerprint}</span></Small>
      ) : null}

      {id === "probe" && state.verdict ? (
        <div className="flex flex-col gap-2" data-block="server-move-verdict" data-level={state.verdict.level}>
          <p className={state.verdict.level === "fail" ? "text-destructive text-sm" : "text-foreground text-sm"}>{words.verdict[state.verdict.level]}</p>
          <ul className="flex flex-col gap-1">
            {state.verdict.items.map((it) => (
              <li key={it.id} className="flex flex-wrap items-center gap-2 text-sm" data-item={it.id}>
                <Badge variant={tone(it.level)}>{it.level}</Badge>
                <span>{words.item[it.id] ?? it.id}</span>
                {it.value !== undefined && it.value !== null ? <span className="font-mono text-muted-foreground">{String(it.value)}{it.need !== undefined ? ` / ${String(it.need)}` : ""}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {rung.stages && rung.stages.length > 0 ? <StageLog labels={words.stage} stages={rung.stages} /> : null}

      {id === "claude" && running && state.claude?.url ? (
        <div className="flex flex-col gap-2" data-block="server-move-claude">
          <a className="inline-flex w-fit items-center gap-1.5 text-sm underline" href={state.claude.url} rel="noreferrer noopener" target="_blank">
            {words.claudeOpen}
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
          <Field>
            <FieldLabel htmlFor="server-claude-code">{words.claudeCode}</FieldLabel>
            <Input id="server-claude-code" autoComplete="off" className="font-mono" onChange={(e) => setCode(e.target.value)} value={code} />
          </Field>
          <Button className="w-fit" disabled={busy || code.trim().length < 8} onClick={() => { const c = code.trim(); setCode(""); void onStart("claude-code", { code: c }) }} size="sm">
            {words.claudeSend}
          </Button>
        </div>
      ) : null}
      {id === "claude" && done && state.claude?.email ? <Small className="text-muted-foreground">{words.claudeSigned} {state.claude.email}</Small> : null}

      {(id === "rehearse" || id === "move") && state.checks && (done || rung.state === "failed") ? (
        <ul className="flex flex-col gap-1" data-block="server-move-checks">
          {state.checks.map((c) => (
            <li key={c.id} className="flex items-center gap-2 text-sm" data-check={c.id} data-ok={c.ok ? "1" : "0"}>
              <Badge variant={c.ok ? "outline" : "destructive"}>{c.ok ? "ok" : "✗"}</Badge>
              <span>{checkLabel(c.id)}</span>
              {c.value !== undefined ? <span className="font-mono text-muted-foreground text-xs">{String(c.value)}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {(id === "rehearse" || id === "move") && state.names?.zone ? (
        // 737-15: the domain's names as the server sees them — pointing here, certified, waiting; the move holds on «waiting».
        <div className="flex flex-col gap-1 text-sm" data-block="server-move-names">
          <span className="text-foreground">{words.names.summary.replace("{zone}", state.names.zone).replace("{p}", String(state.names.pointing?.length ?? 0)).replace("{n}", String(state.names.names ?? 0)).replace("{c}", String(state.names.certified?.length ?? 0))}</span>
          {state.names.waiting?.length ? <span className="text-destructive">{words.names.waiting} <span className="font-mono">{state.names.waiting.join(" ")}</span></span> : null}
          {[...(state.names.elsewhere ?? []), ...(state.names.unknown ?? [])].length ? <span className="text-muted-foreground">{words.names.later} <span className="font-mono">{[...(state.names.elsewhere ?? []), ...(state.names.unknown ?? [])].join(" ")}</span></span> : null}
        </div>
      ) : null}
      {id === "move" && !done && !running ? <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-foreground text-sm">{words.moveWarn}</p> : null}

      {rung.state === "failed" ? (
        <p className="break-all rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-foreground text-sm" data-block="server-move-failed">
          {rung.rolledBack ? words.rolledBack : words.failed} <span className="font-mono">{rung.detail}</span>
        </p>
      ) : null}

      {running ? (
        <Small className="text-muted-foreground">{words.running}</Small>
      ) : !done || id === "connect" ? (
        <Button
          className="w-fit"
          disabled={busy || (id === "connect" && (!host.trim() || !password))}
          onClick={() => (id === "connect" ? connect() : onStart(id))}
          size="sm"
        >
          {rung.state === "failed" ? words.again : words.rung[id].button}
        </Button>
      ) : id === "copy" && state.rungs?.move?.state !== "done" ? (
        // 737-7 (the owner's test, 2026-11-13: «Повторить … not exist this button»): after an update of this node the server needs the
        // same code again — a done copy may run once more; only the changes travel.
        <div className="flex flex-col gap-1" data-block="server-move-copy-again">
          <Button className="w-fit" disabled={busy} onClick={() => onStart("copy")} size="sm" variant="outline">{words.copyAgain}</Button>
          <Small className="text-muted-foreground">{words.copyAgainNote}</Small>
        </div>
      ) : null}
    </div>
  )
}
