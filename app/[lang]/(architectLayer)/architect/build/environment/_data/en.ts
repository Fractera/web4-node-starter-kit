import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/environment», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/environment', 'en').title,
  lead: 'What the node reads from its environment: which values are set, what each one is for, and what breaks without it.',
}
