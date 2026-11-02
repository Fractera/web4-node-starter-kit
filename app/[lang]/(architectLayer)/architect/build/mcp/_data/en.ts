import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «build/i2i/mcp», одно у элемента и у главного агента.

export const en: WorkspacePageWords = {
  title: treeWords('build/i2i/mcp', 'en').title,
  lead: 'External tools the agent may reach for, and the keys that let it.',
}
