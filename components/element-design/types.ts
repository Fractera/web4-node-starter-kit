// ФОРМЫ ВКЛАДКИ «СТРОИТЕЛЬСТВО → ДИЗАЙН» (узел, шаг 711) — то, что отдаёт дверь `/api/node/element-design`.
export type Origin = "own" | "base" | "catalog"
export type FoundSkill = {
  mark: string; name: string; origin: Origin; source: string; summary: string; why: string
  licence: string | null; stars: number | null; installs: number | null; scripts: number; url: string | null
}
export type ProjectSkill = {
  mark: string; name: string; origin: Origin; source: string | null; summary: string | null; licence: string | null
  stars: number | null; installs: number | null; scripts: number; test: boolean; addedAt: string
}
export type DesignRef = { id: number; mark: string; url: string; mediaId: string | null; caption: string | null; addedAt: string }
export type DesignRun = { prototype: string; mark: string; kind: "generate" | "pin"; requestedAt: string }
export type Prototype = {
  id: string; skill: string; from: string; references: { url: string; caption?: string }[]
  status: "draft" | "ready" | "pinned" | "archived"; createdAt: string; readyAt?: string; title?: string
  shots: { desktop: boolean; mobile: boolean }; archived: boolean
}
export type DesignState = {
  ok: true; skills: ProjectSkill[]; refs: DesignRef[]; runs: DesignRun[]; prototypes: Prototype[]; supported: boolean
  pending: string[]; busy: boolean; limits: { fiveHour: number | null; sevenDay: number | null; own: boolean }
}
/** Ответ двери на действие: новое состояние или отказ с причиной. */
export type ActResult = (DesignState & { started?: string; pinning?: string }) | { ok: false; error?: string; reason?: string }
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
export const DOOR = `${BASE}/api/node/element-design`
