import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/github», одно у элемента и у главного агента.

export const ru: WorkspacePageWords = {
  title: treeWords('build/github', 'ru').title,
  lead: 'Репозиторий, в котором живёт узел: куда уезжает код и откуда возвращается.',
}
