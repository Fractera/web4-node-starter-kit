"use client"

import { useMemo, type ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { H2, P } from "@/components/ui/typography"
import { DesignColors } from "@/components/design/design-colors.client"
import { DesignFonts } from "@/components/design/design-fonts.client"
import { DesignType } from "@/components/design/design-type.client"
import { DesignShape } from "@/components/design/design-shape.client"
import type { DesignUi } from "@/components/design/design.i18n"
import { DesignSaveProvider, type DesignSaveApi } from "@/components/design/design-save-context.client"
import type { ElementRemoteWords } from "@/app/[lang]/(architectLayer)/_i18n/element-remote.i18n"
import { RemoteSettings, useRemote } from "./remote.client"
import { RemoteState } from "./remote-state"
import { BriefEditor } from "./brief-editor.client"

// ВКЛАДКА «СТРОИТЕЛЬСТВО → ДИЗАЙН» ЦЕЛИКОМ (узел, шаг 712-3). Владелец 2026-11-09: «перенести дизайн страницу на ту самую вкладку …
// мы сможем эти настройки при необходимости вручную подредактировать». Сверху вниз: бриф → навыки и пробы (панель 711, `children`) →
// тонкая настройка (цвета, шрифты, текст, формы и отступы — редакторы шаблона, `components/design/*`). Всё читает и пишет пульт ядра.

type Raw = {
  colors?: { light?: Record<string, string>; dark?: Record<string, string> }
  fonts?: Record<string, { family: string; import?: string }>
  type?: { scale?: number; leading?: number; headingWeight?: number }
  shape?: { radius?: string; borderWidth?: string; spaceScale?: number; appWidth?: string; shadow?: "none" | "soft" | "medium" | "strong" }
  motion?: { speed?: "none" | "fast" | "normal" | "slow" }
}

function FineTuning({ ui, words }: { ui: DesignUi; words: ElementRemoteWords }) {
  const { files, save, visible } = useRemote()
  const loaded = files.design
  // The editors save through the remote control and show only what the element declares (712-3).
  const api = useMemo<DesignSaveApi>(() => ({
    save: async (patch) => ({ ok: (await save("design", patch)).ok }),
    visible: (path, type) => visible("design", path, type),
  }), [save, visible])
  const c = (loaded?.state === "ok" ? loaded.config : null) as Raw | null
  return (
    <section data-block="eds01" data-design-fine className="flex flex-col gap-3 rounded-lg border border-border p-5">
      <H2 data-block="eds02" variant="ui">{words.fineTitle}</H2>
      <P data-block="eds03" className="text-muted-foreground">{words.fineLead}</P>
      {!c ? <RemoteState loaded={loaded} words={words} /> : (
        <DesignSaveProvider value={api}>
        <Tabs defaultValue="colors" className="flex flex-col gap-4">
          <TabsList>
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

export function ElementDesignSettings({ item, ui, words, children }: { item: string; ui: DesignUi; words: ElementRemoteWords; children: ReactNode }) {
  return (
    <RemoteSettings item={item} files={["brief", "design"]}>
      <div data-block="eds04" data-element-design-settings className="my-6 flex flex-col gap-6">
        <BriefEditor words={words} />
        {children}
        <FineTuning ui={ui} words={words} />
      </div>
    </RemoteSettings>
  )
}
