"use client"

import { useState } from "react"
import { Rocket } from "lucide-react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Button } from "@/components/ui/button"

// «РАЗВЕРНУТЬ» ЯДРА (узел, шаг 555). Слово владельца 2026-10-21: «нажатие эту кнопки автоматически приводит к подсказке проверьте какие
// терминалы сейчас открыты для этого нажмите на кнопку в правом верхнем меню если на нём есть оранжевая метка вы увидите список активных
// терминалов зайдите поочерёдно выключите их при необходимости дождитесь завершения разработки после этого вы выполните развёртывания».
// Окно показывает ту же подсказку и сам список открытых терминалов (`/api/agents/sessions`, та же оранжевая метка) с «Закрыть» у каждого.
// «Развернуть» → `POST /api/node/deploy { core: true }`: сборка при закрытой крышке, страница перестаёт отвечать на её время.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export type CoreDeployWords = {
  button: string
  title: string
  hint: string
  terminals: string
  noTerminals: string
  close: string
  cancel: string
  start: string
  started: string
  refused: string
  /** `{when}` */
  lastDone: string
  /** `{when}`, `{rc}` */
  lastFailed: string
  lastRunning: string
  lastInterrupted: string
}
export type CoreDeployState = { state: "running" | "done" | "failed" | "interrupted"; startedAt?: string; finishedAt?: string; rc?: number | null } | null
type Session = { id: string; name: string; since: string | null }

export function CoreDeploy({ words, dialogUi, last, log, lang, disabled }: {
  words: CoreDeployWords; dialogUi: AppDialogUi; last: CoreDeployState; log: string[]; lang: string; disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const when = (s?: string) => (s ? new Date(s).toLocaleString(lang) : "—")

  async function loadSessions() {
    try {
      const r = await fetch(`${BASE}/api/agents/sessions`, { cache: "no-store" })
      const j = (await r.json()) as { sessions?: Session[] }
      setSessions(j.sessions ?? [])
    } catch {
      setSessions([])
    }
  }
  async function closeOne(id: string) {
    await fetch(`${BASE}/api/agents/sessions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action: "stop" }) }).catch(() => null)
    void loadSessions()
  }
  async function start() {
    const r = await fetch(`${BASE}/api/node/deploy`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ core: true }) }).catch(() => null)
    setOpen(false)
    setNote(r?.ok ? words.started : words.refused)
  }

  const lastLine =
    !last ? null
    : last.state === "done" ? words.lastDone.replace("{when}", when(last.finishedAt))
    : last.state === "failed" ? words.lastFailed.replace("{when}", when(last.finishedAt)).replace("{rc}", String(last.rc ?? "—"))
    : last.state === "running" ? words.lastRunning
    : words.lastInterrupted

  return (
    <div className="flex w-full flex-col gap-2" data-core-deploy={last?.state ?? "none"}>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="outline" onClick={() => { setOpen(true); setSessions(null); void loadSessions() }} disabled={disabled || last?.state === "running"} data-core-deploy-open>
          <Rocket className="mr-2 size-4" aria-hidden />
          {words.button}
        </Button>
        {lastLine && <span className="text-muted-foreground">{lastLine}</span>}
        {note && <span className="text-foreground" data-core-deploy-note>{note}</span>}
      </div>
      {last?.state === "failed" && log.length > 0 && (
        <pre className="max-h-48 overflow-auto rounded-md border border-border bg-muted/40 p-2 text-xs whitespace-pre-wrap">{log.join("\n")}</pre>
      )}
      {open && (
        <AppDialog
          open
          onOpenChange={(o) => { if (!o) setOpen(false) }}
          title={words.title}
          ui={dialogUi}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>{words.cancel}</Button>
              <Button onClick={() => void start()} data-core-deploy-start>{words.start}</Button>
            </>
          }
        >
          <div className="flex flex-col gap-3 px-5 py-4 text-sm">
            <p>{words.hint}</p>
            <p className="font-medium text-foreground">{words.terminals}</p>
            {sessions === null ? <p className="text-muted-foreground">…</p>
              : sessions.length === 0 ? <p className="text-muted-foreground" data-core-deploy-terminals="0">{words.noTerminals}</p>
              : (
                <ul className="flex flex-col gap-2" data-core-deploy-terminals={sessions.length}>
                  {sessions.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                      <span>{s.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => void closeOne(s.id)}>{words.close}</Button>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </AppDialog>
      )}
    </div>
  )
}
