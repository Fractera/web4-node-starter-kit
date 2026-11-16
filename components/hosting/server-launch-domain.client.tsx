"use client"
// @local — step 3 of the launch ladder (one route: «Активация выделенного сервера»): the domain, where its records live, who writes them, the records

import { useEffect, useRef, useState } from "react"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Ladder } from "@/components/hosting/ladder-step"
import type { LaunchState } from "@/components/hosting/server-launch.client"
import { RecordsStep } from "@/components/hosting/server-ladder-records.client"
import { type CfAnswer, CloudflareWrite } from "@/components/hosting/server-launch-cf.client"
import { ChromeHelp, chromeTask } from "@/components/hosting/chrome-help.client"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { launchView } from "@/components/hosting/server-launch-rungs"
import { DomainStep, domainLines, quickNames, WhereStep, WhoStep } from "@/components/hosting/server-ladder-steps.client"
import type { ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import { Small } from "@/components/ui/typography"
import { domainSteps } from "@/lib/hosting/launch-domain.mjs"

// THE DOMAIN OF A SERVER BEING LAUNCHED (node step 738-5): the 737-19 ladder (the domain · where its records live · access to the
// registrar — the only way since 759 · the records by hand) with a first check — «активация домена (… первая проверка)».
// 🔒 ITS STATE IS THE SERVER'S: the choice lives in /root/.fractera/domain.json there and reaches the server node's mark at the launch
// (`launch.sh`, stage mark); this island only shows what the server answered. The next step never waits for DNS.
// 🔒 744-7, D46: step 3 of the launch is done when this ladder is — a domain, where its records live, a way to write them, the first check
// of the records (its result is the second check's business) — `domainSteps` (`lib/hosting/launch-domain.mjs`), read by this ladder, by
// step 3's own line and by the runner's `install` alike; a domain the server already holds counts as connected (744-5).
// 🔒 760-8: WHO WRITES IS MEASURED, NEVER ASKED FIRST — the domain's DNS in Cloudflare (its name servers) → the door reads whether the
// node's key sees the zone (`records-plan`, once per domain, like the detection); it does → the node writes after one confirm; it does
// not → the key first, the question and «by hand» below. Any other DNS → the question and the records by hand, as 759.

type Act = (action: string, extra?: Record<string, unknown>) => Promise<unknown>

export function LaunchDomain({ lang, state, words, launchWords, dialogUi, note, busy, onAct }: {
  lang: string; state: LaunchState; words: ServerLadderWords; launchWords: Pick<ServerLaunchWords, "cf" | "chrome">; dialogUi: AppDialogUi; note: string; busy: boolean; onAct: Act
}) {
  const view = launchView(state)
  const [prefill, setPrefill] = useState<string | null>(null)
  const detected = useRef<string | null>(null)
  // A domain known and never asked about — the node asks the internet once, by itself (the same rule as the 737-19 ladder).
  useEffect(() => {
    if (!view.zone || view.detect || detected.current === view.zone) return
    detected.current = view.zone
    void onAct("detect")
  }, [view.zone, view.detect, onAct])
  const [cf, setCf] = useState<CfAnswer | null>(null)
  const planned = useRef<string | null>(null)
  const onCloudflare = view.detect?.dnsHost === "cloudflare"
  const plan = () => onAct("records-plan").then((a) => setCf((a as { cf?: CfAnswer } | null)?.cf ?? null))
  useEffect(() => {
    if (!onCloudflare || !view.zone || view.readOnly || planned.current === view.zone) return
    planned.current = view.zone
    void plan()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- once per domain, like the detection above
  }, [onCloudflare, view.zone, view.readOnly])

  const done = domainSteps(state.domain)
  const summary = domainLines(view, words)
  const body = {
    domain: <DomainStep busy={busy} onSave={(n) => { setPrefill(null); return onAct("domain", { name: n }) }} prefill={prefill} view={view} words={words} />,
    where: <WhereStep busy={busy} onAgain={() => onAct("detect")} onSub={(name) => setPrefill(name)} view={view} words={words} />,
    who: (() => {
      const ask = <WhoStep busy={busy} onChoose={(way) => onAct("way", { way })} view={view} words={words} />
      if (!onCloudflare || !cf) return ask
      const write = (remove: string[]) => onAct("records-write", { remove }).then((a) => { const next = (a as { cf?: CfAnswer } | null)?.cf; if (next) setCf(next) })
      return <CloudflareWrite busy={busy} cf={cf} dialogUi={dialogUi} manual={ask} onAgain={plan} onWrite={write} words={launchWords.cf} />
    })(),
    // 760-9: under the records by hand — «Claude впишет эти записи в вашем Chrome» with the task for the main agent
    records: (() => {
      const { at, star } = quickNames(view)
      const conflicts = (view.records[0]?.records ?? []).filter((r) => view.dns[r.host] === "elsewhere" || view.dns[r.host] === "aaaa").map((r) => r.name)
      const d = view.detect
      const c = chromeTask(launchWords.chrome, { zone: d?.zone ?? view.zone ?? "", dnsHost: d?.dnsHost, ns: d?.ns ?? [], registrar: d?.registrar ?? null, at, star, ip: view.ip ?? "", conflicts })
      return (
        <div className="flex flex-col gap-3" data-block="server-launch-records">
          <RecordsStep busy={busy} onCheck={() => onAct("dns")} view={view} words={words} />
          {view.readOnly || !c ? null : <ChromeHelp lang={lang} map={{ cabinet: c.cabinet }} task={c.task} words={launchWords.chrome} />}
        </div>
      )
    })(),
  }
  const rungs = (["domain", "where", "who", "records"] as const).map((id) => ({ id, title: words.step[id], done: done[id], summary: summary[id], body: body[id] }))
  return (
    <div className="flex flex-col gap-3" data-block="server-launch-domain">
      <Small className="text-muted-foreground">{note}</Small>
      {/* «Take a subdomain instead» sends the person back to the domain rung with the name typed in. */}
      <Ladder focus={prefill ? "domain" : null} id="launch-domain" locked={words.locked} rungs={rungs} />
    </div>
  )
}
