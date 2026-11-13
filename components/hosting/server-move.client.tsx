"use client"
// @local — the move ladder of the tab «Выделенный сервер» (one route); its pieces are the parts ladder-step and stage-log

import { type ReactNode, useCallback, useEffect, useState } from "react"
import { LadderLocked, LadderStep } from "@/components/hosting/ladder-step"
import type { ServerMoveWords } from "@/components/hosting/server-move.i18n"
import { RungBody, type MoveState } from "@/components/hosting/server-move-rung.client"
import { ServerDomain } from "@/components/hosting/server-domain.client"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { isTemporaryHostname } from "@/lib/auth/temporary-address"

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
type View = { ok: boolean; state: MoveState; rungs: Array<keyof ServerMoveWords["rung"]>; phase: "silent" | "live" | null; moved: boolean }

export function ServerMove({ words, domainWords, place }: { words: ServerMoveWords; domainWords: ServerDomainWords; place?: ReactNode }) {
  const [view, setView] = useState<View | null>(null)
  const [silent, setSilent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [publicAddress, setPublicAddress] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/node/server`, { cache: "no-store" })
      if (!r.ok) throw new Error(String(r.status))
      setView((await r.json()) as View)
      setSilent(false)
    } catch {
      setSilent(true)
    }
  }, [])

  useEffect(() => {
    if (isTemporaryHostname(window.location.hostname)) { setPublicAddress(true); return }
    void load()
  }, [load])

  useEffect(() => {
    if (!view) return
    const running = Object.values(view.state.rungs ?? {}).some((r) => r?.state === "running")
    const t = setTimeout(() => void load(), running ? 3000 : 15000)
    return () => clearTimeout(t)
  }, [view, load])

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
  return (
    <div className="my-6 flex flex-col gap-3" data-block="server-move">
      <p className="text-foreground text-sm">{words.lead}</p>
      {view.rungs.map((id, i) => {
        const open = view.rungs.slice(0, i).every((p) => rungs[p]?.state === "done")
        if (!open) return <LadderLocked key={id} n={i + 1} text={words.locked} title={words.rung[id].title} />
        return (
          <LadderStep key={id} done={rungs[id]?.state === "done"} id={id} n={i + 1} title={words.rung[id].title}>
            <RungBody busy={busy} id={id} onStart={start} rung={rungs[id] ?? {}} state={view.state} words={words} />
          </LadderStep>
        )
      })}
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
      {place ? <div className="mt-6" data-block="server-move-place">{place}</div> : null}
    </div>
  )
}
