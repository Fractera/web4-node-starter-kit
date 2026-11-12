// ДОГОВОР ШАПКИ ИНСТРУМЕНТА И ЯЩИКОВ ЭЛЕМЕНТА (727-2). У инструмента и у элемента — два разных React на одной странице, общего
// контекста у них нет; они говорят двумя событиями окна. Кнопка шапки просит ящик открыться или закрыться, элемент отвечает своим
// состоянием — по нему кнопка рисует свой значок. Тот же договор элемент повторяет у себя (`components/shell-kit/drawer-bridge.client.tsx`
// шаблона): имена событий меняются только вместе в обоих местах.
export const DRAWER_TOGGLE_EVENT = "shell-kit:drawer-toggle"
export const DRAWER_STATE_EVENT = "shell-kit:drawer-state"

export type DrawerSide = "left" | "right"
export type DrawerToggleDetail = { side: DrawerSide }
export type DrawerStateDetail = { left: boolean; right: boolean }
