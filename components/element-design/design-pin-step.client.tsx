"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DesignPrototypeFigure } from "./design-prototype-figure.client"
import { StepHead, StepNext } from "./step-parts"
import type { DesignApi } from "./use-design-state.client"
import type { ActResult } from "./types"

// ШАГ 4 «ЗАКРЕПЛЕНИЕ» (узел, шаг 713-2) — точка фокуса всей вкладки: готовые пробы крупно, рядом, чтобы сравнить глазами; закреплённая —
// первой и с меткой. Одна проба — во всю ширину колонки, две и больше — по две в ряд. После закрепления — путь к тонкой настройке.
export function DesignPinStep({ item, lang, api, words, time, pin, onBack, onFine }: {
  item: string; lang: string; api: DesignApi; words: ElementDesignWords; time: (iso?: string) => string
  pin: (id: string) => Promise<ActResult>; onBack: () => void; onFine: () => void
}) {
  const state = api.state
  const [note, setNote] = useState("")
  const pinOne = async (id: string) => { const r = await pin(id); setNote(r.ok ? "" : `${words.failed} ${r.error ?? r.reason ?? ""}`.trim()) }
  const names = new Map((state?.skills ?? []).map((s) => [s.mark, s.name]))
  const ready = (state?.prototypes ?? [])
    .filter((p) => !p.archived && (p.status === "ready" || p.status === "pinned"))
    .sort((a, b) => Number(b.status === "pinned") - Number(a.status === "pinned") || String(b.readyAt ?? "").localeCompare(String(a.readyAt ?? "")))
  const pinned = ready.some((p) => p.status === "pinned")
  const skillName = (mark: string) => names.get(mark) ?? mark.split(/[:@/]/).pop() ?? mark
  return (
    <section data-block="epn01" data-design-panel="pin" className="flex flex-col gap-8">
      <StepHead title={words.pinTitle} lead={words.pinLead} />
      {state && ready.length === 0 ? (
        <div data-block="epn02" className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border px-5 py-6">
          <Small data-block="epn03" className="max-w-prose">{words.pinEmpty}</Small>
          <Button type="button" variant="outline" size="sm" onClick={onBack}>{words.toTrials}</Button>
        </div>
      ) : null}
      {ready.length > 0 ? (
        <div data-block="epn04" className={ready.length > 1 ? "grid gap-x-8 gap-y-10 sm:grid-cols-2" : "grid"}>
          {ready.map((p) => (
            <DesignPrototypeFigure key={p.id} item={item} lang={lang} proto={p} skillName={skillName(p.skill)} base={api.base} words={words} time={time}
              canPin={!state?.busy} onPin={(id) => void pinOne(id)} onBuild={async () => (await api.act({ action: "build" })).ok} />
          ))}
        </div>
      ) : null}
      {note ? <Small data-block="epn06" className="text-destructive" role="alert">{note}</Small> : null}
      <StepNext label={words.flow.next.fine} onNext={onFine}>
        {pinned ? <Small data-block="epn05" className="max-w-prose">{words.pinnedNext}</Small> : null}
      </StepNext>
    </section>
  )
}
