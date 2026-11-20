"use client"

import { useEffect, useState } from "react"
import { CircleCheck, ExternalLink, RefreshCw, TriangleAlert } from "lucide-react"
import type { OriginNoticeWords } from "./origin-notice.i18n"
import { useSnooze } from "./snooze"
import { bannerView } from "@/lib/deploy/update-banner.mjs"
import { OpenOnThisComputerButton } from "./open-on-this-computer.client"
import { isTemporaryHostname } from "@/components/shell/temporary-host"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// ПОЛОСА «ВЕРСИЯ УСТАРЕЛА» НАД СЛОЕМ АРХИТЕКТОРА (шаги 368, 632-4). Слово владельца 2026-10-01: «никакой запрет представить не будем,
// но … будем выводить уведомления что … ваша версия уже устарела … или продолжите». Владелец 2026-11-03: «синхронизацию я уже
// выполнил наверно было бы логично здесь поставить вторую кнопку запустить развёртывание? И убрать кнопку открыть Fork?»
// ✗ До 632 полоса читала только отметку `check-origin` (пишется при сборке): после «Sync fork» она по-прежнему звала в форк, где
// синхронизировать было уже нечего, а узел сам ничего не забирает.
// Два отставания: форка от оригинала и узла от форка; «Проверить снова» спрашивает GitHub и забирает форк — сеть только по кнопке.
// Источник — дверь `/api/node/update`, один запрос при открытии, таймеров нет.
// 641-2 (владелец 2026-11-04): «кроме кнопки скрыть должно быть кнопка синхронизировать … если уже синхронизировано но не обновлено этот
// баннер должен получить кнопку обновить сборку ядра. Эта кнопка не активна до сих пор синхронизации не прошла … должна отправлять на
// вкладку развёртывание». В каждом состоянии: «Синхронизировать форк» — форк человека на GitHub; «Обновить сборку ядра» — вкладка
// «Развёртывание» (там карточка ядра запускает обновление из форка), активна только когда форк синхронизирован и узел от него отстаёт.
// 641-5 (владелец 2026-11-04: «я уже дважды все синхронизировал Fork … сейчас как будто ты откатил его назад»): ✗ в состоянии «Узел
// обновлён» 641-2 дал «Синхронизировать форк», но не «Проверить снова» — человек синхронизировал форк на GitHub, а сказать узлу
// «посмотри ещё раз» было нечем, и полоса стояла на отметке прошлой проверки. Теперь «Проверить снова» — в каждом состоянии, кроме
// идущего обновления: одно нажатие возвращает полосу к «Форк синхронизирован: N изменений» с активной «Обновить сборку ядра».
// 646 (владелец 2026-11-04, по временному адресу: «если я нажимаю проверить снова … этот баннер просто исчезает как будто нажимаю кнопку
// скрыть»): ✗ дверь на временном адресе отказывает (403 `temporary-address`, `proxy.ts`), а полоса брала тело отказа за состояние —
// без `fork` она гасла. Теперь отказ состояние не трогает и назван словами; на временном адресе вместо «Проверить снова» —
// «Открыть на этом компьютере»: проверка и обновление идут только там.
// 651-1 (владелец 2026-11-05: «отсутствует баннер который показывает информацию о том что проект отстает. Он всегда существовал в нём
// было три кнопки … куда он исчез и почему?»): ✗ когда по отметке ничего не отстаёт и записи обновления нет (свежая установка), полоса
// возвращала `null` — и вместе с ней пропадала «Проверить снова», единственный способ спросить GitHub. Форк ушёл вперёд на 2 коммита,
// а сказать узлу было нечем. Теперь это состояние — тихая строка «совпадает на <время отметки>» с теми же кнопками; «Скрыть» — на сутки.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Update = { state: string; stage?: string; summary?: string; reason?: string; changes?: number; startedAt?: string; finishedAt?: string }
type Body = { fork: boolean; behindBy: number; nodeBehind: number; repo: string | null; update: Update | null; checkedAt?: string | null }
// 743-4: the trial merge of the update — asked once, when the node is behind its synced fork, before anyone presses.
type Preflight = { ok: boolean; conflicts?: string[]; reason?: string } | "checking" | "unknown" | null

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""))

export function OriginNotice({ words, lang }: { words: OriginNoticeWords; lang: string }) {
  const [d, setD] = useState<Body | null>(null)
  const [busy, setBusy] = useState<"check" | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  const [onTemporary, setOnTemporary] = useState(false)
  const [preflight, setPreflight] = useState<Preflight>(null)
  const done = d?.update?.state === "done" && (d.update.changes ?? 0) > 0 ? d.update : null
  const { hidden, snooze } = useSnooze(`node-update-done-${done?.finishedAt ?? ""}`)
  const evenSnooze = useSnooze(`node-even-${d?.checkedAt ?? ""}`)

  // 815-3: «Обновить сборку ядра» starts the update here, in one press; `starting` from the press until the node says «running».
  const [starting, setStarting] = useState(false)
  const [startRefused, setStartRefused] = useState<string | null>(null)
  // 815-4: the state is asked again only while an update starts or runs; a failed read keeps what was shown (the core builds and is
  // silent — the banner must not vanish then).
  const load = (keep: boolean) =>
    fetch(`${BASE}/api/node/update`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: Body | null) => { if (b || !keep) setD(b) })
      .catch(() => { if (!keep) setD(null) })
  useEffect(() => {
    setOnTemporary(isTemporaryHostname(window.location.hostname))
    void load(false)
  }, [])
  const runningNow = d?.update?.state === "running"
  useEffect(() => {
    if (!runningNow && !starting) return
    const t = setInterval(() => void load(true), starting ? 2000 : 5000)
    return () => clearInterval(t)
  }, [runningNow, starting])
  useEffect(() => {
    if (!starting) return
    if (runningNow) { setStarting(false); return }
    const t = setTimeout(() => { setStarting(false); setStartRefused(words.startSilent) }, 45_000)
    return () => clearTimeout(t)
  }, [starting, runningNow, words.startSilent])
  const start = async () => {
    setStarting(true)
    setStartRefused(null)
    const r = await fetch(`${BASE}/api/node/update`, { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update" }) }).catch(() => null)
    const b = r ? ((await r.json().catch(() => null)) as { error?: string; reason?: string } | null) : null
    if (r?.ok) { void load(true); return }
    setStarting(false)
    setStartRefused(b?.reason ?? b?.error ?? (r ? `HTTP ${r.status}` : words.startSilent))
  }

  const askPreflight = !onTemporary && d?.fork === true && d.behindBy === 0 && d.nodeBehind > 0 && d.update?.state !== "running"
  useEffect(() => {
    if (!askPreflight || preflight !== null) return
    setPreflight("checking")
    fetch(`${BASE}/api/node/update`, { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "preflight" }) })
      .then((r) => r.json())
      .then((b: { ok?: boolean; preflight?: { ok: boolean; conflicts?: string[]; reason?: string } }) => setPreflight(b?.ok && b.preflight ? b.preflight : "unknown"))
      .catch(() => setPreflight("unknown"))
  }, [askPreflight, preflight])

  const check = async () => {
    setBusy("check")
    try {
      const r = await fetch(`${BASE}/api/node/update`, { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "check" }) })
      const b = (await r.json().catch(() => null)) as (Body & { reason?: string }) | null
      if (r.ok && b?.fork !== undefined) { setD(b); setRefused(null) }
      else setRefused(b?.reason ?? `HTTP ${r.status}`)
    } finally {
      setBusy(null)
    }
  }

  // 815-7: what is shown is decided by one pure function, proven state by state (`scripts/update-banner.test.mjs`)
  const view = bannerView(d, { starting, doneHidden: !done || hidden, evenHidden: evenSnooze.hidden })
  if (!d || !view) return null
  const u = d.update
  const stage = words.stages[u?.stage ?? ""] ?? u?.stage ?? ""
  const running = view.kind === "running"
  const even = view.kind === "even"
  const forkBehind = d.behindBy > 0
  const canCheck = view.check
  const min = running && u?.startedAt ? Math.max(0, Math.round((Date.now() - new Date(u.startedAt).getTime()) / 60000)) : null
  const text =
    running ? fill(words.running, { stage }) + (min !== null ? ` · ${fill(words.minutes, { min })}` : "")
    : view.kind === "failed" || view.kind === "refused" || view.kind === "interrupted" ? fill(words[view.kind], { stage, reason: u?.reason ?? "" })
    : view.kind === "forkBehind" ? fill(words.forkBehind, { n: d.behindBy })
    : view.kind === "nodeBehind" ? fill(words.nodeBehind, { n: d.nodeBehind })
    : view.kind === "done" ? fill(words.done, { summary: done?.summary ?? "" })
    : d.checkedAt ? fill(words.even, { date: new Date(d.checkedAt).toLocaleString(lang) }) : words.evenNever

  return (
    <div className={even ? "mx-4 mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground" : "mx-4 mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-sm text-foreground"} role="status" data-origin-outdated={d.behindBy} data-node-behind={d.nodeBehind} data-node-update={u?.state ?? "none"} data-origin-even={even ? "true" : undefined}>
      {even ? <CircleCheck className="size-4 shrink-0 text-primary" aria-hidden /> : <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden />}
      <span className="flex-1">
        {text}
        {askPreflight && preflight !== null ? (
          <span className={typeof preflight === "object" && !preflight.ok ? "block text-destructive" : "block text-muted-foreground"} data-node-update-preflight={typeof preflight === "object" ? (preflight.ok ? "ok" : "stop") : preflight}>
            {preflight === "checking" ? words.preflightChecking : preflight === "unknown" ? words.preflightUnknown : preflight.ok ? words.preflightOk : (preflight.conflicts?.length ? fill(words.preflightStop, { files: preflight.conflicts.join(", ") }) : fill(words.preflightRefused, { reason: preflight.reason ?? words.preflightUnknown }))}
          </span>
        ) : null}
        {startRefused ? <span className="block text-destructive" data-node-update-refused>{fill(words.startRefused, { reason: startRefused })}</span> : null}
        {onTemporary ? <span className="block text-muted-foreground">{words.checkHere}</span> : refused ? <span className="block text-destructive">{fill(words.checkRefused, { reason: refused })}</span> : null}
      </span>
      {/* 815-5: the fork is synced — nothing to sync; the button stays only while the fork is behind, or at rest («even») */}
      {d.repo && view.sync && (
        <a href={d.repo} target="_blank" rel="noopener noreferrer" className={forkBehind ? "inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground" : "inline-flex items-center gap-1 underline"} data-node-update-sync>
          {words.sync}
          <ExternalLink className="size-3" aria-hidden />
        </a>
      )}
      {view.rebuild !== "none" && (view.rebuild !== "off" ? (
        <Button type="button" size="sm" onClick={() => void start()} disabled={starting || preflight === "checking"} data-node-update-rebuild={starting ? "starting" : "on"}>
          {starting || preflight === "checking" ? <Spinner data-icon="inline-start" aria-hidden /> : null}
          {starting ? words.starting : words.rebuild}
        </Button>
      ) : (
        // A disabled button fires no pointer events — the hint hangs on a focusable wrapper.
        <TooltipProvider><Tooltip><TooltipTrigger asChild><span className="inline-flex" tabIndex={0}>
          <Button type="button" variant="outline" disabled data-node-update-rebuild="off">
            {words.rebuild}
          </Button>
        </span></TooltipTrigger><TooltipContent className="max-w-xs">{forkBehind ? words.rebuildWaitSync : words.rebuildNothing}</TooltipContent></Tooltip></TooltipProvider>
      ))}
      {onTemporary && <OpenOnThisComputerButton open={words.openHere} />}
      {canCheck && !onTemporary && (
        <Button type="button" variant="link" size="sm" onClick={() => void check()} disabled={busy !== null} className="h-auto px-0 text-foreground underline" data-node-update-check>
          <RefreshCw data-icon="inline-start" aria-hidden />
          {busy === "check" ? words.checking : words.check}
        </Button>
      )}
      {(even || (done && !hidden && !forkBehind && d.nodeBehind === 0)) && (
        <Button type="button" variant="link" size="xs" onClick={even ? evenSnooze.snooze : snooze} className="h-auto px-0 text-muted-foreground underline hover:text-foreground">
          {words.hide}
        </Button>
      )}
    </div>
  )
}
