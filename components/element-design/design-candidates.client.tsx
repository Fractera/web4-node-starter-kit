"use client"

import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { H4, Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import type { ProjectSkill } from "./types"
import { SMALL } from "./step-parts"

// НАВЫКИ В ПРОЕКТЕ (711-2, вид 713-2): кандидаты элемента из поиска — строками одного списка; «На тест» делает навык кандидатом на
// пробную страницу, крестик убирает его из проекта.
export function DesignCandidates({ skills, words, onTest, onRemove }: { skills: ProjectSkill[]; words: ElementDesignWords; onTest: (mark: string, test: boolean) => void; onRemove: (mark: string) => void }) {
  return (
    <section data-block="edc01" data-design-project className="flex flex-col gap-3">
      <H4 data-block="edc02" variant="ui">{words.projectTitle}</H4>
      {skills.length === 0 ? <Small data-block="edc03">{words.projectEmpty}</Small> : (
        <ul data-block="edc04" className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {skills.map((s) => (
            <li data-block="edc05" key={s.mark} data-project-skill={s.mark} data-test={s.test} className="flex items-center justify-between gap-4 px-4 py-3">
              <div data-block="edc06" className="flex min-w-0 flex-col gap-0.5">
                <span data-block="edc07" className={`truncate font-medium text-foreground ${SMALL}`}>{s.name}</span>
                <span data-block="edc08" className={`truncate text-muted-foreground ${SMALL}`}>{words.groups[s.origin]}{s.source ? ` · ${s.source}` : ""}</span>
              </div>
              <div data-block="edc09" className="flex shrink-0 items-center gap-1">
                <Button size="sm" variant={s.test ? "default" : "outline"} onClick={() => onTest(s.mark, !s.test)} aria-pressed={s.test} data-design-test>
                  {s.test ? <Check data-icon="inline-start" aria-hidden /> : null}
                  {s.test ? words.inTest : words.toTest}
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={() => onRemove(s.mark)} aria-label={`${words.remove}: ${s.name}`} title={words.remove} data-design-remove>
                  <X aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
