"use client"

import { Button } from "@/components/ui/button"
import { H3, Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import type { ProjectSkill } from "./types"

// НАВЫКИ ПРОЕКТА (711-2): кандидаты элемента из поиска; «На тест» делает навык кандидатом на тестовую страницу.
export function DesignCandidates({ skills, words, onTest, onRemove }: { skills: ProjectSkill[]; words: ElementDesignWords; onTest: (mark: string, test: boolean) => void; onRemove: (mark: string) => void }) {
  return (
    <section data-block="edc01" data-design-project className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <H3 data-block="edc02">{words.projectTitle}</H3>
      {skills.length === 0 ? <Small data-block="edc03" className="text-muted-foreground">{words.projectEmpty}</Small> : (
        <ul data-block="edc04" className="flex flex-col gap-2">
          {skills.map((s) => (
            <li data-block="edc05" key={s.mark} data-project-skill={s.mark} data-test={s.test} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
              <span data-block="edc06" className="text-sm text-foreground">{s.name}<span className="text-muted-foreground"> · {words.groups[s.origin]}{s.source ? ` · ${s.source}` : ""}</span></span>
              <span data-block="edc07" className="flex gap-2">
                <Button size="sm" variant={s.test ? "default" : "outline"} onClick={() => onTest(s.mark, !s.test)} aria-pressed={s.test} data-design-test>{s.test ? words.inTest : words.toTest}</Button>
                <Button size="sm" variant="ghost" onClick={() => onRemove(s.mark)} data-design-remove>{words.remove}</Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
