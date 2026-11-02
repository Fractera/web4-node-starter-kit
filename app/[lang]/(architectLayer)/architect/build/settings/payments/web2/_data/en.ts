import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 530-1: заголовок — слово дерева элемента «settings/payments/web2»; строка о назначении — своя, для узла.
export const en: WorkspacePageWords = {
  title: treeWords('settings/payments/web2', 'en').title,
  lead: 'The payment elements of the node, and the same page in each element.',
}
