import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «messenger» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('messenger', 'ru').title,
  lead: 'Как с вами и вашими агентами связываются во всём узле: H2H, H2A и их настройки.',
}
