import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/github», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/github', 'en').title,
  lead: 'The repository this node lives in: where the code goes and where it comes back from.',
}
