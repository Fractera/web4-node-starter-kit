import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/skills», одно у элемента и у главного агента.

export const ru: WorkspacePageWords = {
  title: treeWords('build/documents/skills', 'ru').title,
  lead: 'Навыки: процедуры, по которым агент работает вместо того, чтобы изобретать их заново.',
}
