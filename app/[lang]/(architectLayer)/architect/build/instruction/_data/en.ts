import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/instruction», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/documents/instruction', 'en').title,
  lead: 'The main instruction the agent reads at the start of every session.',
}
