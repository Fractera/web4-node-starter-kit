"use client"

import { useCallback, useEffect, useState } from "react"
import { Rocket } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { H2 } from "@/components/ui/typography"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { LiveLog } from "@/app/[lang]/(architectLayer)/_components/live-log.client"
import { CoreDeploy, type CoreDeployState, type CoreDeployWords } from "./core-deploy.client"

// ДАШБОРД РАЗВЁРТЫВАНИЙ (280-11b).
//
// 🔒 СОСТОЯНИЕ СПРАШИВАЕТСЯ В БРАУЗЕРЕ: страница предрендерена, а «что ждёт развёртывания» меняется
// каждым сохранением в редакторе «Дизайн». Пока идёт развёртывание, дверь спрашивается раз в 3 с.
//
// Слова приходят с сервера пропсами — словарь в браузер не грузится.

export type DeployBoardWords = {
  intro: string
  what: string
  loading: string
  unavailable: string
  element: string
  version: string
  built: string
  status: string
  pending: string
  upToDate: string
  noSettings: string
  notInstalled: string
  deployOne: string
  deployAll: string
  running: string
  queued: string
  lastRun: string
  ok: string
  failed: string
  core: string
  coreNote: string
  busy: string
  /** 287: «Вернуть {version}» — откат до предыдущей рабочей версии */
  rollback: string
  /** подсказка: версия взята из истории реестра, её успех не записан */
  rollbackGit: string
  /** 337-2: «правок кода: {n}» */
  codeChanges: string
  /** 555: кнопка «Развернуть» ядра и её окно */
  coreDeploy: CoreDeployWords
  /** 641-3: карточка ядра — `{n}` изменений оригинала нет в форке; ссылка на форк; идущее обновление `{stage}`; подсказка неактивной кнопки */
  forkBehind: string
  openFork: string
  nodeUpdating: string
  nothingWaiting: string
  /** 642-1: терминал под строкой — `{id}`; итог — `{id}`, `{s}` */
  deployingNow: string
  starting: string
  deployedOk: string
  deployedFailed: string
  hideLog: string
}

type Element = {
  id: string
  version: string | null
  installed: boolean
  builtAt: string | null
  takesSettings: boolean
  pending: boolean
  previous: { version: string; source: "history" | "git" } | null
  /** 337-2: состояние кода элемента по git (`lib/web4-items/element-code-state.ts`). */
  code: { head: string | null; running: string | null; changed: number; changes: string[]; pending: boolean } | null
}
type Deployment = {
  running: boolean
  current: string | null
  queue: string[]
  results: { id: string; ok: boolean; seconds: number; note: string }[]
  finishedAt: string | null
}
type State = { core: { commit: string | null; builtAt: string | null; deploy?: CoreDeployState; log?: string[] }; elements: Element[]; deployment: Deployment | null }

type Fork = { behindBy: number; nodeBehind: number; repo: string | null; update: { state: string; stage?: string } | null }

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DOOR = `${BASE}/api/node/deploy`
const when = (iso: string | null, lang: string) => (iso ? new Date(iso).toLocaleString(lang) : "—")

export function DeployBoard({ words, lang, dialogUi }: { words: DeployBoardWords; lang: string; dialogUi: AppDialogUi }) {
  const [state, setState] = useState<State | "loading" | "failed">("loading")
  const [refused, setRefused] = useState(false)
  const [fork, setFork] = useState<Fork | null>(null)

  // 641-3: отставание узла от форка — та же дверь, что у полосы обновления, один запрос без сети.
  const loadFork = useCallback(() => {
    fetch(`${BASE}/api/node/update`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: Fork | null) => setFork(b))
      .catch(() => setFork(null))
  }, [])
  useEffect(() => {
    loadFork()
  }, [loadFork])

  const load = useCallback(() => {
    fetch(DOOR, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: State) => setState(d))
      .catch(() => setState("failed"))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const running = typeof state === "object" && !!state.deployment?.running
  const current = typeof state === "object" ? state.deployment?.current ?? null : null

  // 642-1 (владелец 2026-11-04: «развёртывание проходит совершенно вслепую … терминала высотой например в 400 пикселей … с фокусировкой
  // на последнюю строчку»): пока идёт развёртывание — раз в секунду ход и хвост журнала того, что разворачивается сейчас (дверь 353-3,
  // `?progress=1&log=`, без git по каждому элементу); кончилось — полное состояние. Строки каждого элемента остаются под его строкой.
  const [logs, setLogs] = useState<Record<string, string[]>>({})
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const readLog = useCallback(async (id: string) => {
    try {
      const r = await fetch(`${DOOR}?progress=1&log=${encodeURIComponent(id)}`, { cache: "no-store" })
      if (!r.ok) return null
      const b = (await r.json()) as { deployment: Deployment | null; log?: string[] }
      if (b.log && b.log.length) setLogs((was) => ({ ...was, [id]: b.log as string[] }))
      return b.deployment
    } catch {
      return null
    }
  }, [])
  useEffect(() => {
    if (!running || !current) return
    let stop = false
    const tick = async () => {
      const d = await readLog(current)
      if (stop || !d) return
      setState((was) => (typeof was === "object" ? { ...was, deployment: d } : was))
      // Элемент сменился или работа кончилась: последние строки прежнего — одним чтением, затем полное состояние.
      if (!d.running || d.current !== current) {
        await readLog(current)
        load()
      }
    }
    void tick()
    const t = setInterval(() => void tick(), 1000)
    return () => {
      stop = true
      clearInterval(t)
    }
  }, [running, current, readLog, load])
  // Работа идёт, но элемент ещё не назван (первые секунды) — полное состояние, как до 642.
  useEffect(() => {
    if (!running || current) return
    const t = setInterval(load, 3000)
    return () => clearInterval(t)
  }, [running, current, load])

  // 641-4: идущее обновление узла — его этап спрашивается раз в 5 с, пока страница ещё отвечает.
  const forkUpdating = fork?.update?.state === "running"
  useEffect(() => {
    if (!forkUpdating) return
    const t = setInterval(loadFork, 5000)
    return () => clearInterval(t)
  }, [forkUpdating, loadFork])

  async function rollbackTo(id: string) {
    setRefused(false)
    const r = await fetch(DOOR, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rollback: id }) })
    if (r.status === 409) setRefused(true)
    setTimeout(load, 800)
  }

  async function deploy(ids: string[]) {
    setRefused(false)
    // 353-3: нажатие видно сразу — терминал открывается до ответа двери.
    setHidden((was) => new Set([...was].filter((x) => !ids.includes(x))))
    setLogs((was) => ({ ...was, ...Object.fromEntries(ids.map((x) => [x, [words.starting]])) }))
    const r = await fetch(DOOR, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) })
    if (r.status === 409) setRefused(true)
    setTimeout(load, 800)
  }

  if (state === "loading") return <p className="text-muted-foreground text-sm">{words.loading}</p>
  if (state === "failed") return <p className="text-muted-foreground text-sm">{words.unavailable}</p>

  const installed = state.elements.filter((e) => e.installed)
  // 641-3 (владелец 2026-11-04: «непонятно наличие кнопки развернуть если процессор актуален»): разворачивается только то, что ждёт.
  const waiting = installed.filter((e) => e.pending)
  const dep = state.deployment
  const forkChanges = fork && fork.behindBy === 0 ? fork.nodeBehind : 0
  const updating = fork?.update?.state === "running"

  return (
    <div className="flex flex-col gap-4" data-deploy-board>
      {/* 641-3 (владелец 2026-11-04): «самый важный раздел развернуть ядро находится почему-то внизу, его нужно как минимум поднять вверх
          но ещё и значительно выделить». */}
      <section className="flex flex-col gap-2 rounded-lg border-2 border-primary/60 bg-primary/5 px-4 py-4 text-sm" data-deploy-row="core">
        <div className="flex flex-wrap items-baseline gap-3">
          <H2 variant="ui">{words.core}</H2>
          <span className="text-muted-foreground">{words.version}: {state.core.commit ?? "—"}</span>
          <span className="text-muted-foreground">{words.built}: {when(state.core.builtAt, lang)}</span>
        </div>
        <span className="text-muted-foreground">{words.coreNote}</span>
        {fork && fork.behindBy > 0 && (
          <span className="text-foreground" data-core-fork-behind={fork.behindBy}>
            {words.forkBehind.replace("{n}", String(fork.behindBy))}{" "}
            {fork.repo && <a href={fork.repo} target="_blank" rel="noopener noreferrer" className="underline">{words.openFork}</a>}
          </span>
        )}
        {updating && <span className="text-foreground" data-core-updating>{words.nodeUpdating.replace("{stage}", fork?.update?.stage ?? "")}</span>}
        <CoreDeploy words={words.coreDeploy} dialogUi={dialogUi} last={state.core.deploy ?? null} log={state.core.log ?? []} lang={lang} disabled={running || updating} forkChanges={forkChanges} inProgress={updating} onStarted={() => { loadFork(); setTimeout(load, 800) }} />
      </section>

      <p className="text-muted-foreground text-sm">{words.intro}</p>
      <p className="text-muted-foreground text-sm">{words.what}</p>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => deploy(waiting.map((e) => e.id))} disabled={running || waiting.length === 0} title={waiting.length === 0 ? words.nothingWaiting : undefined} data-deploy-all={waiting.length}>
          {running ? <Spinner className="mr-2" /> : <Rocket className="mr-2 size-4" aria-hidden />}
          {words.deployAll}
        </Button>
        {running && dep?.current && <span className="text-sm text-foreground">{words.running.replace("{id}", dep.current)}</span>}
        {refused && <span className="text-sm text-muted-foreground">{words.busy}</span>}
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        {state.elements.map((e) => {
          const queued = running && dep?.queue.includes(e.id) && dep.current !== e.id && !dep.results.some((r) => r.id === e.id)
          const lines = logs[e.id]
          const result = dep?.results.find((r) => r.id === e.id)
          const now = running && dep?.current === e.id
          return (
            <div key={e.id} className="flex flex-col gap-3 px-4 py-3 text-sm" data-deploy-row={e.id}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="min-w-20 font-medium text-foreground">{e.id}</span>
              <span className="text-muted-foreground">{words.version}: {e.version ?? "—"}</span>
              <span className="text-muted-foreground">{words.built}: {when(e.builtAt, lang)}</span>
              {/* 337-2: ожидание — и правки кода, и новый коммит, поэтому оно проверяется раньше «настроек не получает». */}
              {!e.installed ? (
                <Badge variant="outline">{words.notInstalled}</Badge>
              ) : e.pending ? (
                <Badge variant="secondary" className="border-warning/50 bg-warning/10 text-foreground" data-pending>{words.pending}</Badge>
              ) : !e.takesSettings ? (
                <Badge variant="outline">{words.noSettings}</Badge>
              ) : (
                <Badge variant="outline">{words.upToDate}</Badge>
              )}
              {e.code && e.code.changed > 0 && (
                <span className="text-muted-foreground" data-code-changes={e.code.changed}>{words.codeChanges.replace("{n}", String(e.code.changed))}</span>
              )}
              {queued && <span className="text-muted-foreground">{words.queued}</span>}
              {running && dep?.current === e.id && <Spinner />}
              <span className="ml-auto flex flex-wrap gap-2">
                {/* 287: откат до предыдущей рабочей версии — та же команда, что с машины. */}
                {e.previous && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => rollbackTo(e.id)}
                    disabled={running}
                    title={e.previous.source === "git" ? words.rollbackGit : undefined}
                    data-deploy-rollback={e.id}
                  >
                    {words.rollback.replace("{version}", e.previous.version)}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => deploy([e.id])} disabled={running || !e.installed || !e.pending} title={e.installed && !e.pending ? words.nothingWaiting : undefined} data-deploy-one={e.pending ? "on" : "off"}>
                  {words.deployOne}
                </Button>
              </span>
            </div>
            {lines && !hidden.has(e.id) && (now || result) && (
              <div className="flex flex-col gap-2" data-deploy-log={e.id}>
                <LiveLog
                  title={result && !now ? (result.ok ? words.deployedOk : words.deployedFailed).replace("{id}", e.id).replace("{s}", String(result.seconds)) : words.deployingNow.replace("{id}", e.id)}
                  lines={lines}
                  done={!!result && !now}
                  failed={!!result && !now && !result.ok}
                />
                {result && !now && (
                  <Button variant="ghost" size="sm" className="self-start" onClick={() => setHidden((was) => new Set([...was, e.id]))}>{words.hideLog}</Button>
                )}
              </div>
            )}
            </div>
          )
        })}
      </div>

      {dep && !dep.running && dep.results.length > 0 && (
        <div className="flex flex-col gap-1 text-sm" data-deploy-last>
          <p className="font-medium text-foreground">{words.lastRun} {when(dep.finishedAt, lang)}</p>
          {dep.results.map((r) => (
            <p key={r.id} className="text-muted-foreground">
              {r.id}: {r.ok ? words.ok : words.failed} · {r.seconds} s{r.note ? ` · ${r.note}` : ""}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
