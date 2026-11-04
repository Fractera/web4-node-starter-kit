"use client"

import { useCallback, useEffect, useState } from "react"
import { Rocket } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { H2 } from "@/components/ui/typography"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
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
  useEffect(() => {
    fetch(`${BASE}/api/node/update`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: Fork | null) => setFork(b))
      .catch(() => setFork(null))
  }, [])

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
  useEffect(() => {
    if (!running) return
    const t = setInterval(load, 3000)
    return () => clearInterval(t)
  }, [running, load])

  async function rollbackTo(id: string) {
    setRefused(false)
    const r = await fetch(DOOR, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rollback: id }) })
    if (r.status === 409) setRefused(true)
    setTimeout(load, 800)
  }

  async function deploy(ids: string[]) {
    setRefused(false)
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
        <CoreDeploy words={words.coreDeploy} dialogUi={dialogUi} last={state.core.deploy ?? null} log={state.core.log ?? []} lang={lang} disabled={running || updating} forkChanges={forkChanges} />
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
          return (
            <div key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm" data-deploy-row={e.id}>
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
