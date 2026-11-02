import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «workflow/a2a-work/native» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const en: WorkspacePageWords = {
  title: treeWords('workflow/a2a-work/native', 'en').title,
  lead: 'The agents your elements work for, and the history with each of them.',
}
