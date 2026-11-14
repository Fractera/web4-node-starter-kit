"use client"
// @local — steps 4–7 of the launch ladder (one route: «Активация выделенного сервера»): installation, the records again, certificates, ready

import { Check, X } from "lucide-react"
import { CertsStep } from "@/components/hosting/server-domain-certs.client"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import type { Strategy } from "@/components/hosting/server-launch-check.client"
import type { LaunchState } from "@/components/hosting/server-launch.client"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { StageLog } from "@/components/hosting/stage-log"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Small } from "@/components/ui/typography"

// THE LAST FOUR STEPS (node step 738). The owner, 2026-11-14: «процесс установки сервера → повторной проверки учётных записей … если не
// видны то мы не можем перейти к шагу … проверка установка и обновления сертификатов безопасности который должен заканчиваться чек листом
// … Только после этого … сообщаешь пользователю о том что его сервер готов». Every number here is the server's own answer: its launch
// (`launch.json`), its node's names, certificates and HTTPS (its domain door, 737-8), sign-in asked from the internet (738-6).

type Act = (action: string, extra?: Record<string, unknown>) => Promise<unknown>
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

export function InstallStep({ state, strategy, words, busy, onAct }: { state: LaunchState; strategy: Strategy; words: ServerLaunchWords; busy: boolean; onAct: Act }) {
  const w = words.install
  const l = state.launch
  const running = l?.state === "running"
  const head = l?.version?.head ?? state.probe?.fractera?.head ?? ""
  const current = state.progress.find((s) => s.state === "running" || s.state === "failed")
  return (
    <div className="flex flex-col gap-2" data-block="server-launch-install">
      <Small className="text-muted-foreground">{w.text}</Small>
      {state.progress.length ? <StageLog labels={words.stage} stages={state.progress.filter((s) => s.id !== "launch")} /> : null}
      {current && state.sub.length ? <div className="ml-6" data-block="server-launch-sub"><StageLog labels={words.stage} stages={state.sub.filter((s) => !["prepare", "install", "start"].includes(s.id))} /></div> : null}
      {state.update?.summary || state.update?.reason ? <Small className="text-muted-foreground">{state.update.summary ?? state.update.reason}</Small> : null}
      {running ? <Small className="text-foreground">{w.running} {w.leave}</Small> : null}
      {l?.state === "done" ? <Small className="text-foreground">{fill(w.done, { head: head.slice(0, 8) })}</Small> : null}
      {l?.state === "failed" ? <Small className="break-all text-destructive">{fill(w.failed, { stage: words.stage[l.failed ?? ""] ?? l.failed ?? "?" })} {l.detail?.slice(-300)}</Small> : null}
      {strategy !== "latest" && !running ? (
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => void onAct("install", { mode: state.probe?.fractera?.head ? "update" : "install" })} size="sm">
            {l?.state === "failed" ? w.again : state.probe?.fractera?.head ? w.update : w.install}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function RecheckStep({ state, words, domainWords, busy, onAct }: { state: LaunchState; words: ServerLaunchWords; domainWords: ServerDomainWords; busy: boolean; onAct: Act }) {
  const rows = state.core?.rows ?? []
  if (!state.core?.zone) return <Small className="text-muted-foreground">{words.recheck.noDomain}</Small>
  return (
    <div className="flex flex-col gap-2" data-block="server-launch-recheck">
      <Small className="text-muted-foreground">{words.recheck.text}</Small>
      <ul className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <li className="flex flex-wrap items-center gap-2 text-sm" data-host={r.host} key={r.host}>
            <span className="font-mono text-foreground">{r.host}</span>
            <Badge variant={r.dns === "ok" ? "default" : r.optional ? "outline" : "destructive"}>{domainWords.dnsState[r.dns as keyof ServerDomainWords["dnsState"]] ?? r.dns}</Badge>
            {r.optional ? <span className="text-muted-foreground text-xs">{domainWords.table.optional}</span> : null}
          </li>
        ))}
      </ul>
      {state.core.dnsAt && !state.core.steps.dns ? <Small className="text-destructive">{words.recheck.gate}</Small> : null}
      <div><Button disabled={busy} onClick={() => void onAct("dns-check")} size="sm">{words.recheck.button}</Button></div>
    </div>
  )
}

export function CertsLaunchStep({ state, words, domainWords, busy, onAct }: { state: LaunchState; words: ServerLaunchWords; domainWords: ServerDomainWords; busy: boolean; onAct: Act }) {
  const core = state.core
  if (!core) return null
  const w = words.certs
  const domain = state.domain?.detect?.zone ?? core.zone ?? ""
  const act = async (action: string, extra?: Record<string, unknown>) => { await onAct(action, action === "upload" ? { name: extra?.host, fullchain: extra?.fullchain, privkey: extra?.privkey } : extra) }
  return (
    <div className="flex flex-col gap-3" data-block="server-launch-certs">
      <CertsStep busy={busy} helper={core.helper} onAct={act} readOnly={false} rows={core.rows} run={core.certsRun} words={domainWords} />
      {state.week !== null ? <Small className="text-muted-foreground">{fill(w.budget, { week: String(state.week), domain })} {w.limit}</Small> : null}
      <div className="flex flex-col gap-2" data-block="server-launch-checklist">
        <Small className="font-medium text-foreground">{w.checklist}</Small>
        <Table>
          <TableHeader>
            <TableRow><TableHead>{w.name}</TableHead><TableHead>{w.dns}</TableHead><TableHead>{w.cert}</TableHead><TableHead>{w.https}</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {core.rows.map((r) => (
              <TableRow data-host={r.host} key={r.host}>
                <TableCell className="font-mono text-xs">{r.host}</TableCell>
                <TableCell>{r.dns === "ok" ? <Check aria-label="ok" className="size-4 text-primary" /> : <X aria-label={r.dns} className="size-4 text-destructive" />}</TableCell>
                <TableCell className="text-xs">{domainWords.certState[r.cert as keyof ServerDomainWords["certState"]] ?? r.cert}{r.daysLeft !== null ? ` · ${domainWords.daysLeft.replace("{n}", String(r.daysLeft))}` : ""}{r.certSource ? ` · ${r.certSource === "own" ? domainWords.own : "Let's Encrypt"}` : ""}</TableCell>
                <TableCell>{r.https === null ? "—" : r.https ? <Check aria-label="ok" className="size-4 text-primary" /> : <X aria-label="fail" className="size-4 text-destructive" />}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={busy || Boolean(core.certsRun?.running)} onClick={() => void onAct("check")} size="sm" variant="outline">{w.httpsButton}</Button>
          {core.checkAt ? <Small className="text-muted-foreground">{domainWords.checkedAt} {new Date(core.checkAt).toLocaleString()}</Small> : null}
        </div>
      </div>
    </div>
  )
}

export function ReadyStep({ state, words, busy, onAct }: { state: LaunchState; words: ServerLaunchWords; busy: boolean; onAct: Act }) {
  const w = words.ready
  const zone = state.core?.zone ?? ""
  const architect = state.core?.rows.find((r) => r.kind === "architect")?.host ?? zone
  const s = state.domain?.signin
  if (!state.core?.steps.active) {
    return (
      <div className="flex flex-col gap-2" data-block="server-launch-ready">
        <Small className="text-muted-foreground">{fill(w.text, { zone })}</Small>
        <Small className="text-foreground">{w.first}</Small>
        <div><Button disabled={busy} onClick={() => void onAct("activate")} size="sm">{busy ? w.activating : w.activate}</Button></div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2" data-block="server-launch-ready">
      {s ? <Small className={s.ok ? "text-foreground" : "break-all text-destructive"}>{s.ok ? fill(w.signinOk, { zone }) : fill(w.signinFail, { zone, detail: `${String(s.providers)} · ${s.location ?? "—"}` })}</Small> : null}
      {s?.ok ? <p className="font-medium text-foreground text-sm" data-block="server-launch-done">{w.done}</p> : null}
      <Small className="text-foreground">
        {w.links} <a className="underline" href={`https://${zone}/`}>{w.site}</a> · <a className="underline" href={`https://${architect}/`}>{w.panel}</a> · <a className="underline" href={`https://auth.${zone}/`}>{w.signin}</a>
      </Small>
      <Small className="text-muted-foreground">{w.next}</Small>
      <Small className="text-foreground">{w.first}</Small>
      <div><Button disabled={busy} onClick={() => void onAct("signin")} size="sm" variant="outline">{w.signinButton}</Button></div>
    </div>
  )
}
