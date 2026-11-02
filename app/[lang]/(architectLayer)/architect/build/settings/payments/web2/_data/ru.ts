import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 530-1: заголовок — слово дерева элемента «settings/payments/web2»; строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('settings/payments/web2', 'ru').title,
  lead: 'Платёжные элементы узла и эта же страница у каждого элемента.',
}
