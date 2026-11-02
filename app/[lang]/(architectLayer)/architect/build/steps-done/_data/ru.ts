import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/steps-done», одно у элемента и у главного агента.

export const ru: WorkspacePageWords = {
  title: treeWords('build/documents/steps-done', 'ru').title,
  lead: 'Законченная работа с доказательствами: что построено, как и чего это стоило.',
}
