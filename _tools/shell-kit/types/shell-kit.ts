import type { ShellData } from "@/components/shell/shell-types"

// ЧТО ИНСТРУМЕНТ «ОБОЛОЧКА ПРОЕКТА» ПОЛУЧАЕТ ОТ ПОВЕРХНОСТИ (727-1). Всё — строки и данные: пропсы едут в страницу элемента JSON-ом,
// функций в них нет. `{lang}` в адресах входа и выхода — место языка.
export type ShellKitSurface = {
  meUrl?: string
  loginHref?: string
  logoutHref?: string
  languages?: string[]
}

/** Подписи кнопки бокового ящика элемента: ящик живёт у элемента, кнопка — в шапке инструмента (727-2). */
export type ShellKitDrawerLabels = { open: string; close: string }

export type ShellKitProps = {
  data: ShellData
  surface: ShellKitSurface
  /** Боковые ящики элемента, если они есть: кнопки рисует инструмент, открывает их элемент по событию окна (`drawer-events.ts`). */
  drawers?: { left?: ShellKitDrawerLabels; right?: ShellKitDrawerLabels }
  /** Путь страницы, для которой нарисован фрагмент: им живёт переключатель языка до первого кадра в браузере. */
  path: string
}

export type ShellKitPart = "header" | "footer"
