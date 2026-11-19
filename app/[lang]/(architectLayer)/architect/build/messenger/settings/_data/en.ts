import type { WorkspacePageWords } from '@/lib/collection/types'

// 528-6: заголовок — слово дерева элемента «messenger/settings» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
// 801-5: the tree's Messenger is commented out until Lagrix, so its word is kept here — treeWords() of a hidden page fails the build.
export const en: WorkspacePageWords = {
  title: 'Settings',
  lead: 'Messenger settings for the whole node: the first contact price and the rules for agents. For now each element keeps its own.',
}
