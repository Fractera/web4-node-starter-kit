import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/translation-debt», одно у элемента и у главного агента.

export const ru: WorkspacePageWords = {
  title: treeWords('build/documents/translation-debt', 'ru').title,
  lead: 'Что пока говорит на одном языке и что предстоит перевести до выпуска.',
}
