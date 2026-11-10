// ФОРМЫ ВКЛАДКИ «СТРОИТЕЛЬСТВО → ДИЗАЙН» (узел, шаги 711, 715) — то, что отдаёт дверь `/api/node/element-design`.
export type Origin = "own" | "base" | "catalog"
export type FoundSkill = {
  mark: string; name: string; origin: Origin; source: string; summary: string; why: string
  licence: string | null; stars: number | null; installs: number | null; scripts: number; url: string | null; github: string | null
}
export type ProjectSkill = {
  mark: string; name: string; origin: Origin; source: string | null; summary: string | null; licence: string | null
  stars: number | null; installs: number | null; scripts: number; test: boolean; addedAt: string; github: string | null
}
export type DesignRef = { id: number; mark: string; url: string; mediaId: string | null; caption: string | null; addedAt: string }
export type DesignRun = { prototype: string; mark: string; kind: "generate" | "pin" | "build"; requestedAt: string }
export type Prototype = {
  id: string; skill: string; from: string; references: { url: string; caption?: string }[]
  status: "draft" | "ready" | "pinned" | "archived"; createdAt: string; readyAt?: string; title?: string
  shots: { desktop: boolean; mobile: boolean }; archived: boolean
}
export type DesignState = {
  ok: true; skills: ProjectSkill[]; refs: DesignRef[]; runs: DesignRun[]; prototypes: Prototype[]; supported: boolean
  pending: string[]; busy: boolean; building: string[]; limits: { fiveHour: number | null; sevenDay: number | null; own: boolean }
}
/** Ответ двери на действие: новое состояние или отказ с причиной. */
export type ActResult = (DesignState & { started?: string; pinning?: string }) | { ok: false; error?: string; reason?: string }
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
export const DOOR = `${BASE}/api/node/element-design`

/** Снимок тестовой страницы (компьютер или телефон) — через дверь ядра. */
export const shotUrl = (item: string, id: string, size: "desktop" | "mobile") =>
  `${DOOR}?item=${encodeURIComponent(item)}&shot=${encodeURIComponent(id)}&size=${size}`

/** Вся тестовая страница — на самом элементе (адрес выбирает браузер, `use-design-state`); в архиве ссылки нет. */
export const prototypeHref = (base: string | null, lang: string, id: string, archived = false) => (base && !archived ? `${base}/${lang}/prototypes/${id}` : null)
