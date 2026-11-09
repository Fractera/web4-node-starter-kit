"use client"

import { useMemo } from "react"
import { Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DesignCandidates } from "./design-candidates.client"
import { DesignSearch } from "./design-search.client"
import { StepHead, StepNext } from "./step-parts"
import type { DesignApi } from "./use-design-state.client"

// ШАГ 2 «НАВЫКИ» (узел, шаг 713-2): сверху то, что уже выбрано («В проекте», с «На тест»), ниже — поиск, откуда выбирают. Порядок
// «сначала своё» держит фокус на решении, а не на каталоге.
export function DesignSkillsStep({ item, lang, api, words, onNext }: { item: string; lang: string; api: DesignApi; words: ElementDesignWords; onNext: () => void }) {
  const skills = useMemo(() => api.state?.skills ?? [], [api.state])
  const inProject = useMemo(() => new Set(skills.map((s) => s.mark)), [skills])
  return (
    <section data-block="esk01" data-design-panel="skills" className="flex flex-col gap-8">
      <StepHead title={words.skillsTitle} lead={words.skillsLead}>
        {api.state && !api.state.supported ? <Small data-block="esk02">{words.template}</Small> : null}
      </StepHead>
      {api.state ? (
        <DesignCandidates skills={skills} words={words}
          onTest={(mark, test) => void api.act({ action: "set-test", mark, test })}
          onRemove={(mark) => void api.act({ action: "remove-skill", mark })} />
      ) : null}
      <DesignSearch item={item} lang={lang} words={words} inProject={inProject} onAdd={(s) => void api.act({ action: "add-skill", skill: s })} />
      <StepNext label={words.flow.next.trials} onNext={onNext} />
    </section>
  )
}
