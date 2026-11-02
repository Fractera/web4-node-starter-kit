import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('build', 'ru').title,
  lead: 'Всё, что нужно главному агенту, чтобы строить узел: репозиторий, агент, развёртывание, его двери и документы.',
}
