"use client"

import { BadgeCheck, CheckCircle2, ExternalLink } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Small } from "@/components/ui/typography"
import type { DesignUi } from "@/components/design/design.i18n"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import type { ElementRemoteWords } from "@/app/[lang]/(architectLayer)/_i18n/element-remote.i18n"
import { DesignFine } from "@/components/element-settings/design-fine.client"
import { DesignReference } from "./design-reference.client"
import type { Card } from "./flow"
import { prototypeHref, shotUrl, type ActResult, type DesignState } from "./types"
import { SMALL } from "./step-parts"

// ВЫБРАННАЯ КАРТОЧКА КРУПНО (узел, шаг 715-4). Владелец 2026-11-10: «под картинкой: закрытые аккордеон: изменить референс … тонкая
// настройка … Утвердить этот дизайн для элемента (название элемента). Снизу подпись …». Картинка — снимок компьютера во всю колонку и
// снимок телефона поверх угла; нажатие открывает всю страницу на элементе. «Тонкая настройка» правит утверждённый дизайн — у остальных
// карточек она говорит, как до неё дойти.
export function DesignStage({ item, lang, card, state, base, name, agentHref, words, remote, ui, act, approve }: {
  item: string; lang: string; card: Card; state: DesignState; base: string | null; name: string; agentHref: string
  words: ElementDesignWords; remote: ElementRemoteWords; ui: DesignUi; act: (p: Record<string, unknown>) => Promise<ActResult>; approve: (id: string) => void
}) {
  const p = card.proto
  const shown = p && (p.shots.desktop || p.shots.mobile)
  const href = p && (card.state === "ready" || card.state === "approved") ? prototypeHref(base, lang, p.id) : null
  const assembling = p ? state.building.includes(p.id) : false
  return (
    <section data-block="est01" data-design-stage={card.key} className="flex flex-col gap-6">
      {shown && p ? (
        <figure data-block="est02" className="flex flex-col gap-2">
          <a href={href && !assembling ? href : undefined} target="_blank" rel="noopener noreferrer" aria-label={href ? words.openHint : undefined}
            data-block="est03" className={`relative block pb-6 pr-6 ${href && !assembling ? "group cursor-pointer" : "cursor-default"}`}>
            {p.shots.desktop ? (
              <img src={shotUrl(item, p.id, "desktop")} alt={`${card.name} · ${words.desktop}`}
                className="aspect-[16/10] w-full rounded-lg border border-border bg-muted object-cover object-top transition-colors group-hover:border-primary" />
            ) : <Skeleton data-block="est04" className="aspect-[16/10] w-full rounded-lg" />}
            {p.shots.mobile ? (
              <img src={shotUrl(item, p.id, "mobile")} alt={`${card.name} · ${words.mobile}`}
                className="absolute bottom-0 right-0 aspect-[13/30] w-[22%] rounded-md border border-border bg-muted object-cover object-top ring-4 ring-card" />
            ) : null}
          </a>
          <figcaption data-block="est05" className={`flex items-center gap-1.5 text-muted-foreground ${SMALL}`}>
            {href && !assembling ? <ExternalLink className="size-3.5" aria-hidden /> : null}
            {!base ? words.localOnly : assembling ? words.pageBuilding : href ? words.openHint : ""}
          </figcaption>
        </figure>
      ) : card.state === "building" ? (
        <div data-block="est06" className="flex flex-col gap-2">
          <Skeleton data-block="est07" className="aspect-[16/10] w-full rounded-lg" />
          <Small data-block="est08">{words.buildingWait}</Small>
        </div>
      ) : (
        <div data-block="est09" className="flex aspect-[16/7] w-full items-center justify-center rounded-lg border border-dashed border-border px-6 text-center">
          <Small data-block="est10" className="max-w-md">{words.notBuilt}</Small>
        </div>
      )}
      <Accordion key={card.key} type="multiple" defaultValue={card.state === "none" ? ["ref"] : []} data-block="est11" className="rounded-lg border border-border px-4">
        <AccordionItem value="ref">
          <AccordionTrigger data-design-accordion="ref">{words.refTitle}</AccordionTrigger>
          <AccordionContent>
            {card.skill ? <DesignReference skill={card.skill} state={state} base={base} lang={lang} words={words} act={act} /> : <Small data-block="est12">{words.compareEmpty}</Small>}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="fine">
          <AccordionTrigger data-design-accordion="fine">{remote.fineTitle}</AccordionTrigger>
          <AccordionContent>
            {card.state === "approved" ? <DesignFine ui={ui} words={remote} bare /> : <Small data-block="est13" className="max-w-prose">{words.fineLocked}</Small>}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {p && (card.state === "ready" || card.state === "approved") ? (
        <div data-block="est14" className="flex flex-col items-start gap-3">
          {card.state === "approved" ? (
            <span data-block="est15" className={`inline-flex items-center gap-2 font-medium text-foreground ${SMALL}`}>
              <BadgeCheck className="size-5 text-success" aria-hidden />
              {words.approved.replace("{name}", name)}
            </span>
          ) : (
            <Button size="lg" disabled={state.busy} onClick={() => approve(p.id)} data-design-approve>
              <CheckCircle2 data-icon="inline-start" aria-hidden />
              {words.approve.replace("{name}", name)}
            </Button>
          )}
          <Small data-block="est16" className="max-w-prose">
            {words.approveAfter} <a href={agentHref} className="text-primary hover:underline">{words.agentLink}</a>
          </Small>
        </div>
      ) : null}
    </section>
  )
}
