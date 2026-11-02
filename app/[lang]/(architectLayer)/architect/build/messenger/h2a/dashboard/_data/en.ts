import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «messenger/h2a/dashboard» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const en: WorkspacePageWords = {
  title: treeWords('messenger/h2a/dashboard', 'en').title,
  lead: 'Who you talk to through the agents of the node, in short.',
}
