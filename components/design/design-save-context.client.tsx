"use client"

import { createContext, useCallback, useContext, type ReactNode } from "react"
import type { FieldType } from "@/components/element-settings/remote.client"

// КУДА ПИШУТ РЕДАКТОРЫ ОФОРМЛЕНИЯ ЯДРА (узел, шаг 712-3). Четыре редактора (`design-colors|fonts|type|shape.client.tsx`) перенесены из
// шаблона элемента дословно, кроме двух строк: запись и видимость поля они берут отсюда. Два поставщика:
//  · вкладка элемента «Строительство → Дизайн» — пульт ядра к файлам элемента (`components/element-settings/design-settings.client.tsx`):
//    поле видно, только если элемент его объявляет; запись — заплата через `/api/node/element-settings`;
//  · вид каталога `designSection` (280-6) — общая дверь `/api/architect/design-config`, все поля видны.
export type DesignSaveApi = {
  save: (patch: Record<string, unknown>) => Promise<{ ok: boolean }>
  visible: (path: string, type: FieldType) => boolean
}

const DesignSaveContext = createContext<DesignSaveApi | null>(null)

export function DesignSaveProvider({ value, children }: { value: DesignSaveApi; children: ReactNode }) {
  return <DesignSaveContext.Provider value={value}>{children}</DesignSaveContext.Provider>
}

function useApi(): DesignSaveApi {
  const api = useContext(DesignSaveContext)
  if (!api) throw new Error("design editor outside DesignSaveProvider")
  return api
}

export function useDesignSave(): (arg: { patch: Record<string, unknown> }) => Promise<{ ok: boolean }> {
  const api = useApi()
  return useCallback(({ patch }) => api.save(patch), [api])
}

export function useDesignVisible(): (path: string, type: FieldType) => boolean {
  return useApi().visible
}
