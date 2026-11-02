import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 530-1: заголовок — слово дерева элемента «settings/payments»; строка о назначении — своя, для узла.
export const en: WorkspacePageWords = {
  title: treeWords('settings/payments', 'en').title,
  lead: 'Payments of the node: by card through its payment elements (Web2) and in USDC through the node\'s wallet (Web3).',
}
