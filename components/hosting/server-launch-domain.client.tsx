"use client"
// @local — step 3 of the launch ladder (one route: «Активация выделенного сервера»): the domain, where its records live, who writes them, the records

import { useEffect, useRef, useState } from "react"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { DomainLadderWords } from "@/components/domain/domain-ladder.i18n"
import { LadderLocked, LadderStep } from "@/components/hosting/ladder-step"
import type { LaunchState } from "@/components/hosting/server-launch.client"
import type { LadderView } from "@/components/hosting/server-ladder.client"
import { RecordsStep } from "@/components/hosting/server-ladder-records.client"
import { DomainStep, WhereStep, WhoStep } from "@/components/hosting/server-ladder-steps.client"
import type { ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import { Small } from "@/components/ui/typography"

// THE DOMAIN OF A SERVER BEING LAUNCHED (node step 738-5): the 737-19 ladder (the owner drew it on 2026-11-13: the domain · «кто его
// возвращает регистратор или Cloud Flyer» · who has access · the records) with a first check — «активация домена (… первая проверка)».
// 🔒 ITS STATE IS THE SERVER'S: the choice lives in /root/.fractera/domain.json there and reaches the server node's mark at the launch
// (`launch.sh`, stage mark); this island only shows what the server answered. The next step never waits for DNS.

type Act = (action: string, extra?: Record<string, unknown>) => Promise<unknown>

/** The launch state as the 737-19 steps read it — one shape for every door (`server-ladder.client.tsx`). */
export function launchView(s: LaunchState, key: boolean): LadderView {
  const d = s.domain ?? {}
  const ip = /^\d{1,3}(\.\d{1,3}){3}$/.test(s.host ?? "") ? (s.host as string) : s.probe?.publicIp ?? null
  return {
    zone: d.domain ?? null, ip, readOnly: false, own: false, canType: s.mark?.domainActive !== true, detect: d.detect ?? null, way: d.way ?? null, key,
    records: s.records ?? [], dns: Object.fromEntries((d.check?.results ?? []).map((r) => [r.host, r.state])), dnsAt: d.check?.at ?? null,
    run: null, names: null, server: null,
  }
}

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

  const done = {
    domain: Boolean(view.zone),
    where: Boolean(view.detect && view.detect.dnsHost !== "none"),
    who: Boolean(view.way && view.way !== "none"),
    records: Object.keys(view.dns).length > 0,
  }
  const order = ["domain", "where", "who", "records"] as const
  const body = {
    domain: <DomainStep busy={busy} onSave={(n) => { setPrefill(null); return onAct("domain", { name: n }) }} prefill={prefill} view={view} words={words} />,
    where: <WhereStep busy={busy} onAgain={() => onAct("detect")} onSub={(name) => setPrefill(name)} view={view} words={words} />,
    who: <WhoStep busy={busy} onChoose={(way) => onAct("way", { way })} view={view} words={words} />,
    records: <RecordsStep busy={busy} dialogUi={dialogUi} keyWords={keyWords} onCheck={() => onAct("dns")} onKeySaved={() => onAct("state")} onWrite={() => onAct("cloudflare-write")} view={view} words={words} />,
  }
  return (
    <div className="flex flex-col gap-3" data-block="server-launch-domain">
      <Small className="text-muted-foreground">{note}</Small>
      {order.map((id, i) => {
        const open = order.slice(0, i).every((p) => (p === "records" ? done.who : done[p]))
        if (!open) return <LadderLocked key={id} n={i + 1} text={words.locked} title={words.step[id]} />
        return <LadderStep done={done[id]} id={`domain-${id}`} key={id} n={i + 1} title={words.step[id]}>{body[id]}</LadderStep>
      })}
    </div>
  )
}
