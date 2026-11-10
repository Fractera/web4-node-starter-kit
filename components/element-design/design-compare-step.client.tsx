"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"
import type { DesignUi } from "@/components/design/design.i18n"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import type { ElementRemoteWords } from "@/app/[lang]/(architectLayer)/_i18n/element-remote.i18n"
import { DesignCarousel } from "./design-carousel.client"
import { DesignStage } from "./design-stage.client"
import type { Card } from "./flow"
import { StepHead } from "./step-parts"
import type { ActResult } from "./types"
import type { DesignApi } from "./use-design-state.client"

// ШАГ 3 «СГЕНЕРИРОВАТЬ И СРАВНИТЬ» (узел, шаг 715-4) — точка фокуса вкладки: карусель тестовых страниц и сохранённых навыков, под ней
// выбранная крупно, её референсы и генерация, тонкая настройка и «Утвердить». Таймеров нет: ход генерации обновляет «Обновить», каждое
// действие и смена шага.
export function DesignCompareStep({ item, lang, api, cards, selected, onSelect, name, agentHref, words, remote, ui, act, approve, onBack }: {
  item: string; lang: string; api: DesignApi; cards: Card[]; selected: string | null; onSelect: (key: string) => void; name: string; agentHref: string
  words: ElementDesignWords; remote: ElementRemoteWords; ui: DesignUi; act: (p: Record<string, unknown>) => Promise<ActResult>; approve: (id: string) => void; onBack: () => void
}) {
  const state = api.state
  const card = cards.find((c) => c.key === selected) ?? null
  return (
    <section data-block="ecs01" data-design-panel="compare" className="flex flex-col gap-6">
      <StepHead title={words.compareTitle} lead={words.compareLead}>
        {state && !state.supported ? <Small data-block="ecs02">{words.template}</Small> : null}
      </StepHead>
      {state && cards.length === 0 ? (
        <div data-block="ecs03" className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border px-5 py-6">
          <Small data-block="ecs04" className="max-w-prose">{words.compareEmpty}</Small>
          <Button type="button" variant="outline" size="sm" onClick={onBack}>{words.toSkills}</Button>
        </div>
      ) : null}
      {cards.length > 0 ? (
        <div data-block="ecs05" className="flex flex-col gap-2">
          <div data-block="ecs06" className="flex justify-end">
            <Button type="button" size="sm" variant="ghost" onClick={() => void api.load()} data-design-refresh>
              <RefreshCw data-icon="inline-start" aria-hidden />
              {words.refresh}
            </Button>
          </div>
          <DesignCarousel item={item} cards={cards} selected={selected} onSelect={onSelect} words={words} />
        </div>
      ) : null}
      {state && card ? (
        <DesignStage item={item} lang={lang} card={card} state={state} base={api.base} name={name} agentHref={agentHref}
          words={words} remote={remote} ui={ui} act={act} approve={approve} />
      ) : null}
    </section>
  )
}
