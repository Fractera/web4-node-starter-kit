import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/backlog», одно у элемента и у главного агента.

export const ru: WorkspacePageWords = {
  title: treeWords('build/documents/backlog', 'ru').title,
  lead: 'Построенное наполовину, обещанное и необъяснённое — открывают, когда всплыла область.',
}
