import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/translation-debt», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/documents/translation-debt', 'en').title,
  lead: 'What still speaks one language, and what has to be translated before release.',
}
