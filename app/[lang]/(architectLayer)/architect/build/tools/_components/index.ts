import type { PageItem } from '@/lib/content/sections/types'

// 725-8 (владелец 2026-11-12: «на вкладке … у главного агента в рабочих процессах создадим вкладку инструмента»): инструменты ядра —
// карточки, показ, правка и новый инструмент через один терминал главного агента.
export function content(lang: string): PageItem[] {
  return [{ kind: 'toolsTab', lang }]
}
