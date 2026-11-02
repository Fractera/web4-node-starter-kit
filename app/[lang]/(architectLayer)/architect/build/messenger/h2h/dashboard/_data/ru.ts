import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «messenger/h2h/dashboard» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('messenger/h2h/dashboard', 'ru').title,
  lead: 'Контакты и разговоры всех элементов — коротко.',
}
