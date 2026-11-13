"use client"
// @local — the last steps of the server's domain ladder (one route: the tab «Выделенный сервер»): the check and certificates before the move, certificates · HTTPS · switch on after it

import { LadderLocked, LadderStep } from "@/components/hosting/ladder-step"
import type { LadderView } from "@/components/hosting/server-ladder.client"
import type { ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import { CertsStep, type CertRow, type CertsRun } from "@/components/hosting/server-domain-certs.client"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"

// 737-19. Before the move the server takes certificates through the runner over SSH (`move.mjs domain` → name-up → certs), and the move
// waits for every name that already points there (737-15c). After the move the server's own three steps stay as they were (737-8):
// certificates, HTTPS from the internet, switching the domain on — taken over from the former five-step island unchanged.

const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)
type Row = CertRow & { zone: string; label: string; kind: string; https: boolean | null; status: number | null }
export type ServerEnd = {
  rows: Row[]
  steps: { domain: boolean; dns: boolean; certs: boolean; check: boolean; active: boolean }
  certsRun: CertsRun
  helper: boolean
  checkAt: string | null
}

export function ReadyStep({ view, words, busy, onCheck, onIssue }: { view: LadderView; words: ServerLadderWords; busy: boolean; onCheck: () => unknown; onIssue: () => unknown }) {
  const w = words.ready
  const all = (view.records[0]?.records ?? []).filter((r) => !r.optional)
  const pointing = all.filter((r) => view.dns[r.host] === "ok").map((r) => r.host)
  const names = view.names?.zone === view.zone ? view.names : null
  const certified = pointing.filter((h) => names?.certified?.includes(h))
  const waiting = pointing.filter((h) => !certified.includes(h))
  const checked = Object.keys(view.dns).length > 0
  return (
    <div className="flex flex-col gap-2" data-block="server-ladder-ready">
      {checked ? (
        <>
          <Small className="text-foreground">{fill(w.summary, { p: String(pointing.length), n: String(all.length) })}</Small>
          {pointing.length ? <Small className="text-foreground">{fill(w.certs, { c: String(certified.length), p: String(pointing.length) })}</Small> : null}
          {waiting.length ? <Small className="text-muted-foreground">{fill(w.waiting, { names: waiting.join(", ") })}</Small> : null}
        </>
      ) : <Small className="text-muted-foreground">{w.unchecked}</Small>}
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} onClick={() => void onCheck()} size="sm" variant="outline">{words.records.check}</Button>
        <Button disabled={busy || pointing.length === 0} onClick={() => void onIssue()} size="sm" variant="outline">{w.issue}</Button>
      </div>
    </div>
  )
}

export function ServerEndSteps({ end, words, busy, readOnly, first, zone, onAct }: {
  end: ServerEnd; words: ServerDomainWords; busy: boolean; readOnly: boolean; first: number; zone: string | null
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<void>
}) {
  const architect = end.rows.find((r) => r.kind === "architect")?.host ?? zone ?? ""
  const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "")
  const order = ["certs", "check", "active"] as const
  const prev = { certs: end.steps.dns, check: end.steps.certs, active: end.steps.check }
  const body = {
    certs: <CertsStep busy={busy} helper={end.helper} onAct={onAct} readOnly={readOnly} rows={end.rows} run={end.certsRun} words={words} />,
    check: (
      <div className="flex flex-col gap-3">
        <Small className="text-muted-foreground">{words.checkText}</Small>
        <ul className="flex flex-col gap-1.5" data-block="server-ladder-https">
          {end.rows.map((r) => (
            <li className="flex flex-wrap items-center gap-2 text-sm" key={r.host}>
              <span className="font-mono text-foreground">{r.host}</span>
              {r.https === null ? null : <Badge variant={r.https ? "default" : "destructive"}>{r.https ? `${words.httpsOk} · ${r.status}` : words.httpsFail}</Badge>}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={busy || readOnly} onClick={() => void onAct("check")} size="sm">{words.checkButton}</Button>
          {end.checkAt ? <Small className="text-muted-foreground">{words.checkedAt} {when(end.checkAt)}</Small> : null}
        </div>
      </div>
    ),
    active: end.steps.active ? (
      <div className="flex flex-col gap-3">
        <Small className="text-foreground">{words.activeOn.split("{url}")[0]}<a className="underline" href={`https://${architect}/`}>{`https://${architect}/`}</a></Small>
        <div><Button disabled={busy || readOnly} onClick={() => void onAct("deactivate")} size="sm" variant="outline">{words.deactivate}</Button></div>
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        <Small className="text-muted-foreground">{words.activeText.replace("{architect}", architect).replace("{zone}", zone ?? "")}</Small>
        <div><Button disabled={busy || readOnly} onClick={() => void onAct("activate")} size="sm">{words.activate}</Button></div>
      </div>
    ),
  }
  return (
    <>
      {order.map((id, i) => (prev[id]
        ? <LadderStep done={end.steps[id]} id={`domain-${id}`} key={id} n={first + i} title={words.step[id]}>{body[id]}</LadderStep>
        : <LadderLocked key={id} n={first + i} text={words.locked} title={words.step[id]} />))}
    </>
  )
}
