"use client"

import { useMemo, useState } from "react"
import { Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DesignSaved } from "./design-saved.client"
import { DesignSearch } from "./design-search.client"
import type { Card } from "./flow"
import { StepHead, StepNext } from "./step-parts"
import type { FoundSkill } from "./types"
import type { DesignApi } from "./use-design-state.client"

// ШАГ 1 «НАВЫКИ» (узел, шаг 715-3). Владелец 2026-11-10: «прямо написать что Fractera на текущий момент имеет в своем хранилище икс
// навыков созданных сторонними разработчиками. На этой странице из всех этих навыков вы выбирайте тех которые готовы отправить в
// тестирование». Сверху — что уже сохранено для тестирования, ниже — вся библиотека. Сохранённый навык и есть кандидат на тест.
export function DesignSkillsStep({ item, lang, api, cards, words, onSee, onNext }: {
  item: string; lang: string; api: DesignApi; cards: Card[]; words: ElementDesignWords; onSee: (key: string) => void; onNext: () => void
}) {
  const [library, setLibrary] = useState<number | null>(null)
  const skills = useMemo(() => api.state?.skills ?? [], [api.state])
  const inProject = useMemo(() => new Set(skills.map((s) => s.mark)), [skills])
  const choose = async (s: FoundSkill) => {
    const r = await api.act({ action: "add-skill", skill: s })
    if (r.ok) await api.act({ action: "set-test", mark: s.mark, test: true })
  }
  return (
    <section data-block="esk01" data-design-panel="skills" className="flex flex-col gap-8">
      <StepHead title={words.libraryTitle} lead={words.libraryLead.replace("{n}", library === null ? "…" : String(library))}>
        {api.state && !api.state.supported ? <Small data-block="esk02">{words.template}</Small> : null}
      </StepHead>
      {api.state ? (
        <DesignSaved skills={skills} cards={cards} base={api.base} lang={lang} words={words} onSee={onSee}
          onRemove={(mark) => void api.act({ action: "remove-skill", mark })} />
      ) : null}
      <DesignSearch item={item} lang={lang} words={words} inProject={inProject} onAdd={(s) => void choose(s)} onLibrary={setLibrary} />
      <StepNext label={words.flow.next.brief} onNext={onNext} />
    </section>
  )
}
