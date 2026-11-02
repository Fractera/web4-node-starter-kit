import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/cancelled», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/documents/cancelled', 'en').title,
  lead: 'Laws that no longer apply: what was cancelled, when, and what replaced it.',
}
