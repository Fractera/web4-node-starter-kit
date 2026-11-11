import "server-only"
import menuState from "@/lib/web4-items/menu-state.cjs"
import { elementLabel } from "@/lib/web4-items/element-name"
import { web4DraftsUi, type Web4DraftsUi } from "@/app/[lang]/(architectLayer)/_i18n/web4-drafts.i18n"

// 722-2: ПОРЦИЯ КАСТОМНЫХ ЭЛЕМЕНТОВ ДЛЯ МЕНЮ АРХИТЕКТОРА — то, что отдаёт дверь `/api/architect/menu/elements` и рисует сервер в первых
// двенадцати строках: имя на языке человека (`elementLabel`), адрес страницы и состояние со словом. Порядок и состояние —
// `menu-state.cjs` (одно чтение реестра); имена — только у строк порции.

export type MenuState = "running" | "asleep" | "off" | "draft"
export type MenuRow = { id: string; label: string; href: string; state: { kind: MenuState; label: string }; description?: string }

export function stateWord(kind: MenuState, ui: Web4DraftsUi): string {
  return kind === "running" ? ui.stateRunning : kind === "asleep" ? ui.stateAsleep : kind === "off" ? ui.stateOff : ui.stateDraft
}

/** Состояние каждого элемента по id — для деревьев меню, которые строит сервер (без имён, одно чтение реестра). */
export function menuStates(): Map<string, MenuState> {
  return new Map((menuState.menuRows(process.cwd()) as { id: string; state: MenuState }[]).map((r) => [r.id, r.state]))
}

/** Порция кастомных элементов (root — только с `withRoot`, у левого меню он своей строкой): `compact` — ссылка ведёт на «Живой сайт», как у короткого меню. */
export function menuPortion(lang: string, o: { from?: number; limit?: number; q?: string; active?: boolean; compact?: boolean; description?: boolean; withRoot?: boolean }) {
  const ui = web4DraftsUi(lang)
  const page = menuState.menuPage(process.cwd(), { from: o.from ?? 0, limit: o.limit ?? 12, q: o.q ?? "", active: !!o.active, custom: true, withRoot: !!o.withRoot, description: !!o.description }) as {
    rows: { id: string; address: string; state: MenuState; description?: string }[]; total: number; next: number | null
  }
  const rows: MenuRow[] = page.rows.map((r) => ({
    id: r.id,
    label: elementLabel(r.id, lang),
    href: `/${lang}/architect/${r.address}${o.compact ? "/preview" : ""}`,
    state: { kind: r.state, label: stateWord(r.state, ui) },
    ...(r.description ? { description: r.description } : {}),
  }))
  return { rows, total: page.total, next: page.next }
}
