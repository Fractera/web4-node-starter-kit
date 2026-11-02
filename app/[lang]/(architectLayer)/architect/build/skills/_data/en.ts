import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/skills», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/documents/skills', 'en').title,
  lead: 'Skills: procedures the agent follows instead of inventing its own each time.',
}
