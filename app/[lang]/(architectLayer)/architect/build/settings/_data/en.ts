import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 530-1: заголовок — слово дерева элемента «settings»; строка о назначении — своя, для узла.
export const en: WorkspacePageWords = {
  title: treeWords('settings', 'en').title,
  lead: 'Settings of the main agent: how the node takes money.',
}
