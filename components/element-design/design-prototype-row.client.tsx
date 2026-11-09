"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DOOR, type Prototype } from "./types"

// ОДИН ПРОТОТИП (711-5, 711-6): статус, снимки компьютера и телефона, ссылка на страницу в защищённом разделе элемента и «Закрепить».
// Ссылка — на сам элемент: этот компьютер — его порт, свой домен — его адрес (адрес выбирает браузер, `element-design-panel.client.tsx`).
export function DesignPrototypeRow({ item, lang, proto, queued, base, words, canPin, onPin }: {
  item: string; lang: string; proto: Prototype | null; queued?: string; base: string | null; words: ElementDesignWords; canPin: boolean; onPin: (id: string) => void
}) {
  if (!proto) {
    return <li data-block="edp01" data-prototype-row={queued} data-status="queued" className="rounded-md border border-dashed border-border px-3 py-2"><Small data-block="edp02" className="text-muted-foreground">{queued} · {words.status.queued}</Small></li>
  }
  const shot = (size: "desktop" | "mobile") => `${DOOR}?item=${encodeURIComponent(item)}&shot=${encodeURIComponent(proto.id)}&size=${size}`
  const href = base && !proto.archived ? `${base}/${lang}/prototypes/${proto.id}` : null
  return (
    <li data-block="edp03" data-prototype-row={proto.id} data-status={proto.status} className="flex flex-col gap-2 rounded-md border border-border p-3">
      <div data-block="edp04" className="flex flex-wrap items-center justify-between gap-2">
        <span data-block="edp05" className="text-sm text-foreground">{proto.title ?? proto.id}<span className="text-muted-foreground"> · {words.status[proto.status]}</span></span>
        <span data-block="edp06" className="flex gap-2">
          {href && <a href={href} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "sm", variant: "outline" })} data-prototype-open>{words.open}</a>}
          {proto.status === "ready" && !proto.archived && <Button size="sm" disabled={!canPin} onClick={() => onPin(proto.id)} title={words.pinHint} data-prototype-pin>{words.pin}</Button>}
        </span>
      </div>
      {(proto.shots.desktop || proto.shots.mobile) && (
        <div data-block="edp07" className="flex items-start gap-2">
          {proto.shots.desktop && <img src={shot("desktop")} alt={`${proto.id} · ${words.desktop}`} className="h-40 w-auto rounded border border-border object-cover object-top" loading="lazy" />}
          {proto.shots.mobile && <img src={shot("mobile")} alt={`${proto.id} · ${words.mobile}`} className="h-40 w-auto rounded border border-border object-cover object-top" loading="lazy" />}
        </div>
      )}
    </li>
  )
}
