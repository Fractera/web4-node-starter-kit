"use client"
// @local — steps 4–7 of the launch ladder (one route: «Активация выделенного сервера»): installation, the records again, certificates, ready

import { Check, ExternalLink, Info, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { CertsStep } from "@/components/hosting/server-domain-certs.client"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import type { Strategy } from "@/components/hosting/server-launch-check.client"
import type { LaunchState } from "@/components/hosting/server-launch.client"
import { installedOf } from "@/components/hosting/server-launch-rungs"
import { finalCheck, httpsWaits } from "@/lib/hosting/final-check.mjs"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { ServerInstallLive } from "@/components/hosting/server-install-live.client"
import { Claim, type ClaimShown } from "@/components/hosting/server-launch-claim.client"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Small } from "@/components/ui/typography"

// THE LAST FOUR STEPS (node step 738). The owner, 2026-11-14: «процесс установки сервера → повторной проверки учётных записей … если не
// видны то мы не можем перейти к шагу … проверка установка и обновления сертификатов безопасности который должен заканчиваться чек листом
// … Только после этого … сообщаешь пользователю о том что его сервер готов». Every number here is the server's own answer: its launch
// (`launch.json`), its node's names, certificates and HTTPS (its domain door, 737-8), sign-in asked from the internet (738-6).

type Act = (action: string, extra?: Record<string, unknown>) => Promise<unknown>
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

export function InstallStep({ state, strategy, words, busy, onAct, target }: { state: LaunchState; strategy: Strategy; words: ServerLaunchWords; busy: boolean; onAct: Act; target: { host: string; port: number } }) {
  const w = words.install
  const l = state.launch
  const running = l?.state === "running"
  const head = l?.version?.head ?? state.probe?.fractera?.head ?? ""
  return (
    <div className="flex flex-col gap-2" data-block="server-launch-install">
      <Small className="text-muted-foreground">{w.text}</Small>
      {/* 806-4: the server's own log and checklist, live, instead of one «running» line for 40 minutes */}
      {l ? <ServerInstallLive host={target.host} port={target.port} running={running} runKey={l.startedAt ?? ""} stage={words.stage} words={words.live} /> : null}
      {state.update?.summary || state.update?.reason ? <Small className="text-muted-foreground">{state.update.summary ?? state.update.reason}</Small> : null}
      {running ? <Small className="text-foreground">{w.running} {w.leave}</Small> : null}
      {l?.state === "done" ? <Small className="text-foreground">{fill(w.done, { head: head.slice(0, 8) })}</Small> : null}
      {l?.state === "failed" ? <Small className="break-all text-destructive">{fill(w.failed, { stage: words.stage[l.failed ?? ""] ?? l.failed ?? "?" })} {l.detail?.slice(-300)}</Small> : null}
      {installedOf(state, strategy) && !state.core ? (
        <div className="flex flex-wrap items-center gap-3" data-block="server-launch-silent">
          <Small className="text-foreground">{w.silent}</Small>
          <Button disabled={busy} onClick={() => void onAct("state")} size="sm" variant="outline">{w.ask}</Button>
        </div>
      ) : null}
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
  // 744-9: a name whose HTTPS is not due yet (off, or sign-in before the domain is on) is grey with its reason, never a red cross;
  // 742-10: the rule is one for this page and the server's own rung (`httpsWaits`)
  const waits = (r: (typeof core.rows)[number]) => httpsWaits(r, core.steps.active)
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
                <TableCell>{r.https === true ? <Check aria-label="ok" className="size-4 text-primary" /> : waits(r) ? <Small className="inline-flex items-center gap-1 text-muted-foreground"><Info aria-hidden className="size-4" />{r.off ? w.off : w.afterOn}</Small> : r.https === null ? "—" : <X aria-label="fail" className="size-4 text-destructive" />}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {core.rows.some((r) => r.https !== true && waits(r)) ? <Small className="text-muted-foreground" data-block="server-launch-not-due">{w.notDue}</Small> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={busy || Boolean(core.certsRun?.running)} onClick={() => void onAct("check")} size="sm" variant="outline">{w.httpsButton}</Button>
          {core.checkAt ? <Small className="text-muted-foreground">{domainWords.checkedAt} {new Date(core.checkAt).toLocaleString()}</Small> : null}
        </div>
      </div>
    </div>
  )
}

type ReadyProps = { state: LaunchState; words: ServerLaunchWords; busy: boolean; onAct: Act; claim: ClaimShown; onClaim: (c: ClaimShown) => void }

// 744-6. The owner, 2026-11-14: «мы не должны говорить пользу о том что сервер доступен если все сертификаты безопасности не установлены и на
// последнем этапе заключительной проверки … мы эти проверки не завершили». «Ваш сервер готов», the links and the architect's code are
// `ReadyWords`, drawn only under a passed `finalCheck` (every required name: a certificate and HTTPS; the domain on; sign-in leading to
// auth.<zone>) — `check:ready-words` holds it; otherwise the step names what the check still misses.
export function ReadyStep({ state, words, busy, onAct, claim, onClaim }: ReadyProps) {
  const w = words.ready
  const zone = state.core?.zone ?? ""
  const s = state.domain?.signin
  const [checking, setChecking] = useState(false)
  if (!state.core?.steps.active) {
    return (
      <div className="flex flex-col gap-2" data-block="server-launch-ready">
        <Small className="text-muted-foreground">{fill(w.text, { zone })}</Small>
        <Small className="text-foreground">{w.first}</Small>
        <div><Button disabled={busy} onClick={() => void onAct("activate")} size="sm">{busy ? w.activating : w.activate}</Button></div>
      </div>
    )
  }
  const final = finalCheck(state)
  // ✗ 2026-11-18 22:4x (the owner): the answer stood at the top of the step, the same words before and after the press, no time — the
  // press read as nothing. Now it stands under the button with the time of the check, and a spinner while the server is asked.
  const time = s?.at ? new Date(s.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"
  const recheck = async () => { setChecking(true); try { await onAct("signin") } finally { setChecking(false) } }
  return (
    <div className="flex flex-col gap-2" data-block="server-launch-ready" data-ready={final.ok ? "1" : "0"}>
      {final.ok ? <ReadyWords busy={busy} claim={claim} onAct={onAct} onClaim={onClaim} state={state} words={words} /> : (
        <div className="flex flex-col gap-1" data-block="server-launch-missing">
          <Small className="text-foreground">{w.missing.title}</Small>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
            {final.missing.map((m) => <li key={`${m.host}-${m.what}`}>{w.missing[m.what].replace("{host}", m.host ?? "?")}</li>)}
          </ul>
        </div>
      )}
      <div className="flex flex-col gap-1" data-block="server-launch-signin">
        <div className="flex items-center gap-1">
          <Button disabled={busy || checking} onClick={() => void recheck()} size="sm" variant="outline">{checking ? <Spinner className="size-4" /> : null}{checking ? w.signinChecking : w.signinButton}</Button>
          <TooltipProvider><Tooltip>
            <TooltipTrigger asChild><Button aria-label={w.signinHintLabel} className="size-8" size="icon" variant="ghost"><Info aria-hidden /></Button></TooltipTrigger>
            <TooltipContent className="max-w-xs">{fill(w.signinHint, { zone })}</TooltipContent>
          </Tooltip></TooltipProvider>
        </div>
        {s && !checking ? <Small className={s.ok ? "text-success" : "break-all text-destructive"} data-block="server-launch-signin-answer" role="status">{s.ok ? fill(w.signinOk, { zone, time }) : fill(w.signinFail, { zone, time, detail: `${String(s.providers)} · ${s.location ?? "—"}` })}</Small> : null}
      </div>
    </div>
  )
}

/** The words that call the server usable — drawn only under a passed final check (744-6, `check:ready-words`). 796: the links «Сайт ·
 *  Панель · Вход» only once the architect exists — before that one road, the architect's e-mail and the one registration button (814). */
function ReadyWords({ state, words, busy, onAct, claim, onClaim }: ReadyProps) {
  const w = words.ready
  const zone = state.core?.zone ?? ""
  const architect = state.core?.rows.find((r) => r.kind === "architect")?.host ?? zone
  // ✗ 2026-11-18 14:56 (Telegram 697): with `claim`/`onClaim` as dependencies and no answer settling `claimed`, this asked the server
  // over SSH in a loop until it stopped answering. Now: ONE quiet read per zone, and every answer settles it — a refusal shows the form.
  const asked = useRef("")
  useEffect(() => {
    if (claim.claimed !== null || asked.current === zone) return
    asked.current = zone
    void (onAct("claim", { status: true, zone }) as Promise<{ reason?: string; answer?: { ok?: boolean; claimed?: boolean; reason?: string } } | undefined>).then((a) => {
      const claimed = a?.answer?.claimed === true || a?.reason === "claimed" || a?.answer?.reason === "claimed"
      onClaim({ sent: claim.sent, claimed })
    })
  }, [claim.claimed, claim.sent, zone, onAct, onClaim])
  return (
    <>
      <p className="font-medium text-foreground text-sm" data-block="server-launch-done">{w.done}</p>
      {claim.claimed ? (
        <>
          <Small className="text-foreground" data-block="server-launch-claimed">{w.claimed}</Small>
          <Small className="text-foreground">
            {w.links} <a className="underline" href={`https://${zone}/`}>{w.site}</a> · <a className="underline" href={`https://${architect}/`}>{w.panel}</a> · <a className="underline" href={`https://auth.${zone}/`}>{w.signin}</a>
          </Small>
          <Small className="text-muted-foreground">{w.next}</Small>
        </>
      ) : <Claim busy={busy} onAct={onAct} onShown={onClaim} shown={claim} words={w} zone={zone} />}
    </>
  )
}
