"use client"

import { useState } from "react"
import { ExternalLink, Hammer } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DOOR, type Prototype } from "./types"

// «ОТКРЫТЬ» И «СОБРАТЬ ЭЛЕМЕНТ» У ПРОБНОЙ СТРАНИЦЫ (711-6, 711-8, вид 713-2) — одни и те же в строке шага «Пробы» и в галерее
// «Закрепления». Ссылка — на сам элемент (адрес выбирает браузер, `use-design-state`); секции пробы — код, поэтому ссылка показывает её
// после сборки элемента, и кнопка сборки стоит рядом со ссылкой.

export const shotUrl = (item: string, id: string, size: "desktop" | "mobile") =>
  `${DOOR}?item=${encodeURIComponent(item)}&shot=${encodeURIComponent(id)}&size=${size}`

export const prototypeHref = (base: string | null, lang: string, p: Prototype) => (base && !p.archived ? `${base}/${lang}/prototypes/${p.id}` : null)

export function PrototypeActions({ href, onBuild, words, children }: {
  href: string | null; onBuild?: () => Promise<boolean>; words: ElementDesignWords; children?: React.ReactNode
}) {
  const [building, setBuilding] = useState(false)
  return (
    <div data-block="epa01" className="flex flex-col gap-1.5">
      <div data-block="epa02" className="flex flex-wrap items-center gap-2">
        {children}
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "sm", variant: "outline" })} data-prototype-open>
            <ExternalLink data-icon="inline-start" aria-hidden />
            {words.open}
          </a>
        ) : null}
        {onBuild ? (
          <Button size="sm" variant="ghost" disabled={building} onClick={async () => setBuilding(await onBuild())} title={words.buildHint} data-prototype-build>
            <Hammer data-icon="inline-start" aria-hidden />
            {words.build}
          </Button>
        ) : null}
      </div>
      {building ? <Small data-block="epa03">{words.building}</Small> : null}
    </div>
  )
}
