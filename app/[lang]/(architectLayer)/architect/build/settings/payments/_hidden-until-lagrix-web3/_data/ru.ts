import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 530-1: заголовок — слово дерева элемента «settings/payments/web3»; строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('settings/payments/web3', 'ru').title,
  lead: 'Кошелёк узла — у главного агента и у каждого элемента, у которого нет своего.',
}
