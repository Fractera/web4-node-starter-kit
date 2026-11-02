import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 530-1: заголовок — слово дерева элемента «settings/payments/web3»; строка о назначении — своя, для узла.
export const en: WorkspacePageWords = {
  title: treeWords('settings/payments/web3', 'en').title,
  lead: 'The node\'s wallet — for the main agent and for every element that has none of its own.',
}
