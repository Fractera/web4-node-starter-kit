"use client"
// @local — the live install of one route («Активация выделенного сервера», step 4): the server's own log and checklist, read over SSH

import { Check, Minus, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { LiveLog } from "@/app/[lang]/(architectLayer)/_components/live-log.client"
import type { LiveWords } from "@/components/hosting/server-install-live.i18n"
import { Spinner } from "@/components/ui/spinner"
import { Small } from "@/components/ui/typography"

// THE SERVER'S INSTALL, LIVE (node step 806-4, 806-5). The owner, 2026-11-19: «Я хочу видеть что что-то происходит … подними терминал и
// пусть отдельный чтец тебе возвращает живой файлы»; «большой чеклист из 10 15 или даже 25 пунктов чтобы было видно что что-то происходит
// или что-то где-то зависло». ✗ The same day 18:56–19:37 the page showed one line «Пакеты, сборка и элементы · running» for 41 minutes.
// 🔒 THE READER IS THE SERVER'S OWN SCRIPT (`scripts/dedicated-server/log.sh`) asked through the page's visit (`/api/node/launch` «log»):
// one question at a time — the next only after the answer and a pause (✗ 796: a loop of SSH reads piled up on the server).
// 🔒 A QUIET LOG IS NAMED, NOT GUESSED: after 3 minutes without a line the step says how busy the processor is — busy is a long step
// without output (npm ci), idle is a hang (red).

export type LiveStep = { id: string; kind: "stage" | "sub" | "element"; parent: string | null; state: string; startedAt: string | null; sec: number | null; lastSec: number | null; detail?: string }
export type LiveLogAnswer = { stage: string | null; file: string; quietSec: number | null; cpuPct: number | null; memAvailMb: number | null; diskFreeGb: number | null; lines: string[]; steps: LiveStep[]; launch: { state?: string } | null }
type Answer = { ok?: boolean; reason?: string; log?: LiveLogAnswer } | null

const QUIET_SEC = 180
const IDLE_CPU = 15
const EVERY_MS = 3000
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** `sec` in the page's words: «45 с», «6 мин 12 с», «1 ч 4 мин». */
export function duration(sec: number, w: LiveWords): string {
  const s = Math.max(0, Math.round(sec))
  if (s < 60) return w.sec.replace("{s}", String(s))
  if (s < 3600) return w.min.replace("{m}", String(Math.floor(s / 60))).replace("{s}", String(s % 60))
  return w.hour.replace("{h}", String(Math.floor(s / 3600))).replace("{m}", String(Math.floor((s % 3600) / 60)))
}

export function ServerInstallLive({ host, port, running, runKey, words, stage }: { host: string; port: number; running: boolean; runKey: string; words: LiveWords; stage: Record<string, string> }) {
  const [log, setLog] = useState<LiveLogAnswer | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const read = useCallback(async (): Promise<Answer> => {
    try {
      const r = await fetch(`${BASE}/api/node/launch`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "log", host, port }), cache: "no-store" })
      return (await r.json().catch(() => null)) as Answer
    } catch { return null }
  }, [host, port])

  useEffect(() => {
    let stop = false
    const loop = async () => {
      for (;;) {
        const a = await read()
        if (stop) return
        if (a?.ok && a.log) { setLog(a.log); setFailed(null) } else setFailed(a?.reason ?? "network")
        // a finished launch is read once — its last lines and the whole checklist with times stay on the page
        if (!running) return
        await new Promise((r) => setTimeout(r, EVERY_MS))
        if (stop) return
      }
    }
    void loop()
    return () => { stop = true }
  }, [read, running, runKey])

  const state = log?.launch?.state ?? (running ? "running" : "done")
  const title = state === "failed" ? words.failed : state === "done" && !running ? words.done : words.running
  const quiet = running && log?.quietSec !== null && log?.quietSec !== undefined && log.quietSec >= QUIET_SEC ? log.quietSec : null
  const idle = quiet !== null && log?.cpuPct !== null && log?.cpuPct !== undefined && log.cpuPct < IDLE_CPU
  const label = (s: LiveStep) => s.kind === "element" ? (words.names[s.id] ?? words.element.replace("{id}", s.id)) : (stage[s.id] ?? s.id)

  return (
    <div className="flex flex-col gap-3" data-block="server-install-live" data-live-state={state}>
      {log?.steps.length ? (
        <div className="flex flex-col gap-1.5" data-block="server-install-checklist">
          <Small className="font-medium text-foreground">{words.checklist}</Small>
          <ul className="flex flex-col gap-1">
            {log.steps.map((s) => (
              <li className={`flex items-start gap-2 text-sm ${s.kind === "stage" ? "" : s.kind === "sub" ? "pl-6" : "pl-12"}`} data-kind={s.kind} data-state={s.state} data-step={s.id} key={`${s.kind}:${s.parent ?? ""}:${s.id}`}>
                <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center">
                  {s.state === "done" ? <Check aria-hidden className="size-4 text-primary" />
                    : s.state === "running" ? <Spinner className="size-4 text-foreground" />
                    : s.state === "failed" ? <X aria-hidden className="size-4 text-destructive" />
                    : <Minus aria-hidden className="size-4 text-muted-foreground" />}
                </span>
                <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
                  <span className={s.state === "failed" ? "text-destructive" : s.state === "running" ? "font-medium text-foreground" : "text-foreground"}>{label(s)}</span>
                  {s.sec !== null ? <span className="text-muted-foreground text-xs tabular-nums">{duration(s.sec, words)}</span> : null}
                  {s.lastSec !== null ? <span className="text-muted-foreground text-xs tabular-nums">· {words.last.replace("{t}", duration(s.lastSec, words))}</span> : null}
                  {s.state === "failed" && s.detail ? <span className="w-full break-all font-mono text-destructive text-xs">{s.detail.slice(-300)}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {quiet !== null ? (
        <Small className={idle ? "rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-destructive" : "text-muted-foreground"} data-block="server-install-quiet" data-idle={idle ? "1" : "0"} role="status">
          {(log?.cpuPct === null || log?.cpuPct === undefined ? words.quietUnknown : idle ? words.quietIdle : words.quietBusy).replace("{t}", duration(quiet, words)).replace("{cpu}", String(log?.cpuPct ?? "—"))}
        </Small>
      ) : null}
      <LiveLog done={!running} failed={state === "failed"} lines={log?.lines.length ? log.lines : [words.reading]} title={title} />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {log ? <Small className="text-muted-foreground tabular-nums">{words.machine.replace("{mem}", String(log.memAvailMb ?? "—")).replace("{disk}", String(log.diskFreeGb ?? "—")).replace("{cpu}", String(log.cpuPct ?? "—"))}</Small> : null}
        {log?.file ? <Small className="font-mono text-muted-foreground">{words.file.replace("{file}", log.file)}</Small> : null}
        {running && !log ? <Spinner className="size-4 text-muted-foreground" /> : null}
      </div>
      {failed ? <Small className="text-muted-foreground" role="status">{words.unreadable.replace("{reason}", failed)}</Small> : null}
    </div>
  )
}
