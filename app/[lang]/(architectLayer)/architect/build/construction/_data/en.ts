import type { WorkspacePageWords } from '@/lib/collection/types'

// 709 (владелец 2026-11-09: «вкладка строительства … у агента ядра именно эта вкладка отвечает за строительство и за координацию других
// агентов … переименовать эту кнопку в рабочие процессы»): у главного агента — своё слово, у элемента остаётся «Строительство».
export const en: WorkspacePageWords = {
  title: 'Working processes',
  lead: 'Everything the main agent does: builds the node — repository, agent, deploy, documents — and coordinates the agents of the elements, which do the work.',
}
