import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «workflow/a2a-work/capabilities» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const en: WorkspacePageWords = {
  title: treeWords('workflow/a2a-work/capabilities', 'en').title,
  lead: 'What each of your elements can do for others.',
}
