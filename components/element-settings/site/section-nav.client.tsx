"use client"

import { Fragment } from "react"
import { Separator } from "@/components/ui/separator"

// СПИСОК РАЗДЕЛОВ «НАСТРОЕК САЙТА» (узел, шаг 713-3), как у хороших приложений настроек: слева столбцом от ширины `lg`, на телефоне —
// полосой над разделом, которая прокручивается вбок. Столбец отмечает раздел заливкой (как верхние пункты левого меню слоя), полоса —
// нижней линией (стандарт вкладок владельца 2026-09-01). Раздел за чертой — «Сеть Web4»: он про узел, а не про сайт.
export function SectionNav<T extends string>({ sections, current, onPick, label, names, apart }: {
  sections: readonly T[]; current: T; onPick: (s: T) => void; label: string; names: Record<T, string>; apart?: T
}) {
  return (
    <nav data-block="esn01" aria-label={label} className="slim-scrollbar overflow-x-auto lg:sticky lg:top-28 lg:self-start lg:overflow-visible">
      <ul data-block="esn02" className="flex w-max min-w-full border-b border-border lg:w-auto lg:flex-col lg:gap-0.5 lg:border-b-0">
        {sections.map((s) => {
          const on = s === current
          return (
            <Fragment key={s}>
              {s === apart ? <li data-block="esn03" aria-hidden className="hidden lg:block lg:px-3 lg:py-2"><Separator /></li> : null}
              <li data-block="esn04" className="flex">
                <button
                  type="button"
                  onClick={() => onPick(s)}
                  aria-current={on ? "page" : undefined}
                  data-site-section={s}
                  className={`-mb-px w-full whitespace-nowrap border-b-2 px-3 py-2 text-left text-[length:var(--fs-small)] transition-colors lg:mb-0 lg:rounded-md lg:border-b-0 ${
                    on ? "border-primary font-medium text-foreground lg:bg-muted" : "border-transparent text-muted-foreground hover:text-foreground lg:hover:bg-muted/60"
                  }`}
                >
                  {names[s]}
                </button>
              </li>
            </Fragment>
          )
        })}
      </ul>
    </nav>
  )
}
