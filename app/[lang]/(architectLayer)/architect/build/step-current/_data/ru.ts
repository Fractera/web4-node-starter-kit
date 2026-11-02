import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/current-step», одно у элемента и у главного агента.

export const ru: WorkspacePageWords = {
  title: treeWords('build/documents/current-step', 'ru').title,
  lead: 'Где работа стоит прямо сейчас, чтобы новая сессия продолжила, а не начала заново.',
}
