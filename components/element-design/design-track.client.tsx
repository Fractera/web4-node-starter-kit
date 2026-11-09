"use client"

import { useEffect, useRef } from "react"
import { Check, SlidersHorizontal } from "lucide-react"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { STEPS, type StepId } from "./flow"
import { SMALL } from "./step-parts"

// ПУТЬ ШАГОВ НАД ВКЛАДКОЙ «ДИЗАЙН» (узел, шаг 713-1): «1 Бриф · 2 Навыки · 3 Пробы · 4 Закрепление» и «Тонкая настройка» по желанию,
// у каждого — состояние словами. Отметка текущего — нижняя линия, как у вкладок слоя (стандарт владельца 2026-09-01: «нижнее
// подчёркивание», не обведённая таблетка). На телефоне ряд прокручивается вбок, и текущий шаг сам встаёт в поле зрения.
export function DesignTrack({ current, lines, done, onPick, words }: {
  current: StepId | null; lines: Record<StepId, string>; done: Record<StepId, boolean>; onPick: (s: StepId) => void; words: ElementDesignWords
}) {
  const list = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const on = list.current?.querySelector<HTMLElement>('[aria-current="step"]')
    const box = list.current?.parentElement
    if (!on || !box || box.scrollWidth <= box.clientWidth) return
    const left = on.getBoundingClientRect().left - box.getBoundingClientRect().left + box.scrollLeft - 8
    box.scrollTo({ left, behavior: "smooth" })
  }, [current])
  return (
    <nav data-block="edk01" aria-label={words.flow.label} className="slim-scrollbar -mx-1 overflow-x-auto px-1">
      <ol ref={list} data-block="edk02" className="flex w-max min-w-full border-b border-border">
        {STEPS.map((id, i) => {
          const on = id === current
          const fine = id === "fine"
          return (
            <li key={id} data-block="edk03" className={fine ? "ml-auto flex pl-6" : "flex"}>
              <button
                type="button"
                onClick={() => onPick(id)}
                aria-current={on ? "step" : undefined}
                data-design-step={id}
                data-done={done[id] ? "yes" : "no"}
                className={`-mb-px flex flex-col items-start gap-1 border-b-2 px-3 pb-3 pt-1 text-left transition-colors ${on ? "border-primary" : "border-transparent hover:border-border"}`}
              >
                <span data-block="edk04" className={`flex items-center gap-2 font-medium ${SMALL} ${on ? "text-foreground" : "text-muted-foreground"}`}>
                  <span
                    data-block="edk05"
                    aria-hidden
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[length:var(--fs-eyebrow)] ${
                      done[id] ? "border-primary bg-primary text-primary-foreground" : on ? "border-primary text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    {done[id] ? <Check className="size-3" /> : fine ? <SlidersHorizontal className="size-3" /> : i + 1}
                  </span>
                  {words.flow.steps[id]}
                </span>
                <span data-block="edk06" className={`whitespace-nowrap pl-7 text-muted-foreground ${SMALL}`}>{lines[id]}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
