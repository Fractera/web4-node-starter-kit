import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/task-add», одно у элемента и у главного агента.

export const ru: WorkspacePageWords = {
  title: treeWords('build/documents/task-add', 'ru').title,
  lead: 'Оставьте задачу своими словами — агент сам определит ей место в работе.',
}
