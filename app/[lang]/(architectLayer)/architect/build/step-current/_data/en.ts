import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/current-step», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/documents/current-step', 'en').title,
  lead: 'Where the work stands right now, so a new session continues instead of restarting.',
}
