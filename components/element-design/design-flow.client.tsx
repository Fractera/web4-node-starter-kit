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
import { DesignFine } from "@/components/element-settings/design-fine.client"
import { DesignTrack } from "./design-track.client"
import { DesignSkillsStep } from "./design-skills-step.client"
import { DesignTrialsStep } from "./design-trials-step.client"
import { DesignPinStep } from "./design-pin-step.client"
import { done, facts, firstOpen, isStep, line, STEPS, type BriefFacts, type StepId } from "./flow"
import { useDesignState } from "./use-design-state.client"
import type { ActResult } from "./types"

// ВКЛАДКА «СТРОИТЕЛЬСТВО → ДИЗАЙН» КАК ОДИН ПУТЬ (узел, шаг 713-1). Владелец 2026-11-09: «это просто огромная свалка и куча блоков …
// сделай нормальный человеческий логический дизайн который проходит от начала и до конца». Сверху — путь из четырёх шагов и тонкой
// настройки, у каждого состояние словами; ниже открыт один шаг. Сам открывается первый несделанный; выбранный шаг живёт в адресе
// (`#skills`), и перезагрузка возвращает на него. Шаги не размонтируются — несохранённый бриф переживает переход.
type Props = { item: string; lang: string; port: number | null; publicUrl: string | null; words: ElementDesignWords; remote: ElementRemoteWords; ui: DesignUi; dialogUi: AppDialogUi }

export function DesignFlow({ item, lang, port, publicUrl, words, remote, ui, dialogUi }: Props) {
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
  const [step, setStep] = useState<StepId | null>(null)
  const top = useRef<HTMLDivElement>(null)

  // The first open: the step in the address, else the first unfinished one once both sources answered.
  useEffect(() => {
    if (step) return
    const asked = window.location.hash.slice(1)
    const auto = isStep(asked) ? asked : firstOpen(f) ?? (api.error ? "brief" : null)
    if (auto) setStep(auto)
  }, [step, f, api.error])
  const go = useCallback((s: StepId, scroll = false) => {
    setStep(s)
    window.history.replaceState(null, "", `#${s}`)
    if (scroll) top.current?.scrollIntoView({ block: "start", behavior: "smooth" })
    if (s !== "brief" && s !== "fine") void api.load()
  }, [api])

  // 712-3: a pin replaces the hand edits of «Fine tuning» — the platform's window says so before the press.
  const [pinAsk, setPinAsk] = useState<((yes: boolean) => void) | null>(null)
  const act = useCallback(async (payload: Record<string, unknown>): Promise<ActResult> => {
    if (payload.action !== "pin") return api.act(payload)
    const yes = await new Promise<boolean>((resolve) => setPinAsk(() => resolve))
    setPinAsk(null)
    return yes ? api.act(payload) : (api.state ?? { ok: false, error: "" })
  }, [api])
  const time = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(lang, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    return (iso?: string) => (iso ? fmt.format(new Date(iso)) : "")
  }, [lang])

  const lines = Object.fromEntries(STEPS.map((s) => [s, line(s, f, words.flow.state)])) as Record<StepId, string>
  const marks = Object.fromEntries(STEPS.map((s) => [s, done(s, f)])) as Record<StepId, boolean>
  return (
    <div data-block="edf01" data-element-design-flow data-step={step ?? ""} className="my-6 flex flex-col gap-8">
      <div data-block="edf02" ref={top} className="flex scroll-mt-32 flex-col gap-3">
        <DesignTrack current={step} lines={lines} done={marks} onPick={(s) => go(s)} words={words} />
        <details data-block="edf03" className="group">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-[length:var(--fs-small)] text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
            <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" aria-hidden />
            {words.howTitle}
          </summary>
          <div data-block="edf04" className="mt-3 flex max-w-prose flex-col gap-2 border-l-2 border-border pl-4">
            <P data-block="edf05">{words.how}</P>
            <P data-block="edf06">{words.gain}</P>
          </div>
        </details>
        {api.error ? <Small data-block="edf07" className="text-destructive" role="alert">{words.failed} {api.error}</Small> : null}
      </div>
      {step === null ? <Skeleton data-block="edf08" className="h-72 w-full rounded-lg" /> : (
        <>
          <div data-block="edf09" hidden={step !== "brief"}><BriefEditor words={remote} nextLabel={words.flow.next.skills} onNext={() => go("skills", true)} /></div>
          <div data-block="edf10" hidden={step !== "skills"}><DesignSkillsStep item={item} lang={lang} api={api} words={words} onNext={() => go("trials", true)} /></div>
          <div data-block="edf11" hidden={step !== "trials"}>
            <DesignTrialsStep item={item} lang={lang} api={api} words={words} time={time} act={act} onBack={() => go("skills", true)} onNext={() => go("pin", true)} />
          </div>
          <div data-block="edf12" hidden={step !== "pin"}>
            <DesignPinStep item={item} lang={lang} api={api} words={words} time={time} pin={(id) => act({ action: "pin", prototype: id })} onBack={() => go("trials", true)} onFine={() => go("fine", true)} />
          </div>
          <div data-block="edf13" hidden={step !== "fine"}><DesignFine ui={ui} words={remote} /></div>
        </>
      )}
      <AppDialog
        open={pinAsk !== null}
        onOpenChange={(open) => { if (!open) pinAsk?.(false) }}
        title={words.pinWarnTitle}
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
