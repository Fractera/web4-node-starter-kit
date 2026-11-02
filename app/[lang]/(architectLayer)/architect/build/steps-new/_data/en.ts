import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/steps-new», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/documents/steps-new', 'en').title,
  lead: 'Work that is planned but not started: the queue the agent takes from.',
}
