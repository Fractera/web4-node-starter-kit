"use client"
// @local — step 3 of the launch ladder (one route: «Активация выделенного сервера»): the domain, where its records live, who writes them, the records

import { useEffect, useRef, useState } from "react"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { DomainLadderWords } from "@/components/domain/domain-ladder.i18n"
import { Ladder } from "@/components/hosting/ladder-step"
import type { LaunchState } from "@/components/hosting/server-launch.client"
import { RecordsStep } from "@/components/hosting/server-ladder-records.client"
import { domainDone, launchView } from "@/components/hosting/server-launch-rungs"
import { DomainStep, domainLines, WhereStep, WhoStep } from "@/components/hosting/server-ladder-steps.client"
import type { ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import { Small } from "@/components/ui/typography"

// THE DOMAIN OF A SERVER BEING LAUNCHED (node step 738-5): the 737-19 ladder (the owner drew it on 2026-11-13: the domain · «кто его
// возвращает регистратор или Cloud Flyer» · who has access · the records) with a first check — «активация домена (… первая проверка)».
// 🔒 ITS STATE IS THE SERVER'S: the choice lives in /root/.fractera/domain.json there and reaches the server node's mark at the launch
// (`launch.sh`, stage mark); this island only shows what the server answered. The next step never waits for DNS.
// 🔒 744-7, D46: step 3 of the launch is done when this ladder is — a domain, where its records live, a way to write them, the first check
// of the records (its result is the second check's business): `domainDone` (`server-launch-rungs.ts`), read by this ladder and step 3 alike.

type Act = (action: string, extra?: Record<string, unknown>) => Promise<unknown>

export function LaunchDomain({ state, keyPresent, words, keyWords, dialogUi, note, busy, onAct }: {
  state: LaunchState; keyPresent: boolean; words: ServerLadderWords; keyWords: DomainLadderWords; dialogUi: AppDialogUi; note: string; busy: boolean; onAct: Act
}) {
  const view = launchView(state, keyPresent)
  const [prefill, setPrefill] = useState<string | null>(null)
  const detected = useRef<string | null>(null)
  // A domain known and never asked about — the node asks the internet once, by itself (the same rule as the 737-19 ladder).
  useEffect(() => {
    if (!view.zone || view.detect || detected.current === view.zone) return
    detected.current = view.zone
    void onAct("detect")
  }, [view.zone, view.detect, onAct])

  const done = domainDone(view)
  const summary = domainLines(view, words)
  const body = {
    domain: <DomainStep busy={busy} onSave={(n) => { setPrefill(null); return onAct("domain", { name: n }) }} prefill={prefill} view={view} words={words} />,
    where: <WhereStep busy={busy} onAgain={() => onAct("detect")} onSub={(name) => setPrefill(name)} view={view} words={words} />,
    who: <WhoStep busy={busy} onChoose={(way) => onAct("way", { way })} view={view} words={words} />,
    records: <RecordsStep busy={busy} dialogUi={dialogUi} keyWords={keyWords} onCheck={() => onAct("dns")} onKeySaved={() => onAct("state")} onWrite={() => onAct("cloudflare-write")} view={view} words={words} />,
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
