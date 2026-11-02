import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «workflow/process/subscriptions» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('workflow/process/subscriptions', 'ru').title,
  lead: 'Внешние сервисы, которыми могут пользоваться ваши элементы.',
}
