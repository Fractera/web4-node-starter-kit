import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «workflow/a2a-orders» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('workflow/a2a-orders', 'ru').title,
  lead: 'Работа, которую ваши элементы заказывают у других агентов, — по всему узлу.',
}
