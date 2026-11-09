import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import type { DesignState } from "./types"

// ПУТЬ ДИЗАЙНА ЭЛЕМЕНТА — ЧЕТЫРЕ ШАГА И ТОНКАЯ НАСТРОЙКА (узел, шаг 713-1). Владелец 2026-11-09: «нормальный человеческий логический
// дизайн который проходит от начала и до конца не спагетти дизайн». Здесь только счёт: что сделано на каждом шаге, его строка словами и
// какой шаг открыть первым — первый несделанный; сделано всё — «Закрепление», где виден итог.
export type StepId = "brief" | "skills" | "trials" | "pin" | "fine"
export const STEPS: readonly StepId[] = ["brief", "skills", "trials", "pin", "fine"]
export const isStep = (s: string): s is StepId => (STEPS as readonly string[]).includes(s)

/** Бриф из пульта ядра: ещё спрашивается, недоступен или прочитан; заполнен — есть «для кого» и характер. */
export type BriefFacts = { state: "loading" | "off" | "ok"; filled: boolean; pinned: string | null }

export type Facts = { brief: BriefFacts; loaded: boolean; skills: number; tests: number; ready: number; building: number; pinned: string | null }

export function facts(brief: BriefFacts, state: DesignState | null): Facts {
  const live = (state?.prototypes ?? []).filter((p) => !p.archived)
  const building = new Set([...(state?.pending ?? []), ...live.filter((p) => p.status === "draft").map((p) => p.id)])
  return {
    brief,
    loaded: state !== null,
    skills: state?.skills.length ?? 0,
    tests: (state?.skills ?? []).filter((s) => s.test).length,
    ready: live.filter((p) => p.status === "ready" || p.status === "pinned").length,
    building: building.size,
    pinned: live.find((p) => p.status === "pinned")?.id ?? brief.pinned,
  }
}

export function done(id: StepId, f: Facts): boolean {
  if (id === "brief") return f.brief.filled
  if (id === "skills") return f.tests > 0
  if (id === "trials") return f.ready > 0
  if (id === "pin") return f.pinned !== null
  return false
}

export function line(id: StepId, f: Facts, w: ElementDesignWords["flow"]["state"]): string {
  if (id === "fine") return w.fine
  if (id === "brief") return f.brief.state === "loading" ? w.loading : f.brief.state === "off" ? w.off : f.brief.filled ? w.briefDone : w.briefTodo
  if (!f.loaded) return w.loading
  if (id === "skills") return f.skills === 0 ? w.skillsNone : w.skills.replace("{n}", String(f.skills)).replace("{t}", String(f.tests))
  if (id === "trials") {
    const parts = [f.ready ? w.trialsReady.replace("{n}", String(f.ready)) : "", f.building ? w.trialsBuilding.replace("{n}", String(f.building)) : ""]
    return parts.filter(Boolean).join(" · ") || w.trialsNone
  }
  return f.pinned ? w.pinned : w.notPinned
}

/** Шаг, который открывается сам: первый несделанный; пока ничего не известно — `null`. */
export function firstOpen(f: Facts): StepId | null {
  if (f.brief.state === "loading" || !f.loaded) return null
  if (f.brief.state === "ok" && !f.brief.filled) return "brief"
  return (["skills", "trials", "pin"] as const).find((s) => !done(s, f)) ?? "pin"
}
