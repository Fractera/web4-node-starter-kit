import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/backlog», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/documents/backlog', 'en').title,
  lead: 'Built halfway, promised, or unexplained — opened when its subject comes up.',
}
