import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/documents/steps-new», одно у элемента и у главного агента.

export const ru: WorkspacePageWords = {
  title: treeWords('build/documents/steps-new', 'ru').title,
  lead: 'Работа, которая запланирована и ещё не начата: очередь, из которой берёт агент.',
}
