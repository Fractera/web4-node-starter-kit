import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/glossary», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/documents/glossary', 'en').title,
  lead: 'Words this project agreed on, so the same thing is not called two names.',
}
