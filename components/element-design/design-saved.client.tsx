"use client"

import { Eye, Github, X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { H4, Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DesignStatus } from "./design-status"
import type { Card, CardState } from "./flow"
import { prototypeHref, type ProjectSkill } from "./types"
import { SMALL } from "./step-parts"

// «НАВЫКИ, КОТОРЫЕ ВЫ СОХРАНИЛИ ДЛЯ ТЕСТИРОВАНИЯ В ЭТОМ ПРОЕКТЕ» (узел, шаг 715-3). Владелец 2026-11-10: «В проекте … назвать навыки
// которые вы сохранили для тестирования … кнопок на тесте и на тест это полное тарабарщина … обязательно поставить иконку на страницу где
// человек сможет всё это увидеть своими глазами». У строки — состояние словами (плашка), репозиторий на GitHub, глаз — к тестовой
// странице (готова — вся страница на элементе, нет — карточка навыка в «Сгенерировать и сравнить») и «Убрать из тестирования».
const RANK: CardState[] = ["approved", "ready", "building", "none"]

export function DesignSaved({ skills, cards, base, lang, words, onSee, onRemove }: {
  skills: ProjectSkill[]; cards: Card[]; base: string | null; lang: string; words: ElementDesignWords
  onSee: (key: string) => void; onRemove: (mark: string) => void
}) {
  return (
    <section data-block="esv01" data-design-saved className="flex flex-col gap-3">
      <H4 data-block="esv02" variant="ui">{words.savedTitle}</H4>
      {skills.length === 0 ? <Small data-block="esv03">{words.savedEmpty}</Small> : (
        <ul data-block="esv04" className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {skills.map((s) => {
            const mine = cards.filter((c) => c.skill?.mark === s.mark && c.state !== "archived")
            const best = RANK.map((r) => mine.find((c) => c.state === r)).find(Boolean)
            const href = best?.proto && (best.state === "ready" || best.state === "approved") ? prototypeHref(base, lang, best.proto.id) : null
            return (
              <li data-block="esv05" key={s.mark} data-saved-skill={s.mark} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
                <div data-block="esv06" className="flex min-w-0 flex-col gap-0.5">
                  <span data-block="esv07" className={`truncate font-medium text-foreground ${SMALL}`}>{s.name}</span>
                  <span data-block="esv08" className={`truncate text-muted-foreground ${SMALL}`}>{s.source ?? words.groups[s.origin]}</span>
                </div>
                <div data-block="esv09" className="flex shrink-0 items-center gap-1">
                  <DesignStatus state={best?.state ?? "none"} words={words} />
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${words.see}: ${s.name}`} title={words.see}
                      className={buttonVariants({ size: "icon-sm", variant: "ghost" })} data-design-see>
                      <Eye aria-hidden />
                    </a>
                  ) : (
                    <Button size="icon-sm" variant="ghost" aria-label={`${words.toCompare}: ${s.name}`} title={words.toCompare} onClick={() => onSee(best?.key ?? s.mark)} data-design-see>
                      <Eye aria-hidden />
                    </Button>
                  )}
                  {s.github ? (
                    <a href={s.github} target="_blank" rel="noopener noreferrer" aria-label={`${words.github}: ${s.name}`} title={words.github}
                      className={buttonVariants({ size: "icon-sm", variant: "ghost" })} data-design-github>
                      <Github aria-hidden />
                    </a>
                  ) : null}
                  <Button size="icon-sm" variant="ghost" onClick={() => onRemove(s.mark)} aria-label={`${words.remove}: ${s.name}`} title={words.remove} data-design-remove>
                    <X aria-hidden />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
