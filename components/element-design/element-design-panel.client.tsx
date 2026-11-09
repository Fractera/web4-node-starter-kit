"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { H2, H3, P, Small } from "@/components/ui/typography"
import { isLoopbackHostname } from "@/lib/auth/owner-at-machine"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DesignCandidates } from "./design-candidates.client"
import { DesignSearch } from "./design-search.client"
import { DesignTestCard } from "./design-test-card.client"
import { DOOR, type ActResult, type DesignState, type FoundSkill } from "./types"

// ВКЛАДКА «СТРОИТЕЛЬСТВО → ДИЗАЙН» ЭЛЕМЕНТА (узел, шаг 711). Владелец 2026-11-09: найти навыки дизайна живым поиском, добавить
// кандидатов к проекту, отметить несколько на тест, дать каждому свои референсы, сгенерировать тестовые страницы, закрепить победителя.
// Состояние — дверь `/api/node/element-design`; прототипы строит агент элемента, вкладка их только показывает. Таймеров нет: статус
// обновляется кнопкой «Обновить» и после каждого действия.
export function ElementDesignPanel({ item, lang, port, publicUrl, words }: { item: string; lang: string; port: number | null; publicUrl: string | null; words: ElementDesignWords }) {
  const [state, setState] = useState<DesignState | null>(null)
  const [error, setError] = useState("")
  const [base, setBase] = useState<string | null>(null)
  const load = useCallback(async () => {
    const j = await fetch(`${DOOR}?item=${encodeURIComponent(item)}`, { cache: "no-store" }).then((r) => r.json()).catch(() => null)
    if (j?.ok) { setState(j as DesignState); setError("") } else setError(String(j?.error ?? "network"))
  }, [item])
  useEffect(() => { void load() }, [load])
  useEffect(() => {
    const local = isLoopbackHostname(window.location.hostname)
    setBase((local && port ? `http://127.0.0.1:${port}` : publicUrl)?.replace(/\/+$/, "") ?? null)
  }, [port, publicUrl])
  const act = useCallback(async (payload: Record<string, unknown>): Promise<ActResult> => {
    const j = (await fetch(DOOR, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item, ...payload }) }).then((r) => r.json()).catch(() => null)) as ActResult | null
    if (j?.ok) setState(j)
    return j ?? { ok: false, error: "network" }
  }, [item])
  const inProject = useMemo(() => new Set((state?.skills ?? []).map((s) => s.mark)), [state])
  const add = (s: FoundSkill) => void act({ action: "add-skill", skill: s })
  const tests = (state?.skills ?? []).filter((s) => s.test)
  return (
    <section data-block="edm01" data-element-design className="my-6 flex flex-col gap-5">
      <div data-block="edm02" className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-4">
        <H2 data-block="edm03" variant="ui">{words.howTitle}</H2>
        <P data-block="edm04">{words.how}</P>
        <P data-block="edm05" className="text-muted-foreground">{words.gain}</P>
        <P data-block="edm06" className="text-muted-foreground">{words.collection}</P>
      </div>
      {error && <Small data-block="edm07" className="text-destructive">{words.failed} {error}</Small>}
      {state && !state.supported && <Small data-block="edm08" className="text-muted-foreground">{words.template}</Small>}
      <DesignSearch item={item} words={words} inProject={inProject} onAdd={add} />
      {state && (
        <>
          <DesignCandidates skills={state.skills} words={words} onTest={(mark, test) => void act({ action: "set-test", mark, test })} onRemove={(mark) => void act({ action: "remove-skill", mark })} />
          <section data-block="edm09" data-design-tests className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <div data-block="edm10" className="flex items-center justify-between gap-2">
              <H3 data-block="edm11">{words.testTitle}</H3>
              <Button size="sm" variant="outline" onClick={() => void load()}>{words.refresh}</Button>
            </div>
            {tests.length === 0 ? <Small data-block="edm12" className="text-muted-foreground">{words.testEmpty}</Small> : (
              <ul data-block="edm13" className="flex flex-col gap-3">
                {tests.map((s) => <DesignTestCard key={s.mark} item={item} lang={lang} skill={s} state={state} base={base} words={words} act={act} />)}
              </ul>
            )}
            {!base && <Small data-block="edm14" className="text-muted-foreground">{words.localOnly}</Small>}
          </section>
        </>
      )}
    </section>
  )
}
