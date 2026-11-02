import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «workflow» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('workflow', 'ru').title,
  lead: 'Что делают ваши работающие элементы по всему узлу: работа по расписанию, заказы, работа для других и отзывы.',
}
