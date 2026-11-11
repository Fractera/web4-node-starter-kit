"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DesignColors } from "@/components/design/design-colors.client"
import { DesignFonts } from "@/components/design/design-fonts.client"
import { DesignType } from "@/components/design/design-type.client"
import { DesignShape } from "@/components/design/design-shape.client"
import type { DesignUi } from "@/components/design/design.i18n"
import { DesignSaveProvider, type DesignSaveApi } from "@/components/design/design-save-context.client"
import type { PanelDesignWords } from "./panel-design.i18n"

// «ДИЗАЙН ПАНЕЛИ» (шаг 718): те же редакторы тонкой настройки, что во вкладке «Дизайн» элемента (`components/design/*`), но пишут
// они оформление самой панели — дверь `/api/architect/panel-design`. Тем нет намеренно (владелец 2026-11-11: «мы не будем давать
// менять тему это бессмысленно»): только цвета, шрифты, текст, формы и отступы.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DOOR = `${BASE}/api/architect/panel-design`

type Raw = {
  colors?: { light?: Record<string, string>; dark?: Record<string, string> }
  fonts?: Record<string, { family: string; import?: string }>
  type?: { scale?: number; leading?: number; headingWeight?: number }
  shape?: { radius?: string; borderWidth?: string; spaceScale?: number; appWidth?: string; shadow?: "none" | "soft" | "medium" | "strong" }
  motion?: { speed?: "none" | "fast" | "normal" | "slow" }
}
type State = { own: boolean; config: Raw } | "loading" | "failed"

export function PanelDesign({ ui, words }: { ui: DesignUi; words: PanelDesignWords }) {
  const router = useRouter()
  const [state, setState] = useState<State>("loading")
  const [round, setRound] = useState(0)
  const load = useCallback(async () => {
    const r = await fetch(DOOR, { cache: "no-store" }).catch(() => null)
    const b = r?.ok ? await r.json().catch(() => null) : null
    setState(b?.ok ? { own: !!b.own, config: (b.config ?? {}) as Raw } : "failed")
  }, [])
  useEffect(() => { void load() }, [load])
  const api = useMemo<DesignSaveApi>(() => ({
    save: async (patch) => {
      const r = await fetch(DOOR, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patch }) }).catch(() => null)
      const ok = !!r?.ok
      if (ok) { setState((s) => (typeof s === "object" ? { ...s, own: true } : s)); router.refresh() }
      return { ok }
    },
    visible: () => true,
  }), [router])
  const back = async () => {
    const r = await fetch(DOOR, { method: "DELETE" }).catch(() => null)
    if (r?.ok) { await load(); setRound((n) => n + 1); router.refresh() }
  }
  if (state === "loading" || state === "failed") {
    return <p data-block="pdn01" className="text-muted-foreground text-sm">{state === "loading" ? words.loading : words.failed}</p>
  }
  const c = state.config
  return (
    <div data-block="pdn02" className="flex flex-col gap-4">
      <div data-block="pdn03" className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{state.own ? words.own : words.copying}</p>
        {state.own && <Button variant="outline" size="sm" onClick={back} data-panel-design-back>{words.back}</Button>}
      </div>
      <DesignSaveProvider value={api}>
        <Tabs key={round} defaultValue="colors" className="flex flex-col gap-6">
          <TabsList data-block="pdn04" className="w-fit max-w-full overflow-x-auto">
            {(["colors", "fonts", "type", "shape"] as const).map((t) => <TabsTrigger key={t} value={t} data-panel-design-tab={t}>{words.tabs[t]}</TabsTrigger>)}
          </TabsList>
          <TabsContent value="colors"><DesignColors initial={{ light: c.colors?.light ?? {}, dark: c.colors?.dark ?? {} }} ui={ui.colors} /></TabsContent>
          <TabsContent value="fonts"><DesignFonts initial={c.fonts ?? {}} ui={ui.fonts} /></TabsContent>
          <TabsContent value="type"><DesignType initial={c.type ?? {}} ui={ui.type} /></TabsContent>
          <TabsContent value="shape"><DesignShape initial={{ ...(c.shape ?? {}), ...(c.motion?.speed ? { speed: c.motion.speed } : {}) }} ui={ui.shape} /></TabsContent>
        </Tabs>
      </DesignSaveProvider>
    </div>
  )
}
