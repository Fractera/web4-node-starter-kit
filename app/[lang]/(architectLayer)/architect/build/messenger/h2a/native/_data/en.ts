import type { WorkspacePageWords } from '@/lib/collection/types'

// 528-6: заголовок — слово дерева элемента «messenger/h2a/native» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
// 801-5: the tree's Messenger is commented out until Lagrix, so its word is kept here — treeWords() of a hidden page fails the build.
export const en: WorkspacePageWords = {
  title: 'Native chat',
  lead: 'Talk to the main agent and the agents of your elements right here.',
}
