import type { WorkspacePageWords } from '@/lib/collection/types'
import { treeWords } from '@/lib/web4-items/item-tree'

// 528-6: заголовок — слово дерева элемента «workflow/terminal» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
export const ru: WorkspacePageWords = {
  title: treeWords('workflow/terminal', 'ru').title,
  lead: 'Терминал рабочего процесса каждого элемента: сессия, в которой идут задачи агентов других узлов (шаг 552-4).',
}
