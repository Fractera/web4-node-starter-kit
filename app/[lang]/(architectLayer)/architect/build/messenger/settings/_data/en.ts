import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «messenger/settings» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const en: WorkspacePageWords = {
  title: treeWords('messenger/settings', 'en').title,
  lead: 'Messenger settings for the whole node: the first contact price and the rules for agents. For now each element keeps its own.',
}
