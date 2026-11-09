"use client"

import { Pin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { PrototypeActions, prototypeHref, shotUrl } from "./design-prototype-actions.client"
import type { Prototype } from "./types"
import { SMALL } from "./step-parts"

// ПРОБА КРУПНО — ДЛЯ СРАВНЕНИЯ И ЗАКРЕПЛЕНИЯ (узел, шаг 713-2): снимок компьютера во всю ширину и снимок телефона поверх его угла, как
// пара устройств; под ними — имя, навык, время и «Открыть / Собрать / Закрепить». Глубина — только линии: телефон отделён кольцом цвета
// страницы, без тени.
export function DesignPrototypeFigure({ item, lang, proto, skillName, base, words, time, canPin, onPin, onBuild }: {
  item: string; lang: string; proto: Prototype; skillName: string; base: string | null; words: ElementDesignWords
  time: (iso?: string) => string; canPin: boolean; onPin: (id: string) => void; onBuild: () => Promise<boolean>
}) {
  const pinned = proto.status === "pinned"
  const title = proto.title ?? proto.id
  return (
    <figure data-block="epf01" data-prototype-figure={proto.id} data-status={proto.status} className="flex min-w-0 flex-col gap-4">
      <div data-block="epf02" className="relative pb-6 pr-6">
        {proto.shots.desktop ? (
          <img src={shotUrl(item, proto.id, "desktop")} alt={`${title} · ${words.desktop}`} loading="lazy"
            className="aspect-[16/10] w-full rounded-lg border border-border bg-muted object-cover object-top" />
        ) : <Skeleton data-block="epf03" className="aspect-[16/10] w-full rounded-lg" />}
        {proto.shots.mobile ? (
          <img src={shotUrl(item, proto.id, "mobile")} alt={`${title} · ${words.mobile}`} loading="lazy"
            className="absolute bottom-0 right-0 aspect-[13/30] w-[22%] rounded-md border border-border bg-muted object-cover object-top ring-4 ring-background" />
        ) : null}
      </div>
      <figcaption data-block="epf04" className="flex flex-col gap-3">
        <div data-block="epf05" className="flex flex-wrap items-center gap-2">
          <span data-block="epf06" className={`font-medium text-foreground ${SMALL}`}>{title}</span>
          {pinned ? <Badge data-block="epf07">{words.pinnedBadge}</Badge> : null}
          <span data-block="epf08" className={`text-muted-foreground ${SMALL}`}>
            {words.skillOf.replace("{name}", skillName)}{proto.readyAt ? ` · ${words.readyAt.replace("{time}", time(proto.readyAt))}` : ""}
          </span>
        </div>
        <PrototypeActions href={prototypeHref(base, lang, proto)} onBuild={onBuild} words={words}>
          {!pinned ? (
            <Button size="sm" disabled={!canPin} onClick={() => onPin(proto.id)} title={words.pinHint} data-prototype-pin>
              <Pin data-icon="inline-start" aria-hidden />
              {words.pin}
            </Button>
          ) : null}
        </PrototypeActions>
      </figcaption>
    </figure>
  )
}
