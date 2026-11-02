import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/task-add», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/documents/task-add', 'en').title,
  lead: 'Leave a task in your own words; the agent routes it to the right step.',
}
