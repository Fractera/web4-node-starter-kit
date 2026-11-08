import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 530-1: заголовок — слово дерева элемента «settings»; строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('settings', 'ru').title,
  lead: 'Настройки узла: базовый AI-провайдер и то, как узел принимает деньги.',
}
