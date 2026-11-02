import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const en: WorkspacePageWords = {
  title: treeWords('build', 'en').title,
  lead: 'Everything the main agent needs to build the node: repository, agent, deploy, its doors and documents.',
}
