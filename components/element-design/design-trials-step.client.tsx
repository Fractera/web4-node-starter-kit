"use client"

import { Fragment } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DesignTestCard } from "./design-test-card.client"
import { StepHead, StepNext } from "./step-parts"
import type { DesignApi } from "./use-design-state.client"

// ШАГ 3 «ПРОБЫ» (узел, шаг 713-2): для каждого навыка на тесте — референсы, цена и «Сгенерировать», его пробы строками. Таймеров нет:
// ход проб обновляет кнопка «Обновить» (и каждое действие). Нет навыков на тесте — одна строка и путь назад, к «Навыкам».
export function DesignTrialsStep({ item, lang, api, words, time, act, onBack, onNext }: {
  item: string; lang: string; api: DesignApi; words: ElementDesignWords; time: (iso?: string) => string
  act: DesignApi["act"]; onBack: () => void; onNext: () => void
}) {
  const state = api.state
  const tests = (state?.skills ?? []).filter((s) => s.test)
  return (
    <section data-block="etr01" data-design-panel="trials" className="flex flex-col gap-8">
      <StepHead title={words.testTitle} lead={words.testLead}>
        <div data-block="etr02" className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="button" size="sm" variant="ghost" onClick={() => void api.load()} data-design-refresh>
            <RefreshCw data-icon="inline-start" aria-hidden />
            {words.refresh}
          </Button>
          {state && !state.supported ? <Small data-block="etr03">{words.template}</Small> : null}
          {!api.base ? <Small data-block="etr04">{words.localOnly}</Small> : null}
        </div>
      </StepHead>
      {state && tests.length === 0 ? (
        <div data-block="etr05" className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border px-5 py-6">
          <Small data-block="etr06" className="max-w-prose">{words.testEmpty}</Small>
          <Button type="button" variant="outline" size="sm" onClick={onBack}>{words.toSkills}</Button>
        </div>
      ) : null}
      {state ? tests.map((s, i) => (
        <Fragment key={s.mark}>
          {i > 0 ? <Separator /> : null}
          <DesignTestCard item={item} lang={lang} skill={s} state={state} base={api.base} words={words} act={act} time={time} />
        </Fragment>
      )) : null}
      <StepNext label={words.flow.next.pin} onNext={onNext} />
    </section>
  )
}
