import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/anti-patterns», одно у элемента и у главного агента.

export const ru: WorkspacePageWords = {
  title: treeWords('build/documents/anti-patterns', 'ru').title,
  lead: 'Подходы, оказавшиеся тупиками: чего не делать и чем это было оплачено.',
}
