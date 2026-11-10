"use client"

import { Check } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { STEPS, type StepId } from "./flow"
import { SMALL } from "./step-parts"

// ПУТЬ ШАГОВ ВКЛАДКИ «ДИЗАЙН» (узел, шаг 715-2): «1 Навыки · 2 Бриф (по желанию) · 3 Сгенерировать и сравнить». Владелец 2026-11-10:
// «Статус нужно скрыть и показывает только при наведении на кнопку чтобы он всплывал сверху. Само верхнее меню должно быть липким и
// никогда не уходить за верхний край экрана». Состояние — подсказка сверху (и при фокусе с клавиатуры); сделанный шаг виден по галочке.
// Липкость — та же высота прилипания, что у вкладок слоя (`wsx-sticky`, под шапкой сайта), с фоном карточки: текст под ней не просвечивает.
// Текущий шаг — нижняя линия (стандарт вкладок владельца 2026-09-01).
export function DesignTrack({ current, lines, done, onPick, words }: {
  current: StepId | null; lines: Record<StepId, string>; done: Record<StepId, boolean>; onPick: (s: StepId) => void; words: ElementDesignWords
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <nav data-block="edk01" aria-label={words.flow.label} className="wsx-sticky sticky z-30 -mx-1 bg-card px-1 pt-2">
        <ol data-block="edk02" className="slim-scrollbar flex overflow-x-auto border-b border-border">
          {STEPS.map((id, i) => {
            const on = id === current
            return (
              <li key={id} data-block="edk03" className="flex shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onPick(id)}
                      aria-current={on ? "step" : undefined}
                      data-design-step={id}
                      data-done={done[id] ? "yes" : "no"}
                      className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 font-medium transition-colors ${SMALL} ${
                        on ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      <span
                        data-block="edk04"
                        aria-hidden
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[length:var(--fs-eyebrow)] ${
                          done[id] ? "border-primary bg-primary text-primary-foreground" : on ? "border-primary text-primary" : "border-border text-muted-foreground"
                        }`}
                      >
                        {done[id] ? <Check className="size-3" /> : i + 1}
                      </span>
                      {words.flow.steps[id]}
                      {id === "brief" ? <span data-block="edk05" className="font-normal text-muted-foreground">({words.flow.optional})</span> : null}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={6}>{lines[id]}</TooltipContent>
                </Tooltip>
              </li>
            )
          })}
        </ol>
      </nav>
    </TooltipProvider>
  )
}
