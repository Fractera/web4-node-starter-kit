"use client"
// @local — the move ladder of the tab «Выделенный сервер» (one route); its pieces are the parts ladder-step and stage-log

import { Fragment, useCallback, useEffect, useState } from "react"
import { LadderLocked, LadderStep } from "@/components/hosting/ladder-step"
import type { ServerMoveWords } from "@/components/hosting/server-move.i18n"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { ServerBusy } from "@/components/hosting/server-move-busy.client"
import { ServerRecords } from "@/components/hosting/server-move-records.client"
import { RungBody, type MoveState } from "@/components/hosting/server-move-rung.client"
import { ServerTelegram, type HomeBot } from "@/components/hosting/server-move-telegram.client"
import { CopyPlanChoice, EarlierRun, RoadChoice, type CopyPlan, type Road } from "@/components/hosting/server-move-road.client"
import type { TelegramChannelWords } from "@/app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/words/telegram-channel.i18n"
import { ServerDomain } from "@/components/hosting/server-domain.client"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { isTemporaryHostname } from "@/lib/auth/temporary-address"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"

// THE MOVE TO A DEDICATED SERVER — THE LADDER (node step 737-7). The owner, 2026-11-13: «настройка которая принимает IP-адрес сервера и
// которая принимает пароль с сервера а затем создают процесс при котором шаг за шагом автоматически … весь проект переносится на
// сервер и запускается там сначала по IP-адресу».
// 🔒 THE LADDER LAW (the domain ladder, 259-1): a rung opens when the one before it is done; a closed one is a grey line naming what
// appears there. The state is the node's (`/api/node/server` reads `data/node/server/move.json`), never this island's memory: opened from
// another device, the ladder shows the same truth. While a rung works the island asks every 3 s; otherwise every 15 s.
// 🔒 ON A PUBLIC ADDRESS THE LADDER IS NOT ASKED: its door refuses there. The server's bare IP is such an address too — there the domain's
// five steps show read-only (737-8: the records to write are what the person opening the IP wants to see).
// 🔒 ON THE SERVER ITSELF (phase live) THE MOVE IS OVER: the tab shows the domain's five steps instead (737-8).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type View = { ok: boolean; state: MoveState; road: Road; rungs: Array<keyof ServerMoveWords["rung"]>; phase: "silent" | "live" | null; moved: boolean; homeBot: HomeBot; serverOrigin: string | null }

export function ServerMove({ words, domainWords, dialogUi, lang, channelWords }: { words: ServerMoveWords; domainWords: ServerDomainWords; dialogUi: AppDialogUi; lang: string; channelWords: TelegramChannelWords }) {
  const [view, setView] = useState<View | null>(null)
  const [silent, setSilent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [publicAddress, setPublicAddress] = useState(false)
  // 737-11b: the new server's copy plan — no data by default: a person's data goes to another machine only by an explicit tick.
  const [plan, setPlan] = useState<CopyPlan>({ variant: "clone", data: false })
  // ✗ The owner's test 2026-11-13: one unanswered request (the core busy) stopped the polling for good and the screen kept «Идёт
  // работа…» of a rung finished long before. Every answer — or its absence — counts as a tick, and the next ask follows it.
  const [tick, setTick] = useState(0)

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/node/server`, { cache: "no-store" })
      if (!r.ok) throw new Error(String(r.status))
      setView((await r.json()) as View)
      setSilent(false)
    } catch {
      setSilent(true)
    } finally {
      setTick((n) => n + 1)
    }
  }, [])

  useEffect(() => {
    if (isTemporaryHostname(window.location.hostname)) { setPublicAddress(true); return }
    void load()
  }, [load])

  useEffect(() => {
    if (!tick) return
    if (!view) { const t = setTimeout(() => void load(), 5000); return () => clearTimeout(t) }
    const running = Object.values(view.state.rungs ?? {}).some((r) => r?.state === "running") || view.state.clear?.state === "running"
    const t = setTimeout(() => void load(), running ? 3000 : 15000)
    return () => clearTimeout(t)
  }, [tick, view, load])

  async function start(rung: string, extra: Record<string, unknown> = {}) {
    setBusy(true)
    try {
      const r = await fetch(`${BASE}/api/node/server`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ rung, ...extra }) })
      const a = (await r.json().catch(() => null)) as View | null
      if (a?.state) setView(a)
      else await load()
    } finally {
      setBusy(false)
    }
  }

  if (publicAddress) return <ServerDomain fallback={words.lead} words={domainWords} />
  if (!view) return <p className="my-6 text-muted-foreground text-sm" data-block="server-move-loading">{silent ? "—" : words.loading}</p>
  if (view.phase === "silent") return <p className="my-6 text-foreground text-sm" data-block="server-move-on-server">{words.silent}</p>
  if (view.phase === "live") {
    return (
      <div data-block="server-move-on-server">
        <p className="my-6 text-foreground text-sm">{words.onServer}</p>
        <ServerDomain words={domainWords} />
      </div>
    )
  }

  const rungs = view.state.rungs ?? {}
  const moved = rungs.move?.state === "done"
  const url = view.state.server?.host ? `http://${view.state.server.host}/` : ""
  // 737-7: the probe found another installation — the choice to free the server or cancel, before anything is prepared.
  const items = view.state.verdict?.items ?? []
  const sitesItem = items.find((i) => i.id === "sites")
  const othersItem = items.find((i) => i.id === "others")
  const started = ["prepare", "copy", "claude", "rehearse", "start", "telegram", "move"].some((r) => rungs[r]?.state)
  const road: Road = view.road === "new" ? "new" : "move"
  const independent = road === "new" && rungs.start?.state === "done"
  const running = Object.values(rungs).some((r) => r?.state === "running")
  const current = view.rungs.findIndex((r) => rungs[r]?.state !== "done")
  const stale = Date.now() - Date.parse(view.state.updatedAt ?? "") > 30 * 60_000
  const earlier = Object.keys(rungs).length > 0 && !running && !moved && !independent && current >= 0 && (rungs[view.rungs[current]]?.state === "failed" || stale)
  const withPlan = (r: string, x: Record<string, unknown> = {}) => start(r, r === "copy" && road === "new" ? { ...plan, ...x } : x)
  const taken = (sitesItem || othersItem || view.state.clear?.state) && !started
    ? { host: view.state.server?.host, sites: String(sitesItem?.value ?? "").split(", ").filter(Boolean), programs: Number(othersItem?.value ?? 0), clear: view.state.clear }
    : null
  return (
    <div className="my-6 flex flex-col gap-3" data-block="server-move">
      <p className="text-foreground text-sm">{words.lead}</p>
      {earlier ? (
        <EarlierRun at={new Date(view.state.updatedAt ?? Date.now()).toLocaleString()} busy={busy} host={view.state.server?.host ?? "—"} n={current + 1} onRestart={() => void start("restart")} step={words.rung[view.rungs[current]].title} words={words.earlier} />
      ) : null}
      <RoadChoice busy={busy} onChoose={(r) => void start("road", { road: r })} open={!started} road={road} words={words.road} />
      {view.rungs.map((id, i) => {
        const open = view.rungs.slice(0, i).every((p) => rungs[p]?.state === "done")
        if (!open) return <LadderLocked key={id} n={i + 1} text={words.locked} title={words.rung[id].title} />
        // 737-15: the domain right under «Подключение» (the owner, 2026-11-13: «подними блок домена под шаг 1») — from the moment the
        // server's IP is known until the move, so DNS wakes while the server is prepared and copied.
        const domainHere = id === "connect" && rungs.connect?.state === "done" && !moved && road === "move"
        return (
          <Fragment key={id}>
          <LadderStep done={rungs[id]?.state === "done"} id={id} n={i + 1} title={words.rung[id].title}>
            {id === "copy" && road === "new" && rungs.copy?.state !== "running" ? <CopyPlanChoice busy={busy} onChange={setPlan} plan={plan} words={words.plan} /> : null}
            {id === "telegram" ? (
              <ServerTelegram busy={busy} canMove={road === "move"} channelWords={channelWords} homeBot={view.homeBot ?? null} lang={lang} onStart={start} origin={view.serverOrigin ?? null} state={view.state} text={words.rung.telegram.text} words={words.telegram} />
            ) : (
              <RungBody busy={busy} id={id} onStart={withPlan} rung={rungs[id] ?? {}} state={view.state} words={words} />
            )}
            {id === "probe" && taken ? <ServerBusy busy={taken} dialogUi={dialogUi} disabled={busy} onStart={start} words={words.busy} /> : null}
          </LadderStep>
          {domainHere ? <ServerRecords dialogUi={dialogUi} words={words.records} /> : null}
          </Fragment>
        )
      })}
      {independent ? (
        // 737-11b: the independent server runs on its own; the tab may be freed for the next one once its bot is chosen.
        <div className="flex flex-col gap-2 rounded-lg border border-primary/40 bg-primary/5 p-4" data-block="server-move-independent">
          <p className="font-medium text-foreground text-sm">{words.newDone.title}</p>
          <p className="text-foreground text-sm">
            {words.newDone.text.split("{url}")[0]}
            <a className="underline" href={url}>{url}</a>
            {words.newDone.text.split("{url}")[1] ?? ""}
          </p>
          {rungs.telegram?.state === "done" ? (
            <div className="flex flex-col gap-1" data-block="server-move-forget">
              <Button className="w-fit" disabled={busy} onClick={() => void start("forget")} size="sm" variant="outline">{words.newDone.forget}</Button>
              <Small className="text-muted-foreground">{words.newDone.note}</Small>
            </div>
          ) : null}
        </div>
      ) : null}
      {moved ? (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-4" data-block="server-move-moved">
          <p className="font-medium text-foreground text-sm">{words.movedTitle}</p>
          <p className="mt-1 text-foreground text-sm">
            {words.movedText.split("{url}")[0]}
            <a className="underline" href={url}>{url}</a>
            {words.movedText.split("{url}")[1] ?? ""}
          </p>
        </div>
      ) : null}
    </div>
  )
}
