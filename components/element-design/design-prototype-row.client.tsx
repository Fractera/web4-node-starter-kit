"use client"

import { Skeleton } from "@/components/ui/skeleton"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { PrototypeActions, prototypeHref, shotUrl } from "./design-prototype-actions.client"
import type { Prototype } from "./types"
import { SMALL } from "./step-parts"

// ОДНА ПРОБНАЯ СТРАНИЦА В ШАГЕ «ПРОБЫ» (711-5, вид 713-2): миниатюра, имя и состояние словами, «Открыть» и «Собрать». Пока строится или
// ждёт очереди — заглушка вместо снимка и строка, когда её ждать. Сравнение крупно и «Закрепить» — шаг «Закрепление».
export function DesignPrototypeRow({ item, lang, proto, queued, base, words, time, onBuild }: {
  item: string; lang: string; proto: Prototype | null; queued?: string; base: string | null; words: ElementDesignWords
  time: (iso?: string) => string; onBuild?: () => Promise<boolean>
}) {
  const id = proto?.id ?? queued ?? ""
  const status = proto ? proto.status : "queued"
  const waiting = status === "queued" || status === "draft"
  const ready = proto && (proto.status === "ready" || proto.status === "pinned") && !proto.archived
  return (
    <li data-block="edp01" data-prototype-row={id} data-status={status} className="flex flex-wrap items-center gap-4 px-4 py-3">
      {proto?.shots.desktop ? (
        <img src={shotUrl(item, proto.id, "desktop")} alt={`${proto.title ?? proto.id} · ${words.desktop}`} loading="lazy"
          className="aspect-[16/10] w-24 shrink-0 rounded-md border border-border object-cover object-top" />
      ) : (
        <Skeleton data-block="edp02" className="aspect-[16/10] w-24 shrink-0 rounded-md" />
      )}
      <div data-block="edp03" className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span data-block="edp04" className={`truncate font-medium text-foreground ${SMALL}`}>{proto?.title ?? id}</span>
        <span data-block="edp05" className={`text-muted-foreground ${SMALL}`}>
          {words.status[status]}{proto?.readyAt && ready ? ` · ${time(proto.readyAt)}` : ""}
        </span>
        {waiting ? <span data-block="edp06" className={`text-muted-foreground ${SMALL}`}>{words.buildingWait}</span> : null}
      </div>
      {ready ? <PrototypeActions href={prototypeHref(base, lang, proto)} onBuild={onBuild} words={words} /> : null}
    </li>
  )
}
