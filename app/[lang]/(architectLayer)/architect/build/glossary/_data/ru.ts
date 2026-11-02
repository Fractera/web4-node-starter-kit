import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/glossary», одно у элемента и у главного агента.

export const ru: WorkspacePageWords = {
  title: treeWords('build/documents/glossary', 'ru').title,
  lead: 'Слова, о которых договорились, чтобы одна вещь не звалась двумя именами.',
}
