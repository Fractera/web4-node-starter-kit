"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { P, Small } from "@/components/ui/typography"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { DesignUi } from "@/components/design/design.i18n"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import type { ElementRemoteWords } from "@/app/[lang]/(architectLayer)/_i18n/element-remote.i18n"
import { useRemote } from "@/components/element-settings/remote.client"
import { BriefEditor } from "@/components/element-settings/brief-editor.client"
import { DesignTrack } from "./design-track.client"
import { DesignSkillsStep } from "./design-skills-step.client"
import { DesignCompareStep } from "./design-compare-step.client"
import { cards as cardsOf, done, facts, firstCard, firstOpen, isStep, line, STEPS, type BriefFacts, type StepId } from "./flow"
import { useDesignState } from "./use-design-state.client"
import type { ActResult } from "./types"

// ВКЛАДКА «СТРОИТЕЛЬСТВО → ДИЗАЙН» ПО СХЕМЕ ВЛАДЕЛЬЦА (узел, шаг 715). Владелец 2026-11-10: «Шаг один: … библиотека навыков … Бриф …
// не обязательно … сгенерировать и сравнить» — и о прежней вкладке: «полностью переработать страницу … удалить с нуля». Сверху липкий
// путь из трёх шагов (состояние — подсказкой), под ним одна строка «Как здесь устроен дизайн», ниже открыт один шаг. Сам открывается
// библиотека, пока навыков нет, иначе — генерация и сравнение; выбранный шаг живёт в адресе (`#compare`). Шаги не размонтируются —
// несохранённый бриф и введённый референс переживают переход.
type Props = {
  item: string; lang: string; port: number | null; publicUrl: string | null; name: string; agentHref: string
  words: ElementDesignWords; remote: ElementRemoteWords; ui: DesignUi; dialogUi: AppDialogUi
}

export function DesignFlow({ item, lang, port, publicUrl, name, agentHref, words, remote, ui, dialogUi }: Props) {
  const api = useDesignState(item, port, publicUrl)
  const { files } = useRemote()
  const loadedBrief = files.brief
  const brief = useMemo<BriefFacts>(() => {
    if (!loadedBrief || loadedBrief.state === "loading") return { state: "loading", filled: false, pinned: null }
    if (loadedBrief.state === "off") return { state: "off", filled: false, pinned: null }
    const c = loadedBrief.config as { audience?: string; character?: string[]; pinned?: { prototype?: string } }
    return { state: "ok", filled: Boolean(c.audience?.trim()) && (c.character?.length ?? 0) > 0, pinned: c.pinned?.prototype ?? null }
  }, [loadedBrief])
  const f = useMemo(() => facts(brief, api.state), [brief, api.state])
  const cards = useMemo(() => cardsOf(api.state), [api.state])
  const [step, setStep] = useState<StepId | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const top = useRef<HTMLDivElement>(null)
  const selected = picked && cards.some((c) => c.key === picked) ? picked : firstCard(cards)

  useEffect(() => {
    if (step) return
    const asked = window.location.hash.slice(1)
    const auto = isStep(asked) ? asked : firstOpen(f) ?? (api.error ? "skills" : null)
    if (auto) setStep(auto)
  }, [step, f, api.error])
  const go = useCallback((s: StepId, scroll = false) => {
    setStep(s)
    window.history.replaceState(null, "", `#${s}`)
    if (scroll) top.current?.scrollIntoView({ block: "start", behavior: "smooth" })
    if (s !== "brief") void api.load()
  }, [api])
  const see = (key: string) => { setPicked(key); go("compare", true) }

  // 712-3: the approval replaces the hand edits of «Fine tuning» — the platform's window says so before the press.
  const [pinAsk, setPinAsk] = useState<((yes: boolean) => void) | null>(null)
  const act = useCallback(async (payload: Record<string, unknown>): Promise<ActResult> => {
    if (payload.action !== "pin") return api.act(payload)
    const yes = await new Promise<boolean>((resolve) => setPinAsk(() => resolve))
    setPinAsk(null)
    return yes ? api.act(payload) : (api.state ?? { ok: false, error: "" })
  }, [api])
  const [pinNote, setPinNote] = useState("")
  const approve = async (id: string) => {
    const r = await act({ action: "pin", prototype: id })
    setPinNote(r.ok ? "" : `${words.failed} ${r.error ?? r.reason ?? ""}`.trim())
  }

  const lines = Object.fromEntries(STEPS.map((s) => [s, line(s, f, words.flow.state)])) as Record<StepId, string>
  const marks = Object.fromEntries(STEPS.map((s) => [s, done(s, f)])) as Record<StepId, boolean>
  return (
    <div ref={top} data-block="edf01" data-element-design-flow data-step={step ?? ""} className="my-6 flex scroll-mt-16 flex-col gap-6">
      <div data-block="edf02" className="flex flex-col gap-3">
        <DesignTrack current={step} lines={lines} done={marks} onPick={(s) => go(s)} words={words} />
        <details data-block="edf03" className="group">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-[length:var(--fs-small)] text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
            <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" aria-hidden />
            {words.howTitle}
          </summary>
          <div data-block="edf04" className="mt-3 flex max-w-prose flex-col gap-2 border-l-2 border-border pl-4">
            <P data-block="edf05">{words.how}</P>
            <P data-block="edf06">{words.howRef}</P>
            <P data-block="edf07">{words.howAfter}</P>
          </div>
        </details>
        {api.error ? <Small data-block="edf08" className="text-destructive" role="alert">{words.failed} {api.error}</Small> : null}
        {pinNote ? <Small data-block="edf09" className="text-destructive" role="alert">{pinNote}</Small> : null}
      </div>
      {step === null ? <Skeleton data-block="edf10" className="h-72 w-full rounded-lg" /> : (
        <>
          <div data-block="edf11" hidden={step !== "skills"}><DesignSkillsStep item={item} lang={lang} api={api} cards={cards} words={words} onSee={see} onNext={() => go("brief", true)} /></div>
          <div data-block="edf12" hidden={step !== "brief"}>
            <BriefEditor words={remote} nextLabel={words.flow.next.compare} skipLabel={words.flow.skip} onNext={() => go("compare", true)} />
          </div>
          <div data-block="edf13" hidden={step !== "compare"}>
            <DesignCompareStep item={item} lang={lang} api={api} cards={cards} selected={selected} onSelect={setPicked} name={name} agentHref={agentHref}
              words={words} remote={remote} ui={ui} act={act} approve={(id) => void approve(id)} onBack={() => go("skills", true)} />
          </div>
        </>
      )}
      <AppDialog
        open={pinAsk !== null}
        onOpenChange={(open) => { if (!open) pinAsk?.(false) }}
        title={words.pinWarnTitle.replace("{name}", name)}
        description={words.pinWarnText}
        ui={dialogUi}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => pinAsk?.(false)}>{words.cancel}</Button>
            <Button onClick={() => pinAsk?.(true)} data-pin-confirm>{words.pinConfirm}</Button>
          </>
        }
      />
    </div>
  )
}
