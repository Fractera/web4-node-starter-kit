import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «messenger/h2a» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('messenger/h2a', 'ru').title,
  lead: 'Ваши разговоры с главным агентом и агентами ваших элементов — в одном месте.',
}
