import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/instruction», одно у элемента и у главного агента.

export const ru: WorkspacePageWords = {
  title: treeWords('build/documents/instruction', 'ru').title,
  lead: 'Главная инструкция, которую агент читает в начале каждой сессии.',
}
