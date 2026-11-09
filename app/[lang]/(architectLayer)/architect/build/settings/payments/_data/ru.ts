import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 530-1: заголовок — слово дерева элемента «settings/payments»; строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('settings/payments', 'ru').title,
  // 706-8 / 709: до запуска Lagrix — без Web3 («… и в USDC через кошелёк узла (Web3)»).
  lead: 'Платежи узла: картой через его платёжные элементы (Web2).',
}
