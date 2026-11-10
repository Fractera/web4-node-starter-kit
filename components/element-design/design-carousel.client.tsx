"use client"

import { useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DesignStatus } from "./design-status"
import type { Card } from "./flow"
import { shotUrl } from "./types"
import { SMALL } from "./step-parts"

// КАРУСЕЛЬ «СГЕНЕРИРОВАТЬ И СРАВНИТЬ» (узел, шаг 715-4). Владелец 2026-11-10: «вверху была карусель из тех дизайнов которые мы уже
// создали и нажимаю на эту карусель внизу появлялась бы та самая большая картинка»; «до момента генерации в карточке просто написан
// название выбранного навыка и красная плашка не сгенерировано». Ряд прокручивается вбок; выбранная карточка — в рамке цвета бренда и
// сама встаёт в поле зрения. Картинка — снимок компьютера готовой страницы; у несгенерированной — только имя навыка.
export function DesignCarousel({ item, cards, selected, onSelect, words }: {
  item: string; cards: Card[]; selected: string | null; onSelect: (key: string) => void; words: ElementDesignWords
}) {
  const row = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const box = row.current
    const on = box?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!box || !on) return
    const left = on.getBoundingClientRect().left - box.getBoundingClientRect().left + box.scrollLeft
    if (left < box.scrollLeft || left + on.offsetWidth > box.scrollLeft + box.clientWidth) box.scrollTo({ left: left - 8, behavior: "smooth" })
  }, [selected])
  return (
    <ul ref={row} data-block="edr01" data-design-carousel className="slim-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-3 pt-1">
      {cards.map((c) => {
        const on = c.key === selected
        const shot = c.proto?.shots.desktop ? shotUrl(item, c.proto.id, "desktop") : null
        return (
          <li key={c.key} data-block="edr02" className="w-44 shrink-0 snap-start sm:w-52">
            <button
              type="button"
              onClick={() => onSelect(c.key)}
              aria-current={on ? "true" : undefined}
              data-design-card={c.key}
              data-state={c.state}
              className={`flex w-full flex-col overflow-hidden rounded-lg border bg-card text-left transition-colors ${
                on ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-muted-foreground/40"
              } ${c.state === "archived" ? "opacity-70" : ""}`}
            >
              {shot ? (
                <img src={shot} alt="" loading="lazy" className="aspect-[16/10] w-full border-b border-border bg-muted object-cover object-top" />
              ) : c.state === "building" ? (
                <Skeleton data-block="edr03" className="aspect-[16/10] w-full rounded-none border-b border-border" />
              ) : (
                <span data-block="edr04" className={`flex aspect-[16/10] w-full items-center justify-center border-b border-border bg-muted px-3 text-center font-medium text-muted-foreground ${SMALL}`}>
                  {c.name}
                </span>
              )}
              <span data-block="edr05" className="flex flex-col items-start gap-1.5 px-3 py-2.5">
                <span data-block="edr06" className={`w-full truncate font-medium text-foreground ${SMALL}`}>{c.name}</span>
                <DesignStatus state={c.state} words={words} />
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
