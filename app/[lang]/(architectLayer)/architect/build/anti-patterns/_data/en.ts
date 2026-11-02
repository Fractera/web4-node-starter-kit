import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/anti-patterns», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/documents/anti-patterns', 'en').title,
  lead: 'Approaches that turned out to be dead ends — what not to do, and why it cost.',
}
