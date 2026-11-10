import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import type { DesignState, ProjectSkill, Prototype } from "./types"

// ПУТЬ ДИЗАЙНА ЭЛЕМЕНТА — ТРИ ШАГА ПО СХЕМЕ ВЛАДЕЛЬЦА (узел, шаг 715-2). Владелец 2026-11-10: «Шаг один: … библиотека навыков … Бриф в
// принципе шаг не обязательно … сгенерировать и сравнить». Здесь только счёт: что сделано на шаге, его строка словами (она всплывает
// подсказкой над кнопкой шага), какой шаг открыть первым, и карточки карусели «Сгенерировать и сравнить».
export type StepId = "skills" | "brief" | "compare"
export const STEPS: readonly StepId[] = ["skills", "brief", "compare"]
export const isStep = (s: string): s is StepId => (STEPS as readonly string[]).includes(s)

/** Бриф из пульта ядра: ещё спрашивается, недоступен или прочитан; заполнен — есть «для кого» и характер. */
export type BriefFacts = { state: "loading" | "off" | "ok"; filled: boolean; pinned: string | null }
export type Facts = { brief: BriefFacts; loaded: boolean; saved: number; generated: number; building: number; approved: string | null }

const live = (p: Prototype) => !p.archived && (p.status === "ready" || p.status === "pinned")

export function facts(brief: BriefFacts, state: DesignState | null): Facts {
  const protos = state?.prototypes ?? []
  const skills = state?.skills ?? []
  const building = new Set([...(state?.pending ?? []), ...protos.filter((p) => !p.archived && p.status === "draft").map((p) => p.id)])
  return {
    brief,
    loaded: state !== null,
    saved: skills.length,
    generated: skills.filter((s) => protos.some((p) => p.skill === s.mark && live(p))).length,
    building: building.size,
    approved: protos.find((p) => !p.archived && p.status === "pinned")?.id ?? brief.pinned,
  }
}

export function done(id: StepId, f: Facts): boolean {
  if (id === "skills") return f.saved > 0
  if (id === "brief") return f.brief.filled
  return f.approved !== null
}

export function line(id: StepId, f: Facts, w: ElementDesignWords["flow"]["state"]): string {
  if (id === "brief") return f.brief.state === "loading" ? w.loading : f.brief.state === "off" ? w.off : f.brief.filled ? w.briefDone : w.briefTodo
  if (!f.loaded) return w.loading
  if (id === "skills") return f.saved === 0 ? w.skillsNone : w.skills.replace("{n}", String(f.saved))
  if (f.approved) return w.approved
  const parts = [f.generated ? w.compare.replace("{g}", String(f.generated)).replace("{n}", String(f.saved)) : "", f.building ? w.building.replace("{n}", String(f.building)) : ""]
  return parts.filter(Boolean).join(" · ") || w.compareNone
}

/** Шаг, который открывается сам: без сохранённых навыков — библиотека, иначе — генерация и сравнение (бриф — по желанию). */
export function firstOpen(f: Facts): StepId | null {
  if (!f.loaded) return null
  return f.saved === 0 ? "skills" : "compare"
}

// ── Карусель «Сгенерировать и сравнить» ────────────────────────────────────────────────────────────────────────────────────
// Владелец: «до момента генерации в карточке просто написан название выбранного навыка и красная плашка не сгенерировано … те навыки
// которые сгенерированы … зелёную плашку». Карточка — тестовая страница (их у навыка может быть несколько: другой референс, ещё одна
// генерация) или сохранённый навык, у которого страницы ещё нет. Страницы в архиве — в конце, только для просмотра.
export type CardState = "none" | "building" | "ready" | "approved" | "archived"
export type Card = { key: string; skill: ProjectSkill | null; name: string; proto: Prototype | null; state: CardState }

export function cards(state: DesignState | null): Card[] {
  if (!state) return []
  const out: Card[] = []
  const known = new Set(state.skills.map((s) => s.mark))
  const of = (p: Prototype): CardState => (p.archived ? "archived" : p.status === "pinned" ? "approved" : p.status === "draft" ? "building" : "ready")
  for (const s of state.skills) {
    const mine = state.prototypes.filter((p) => p.skill === s.mark && !p.archived).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    mine.forEach((p, i) => out.push({ key: p.id, skill: s, name: mine.length > 1 ? `${s.name} · ${i + 1}` : s.name, proto: p, state: of(p) }))
    // Генерация в очереди — карточка с ключом будущей страницы: появится страница — выделение останется на ней.
    const queued = state.runs.find((r) => r.kind === "generate" && r.mark === s.mark && state.pending.includes(r.prototype) && !mine.some((p) => p.id === r.prototype))
    if (queued) out.push({ key: queued.prototype, skill: s, name: s.name, proto: null, state: "building" })
    else if (mine.length === 0) out.push({ key: s.mark, skill: s, name: s.name, proto: null, state: "none" })
  }
  const rest = state.prototypes.filter((p) => p.archived || !known.has(p.skill))
  for (const p of rest) {
    const s = state.skills.find((x) => x.mark === p.skill) ?? null
    out.push({ key: p.id, skill: s, name: s?.name ?? p.skill.split(/[:@/]/).pop() ?? p.skill, proto: p, state: of(p) })
  }
  return out
}

/** Карточка, открытая сама: утверждённая, иначе последняя готовая, иначе первая. */
export function firstCard(list: Card[]): string | null {
  return list.find((c) => c.state === "approved")?.key
    ?? [...list].reverse().find((c) => c.state === "ready")?.key
    ?? list[0]?.key
    ?? null
}
