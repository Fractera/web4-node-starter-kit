"use client"

import { useEffect, useState } from "react"
import { ExternalLink, RefreshCw, TriangleAlert } from "lucide-react"
import type { OriginNoticeWords } from "./origin-notice.i18n"
import { useSnooze } from "./snooze"

// ПОЛОСА «ВЕРСИЯ УСТАРЕЛА» НАД СЛОЕМ АРХИТЕКТОРА (шаги 368, 632-4). Слово владельца 2026-10-01: «никакой запрет представить не будем,
// но … будем выводить уведомления что … ваша версия уже устарела … или продолжите». Владелец 2026-11-03: «синхронизацию я уже
// выполнил наверно было бы логично здесь поставить вторую кнопку запустить развёртывание? И убрать кнопку открыть Fork?»
// ✗ До 632 полоса читала только отметку `check-origin` (пишется при сборке): после «Sync fork» она по-прежнему звала в форк, где
// синхронизировать было уже нечего, а узел сам ничего не забирает.
// Теперь два отставания: форка от оригинала (→ «Открыть ваш форк») и узла от форка (→ «Обновить узел», `scripts/node-update.mjs`);
// «Проверить снова» спрашивает GitHub и забирает форк — сеть только по кнопке. Источник — дверь `/api/node/update`, один запрос при
// открытии, таймеров нет: идущее обновление видно, когда человек откроет страницу снова.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Update = { state: string; stage?: string; summary?: string; reason?: string; changes?: number; finishedAt?: string }
type Body = { fork: boolean; behindBy: number; nodeBehind: number; repo: string | null; update: Update | null }

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""))

export function OriginNotice({ words }: { words: OriginNoticeWords }) {
  const [d, setD] = useState<Body | null>(null)
  const [busy, setBusy] = useState<"check" | "update" | null>(null)
  const done = d?.update?.state === "done" && (d.update.changes ?? 0) > 0 ? d.update : null
  const { hidden, snooze } = useSnooze(`node-update-done-${done?.finishedAt ?? ""}`)

  useEffect(() => {
    fetch(`${BASE}/api/node/update`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: Body | null) => setD(b))
      .catch(() => setD(null))
  }, [])

  const act = async (action: "check" | "update") => {
    setBusy(action)
    try {
      const r = await fetch(`${BASE}/api/node/update`, { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) })
      const b = (await r.json().catch(() => null)) as (Body & { started?: boolean }) | null
      if (action === "update" && b?.started && d) setD({ ...d, update: { state: "running", stage: "check" } })
      else if (action === "check" && b) setD(b)
    } finally {
      setBusy(null)
    }
  }

  if (!d?.fork) return null
  const u = d.update
  const stage = words.stages[u?.stage ?? ""] ?? u?.stage ?? ""
  let text: string | null = null
  let fork = false
  let canUpdate = false
  let canCheck = true
  if (u?.state === "running") {
    text = fill(words.running, { stage })
    canCheck = false
  } else if (u && (u.state === "failed" || u.state === "refused" || u.state === "interrupted")) {
    text = fill(words[u.state as "failed" | "refused" | "interrupted"], { stage, reason: u.reason ?? "" })
    canUpdate = d.nodeBehind > 0 && d.behindBy === 0
  } else if (d.behindBy > 0) {
    text = fill(words.forkBehind, { n: d.behindBy })
    fork = true
  } else if (d.nodeBehind > 0) {
    text = fill(words.nodeBehind, { n: d.nodeBehind })
    canUpdate = true
  } else if (done && !hidden) {
    text = fill(words.done, { summary: done.summary ?? "" })
    canCheck = false
  }
  if (!text) return null

  return (
    <div className="mx-4 mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-sm text-foreground" role="status" data-origin-outdated={d.behindBy} data-node-behind={d.nodeBehind} data-node-update={u?.state ?? "none"}>
      <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden />
      <span className="flex-1">{text}</span>
      {fork && d.repo && (
        <a href={d.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
          {words.openFork}
          <ExternalLink className="size-3" aria-hidden />
        </a>
      )}
      {canUpdate && (
        <button type="button" onClick={() => act("update")} disabled={busy !== null} className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground disabled:opacity-60" data-node-update-start>
          {busy === "update" ? words.starting : words.update}
        </button>
      )}
      {canCheck && (
        <button type="button" onClick={() => act("check")} disabled={busy !== null} className="inline-flex items-center gap-1 underline disabled:opacity-60" data-node-update-check>
          <RefreshCw className="size-3" aria-hidden />
          {busy === "check" ? words.checking : words.check}
        </button>
      )}
      {done && !hidden && !canCheck && (
        <button type="button" onClick={snooze} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
          {words.hide}
        </button>
      )}
    </div>
  )
}
