"use client"
// @local — the last steps of a server node's own domain ladder (one route: the tab of the server itself): certificates · HTTPS · switch on

import type { Rung } from "@/components/hosting/ladder-step"
import { CertsStep, type CertRow, type CertsRun } from "@/components/hosting/server-domain-certs.client"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"
import { httpsDue, httpsWaits } from "@/lib/hosting/final-check.mjs"

// 737-8, 737-19: on the server itself, its own three steps — certificates, HTTPS from the internet, switching the domain on. The launch page
// of the person's computer runs the same three through the server's door over SSH (`server-launch-end.client.tsx`, 738).
// 744-7: they are rungs of the server's one ladder (`server-ladder.client.tsx`) — which one is open is the part's rule, not this file's.

type Row = CertRow & { zone: string; label: string; kind: string; https: boolean | null; status: number | null; off?: boolean }
export type ServerEnd = {
  rows: Row[]
  steps: { domain: boolean; dns: boolean; certs: boolean; check: boolean; active: boolean }
  certsRun: CertsRun
  helper: boolean
  checkAt: string | null
}

/** The server's last three rungs — what each has done, its one line and its body. */
export function serverEndRungs({ end, words, busy, readOnly, zone, onAct }: {
  end: ServerEnd; words: ServerDomainWords; busy: boolean; readOnly: boolean; zone: string | null
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<void>
}): Rung[] {
  const architect = end.rows.find((r) => r.kind === "architect")?.host ?? zone ?? ""
  const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "")
  const need = end.rows.filter((r) => !r.optional)
  const count = (t: string, ok: (r: Row) => boolean) => t.replace("{ok}", String(need.filter(ok).length)).replace("{all}", String(need.length))
  // 742-6: HTTPS is counted over the names it is due for (`httpsDue`) — sign-in before the switch-on and an element off by the registry
  // are not «failing». ✗ Seen 2026-11-14 on aifa.dev: «HTTPS отвечает на 9 из 12 имён» with everything working.
  const due = need.filter(httpsDue)
  const checked = words.summary.check.replace("{ok}", String(due.filter((r) => r.https === true).length)).replace("{all}", String(due.length))
  const summary = { certs: count(words.summary.certs, (r) => r.cert === "ok" || r.cert === "expiring"), check: checked, active: null }
  // 742-10: a row that waits (off by the registry, sign-in before the switch-on) is grey, the way the launch page shows it since 744-9
  const waits = (r: Row) => r.https === false && httpsWaits(r, end.steps.active)
  const badge = (r: Row) =>
    r.https === null ? null
    : r.https ? <Badge variant="default">{`${words.httpsOk} · ${r.status}`}</Badge>
    : waits(r) ? <Badge variant="secondary">{r.off ? words.httpsOff : words.httpsAfterOn}</Badge>
    : <Badge variant="destructive">{words.httpsFail}</Badge>
  const body = {
    certs: <CertsStep busy={busy} helper={end.helper} onAct={onAct} readOnly={readOnly} rows={end.rows} run={end.certsRun} words={words} />,
    check: (
      <div className="flex flex-col gap-3">
        <Small className="text-muted-foreground">{words.checkText}</Small>
        <ul className="flex flex-col gap-1.5" data-block="server-ladder-https">
          {end.rows.map((r) => (
            <li className="flex flex-wrap items-center gap-2 text-sm" key={r.host}>
              <span className="font-mono text-foreground">{r.host}</span>
              {badge(r)}
            </li>
          ))}
        </ul>
        {end.rows.some(waits) ? <Small className="text-muted-foreground" data-block="server-ladder-not-due">{words.httpsNotDue}</Small> : null}
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
  return (["certs", "check", "active"] as const).map((id) => ({ id, title: words.step[id], done: end.steps[id], summary: summary[id], body: body[id] }))
}
