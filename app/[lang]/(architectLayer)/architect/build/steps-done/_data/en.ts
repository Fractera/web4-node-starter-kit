import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/steps-done», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/documents/steps-done', 'en').title,
  lead: 'Finished work with its proofs — what was built, how, and what it cost.',
}
