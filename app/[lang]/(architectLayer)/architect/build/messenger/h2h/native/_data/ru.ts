import type { WorkspacePageWords } from '@/lib/collection/types'

// 528-6: заголовок — слово дерева элемента «messenger/h2h/native» (одно слово у элемента и у главного агента); строка о назначении — своя, для узла.
// 801-5: the tree's Messenger is commented out until Lagrix, so its word is kept here — treeWords() of a hidden page fails the build.
export const ru: WorkspacePageWords = {
  title: 'Нативный мессенджер',
  lead: 'Ваши контакты и разговоры через агентов — во всех элементах узла.',
}
