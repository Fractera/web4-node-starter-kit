"use client"

import { useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DesignColors } from "@/components/design/design-colors.client"
import { DesignFonts } from "@/components/design/design-fonts.client"
import { DesignType } from "@/components/design/design-type.client"
import { DesignShape } from "@/components/design/design-shape.client"
import type { DesignUi } from "@/components/design/design.i18n"
import { DesignSaveProvider, type DesignSaveApi } from "@/components/design/design-save-context.client"
import type { ElementRemoteWords } from "@/app/[lang]/(architectLayer)/_i18n/element-remote.i18n"
import { StepHead } from "@/components/element-design/step-parts"
import { useRemote } from "./remote.client"
import { RemoteState } from "./remote-state"

// «ТОНКАЯ НАСТРОЙКА» — ПЯТЫЙ ШАГ ВКЛАДКИ «ДИЗАЙН», ПО ЖЕЛАНИЮ (712-3, вид 713-2): цвета, шрифты, текст, формы и отступы — редакторы
// шаблона (`components/design/*`) как есть, сменилась только рамка: без карточки, под той же шапкой шага, что и остальные.
// Редакторы пишут через пульт ядра и показывают только то, что элемент объявляет.
type Raw = {
  colors?: { light?: Record<string, string>; dark?: Record<string, string> }
  fonts?: Record<string, { family: string; import?: string }>
  type?: { scale?: number; leading?: number; headingWeight?: number }
  shape?: { radius?: string; borderWidth?: string; spaceScale?: number; appWidth?: string; shadow?: "none" | "soft" | "medium" | "strong" }
  motion?: { speed?: "none" | "fast" | "normal" | "slow" }
}

export function DesignFine({ ui, words }: { ui: DesignUi; words: ElementRemoteWords }) {
  const { files, save, visible } = useRemote()
  const loaded = files.design
  const api = useMemo<DesignSaveApi>(() => ({
    save: async (patch) => ({ ok: (await save("design", patch)).ok }),
    visible: (path, type) => visible("design", path, type),
  }), [save, visible])
  const c = (loaded?.state === "ok" ? loaded.config : null) as Raw | null
  return (
    <section data-block="edn01" data-design-fine data-design-panel="fine" className="flex flex-col gap-6">
      <StepHead title={words.fineTitle} lead={words.fineLead} />
      {!c ? <RemoteState loaded={loaded} words={words} /> : (
        <DesignSaveProvider value={api}>
          <Tabs defaultValue="colors" className="flex flex-col gap-6">
            <TabsList data-block="edn02" className="w-fit max-w-full overflow-x-auto">
              {(["colors", "fonts", "type", "shape"] as const).map((t) => <TabsTrigger key={t} value={t} data-design-tab={t}>{words.fineTabs[t]}</TabsTrigger>)}
            </TabsList>
            <TabsContent value="colors"><DesignColors initial={{ light: c.colors?.light ?? {}, dark: c.colors?.dark ?? {} }} ui={ui.colors} /></TabsContent>
            <TabsContent value="fonts"><DesignFonts initial={c.fonts ?? {}} ui={ui.fonts} /></TabsContent>
            <TabsContent value="type"><DesignType initial={c.type ?? {}} ui={ui.type} /></TabsContent>
            <TabsContent value="shape"><DesignShape initial={{ ...(c.shape ?? {}), ...(c.motion?.speed ? { speed: c.motion.speed } : {}) }} ui={ui.shape} /></TabsContent>
          </Tabs>
        </DesignSaveProvider>
      )}
    </section>
  )
}
