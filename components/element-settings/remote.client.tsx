"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

// ПУЛЬТ ЯДРА К НАСТРОЙКАМ ЭЛЕМЕНТА — В БРАУЗЕРЕ (узел, шаг 712-3). Владелец 2026-11-09: «ядро всего лишь навсего представляет доступ к …
// настройкам которые сейчас существуют в элементе. То есть это удалённый пульт управления … в ядре будут представлены только те строки
// которые совпадают с предварительно созданными в ядре».
//
// Вкладки «Дизайн» и «Настройки сайта» оборачивают свои редакторы в `RemoteSettings`: он один раз спрашивает дверь ядра
// `/api/node/element-settings` о каждом нужном файле элемента и отдаёт редакторам значения, видимость поля и запись.
// 🔒 ВИДНО ТОЛЬКО ОБЪЯВЛЕННОЕ: `visible(файл, путь, тип)` — поле есть в объявлении элемента тем же типом (`lib/web4-items/
// element-settings-schema.cjs` на сервере). Редактор ядра спрашивает о каждом своём поле; чего элемент не объявляет — не рисуется.
// 🔒 ЗАПИСЬ ОТСЕКАЕТ НЕОБЪЯВЛЕННОЕ НА СЕРВЕРЕ ЯДРА (`prunePatch` двери `/api/node/element-settings`): что бы ни прислал редактор (готовый
// набор цветов, перевод поля), в файл элемента ложатся только объявленные пути верного типа; `null` — стереть объявленный ключ.
// 🔒 Страница слоя архитектора предрендерена: значения спрашиваются здесь, после открытия, — никогда не печатаются в HTML.

export type RemoteFile = "design" | "app" | "features" | "brief"
export type FieldType = "string" | "number" | "boolean" | "array" | "object"
export type Loaded =
  | { state: "loading" }
  | { state: "ok"; linked: boolean; config: Record<string, unknown>; fields: Record<string, FieldType>; built: Record<string, unknown> | null }
  | { state: "off"; reason: string }
export type SaveResult = { ok: boolean; reason?: string; config?: Record<string, unknown> }

type Remote = {
  item: string
  files: Partial<Record<RemoteFile, Loaded>>
  visible: (file: RemoteFile, path: string, type: FieldType) => boolean
  save: (file: RemoteFile, patch: Record<string, unknown>) => Promise<SaveResult>
}

const DOOR = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/node/element-settings`
const RemoteContext = createContext<Remote | null>(null)
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

async function load(item: string, file: RemoteFile): Promise<Loaded> {
  const b = await fetch(remoteUrl(item, file), { cache: "no-store" })
    .then((r) => r.json())
    .catch(() => null)
  if (!b?.ok) return { state: "off", reason: String(b?.reason ?? "core-not-answering") }
  return { state: "ok", linked: b.linked === true, config: isObj(b.config) ? b.config : {}, fields: isObj(b.fields) ? (b.fields as Record<string, FieldType>) : {}, built: isObj(b.built) ? b.built : null }
}

export function RemoteSettings({ item, files, children }: { item: string; files: RemoteFile[]; children: ReactNode }) {
  const list = files.join(",")
  const [loaded, setLoaded] = useState<Partial<Record<RemoteFile, Loaded>>>(() => Object.fromEntries(files.map((f) => [f, { state: "loading" }])))
  useEffect(() => {
    let live = true
    for (const f of list.split(",") as RemoteFile[]) {
      void load(item, f).then((l) => { if (live) setLoaded((s) => ({ ...s, [f]: l })) })
    }
    return () => { live = false }
  }, [item, list])

  const visible = useCallback((file: RemoteFile, path: string, type: FieldType) => {
    const l = loaded[file]
    return l?.state === "ok" && l.fields[path] === type
  }, [loaded])

  const save = useCallback(async (file: RemoteFile, patch: Record<string, unknown>): Promise<SaveResult> => {
    const l = loaded[file]
    if (l?.state !== "ok") return { ok: false, reason: l?.state === "off" ? l.reason : "loading" }
    if (l.linked && file !== "design" && file !== "brief") return { ok: false, reason: "config-connected" }
    const b = await fetch(DOOR, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item, file, patch }) })
      .then((r) => r.json())
      .catch(() => null)
    if (!b?.ok) return { ok: false, reason: String(b?.reason ?? "core-not-answering") }
    const config = isObj(b.config) ? b.config : l.config
    setLoaded((s) => ({ ...s, [file]: { ...l, config } }))
    return { ok: true, config }
  }, [loaded, item])

  const value = useMemo<Remote>(() => ({ item, files: loaded, visible, save }), [item, loaded, visible, save])
  return <RemoteContext.Provider value={value}>{children}</RemoteContext.Provider>
}

/** Адрес двери ядра для файла элемента — его зовут редакторы, перенесённые из шаблона (их запись — заплата телом). */
export function remoteUrl(item: string, file: RemoteFile): string {
  return `${DOOR}?item=${encodeURIComponent(item)}&file=${file}`
}

/** Публичная оболочка элемента (шапка, подвал) на языке — через пульт ядра; из неё собирается меню для редактора. */
export function shellUrl(item: string, lang: string): string {
  return `${DOOR}?item=${encodeURIComponent(item)}&file=shell&lang=${encodeURIComponent(lang)}`
}

/** Пульт элемента на экране. Вне `RemoteSettings` — ошибка разработчика, а не состояние. */
export function useRemote(): Remote {
  const r = useContext(RemoteContext)
  if (!r) throw new Error("useRemote outside RemoteSettings")
  return r
}
