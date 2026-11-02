import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «messenger/settings» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('messenger/settings', 'ru').title,
  lead: 'Настройки Messenger для всего узла: тариф первого контакта и правила для агентов. Пока каждый элемент хранит свои.',
}
