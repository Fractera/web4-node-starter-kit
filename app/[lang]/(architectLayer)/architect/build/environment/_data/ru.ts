import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/environment», одно у элемента и у главного агента.

export const ru: WorkspacePageWords = {
  title: treeWords('build/environment', 'ru').title,
  lead: 'Что узел читает из окружения: какие значения заданы, зачем каждое и что сломается без него.',
}
